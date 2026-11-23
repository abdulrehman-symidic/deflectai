"use client";

import { useActionState } from "react";
import {
  createOrder,
  deleteOrder,
  seedDemoOrders,
  setOrderStatus,
  type ActionState,
} from "@/app/dashboard/actions";
import {
  FULFILLMENT_LABELS,
  FULFILLMENT_STATUSES,
  type FulfillmentStatus,
  type StoreOrder,
} from "@/lib/types";

const initial: ActionState = {};

const STATUS_STYLES: Record<FulfillmentStatus, string> = {
  unfulfilled: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  in_transit: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  delivered: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export function OrdersManager({
  storeId,
  orders,
}: {
  storeId: string;
  orders: StoreOrder[];
}) {
  const [state, formAction, pending] = useActionState(createOrder, initial);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Add an order</h2>
          <form action={seedDemoOrders}>
            <input type="hidden" name="store_id" value={storeId} />
            <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white">
              Load demo orders
            </button>
          </form>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          These orders power the AI&apos;s instant status lookups. Shoppers must
          provide the matching email to see status.
        </p>

        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="store_id" value={storeId} />
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              name="order_number"
              required
              placeholder="#1001"
              className={inputClass}
            />
            <input
              name="customer_email"
              type="email"
              required
              placeholder="customer@email.com"
              className={inputClass}
            />
            <select name="fulfillment_status" className={inputClass} defaultValue="unfulfilled">
              {FULFILLMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {FULFILLMENT_LABELS[status]}
                </option>
              ))}
            </select>
            <input name="carrier" placeholder="Carrier (e.g. UPS)" className={inputClass} />
            <input
              name="tracking_number"
              placeholder="Tracking number"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {pending ? "Adding…" : "Add order"}
            </button>
          </div>
          {state.error && (
            <p className="text-sm text-red-300">{state.error}</p>
          )}
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/70 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Carrier / tracking</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No orders yet. Add one above to test the widget.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="bg-slate-950/40">
                <td className="px-4 py-3 font-mono text-slate-200">
                  {order.order_number}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {order.customer_email}
                </td>
                <td className="px-4 py-3">
                  <form action={setOrderStatus}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="store_id" value={storeId} />
                    <select
                      name="fulfillment_status"
                      defaultValue={order.fulfillment_status}
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      className={`rounded-lg border px-2 py-1 text-xs outline-none ${STATUS_STYLES[order.fulfillment_status]}`}
                    >
                      {FULFILLMENT_STATUSES.map((status) => (
                        <option key={status} value={status} className="bg-slate-900 text-slate-100">
                          {FULFILLMENT_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </form>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  <div>{order.carrier}</div>
                  {order.tracking_number && (
                    <div className="font-mono text-xs text-slate-500">
                      {order.tracking_number}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteOrder}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="store_id" value={storeId} />
                    <button className="text-xs text-slate-500 transition hover:text-red-400">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500";
