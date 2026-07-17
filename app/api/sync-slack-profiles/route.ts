import type { NextRequest } from "next/server";
import {
  TEAM_IDENTITIES,
  TEAM_SESSION_COOKIE,
  getTeamIdentityForUsername,
} from "@/lib/team-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function invokeProfileSync() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const syncSecret = process.env.SLACK_PROFILE_SYNC_SECRET;

  if (!supabaseUrl || !syncSecret) {
    return jsonError("Slack profile sync is not configured.", 500);
  }

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/$/, "")}/functions/v1/sync-slack-profiles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sync-secret": syncSecret,
        },
        body: JSON.stringify({ source: "vercel" }),
        cache: "no-store",
      },
    );
    const body = await response.text();

    return new Response(body || JSON.stringify({ ok: response.ok }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Could not invoke sync-slack-profiles", error);
    return jsonError("Could not reach the Slack profile sync service.", 502);
  }
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (
    !cronSecret ||
    request.headers.get("authorization") !== `Bearer ${cronSecret}`
  ) {
    return jsonError("Unauthorized", 401);
  }

  return invokeProfileSync();
}

export async function POST(request: NextRequest) {
  const identity = getTeamIdentityForUsername(
    request.cookies.get(TEAM_SESSION_COOKIE)?.value,
  );

  if (!identity || TEAM_IDENTITIES[identity].accessLevel !== "owner") {
    return jsonError("Owner access is required.", 403);
  }

  return invokeProfileSync();
}
