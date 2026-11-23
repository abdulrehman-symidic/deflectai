"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SidebarNav({
  stores,
}: {
  stores: { id: string; store_name: string }[];
}) {
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
      active
        ? "bg-indigo-600/15 text-indigo-300"
        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
    );

  return (
    <nav className="flex flex-col gap-6">
      <div className="space-y-1">
        <Link href="/dashboard" className={linkClass(pathname === "/dashboard")}>
          Overview
        </Link>
        <Link
          href="/dashboard/stores/new"
          className={linkClass(pathname === "/dashboard/stores/new")}
        >
          + New store
        </Link>
      </div>

      <div>
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Your stores
        </p>
        <div className="mt-2 space-y-1">
          {stores.length === 0 && (
            <p className="px-3 text-sm text-slate-500">No stores yet.</p>
          )}
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/dashboard/stores/${store.id}`}
              className={linkClass(
                pathname.startsWith(`/dashboard/stores/${store.id}`)
              )}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              <span className="truncate">{store.store_name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
