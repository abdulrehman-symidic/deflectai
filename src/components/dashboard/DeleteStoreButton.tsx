"use client";

import { deleteStore } from "@/app/dashboard/actions";

export function DeleteStoreButton({ storeId }: { storeId: string }) {
  return (
    <form
      action={deleteStore}
      onSubmit={(event) => {
        if (
          !confirm(
            "Delete this store? This removes its orders and chat history."
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={storeId} />
      <button className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10">
        Delete store
      </button>
    </form>
  );
}
