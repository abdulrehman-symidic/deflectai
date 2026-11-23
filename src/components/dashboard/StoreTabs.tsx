"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function StoreTabs({ storeId }: { storeId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/stores/${storeId}`;
  const tabs = [
    { href: base, label: "Settings" },
    { href: `${base}/orders`, label: "Orders" },
    { href: `${base}/chat`, label: "Conversations" },
  ];

  return (
    <div className="flex gap-1 border-b border-slate-800">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm transition",
              active
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
