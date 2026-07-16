"use client";

import Link from "next/link";
import { useState } from "react";
import { ClientSelect } from "@/app/_components/ClientSelect";
import {
  WORKSPACE_CLIENTS,
  WORKSPACE_CLIENT_SLUGS,
  type WorkspaceClientSlug,
} from "@/lib/workspace-clients";

type Division = "social-media" | "website" | "ads" | "branding";
type ClientSlug = WorkspaceClientSlug;

const divisions: Array<{
  id: Division;
  label: string;
  description: string;
}> = [
  {
    id: "social-media",
    label: "Social media",
    description: "Content calendars, carousel designs, and review status.",
  },
  {
    id: "website",
    label: "Website",
    description: "Page production, review workflow, QA, and live previews.",
  },
  {
    id: "ads",
    label: "Ads",
    description: "Campaign planning and creative production.",
  },
  {
    id: "branding",
    label: "Branding",
    description: "Identity, collateral, and visual-system projects.",
  },
];

function divisionLink(division: Division, client: ClientSlug) {
  if (division === "website") {
    return `/team/website?client=${client}`;
  }
  if (division === "social-media") {
    return `/team/${client}/social-media/august-content-calendar`;
  }
  return null;
}

function DivisionIcon({ division }: { division: Division }) {
  const paths = {
    "social-media": (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    website: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      </>
    ),
    ads: (
      <>
        <path d="m4 13 12-5v10L4 13Z" />
        <path d="M16 10h2a3 3 0 0 1 0 6h-2M6 14l1 6h4l-2-7" />
      </>
    ),
    branding: (
      <>
        <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3.5A5.5 5.5 0 0 0 21 7.5C21 5 17 3 12 3Z" />
        <circle cx="8" cy="9" r="1" fill="currentColor" stroke="none" />
        <circle cx="11" cy="6.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="7" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[division]}
    </svg>
  );
}

export default function TeamHubProjectsPage() {
  const [division, setDivision] = useState<Division>("social-media");
  const [client, setClient] = useState<ClientSlug>("mvp");
  const activeDivision =
    divisions.find((candidate) => candidate.id === division) ?? divisions[0];
  const workspaceHref = divisionLink(division, client);
  const clientOptions = WORKSPACE_CLIENT_SLUGS.map((slug) => ({
    value: slug,
    label: WORKSPACE_CLIENTS[slug].name,
  }));

  return (
    <main className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7D4698]">
              Team Hub · Production
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#28154F] sm:text-4xl">
              Projects
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75647F] sm:text-base">
              Choose a division and client to open the correct internal
              workspace.
            </p>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8B7895] lg:text-right">
              Client
            </p>
            <ClientSelect
              value={client}
              onChange={(value) => setClient(value as ClientSlug)}
              options={clientOptions}
              ariaLabel="Select project client"
            />
          </div>
        </section>

        <section
          aria-label="Project divisions"
          className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {divisions.map((item) => {
            const isActive = item.id === division;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDivision(item.id)}
                className={`rounded-[20px] border p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698] ${
                  isActive
                    ? "border-[#7D4698] bg-[#341F60] text-white shadow-[0_10px_28px_rgba(40,21,79,0.16)]"
                    : "border-[#D7CBE0] bg-white text-[#341F60] hover:-translate-y-0.5 hover:border-[#B89BC8]"
                }`}
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-white/10 text-[#F4CE45]"
                      : "bg-[#EEE3FA] text-[#7D4698]"
                  }`}
                >
                  <DivisionIcon division={item.id} />
                </span>
                <span className="mt-4 block text-sm font-semibold">
                  {item.label}
                </span>
                <span
                  className={`mt-1 block text-xs leading-5 ${
                    isActive ? "text-white/65" : "text-[#75647F]"
                  }`}
                >
                  {item.description}
                </span>
              </button>
            );
          })}
        </section>

        <section className="mt-7 overflow-hidden rounded-[26px] border border-[#D7CBE0] bg-white shadow-[0_8px_28px_rgba(40,21,79,0.055)]">
          <div className="bg-[linear-gradient(135deg,#EEE3FA,#FFFDF8)] p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7D4698]">
                  {WORKSPACE_CLIENTS[client].name} · Selected workspace
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#28154F]">
                  {activeDivision.label}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#75647F]">
                  {activeDivision.description}
                </p>
              </div>

              {workspaceHref ? (
                <Link
                  href={workspaceHref}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#341F60] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(40,21,79,0.15)] transition hover:bg-[#28154F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
                >
                  Open {activeDivision.label} workspace
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="inline-flex shrink-0 rounded-full bg-[#FFF1B7] px-4 py-2.5 text-xs font-semibold text-[#725A00]">
                  Coming soon
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            {workspaceHref ? (
              <>
                <div className="rounded-2xl border border-[#E5DBEA] bg-[#FFFDF8] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8B7895]">
                    Division
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#341F60]">
                    {activeDivision.label}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5DBEA] bg-[#FFFDF8] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8B7895]">
                    Client scope
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#341F60]">
                    {WORKSPACE_CLIENTS[client].name}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E5DBEA] bg-[#FFFDF8] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8B7895]">
                    Data
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#341F60]">
                    Live from Supabase
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm leading-6 text-[#75647F] sm:col-span-3">
                The {activeDivision.label.toLowerCase()} workspace has been
                reserved and will be built in a follow-up.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
