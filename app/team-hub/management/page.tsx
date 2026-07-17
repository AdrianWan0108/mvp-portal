"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTeamIdentity } from "../_components/TeamIdentity";

type SlackSyncResult = {
  profilesUpdated?: number;
  profilesChecked?: number;
  unmatchedProfiles?: unknown[];
  error?: string;
};

export default function TeamHubManagementPage() {
  const router = useRouter();
  const { accessLevel, isReady } = useTeamIdentity();
  const [isSyncingSlack, setIsSyncingSlack] = useState(false);
  const [slackSyncMessage, setSlackSyncMessage] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (isReady && accessLevel && accessLevel !== "owner") {
      router.replace("/team-hub/dashboard");
    }
  }, [accessLevel, isReady, router]);

  if (!isReady || accessLevel !== "owner") {
    return (
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto h-40 max-w-5xl animate-pulse rounded-[24px] bg-[#EEE3FA]" />
      </main>
    );
  }

  async function syncSlackProfiles() {
    if (isSyncingSlack) return;
    setIsSyncingSlack(true);
    setSlackSyncMessage(null);

    try {
      const response = await fetch("/api/sync-slack-profiles", {
        method: "POST",
      });
      const result = (await response.json()) as SlackSyncResult;

      if (!response.ok) {
        setSlackSyncMessage({
          tone: "error",
          text: result.error || "Slack profile sync failed.",
        });
        return;
      }

      const unmatched = result.unmatchedProfiles?.length ?? 0;
      setSlackSyncMessage({
        tone: "success",
        text: `Updated ${result.profilesUpdated ?? 0} of ${
          result.profilesChecked ?? 0
        } profiles${unmatched ? `; ${unmatched} still need mapping` : ""}.`,
      });
    } catch {
      setSlackSyncMessage({
        tone: "error",
        text: "Could not reach the Slack profile sync service.",
      });
    } finally {
      setIsSyncingSlack(false);
    }
  }

  return (
    <main className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7D4698]">
            Owner access
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#28154F] sm:text-4xl">
            Management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75647F] sm:text-base">
            Open internal management tools available to Understory owners.
          </p>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin"
            className="group rounded-[24px] border border-[#D7CBE0] bg-white p-6 shadow-[0_8px_28px_rgba(40,21,79,0.055)] transition hover:-translate-y-1 hover:border-[#7D4698] hover:shadow-[0_14px_34px_rgba(40,21,79,0.11)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#341F60] text-[#F4CE45]">
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
                <path d="M4 7h16v12H4Z" />
                <path d="M8 7V5h8v2M8 12h8M8 16h5" />
              </svg>
            </span>
            <h2 className="mt-5 text-lg font-semibold text-[#341F60]">
              Admin console
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#75647F]">
              Manage client-facing data, projects, documents, invoices, and
              approvals.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#7D4698]">
              Open admin console
              <span className="transition group-hover:translate-x-1">→</span>
            </span>
          </Link>

          <article className="rounded-[24px] border border-[#D7CBE0] bg-white p-6 shadow-[0_8px_28px_rgba(40,21,79,0.055)]">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#341F60] text-[#F4CE45]">
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
                <path d="M8 8a4 4 0 1 1 8 0v2H8Z" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2M8 13h8" />
              </svg>
            </span>
            <h2 className="mt-5 text-lg font-semibold text-[#341F60]">
              Slack profiles
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#75647F]">
              Refresh team display names and profile photos stored in
              Supabase.
            </p>
            <button
              type="button"
              disabled={isSyncingSlack}
              onClick={() => void syncSlackProfiles()}
              className="mt-5 rounded-full bg-[#341F60] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#28154F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSyncingSlack ? "Syncing…" : "Sync Slack profiles"}
            </button>
            {slackSyncMessage && (
              <p
                role={slackSyncMessage.tone === "error" ? "alert" : "status"}
                className={`mt-4 rounded-xl px-3.5 py-3 text-xs leading-5 ${
                  slackSyncMessage.tone === "error"
                    ? "bg-[#FFF0F0] text-[#8B3E3E]"
                    : "bg-[#EDF7EF] text-[#356346]"
                }`}
              >
                {slackSyncMessage.text}
              </p>
            )}
          </article>
        </section>
      </div>
    </main>
  );
}
