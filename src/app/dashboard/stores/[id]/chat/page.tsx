import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecentSessions, getStore } from "@/lib/queries";
import { StoreTabs } from "@/components/dashboard/StoreTabs";
import { timeAgo } from "@/lib/utils";

export default async function StoreChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const store = await getStore(id);
  if (!store) notFound();

  const sessions = await getRecentSessions(id, 30);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 transition hover:text-slate-200"
        >
          ← Overview
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {store.store_name}
        </h1>
      </div>

      <StoreTabs storeId={store.id} />

      <div>
        <h2 className="font-semibold text-white">
          Recent conversations{" "}
          <span className="text-sm font-normal text-slate-500">
            ({sessions.length})
          </span>
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Each of these is a repetitive question DeflectAI handled without a
          human.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
          No conversations yet. Install the widget and start chatting from the
          live preview.
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono">
                  {session.visitor_id ?? "anonymous"}
                </span>
                <span>{timeAgo(session.created_at)}</span>
              </div>
              <div className="mt-3 space-y-2">
                {session.messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "rounded-lg bg-slate-800/70 px-3 py-2 text-sm text-slate-200"
                        : "rounded-lg bg-indigo-600/15 px-3 py-2 text-sm text-indigo-100"
                    }
                  >
                    <span className="mr-2 text-[10px] uppercase tracking-wider text-slate-500">
                      {message.role}
                    </span>
                    <span className="whitespace-pre-wrap">{message.content}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
