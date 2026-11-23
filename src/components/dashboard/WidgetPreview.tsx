export function WidgetPreview({ storeId }: { storeId: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="font-semibold text-white">Live preview</h2>
      <p className="mt-1 text-sm text-slate-400">
        This is the exact widget your shoppers will see. Click the launcher in
        the bottom-right corner to chat.
      </p>
      <iframe
        src={`/preview/${storeId}`}
        title="Widget preview"
        className="mt-4 h-[560px] w-full rounded-xl border border-slate-800 bg-white"
      />
    </div>
  );
}
