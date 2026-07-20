import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AssistantAgent = "content" | "research";

export function isAssistantAgent(value: unknown): value is AssistantAgent {
  return value === "content" || value === "research";
}

// Cheapest current tier — deliberate choice for a hard-capped, predictable
// budget. Update PRICING alongside MODEL_ID if the model tier ever changes.
export const MODEL_ID = "claude-haiku-4-5";
export const PRICING = { input: 1, output: 5 }; // USD per million tokens
export const MONTHLY_BUDGET_USD = 20;
export const MAX_REPLY_TOKENS = 1024;
export const MAX_HISTORY_MESSAGES = 20;

export const AGENT_SYSTEM_PROMPTS: Record<AssistantAgent, string> = {
  content:
    "You are a marketing copywriter for Understory, a small marketing agency, helping write content for its clients. " +
    "Write in the client's brand voice when one is given below. Produce tight, ready-to-use output — social captions, " +
    "ad copy, brief drafts — not lengthy explanations. Ask a clarifying question only if the request is genuinely ambiguous.",
  research:
    "You are a research assistant for Understory, a small marketing agency. Synthesize what you're told about a client " +
    "below plus your own general knowledge into clear, actionable findings for the team. You do not have live internet " +
    "access — say so plainly if asked for something time-sensitive you can't know, rather than guessing.",
};

type ClientProfileDigest = {
  client_name: string;
  industry: string | null;
  overview: string | null;
  target_audience: string | null;
  unique_value_prop: string | null;
  brand_voice: string | null;
  marketing_channels: string | null;
};

export function buildClientContext(profile: ClientProfileDigest): string {
  const lines = [`Client: ${profile.client_name}`];
  if (profile.industry) lines.push(`Industry: ${profile.industry}`);
  if (profile.overview) lines.push(`Overview: ${profile.overview}`);
  if (profile.target_audience) {
    lines.push(`Target audience: ${profile.target_audience}`);
  }
  if (profile.unique_value_prop) {
    lines.push(`Unique value proposition: ${profile.unique_value_prop}`);
  }
  if (profile.brand_voice) lines.push(`Brand voice: ${profile.brand_voice}`);
  if (profile.marketing_channels) {
    lines.push(`Marketing channels in use: ${profile.marketing_channels}`);
  }
  return lines.join("\n");
}

export function estimateCostUsd(inputTokens: number, outputTokens: number) {
  return (
    (inputTokens / 1_000_000) * PRICING.input +
    (outputTokens / 1_000_000) * PRICING.output
  );
}

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export function startOfCurrentMonthIso() {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  return startOfMonth.toISOString();
}

export async function getMonthlySpend(
  admin: SupabaseClient,
): Promise<number> {
  const { data, error } = await admin
    .from("assistant_usage")
    .select("estimated_cost_usd")
    .gte("created_at", startOfCurrentMonthIso());

  if (error) throw new Error(error.message);

  return (data ?? []).reduce(
    (sum, row) => sum + Number(row.estimated_cost_usd ?? 0),
    0,
  );
}
