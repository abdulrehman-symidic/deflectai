"use client";

import { useActionState } from "react";
import { createStore, updateStore, type ActionState } from "@/app/dashboard/actions";
import type { Store } from "@/lib/types";

const initial: ActionState = {};

export function StoreForm({
  mode,
  store,
}: {
  mode: "create" | "edit";
  store?: Store;
}) {
  const action = mode === "create" ? createStore : updateStore;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-6">
      {store && <input type="hidden" name="id" value={store.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name">
          <input
            name="store_name"
            required
            defaultValue={store?.store_name ?? ""}
            placeholder="Acme Apparel"
            className={inputClass}
          />
        </Field>
        <Field label="Store domain">
          <input
            name="store_domain"
            required
            defaultValue={store?.store_domain ?? ""}
            placeholder="acme.myshopify.com"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Widget title">
          <input
            name="widget_title"
            defaultValue={store?.widget_title ?? "Support & Order Tracking"}
            placeholder="Support & Order Tracking"
            className={inputClass}
          />
        </Field>
        <Field label="Brand colour">
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="brand_color"
              defaultValue={store?.brand_color ?? "#2563eb"}
              className="h-10 w-14 cursor-pointer rounded-lg border border-slate-700 bg-slate-950 p-1"
            />
            <span className="text-sm text-slate-400">
              Used for the launcher &amp; header.
            </span>
          </div>
        </Field>
      </div>

      <Field label="Return policy">
        <textarea
          name="return_policy_text"
          rows={5}
          defaultValue={store?.return_policy_text ?? ""}
          placeholder="Customers can return any item within 30 days of delivery for a full refund. Items must be unworn and in original packaging. Start a return at acme.com/returns."
          className={inputClass}
        />
      </Field>

      <Field label="Shipping policy">
        <textarea
          name="shipping_policy_text"
          rows={5}
          defaultValue={store?.shipping_policy_text ?? ""}
          placeholder="Standard shipping is free over $50 and takes 3–5 business days. Express shipping is available at checkout for $12 (1–2 business days). We ship worldwide."
          className={inputClass}
        />
      </Field>

      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending
          ? "Saving…"
          : mode === "create"
            ? "Create store"
            : "Save changes"}
      </button>
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}
