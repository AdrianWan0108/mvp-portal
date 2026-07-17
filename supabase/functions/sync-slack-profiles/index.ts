import { createClient } from "npm:@supabase/supabase-js@2";

type SlackProfile = {
  email?: string | null;
  display_name?: string | null;
  real_name?: string | null;
  image_192?: string | null;
};

type SlackUser = {
  id: string;
  name?: string | null;
  real_name?: string | null;
  deleted?: boolean;
  profile?: SlackProfile;
};

type SlackUsersPage = {
  ok: boolean;
  members?: SlackUser[];
  error?: string;
  response_metadata?: {
    next_cursor?: string;
  };
};

type TeamProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  slack_user_id: string | null;
};

const SLACK_USERS_URL = "https://slack.com/api/users.list";
const PAGE_SIZE = 200;
const MAX_RATE_LIMIT_RETRIES = 3;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase() || null;
}

function nonEmpty(value: string | null | undefined) {
  return value?.trim() || null;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchSlackUsersPage(
  token: string,
  cursor?: string,
): Promise<SlackUsersPage | null> {
  const url = new URL(SLACK_USERS_URL);
  url.searchParams.set("limit", String(PAGE_SIZE));
  if (cursor) url.searchParams.set("cursor", cursor);

  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Slack users.list network error", {
        attempt,
        error: error instanceof Error ? error.message : String(error),
      });

      if (attempt === MAX_RATE_LIMIT_RETRIES) return null;
      await wait(1000 * 2 ** attempt);
      continue;
    }

    if (response.status === 429) {
      const retryAfterSeconds = Math.max(
        Number(response.headers.get("Retry-After") ?? "1") || 1,
        1,
      );
      console.warn("Slack users.list rate limited", {
        attempt,
        retryAfterSeconds,
      });

      if (attempt === MAX_RATE_LIMIT_RETRIES) return null;
      await wait(retryAfterSeconds * 1000);
      continue;
    }

    if (!response.ok) {
      console.error("Slack users.list HTTP error", {
        status: response.status,
        body: await response.text(),
      });
      return null;
    }

    const payload = (await response.json()) as SlackUsersPage;
    if (!payload.ok) {
      console.error("Slack users.list API error", {
        error: payload.error ?? "unknown_error",
      });
      return null;
    }

    return payload;
  }

  return null;
}

