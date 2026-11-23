import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, Store, StoreOrder } from "@/lib/types";

export async function getStores(): Promise<Store[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Store[];
}

export async function getStore(id: string): Promise<Store | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Store) ?? null;
}

export async function getOrders(storeId: string): Promise<StoreOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_orders")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as StoreOrder[];
}

export interface StoreStats {
  storeCount: number;
  orderCount: number;
  sessionCount: number;
}

export async function getPortfolioStats(): Promise<StoreStats> {
  const supabase = await createClient();
  const stores = await getStores();
  const storeIds = stores.map((s) => s.id);

  if (storeIds.length === 0) {
    return { storeCount: 0, orderCount: 0, sessionCount: 0 };
  }

  const [orders, sessions] = await Promise.all([
    supabase
      .from("store_orders")
      .select("id", { count: "exact", head: true })
      .in("store_id", storeIds),
    supabase
      .from("chat_sessions")
      .select("id", { count: "exact", head: true })
      .in("store_id", storeIds),
  ]);

  return {
    storeCount: stores.length,
    orderCount: orders.count ?? 0,
    sessionCount: sessions.count ?? 0,
  };
}

export interface SessionWithMessages {
  id: string;
  visitor_id: string | null;
  created_at: string;
  messages: Pick<ChatMessage, "id" | "role" | "content" | "created_at">[];
}

export async function getRecentSessions(
  storeId: string,
  limit = 20
): Promise<SessionWithMessages[]> {
  const supabase = await createClient();
  const { data: sessions, error } = await supabase
    .from("chat_sessions")
    .select("id, visitor_id, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  if (!sessions || sessions.length === 0) return [];

  const ids = sessions.map((s) => s.id);
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("id, session_id, role, content, created_at")
    .in("session_id", ids)
    .order("created_at", { ascending: true });
  if (messagesError) throw messagesError;

  return sessions.map((session) => ({
    id: session.id as string,
    visitor_id: (session.visitor_id as string) ?? null,
    created_at: session.created_at as string,
    messages: (messages ?? [])
      .filter((m) => m.session_id === session.id)
      .map((m) => ({
        id: m.id as string,
        role: m.role as ChatMessage["role"],
        content: m.content as string,
        created_at: m.created_at as string,
      })),
  }));
}
