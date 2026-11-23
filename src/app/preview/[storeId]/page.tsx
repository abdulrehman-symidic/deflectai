import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/supabase/admin";
import { normalizeColor } from "@/lib/utils";

export const instant = false;

export default async function WidgetPreviewPage(props: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await props.params;

  let store:
    | { store_name: string; store_domain: string; brand_color: string | null }
    | null = null;

  try {
    const admin = getAdmin();
    const { data } = await admin
      .from("stores")
      .select("store_name, store_domain, brand_color")
      .eq("id", storeId)
      .maybeSingle();
    store = data;
  } catch {
    store = null;
  }

  if (!store) notFound();

  const brand = normalizeColor(store.brand_color);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <span className="text-lg font-bold" style={{ color: brand }}>
          {store.store_name}
        </span>
        <nav className="hidden gap-6 text-sm text-slate-500 sm:flex">
          <span>Shop</span>
          <span>New in</span>
          <span>Sale</span>
          <span>Contact</span>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Demo storefront — widget preview
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Welcome to {store.store_name}
        </h1>
        <p className="mt-3 max-w-xl text-slate-500">
          This is a mock store page so you can try the support widget exactly as
          your shoppers would see it. Open the chat in the bottom-right corner
          and ask about an order or your return policy.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {["Classic Tee", "Everyday Hoodie", "Canvas Tote"].map((name, i) => (
            <div
              key={name}
              className="overflow-hidden rounded-xl border border-slate-200"
            >
              <div
                className="aspect-square"
                style={{
                  background: `linear-gradient(135deg, ${brand}22, ${brand}55)`,
                }}
              />
              <div className="p-4">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-sm text-slate-400">${29 + i * 10}.00</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
          <p className="font-medium text-slate-700">Try asking:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>&ldquo;Where is my order #1001? My email is demo.customer@example.com&rdquo;</li>
            <li>&ldquo;What is your return policy?&rdquo;</li>
            <li>&ldquo;How long does shipping take?&rdquo;</li>
          </ul>
        </div>
      </main>

      <script defer src="/widget.js" data-store-id={storeId} />
    </div>
  );
}
