"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ActionItem = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  resolved: boolean;
  created_at: string;
};

type ClientUpdate = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  created_at: string;
};

type ClientMeeting = {
  id: string;
  client_id: string;
  title: string;
  meeting_date: string;
  notes: string | null;
};

function formatDate(value: string, includeTime = false) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    ...(includeTime
      ? { hour: "numeric", minute: "2-digit" as const }
      : {}),
  }).format(date);
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function LoadingRows({ count = 2 }: { count?: number }) {
  return (
    <div className="divide-y divide-[#E9E0EF]">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-28 animate-pulse bg-white" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [updates, setUpdates] = useState<ClientUpdate[]>([]);
  const [meetings, setMeetings] = useState<ClientMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nextMeeting = useMemo(() => meetings[0] ?? null, [meetings]);

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      setIsLoading(true);

      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("slug", "mvp")
        .single();

      if (!isActive) return;
      if (clientError || !client) {
        setErrorMessage(
          `Could not load the MVP client: ${clientError?.message ?? "Client not found."}`,
        );
        setIsLoading(false);
        return;
      }

      const [actionResult, updateResult, meetingResult] = await Promise.all([
        supabase
          .from("client_action_items")
          .select(
            "id, client_id, title, description, due_date, resolved, created_at",
          )
          .eq("client_id", client.id)
          .eq("resolved", false)
          .order("due_date", { ascending: true }),
        supabase
          .from("client_updates")
          .select("id, client_id, title, description, created_at")
          .eq("client_id", client.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("client_meetings")
          .select("id, client_id, title, meeting_date, notes")
          .eq("client_id", client.id)
          .gte("meeting_date", new Date().toISOString())
          .order("meeting_date", { ascending: true })
          .limit(3),
      ]);

      if (!isActive) return;

      const firstError =
        actionResult.error ?? updateResult.error ?? meetingResult.error;

      if (firstError) {
        setErrorMessage(`Could not load the dashboard: ${firstError.message}`);
        setActionItems([]);
        setUpdates([]);
        setMeetings([]);
      } else {
        setActionItems((actionResult.data ?? []) as ActionItem[]);
        setUpdates((updateResult.data ?? []) as ClientUpdate[]);
        setMeetings((meetingResult.data ?? []) as ClientMeeting[]);
        setErrorMessage(null);
      }

      setIsLoading(false);
    }

    void loadDashboard();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7D4698]">
            Client portal · MVP
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#341F60] sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75647F] sm:text-base">
            What needs your attention, what has changed, and what is coming up.
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mt-7 rounded-2xl border border-[#E4C88F] bg-[#FFF7E6] px-4 py-3 text-sm leading-6 text-[#805A22]"
          >
            {errorMessage}
          </div>
        )}

        <section className="mt-10" aria-labelledby="action-items-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B7895]">
                Your attention
              </p>
              <h2
                id="action-items-heading"
                className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#341F60]"
              >
                Action items
              </h2>
            </div>
            {!isLoading && (
              <span className="rounded-full bg-[#FFF1B7] px-3 py-1.5 text-[11px] font-semibold text-[#725A00]">
                {actionItems.length} open
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="h-48 animate-pulse rounded-[24px] border border-[#E3D8EA] bg-white"
                  />
                ))
              : actionItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[24px] border border-[#E8D17C] bg-white p-5 shadow-[0_8px_28px_rgba(52,31,96,0.05)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF1B7] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.11em] text-[#725A00]">
                        <span className="size-1.5 rounded-full bg-[#D0A323]" />
                        Action needed
                      </span>
                      {item.due_date && (
                        <span className="text-[11px] font-semibold text-[#9A6C1F]">
                          Due {formatDate(item.due_date)}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[#341F60]">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-2 text-sm leading-6 text-[#75647F]">
                        {item.description}
                      </p>
                    )}
                  </article>
                ))}
          </div>

          {!isLoading && actionItems.length === 0 && !errorMessage && (
            <div className="mt-5 rounded-[24px] border border-[#DCCFE4] bg-white px-6 py-9 text-center">
              <span className="mx-auto flex size-9 items-center justify-center rounded-full bg-[#EEE3FA] text-[#7D4698]">
                ✓
              </span>
              <p className="mt-3 text-sm font-semibold text-[#341F60]">
                You’re all caught up.
              </p>
              <p className="mt-1 text-xs text-[#75647F]">
                There are no open action items right now.
              </p>
            </div>
          )}
        </section>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
          <section aria-labelledby="recent-updates-heading">
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B7895]">
              Activity
            </p>
            <h2
              id="recent-updates-heading"
              className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#341F60]"
            >
              Recent updates
            </h2>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-[#E3D8EA] bg-white shadow-[0_8px_28px_rgba(52,31,96,0.05)]">
              {isLoading ? (
                <LoadingRows count={3} />
              ) : updates.length > 0 ? (
                <div className="divide-y divide-[#E9E0EF]">
                  {updates.map((update) => (
                    <article key={update.id} className="flex gap-4 px-5 py-5 sm:px-6">
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-[#7D4698] ring-4 ring-[#EEE3FA]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <h3 className="text-sm font-semibold text-[#341F60]">
                            {update.title}
                          </h3>
                          <time className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9A8AA3]">
                            {formatDate(update.created_at)}
                          </time>
                        </div>
                        {update.description && (
                          <p className="mt-1.5 text-sm leading-6 text-[#75647F]">
                            {update.description}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="px-6 py-10 text-center text-sm text-[#75647F]">
                  No recent updates yet.
                </p>
              )}
            </div>
          </section>

          <section aria-labelledby="meetings-heading">
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B7895]">
              Calendar
            </p>
            <h2
              id="meetings-heading"
              className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#341F60]"
            >
              Upcoming meetings
            </h2>

            <div className="mt-5 rounded-[24px] border border-[#D8C7E2] bg-[#EEE3FA] p-5 shadow-[0_8px_28px_rgba(52,31,96,0.045)] sm:p-6">
              {isLoading ? (
                <div className="h-32 animate-pulse rounded-2xl bg-white/70" />
              ) : nextMeeting ? (
                <article>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#7D4698] text-[#F4CE45] shadow-[0_8px_20px_rgba(52,31,96,0.14)]">
                    <CalendarIcon />
                  </div>
                  <time className="mt-5 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#7D4698]">
                    {formatDate(nextMeeting.meeting_date, true)}
                  </time>
                  <h3 className="mt-2 text-lg font-semibold text-[#341F60]">
                    {nextMeeting.title}
                  </h3>
                  {nextMeeting.notes && (
                    <p className="mt-2 text-sm leading-6 text-[#695677]">
                      {nextMeeting.notes}
                    </p>
                  )}
                </article>
              ) : (
                <p className="py-6 text-center text-sm text-[#695677]">
                  No meetings are currently scheduled.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
