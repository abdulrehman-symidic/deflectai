import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/queries";
import { StoreForm } from "@/components/dashboard/StoreForm";
import { StoreTabs } from "@/components/dashboard/StoreTabs";
import { InstallSnippet } from "@/components/dashboard/InstallSnippet";
import { WidgetPreview } from "@/components/dashboard/WidgetPreview";
import { DeleteStoreButton } from "@/components/dashboard/DeleteStoreButton";

export default async function StoreSettingsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const store = await getStore(id);
  if (!store) notFound();

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 transition hover:text-slate-200"
        >
          ← Overview
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-white">{store.store_name}</h1>
          <DeleteStoreButton storeId={store.id} />
        </div>
        <p className="mt-1 text-sm text-slate-400">{store.store_domain}</p>
      </div>

      <StoreTabs storeId={store.id} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="mb-4 font-semibold text-white">Store &amp; AI settings</h2>
          <StoreForm mode="edit" store={store} />
        </div>

        <div className="space-y-6">
          <InstallSnippet storeId={store.id} appUrl={appUrl} />
          <WidgetPreview storeId={store.id} />
        </div>
      </div>
    </div>
  );
}
