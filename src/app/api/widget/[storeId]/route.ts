import { getAdmin } from "@/lib/supabase/admin";
import { jsonResponse, preflightResponse } from "@/lib/cors";
import { normalizeColor } from "@/lib/utils";

export function OPTIONS() {
  return preflightResponse();
}

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await ctx.params;

  try {
    const admin = getAdmin();
    const { data, error } = await admin
      .from("stores")
      .select("id, store_name, brand_color, widget_title")
      .eq("id", storeId)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return jsonResponse({ error: "Store not found" }, { status: 404 });
    }

    const storeName = data.store_name as string;

    return jsonResponse({
      storeId: data.id,
      storeName,
      brandColor: normalizeColor(data.brand_color as string | null),
      widgetTitle: (data.widget_title as string) || "Support & Order Tracking",
      greeting: `Hi! I'm the ${storeName} assistant. I can check your order status or answer return & shipping questions.`,
    });
  } catch (error) {
    console.error("[widget-config]", error);
    return jsonResponse({ error: "Unable to load widget" }, { status: 500 });
  }
}