async function listAllSlackUsers(token: string) {
  const members: SlackUser[] = [];
  let cursor: string | undefined;
  let page = 0;

  do {
    const payload = await fetchSlackUsersPage(token, cursor);
    if (!payload) {
      return { members, complete: false, failedPage: page + 1 };
    }

    members.push(...(payload.members ?? []));
    cursor = nonEmpty(payload.response_metadata?.next_cursor) ?? undefined;
    page += 1;
  } while (cursor);

  return { members, complete: true, failedPage: null };
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const expectedSecret = Deno.env.get("SLACK_PROFILE_SYNC_SECRET");
  if (!expectedSecret) {
    console.error("Missing SLACK_PROFILE_SYNC_SECRET");
    return json({ error: "Sync endpoint is not configured" }, 500);
  }

  if (request.headers.get("x-sync-secret") !== expectedSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  const slackToken = Deno.env.get("SLACK_BOT_TOKEN");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SECRET_KEY");

  if (!slackToken || !supabaseUrl || !serviceRoleKey) {
    console.error("Missing required sync environment variables", {
      hasSlackToken: Boolean(slackToken),
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
    });
    return json({ error: "Sync service is not fully configured" }, 500);
  }

  try {
    const slackResult = await listAllSlackUsers(slackToken);
    if (!slackResult.members.length && !slackResult.complete) {
      return json(
        {
          error: "Slack users could not be loaded",
          failedPage: slackResult.failedPage,
        },
        502,
      );
    }

    if (!slackResult.complete) {
      console.warn("Continuing with a partial Slack user list", {
        loaded: slackResult.members.length,
        failedPage: slackResult.failedPage,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: profileRows, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, slack_user_id");

    if (profilesError) {
      console.error("Could not load existing profiles", profilesError);
      return json({ error: "Could not load existing profiles" }, 500);
    }

    const profiles = (profileRows ?? []) as TeamProfile[];
    const slackById = new Map(
      slackResult.members.map((member) => [member.id, member]),
    );
    const slackByEmail = new Map<string, SlackUser>();

    for (const member of slackResult.members) {
      const email = normalizeEmail(member.profile?.email);
      if (email && !slackByEmail.has(email)) {
        slackByEmail.set(email, member);
      }
    }

    const matchedSlackIds = new Set<string>();
    const updated: Array<{
      profileId: string;
      profileName: string | null;
      slackUserId: string;
      matchedBy: "email" | "slack_user_id";
    }> = [];
    const unmatchedProfiles: Array<{
      profileId: string;
      profileName: string | null;
    }> = [];
    const updateErrors: Array<{
      profileId: string;
      error: string;
    }> = [];

    for (const profile of profiles) {
      const emailMatch = normalizeEmail(profile.email);
      const slackUser =
        (emailMatch ? slackByEmail.get(emailMatch) : undefined) ??
        (profile.slack_user_id
          ? slackById.get(profile.slack_user_id)
          : undefined);

      if (!slackUser) {
        unmatchedProfiles.push({
          profileId: profile.id,
          profileName: profile.full_name,
        });
        continue;
      }

      const displayName =
        nonEmpty(slackUser.profile?.display_name) ??
        nonEmpty(slackUser.profile?.real_name) ??
        nonEmpty(slackUser.real_name);
      const avatarUrl = nonEmpty(slackUser.profile?.image_192);
      const update: Record<string, string> = {
        slack_user_id: slackUser.id,
        slack_synced_at: new Date().toISOString(),
      };

      if (displayName) update.slack_display_name = displayName;
      if (avatarUrl) update.avatar_url = avatarUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update(update)
        .eq("id", profile.id);

      if (updateError) {
        console.error("Could not update matched profile", {
          profileId: profile.id,
          slackUserId: slackUser.id,
          error: updateError.message,
        });
        updateErrors.push({
          profileId: profile.id,
          error: updateError.message,
        });
        continue;
      }

      matchedSlackIds.add(slackUser.id);
      const matchedBy =
        emailMatch && slackByEmail.get(emailMatch)?.id === slackUser.id
          ? "email"
          : "slack_user_id";
      const matched = {
        profileId: profile.id,
        profileName: profile.full_name,
        slackUserId: slackUser.id,
        matchedBy,
      } as const;
      updated.push(matched);
      console.log("Slack profile matched and updated", matched);
    }

    const unmatchedSlackUsers = slackResult.members
      .filter((member) => !matchedSlackIds.has(member.id))
      .map((member) => ({
        slackUserId: member.id,
        name:
          nonEmpty(member.profile?.display_name) ??
          nonEmpty(member.profile?.real_name) ??
          nonEmpty(member.real_name) ??
          nonEmpty(member.name),
        deleted: Boolean(member.deleted),
      }));

    if (unmatchedSlackUsers.length) {
      console.log("Slack users without a matching Understory profile", {
        count: unmatchedSlackUsers.length,
        users: unmatchedSlackUsers,
      });
    }

    if (unmatchedProfiles.length) {
      console.log("Understory profiles without a Slack match", {
        count: unmatchedProfiles.length,
        profiles: unmatchedProfiles,
      });
    }

    return json({
      ok: updateErrors.length === 0,
      slackListComplete: slackResult.complete,
      slackUsersLoaded: slackResult.members.length,
      profilesChecked: profiles.length,
      profilesUpdated: updated.length,
      updated,
      unmatchedProfiles,
      unmatchedSlackUsers,
      updateErrors,
    });
  } catch (error) {
    console.error("Unexpected Slack profile sync error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return json({ error: "Unexpected profile sync failure" }, 500);
  }
});
