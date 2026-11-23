import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStores } from "@/lib/queries";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

// Authenticated dashboard: request-time auth + data, allowed to block.
export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stores = await getStores();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950/60 p-5 lg:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold">
            D
          </span>
          DeflectAI
        </Link>
        <SidebarNav
          stores={stores.map((s) => ({ id: s.id, store_name: s.store_name }))}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-xs font-bold">
              D
            </span>
            <span className="text-sm font-semibold">DeflectAI</span>
          </Link>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
