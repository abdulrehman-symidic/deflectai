export type FulfillmentStatus = "unfulfilled" | "in_transit" | "delivered";

export interface Store {
  id: string;
  created_at: string;
  user_id: string | null;
  store_name: string;
  store_domain: string;
  return_policy_text: string | null;
  shipping_policy_text: string | null;
  brand_color: string | null;
  widget_title: string | null;
}

export interface StoreOrder {
  id: string;
  store_id: string;
  order_number: string;
  customer_email: string;
  fulfillment_status: FulfillmentStatus;
  carrier: string | null;
  tracking_number: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  store_id: string;
  visitor_id: string | null;
  resolved: boolean | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface WidgetConfig {
  storeId: string;
  storeName: string;
  brandColor: string;
  widgetTitle: string;
  greeting: string;
}

export const FULFILLMENT_STATUSES: FulfillmentStatus[] = [
  "unfulfilled",
  "in_transit",
  "delivered",
];

export const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  unfulfilled: "Unfulfilled",
  in_transit: "In transit",
  delivered: "Delivered",
};
