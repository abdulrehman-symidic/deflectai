import Link from "next/link";
import { getPortfolioStats, getStores } from "@/lib/queries";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Overview — DeflectAI" };

export default async function DashboardPage() {
  const [stats, stores] = await Promise.all([
    getPortfolioStats(),
    getStores(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your deflection portfolio at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Stores" value={stats.storeCount} />
        <StatCard label="Orders indexed" value={stats.orderCount} />
        <StatCard label="Deflected conversations" value={stats.sessionCount} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Your stores</h2>
          <Link
            href="/dashboard/stores/new"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
          >
            + New store
          </Link>
        </div>

        {stores.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-700 p-10 text-center">
            <p className="text-slate-400">
              You haven&apos;t added a store yet.
            </p>
            <Link
              href="/dashboard/stores/new"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Create your first store
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/dashboard/stores/${store.id}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-indigo-500/50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: store.brand_color ?? "#2563eb" }}
                  />
                  <h3 className="font-semibold text-white">
                    {store.store_name}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {store.store_domain}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Added {timeAgo(store.created_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
