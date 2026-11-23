"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeColor, normalizeDomain } from "@/lib/utils";
import { FULFILLMENT_STATUSES, type FulfillmentStatus } from "@/lib/types";

export interface ActionState {
  error?: string;
  ok?: boolean;
  message?: string;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}

function readText(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/* -------------------------------------------------------------------------- */
/* Stores                                                                     */
/* -------------------------------------------------------------------------- */

export async function createStore(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const storeName = readText(formData, "store_name");
  const domain = normalizeDomain(readText(formData, "store_domain"));

  if (!storeName) return { error: "Store name is required." };
  if (!domain) return { error: "Store domain is required." };

  const { data, error } = await supabase
    .from("stores")
    .insert({
      user_id: user.id,
      store_name: storeName,
      store_domain: domain,
      return_policy_text: readText(formData, "return_policy_text"),
      shipping_policy_text: readText(formData, "shipping_policy_text"),
      brand_color: normalizeColor(readText(formData, "brand_color")),
      widget_title:
        readText(formData, "widget_title") || "Support & Order Tracking",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect(`/dashboard/stores/${data.id}`);
}

export async function updateStore(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireUser();
  const id = readText(formData, "id");
  if (!id) return { error: "Missing store id." };

  const storeName = readText(formData, "store_name");
  const domain = normalizeDomain(readText(formData, "store_domain"));
  if (!storeName) return { error: "Store name is required." };
  if (!domain) return { error: "Store domain is required." };

  const { error } = await supabase
    .from("stores")
    .update({
      store_name: storeName,
      store_domain: domain,
      return_policy_text: readText(formData, "return_policy_text"),
      shipping_policy_text: readText(formData, "shipping_policy_text"),
      brand_color: normalizeColor(readText(formData, "brand_color")),
      widget_title:
        readText(formData, "widget_title") || "Support & Order Tracking",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/stores/${id}`);
  revalidatePath("/dashboard");
  return { ok: true, message: "Settings saved." };
}

export async function deleteStore(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = readText(formData, "id");
  if (id) {
    await supabase.from("stores").delete().eq("id", id);
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

export async function createOrder(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase } = await requireUser();

  const storeId = readText(formData, "store_id");
  const orderNumber = readText(formData, "order_number");
  const email = readText(formData, "customer_email");
  const status = readText(formData, "fulfillment_status") as FulfillmentStatus;

  if (!storeId) return { error: "Missing store id." };
  if (!orderNumber) return { error: "Order number is required." };
  if (!email) return { error: "Customer email is required." };
  if (!FULFILLMENT_STATUSES.includes(status)) {
    return { error: "Invalid fulfilment status." };
  }

  const { error } = await supabase.from("store_orders").insert({
    store_id: storeId,
    order_number: orderNumber,
    customer_email: email,
    fulfillment_status: status,
    carrier: readText(formData, "carrier") || "Standard Delivery",
    tracking_number: readText(formData, "tracking_number") || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/stores/${storeId}/orders`);
  return { ok: true, message: "Order added." };
}

export async function setOrderStatus(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = readText(formData, "id");
  const storeId = readText(formData, "store_id");
  const status = readText(formData, "fulfillment_status") as FulfillmentStatus;
  if (id && FULFILLMENT_STATUSES.includes(status)) {
    await supabase
      .from("store_orders")
      .update({ fulfillment_status: status })
      .eq("id", id);
  }
  revalidatePath(`/dashboard/stores/${storeId}/orders`);
}

export async function deleteOrder(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const id = readText(formData, "id");
  const storeId = readText(formData, "store_id");
  if (id) {
    await supabase.from("store_orders").delete().eq("id", id);
  }
  revalidatePath(`/dashboard/stores/${storeId}/orders`);
}

const DEMO_ORDERS = [
  {
    order_number: "#1001",
    customer_email: "demo.customer@example.com",
    fulfillment_status: "in_transit",
    carrier: "UPS",
    tracking_number: "1Z999AA10123456784",
  },
  {
    order_number: "#1002",
    customer_email: "demo.customer@example.com",
    fulfillment_status: "delivered",
    carrier: "FedEx",
    tracking_number: "999999999999",
  },
  {
    order_number: "#1003",
    customer_email: "jane@example.com",
    fulfillment_status: "unfulfilled",
    carrier: "Standard Delivery",
    tracking_number: null,
  },
];

export async function seedDemoOrders(formData: FormData): Promise<void> {
  const { supabase } = await requireUser();
  const storeId = readText(formData, "store_id");
  if (!storeId) return;
  await supabase
    .from("store_orders")
    .insert(DEMO_ORDERS.map((order) => ({ ...order, store_id: storeId })));
  revalidatePath(`/dashboard/stores/${storeId}/orders`);
}
