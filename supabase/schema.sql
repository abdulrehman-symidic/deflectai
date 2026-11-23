-- ===========================================================================
-- DeflectAI - Supabase schema
-- Run this once in the Supabase SQL editor (Database -> SQL editor -> Run).
-- Safe to re-run: everything is guarded with IF NOT EXISTS / drop policy.
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Stores / Tenants
-- ---------------------------------------------------------------------------
create table if not exists stores (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade,
    store_name text not null,
    store_domain text not null,
    return_policy_text text default '',
    shipping_policy_text text default '',
    brand_color text default '#2563eb',
    widget_title text default 'Support & Order Tracking'
);

create index if not exists stores_user_id_idx on stores(user_id);

-- ---------------------------------------------------------------------------
-- 2. Mock Orders (instant order status lookup for the AI)
-- ---------------------------------------------------------------------------
create table if not exists store_orders (
    id uuid primary key default gen_random_uuid(),
    store_id uuid references stores(id) on delete cascade,
    order_number text not null,
    customer_email text not null,
    fulfillment_status text not null, -- 'unfulfilled', 'in_transit', 'delivered'
    carrier text default 'Standard Delivery',
    tracking_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists store_orders_store_id_idx on store_orders(store_id);
create index if not exists store_orders_lookup_idx on store_orders(store_id, lower(order_number));

-- ---------------------------------------------------------------------------
-- 3. Chat sessions + messages (powers the analytics dashboard)
-- ---------------------------------------------------------------------------
create table if not exists chat_sessions (
    id uuid primary key default gen_random_uuid(),
    store_id uuid references stores(id) on delete cascade,
    visitor_id text,
    resolved boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists chat_sessions_store_id_idx on chat_sessions(store_id);

create table if not exists chat_messages (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references chat_sessions(id) on delete cascade,
    role text not null, -- 'user' | 'assistant'
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists chat_messages_session_id_idx on chat_messages(session_id);

-- ===========================================================================
-- Row Level Security
-- Dashboard access is always scoped to the owning user (auth.uid()).
-- The public widget talks to our server API which uses the service role key
-- and therefore bypasses RLS on purpose.
-- ===========================================================================
alter table stores enable row level security;
alter table store_orders enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

-- stores -------------------------------------------------------------------
drop policy if exists "Owners manage their stores" on stores;
create policy "Owners manage their stores" on stores
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- store_orders -------------------------------------------------------------
drop policy if exists "Owners manage orders of their stores" on store_orders;
create policy "Owners manage orders of their stores" on store_orders
    for all
    using (exists (
        select 1 from stores s where s.id = store_orders.store_id and s.user_id = auth.uid()
    ))
    with check (exists (
        select 1 from stores s where s.id = store_orders.store_id and s.user_id = auth.uid()
    ));

-- chat_sessions ------------------------------------------------------------
drop policy if exists "Owners read sessions of their stores" on chat_sessions;
create policy "Owners read sessions of their stores" on chat_sessions
    for all
    using (exists (
        select 1 from stores s where s.id = chat_sessions.store_id and s.user_id = auth.uid()
    ))
    with check (exists (
        select 1 from stores s where s.id = chat_sessions.store_id and s.user_id = auth.uid()
    ));

-- chat_messages ------------------------------------------------------------
drop policy if exists "Owners read messages of their stores" on chat_messages;
create policy "Owners read messages of their stores" on chat_messages
    for all
    using (exists (
        select 1 from chat_sessions c
        join stores s on s.id = c.store_id
        where c.id = chat_messages.session_id and s.user_id = auth.uid()
    ))
    with check (exists (
        select 1 from chat_sessions c
        join stores s on s.id = c.store_id
        where c.id = chat_messages.session_id and s.user_id = auth.uid()
    ));
