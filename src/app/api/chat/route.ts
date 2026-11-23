import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getAdmin } from "@/lib/supabase/admin";
import { getOpenAI, hasOpenAI, AI_MODEL } from "@/lib/openai";
import { jsonResponse, preflightResponse } from "@/lib/cors";

export const maxDuration = 30;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBody {
  storeId?: string;
  visitorId?: string;
  messages?: IncomingMessage[];
}

/* -------------------------------------------------------------------------- */
/* Very small in-memory rate limiter (best-effort on serverless)              */
/* -------------------------------------------------------------------------- */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

/* -------------------------------------------------------------------------- */
/* Tools                                                                      */
/* -------------------------------------------------------------------------- */
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "lookup_order",
      description:
        "Look up the fulfilment status of a specific order. Requires the exact order number and the email address used when placing the order.",
      parameters: {
        type: "object",
        properties: {
          order_number: {
            type: "string",
            description: "The order number, e.g. '#1001' or '1001'.",
          },
          email: {
            type: "string",
            description: "The email address used at checkout.",
          },
        },
        required: ["order_number", "email"],
        additionalProperties: false,
      },
    },
  },
];

async function lookupOrder(
  storeId: string,
  orderNumber: string,
  email: string
): Promise<Record<string, unknown>> {
  const admin = getAdmin();
  const normalized = orderNumber.trim().replace(/^#/, "");

  const { data, error } = await admin
    .from("store_orders")
    .select(
      "order_number, fulfillment_status, carrier, tracking_number, customer_email"
    )
    .eq("store_id", storeId)
    .ilike("order_number", `%${normalized}%`)
    .limit(10);

  if (error) throw error;

  const target = email.trim().toLowerCase();
  const match = (data ?? []).find((order) => {
    const stored = (order.order_number as string).replace(/^#/, "");
    const emailMatches =
      (order.customer_email as string).trim().toLowerCase() === target;
    return emailMatches && stored === normalized;
  }) ?? (data ?? []).find(
    (order) => (order.customer_email as string).trim().toLowerCase() === target
  );

  if (!match) {
    return {
      found: false,
      message:
        "No order matched both the order number and email. Ask the customer to double-check.",
    };
  }

  return {
    found: true,
    order_number: match.order_number,
    status: match.fulfillment_status,
    carrier: match.carrier,
    tracking_number: match.tracking_number,
  };
}

/* -------------------------------------------------------------------------- */

export function OPTIONS() {
  return preflightResponse();
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return jsonResponse(
      { reply: "You're sending messages a little too fast. Please wait a moment." },
      { status: 429 }
    );
  }

  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400 });
  }

  const storeId = body.storeId?.trim();
  const visitorId = body.visitorId?.trim() || "anonymous";
  const incoming = Array.isArray(body.messages) ? body.messages : [];

  if (!storeId) {
    return jsonResponse({ error: "storeId is required" }, { status: 400 });
  }

  const history: ChatCompletionMessageParam[] = incoming
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return jsonResponse({ error: "No user message provided" }, { status: 400 });
  }

  try {
    const admin = getAdmin();
    const { data: store, error } = await admin
      .from("stores")
      .select(
        "id, store_name, store_domain, return_policy_text, shipping_policy_text"
      )
      .eq("id", storeId)
      .maybeSingle();

    if (error) throw error;
    if (!store) {
      return jsonResponse({ error: "Store not found" }, { status: 404 });
    }

    if (!hasOpenAI()) {
      return jsonResponse(
        {
          reply:
            "The AI assistant isn't configured yet. Please contact the store owner.",
        },
        { status: 503 }
      );
    }

    const systemPrompt = buildSystemPrompt({
      storeName: store.store_name as string,
      storeDomain: store.store_domain as string,
      returnPolicy: (store.return_policy_text as string) || "",
      shippingPolicy: (store.shipping_policy_text as string) || "",
    });

    const openai = getOpenAI();
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history,
    ];

    let reply = "";
    for (let step = 0; step < 4; step += 1) {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages,
        tools,
        tool_choice: "auto",
        temperature: 0.3,
        max_tokens: 400,
      });

      const choice = completion.choices[0]?.message;
      if (!choice) break;

      messages.push(choice);

      if (choice.tool_calls && choice.tool_calls.length > 0) {
        for (const call of choice.tool_calls) {
          if (call.type !== "function") continue;
          let result: Record<string, unknown>;
          try {
            const args = JSON.parse(call.function.arguments || "{}") as {
              order_number?: string;
              email?: string;
            };
            if (
              call.function.name === "lookup_order" &&
              args.order_number &&
              args.email
            ) {
              result = await lookupOrder(storeId, args.order_number, args.email);
            } else {
              result = { error: "Unknown or incomplete tool call." };
            }
          } catch (toolError) {
            console.error("[chat] tool error", toolError);
            result = { error: "Tool execution failed." };
          }
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(result),
          });
        }
        continue;
      }

      reply = choice.content?.trim() || "";
      break;
    }

    if (!reply) {
      reply =
        "Sorry, I couldn't generate a response just now. Please try rephrasing, or reach out to our support team.";
    }

    // Best-effort conversation logging for the analytics dashboard.
    logConversation(admin, storeId, visitorId, history, reply).catch((err) =>
      console.error("[chat] log error", err)
    );

    return jsonResponse({ reply });
  } catch (error) {
    console.error("[chat]", error);
    return jsonResponse(
      {
        reply:
          "Something went wrong on my end. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------------------------- */

function buildSystemPrompt(input: {
  storeName: string;
  storeDomain: string;
  returnPolicy: string;
  shippingPolicy: string;
}): string {
  return `You are "DeflectAI", the automated customer-support assistant for the online store "${input.storeName}" (${input.storeDomain}).

Your ONLY job is to help shoppers with:
1. Order status and tracking ("where is my order?").
2. Return policy questions.
3. Shipping policy questions.

Rules you must follow:
- For ANY order status question you MUST call the lookup_order tool. Never guess or invent order details.
- You need BOTH the order number and the email used at checkout. If either is missing, ask for it before calling the tool.
- Status meanings: "unfulfilled" = order received but not shipped yet; "in_transit" = shipped and on the way; "delivered" = delivered.
- If lookup_order returns found: false, tell the shopper you couldn't find a matching order, ask them to double-check the order number and email, and offer to connect them with the team. Do not reveal any other customer's data.
- Use the RETURN POLICY and SHIPPING POLICY below to answer those questions accurately, including timeframes and costs. If a question isn't covered, say you'll connect them with the team instead of inventing an answer.
- Keep every reply short, warm and helpful (2-4 sentences). Match the shopper's language.
- Never promise refunds, discounts, cancellations, or exceptions to policy.
- If the question is unrelated to orders, returns or shipping, politely explain that you can only help with those and suggest contacting support.

--- RETURN POLICY ---
${input.returnPolicy.trim() || "Not provided."}

--- SHIPPING POLICY ---
${input.shippingPolicy.trim() || "Not provided."}`;
}

async function logConversation(
  admin: ReturnType<typeof getAdmin>,
  storeId: string,
  visitorId: string,
  history: ChatCompletionMessageParam[],
  reply: string
): Promise<void> {
  const { data: session, error: sessionError } = await admin
    .from("chat_sessions")
    .insert({ store_id: storeId, visitor_id: visitorId })
    .select("id")
    .single();
  if (sessionError) throw sessionError;

  const rows = [
    ...history
      .filter((m) => m.role === "user")
      .map((m) => ({
        session_id: session.id as string,
        role: "user",
        content: typeof m.content === "string" ? m.content : "",
      })),
    { session_id: session.id as string, role: "assistant", content: reply },
  ];

  const { error } = await admin.from("chat_messages").insert(rows);
  if (error) throw error;
}
