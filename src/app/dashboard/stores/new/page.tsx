import Link from "next/link";
import { StoreForm } from "@/components/dashboard/StoreForm";

export const metadata = { title: "New store — DeflectAI" };

export default function NewStorePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 transition hover:text-slate-200"
        >
          ← Overview
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Add a store</h1>
        <p className="mt-1 text-sm text-slate-400">
          The AI only uses the policy text you provide, so keep it accurate.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <StoreForm mode="create" />
      </div>
    </div>
  );
}
