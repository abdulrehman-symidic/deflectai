import "server-only";

import OpenAI from "openai";

export const AI_MODEL = "gpt-4o-mini";

let cached: OpenAI | null = null;

export function hasOpenAI(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAI(): OpenAI {
  if (cached) return cached;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY. Add it to .env.local");
  }
  cached = new OpenAI({ apiKey });
  return cached;
}
