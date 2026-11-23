"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function InstallSnippet({
  storeId,
  appUrl,
}: {
  storeId: string;
  appUrl: string;
}) {
  const snippet = `<!-- DeflectAI widget -->
<script
  defer
  src="${appUrl}/widget.js"
  data-store-id="${storeId}"
></script>`;
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Install on Shopify</h2>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
            copied
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
          )}
        >
          {copied ? "Copied!" : "Copy snippet"}
        </button>
      </div>
      <ol className="mt-3 space-y-1 text-sm text-slate-400">
        <li>
          1. Shopify admin → <strong className="text-slate-300">Online Store</strong>{" "}
          → <strong className="text-slate-300">Themes</strong> → Edit code.
        </li>
        <li>
          2. Open <code className="font-mono text-slate-300">layout/theme.liquid</code>{" "}
          and paste this before <code className="font-mono text-slate-300">&lt;/body&gt;</code>.
        </li>
      </ol>
      <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-emerald-300">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
