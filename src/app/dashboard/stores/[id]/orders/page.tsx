import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrders, getStore } from "@/lib/queries";
import { StoreTabs } from "@/components/dashboard/StoreTabs";
import { OrdersManager } from "@/components/dashboard/OrdersManager";

export default async function StoreOrdersPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const store = await getStore(id);
  if (!store) notFound();

  const orders = await getOrders(id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 transition hover:text-slate-200"
        >
          ← Overview
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {store.store_name}
        </h1>
      </div>

      <StoreTabs storeId={store.id} />

      <OrdersManager storeId={store.id} orders={orders} />
    </div>
  );
}
