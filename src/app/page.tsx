import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/env";

const FEATURES = [
  {
    title: "Order tracking, answered instantly",
    body: "The AI looks up order status by number + email against your orders, then replies with carrier, tracking number and fulfilment status.",
  },
  {
    title: "Return & shipping policy Q&A",
    body: "Drop in your policy text once. DeflectAI answers every WISMO and return question in your own words, using your brand colour.",
  },
  {
    title: "One-line installation",
    body: "Paste a single script tag into your Shopify theme. No app review, no rebuild, works on any theme.",
  },
  {
    title: "Deflection analytics",
    body: "See every conversation, and how many repetitive tickets were resolved before a human ever got involved.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your store",
    body: "Sign up and add your store name, domain and policies.",
  },
  {
    step: "02",
    title: "Paste the snippet",
    body: "Add the widget script tag before </body> in theme.liquid.",
  },
  {
    step: "03",
    title: "Watch tickets disappear",
    body: "Shoppers self-serve order status and policy answers around the clock.",
  },
];

export default function LandingPage() {
  const configured = hasSupabaseEnv();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm font-bold">
              D
            </span>
            DeflectAI
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-slate-300 transition hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500"
            >
              Start free
            </Link>
          </nav>
        </header>

        <section className="py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Powered by GPT-4o mini
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Deflect 60–70% of your
            <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
              {" "}
              repetitive support{" "}
            </span>
            tickets
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            DeflectAI drops an AI chat widget onto your Shopify store that
            instantly resolves &ldquo;where is my order?&rdquo; and return-policy
            questions — no support team required.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500 sm:w-auto"
            >
              Create your free widget
            </Link>
            <Link
              href="/login"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3 font-medium text-slate-200 transition hover:border-slate-500 sm:w-auto"
            >
              I already have an account
            </Link>
          </div>

          {!configured && (
            <p className="mx-auto mt-8 max-w-xl rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              Heads up: Supabase env vars are not set yet. Add them to{" "}
              <code className="font-mono">.env.local</code> (see{" "}
              <code className="font-mono">.env.example</code>) to enable
              sign-up.
            </p>
          )}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {feature.body}
              </p>
            </div>
          ))}
        </section>

        <section className="py-24">
          <h2 className="text-center text-3xl font-bold text-white">
            Live in under five minutes
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="relative">
                <div className="font-mono text-sm text-indigo-400">
                  {item.step}
                </div>
                <h3 className="mt-2 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-24">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-10 text-center">
            <h2 className="text-3xl font-bold text-white">
              Stop paying humans to copy-paste tracking links
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Free while you evaluate. Connect your store, install the widget,
              and measure the deflection.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500"
            >
              Get started
            </Link>
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 py-8 text-sm text-slate-500 sm:flex-row">
          <span>© DeflectAI</span>
          <span>Built with Next.js, Supabase &amp; OpenAI</span>
        </footer>
      </div>
    </div>
  );
}
