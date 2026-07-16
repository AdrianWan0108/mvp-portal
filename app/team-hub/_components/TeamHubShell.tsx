"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import understoryLogo from "@/public/under story logo-purple.png";
import {
  TEAM_IDENTITIES,
  VALID_TEAM_USERNAMES,
  TeamIdentityProvider,
  type TeamAccessLevel,
  type TeamIdentity,
  useTeamIdentity,
} from "./TeamIdentity";

type NavIcon =
  | "dashboard"
  | "management"
  | "projects"
  | "clients"
  | "payroll"
  | "documents"
  | "resources";

const navigation: Array<{
  label: string;
  href: string;
  icon: NavIcon;
  ownerOnly?: boolean;
}> = [
  {
    label: "Dashboard",
    href: "/team-hub/dashboard",
    icon: "dashboard",
  },
  {
    label: "Management",
    href: "/team-hub/management",
    icon: "management",
    ownerOnly: true,
  },
  {
    label: "Projects",
    href: "/team-hub/projects",
    icon: "projects",
  },
  {
    label: "Client info",
    href: "/team-hub/client-info",
    icon: "clients",
  },
  {
    label: "Payroll",
    href: "/team-hub/payroll",
    icon: "payroll",
  },
  {
    label: "Documents",
    href: "/team-hub/documents",
    icon: "documents",
  },
  {
    label: "Resources",
    href: "/team-hub/resources",
    icon: "resources",
  },
];

function TeamIcon({
  name,
  className = "size-5",
}: {
  name: NavIcon | "menu" | "close";
  className?: string;
}) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    management: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2M18 5l1-1M6 5 5 4" />
      </>
    ),
    projects: (
      <>
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v8A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5Z" />
        <path d="M4 10h16" />
      </>
    ),
    clients: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M17 11a3 3 0 1 0 0-6M16 14a5 5 0 0 1 5 5v1" />
      </>
    ),
    payroll: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 9h5M7 13h3M16 10v4M14 12h4" />
      </>
    ),
    documents: (
      <>
        <path d="M6 3h9l3 3v15H6Z" />
        <path d="M15 3v4h4M9 12h6M9 16h6" />
      </>
    ),
    resources: (
      <>
        <path d="M6 3h9l3 3v15H6Z" />
        <path d="M15 3v4h4M9 12h6M9 16h6" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={understoryLogo}
        alt="Understory"
        className="size-10 rounded-xl"
        priority
      />
      <span>
        <span className="block text-sm font-semibold tracking-wide text-[#341F60]">
          Understory
        </span>
        <span className="block text-[9px] uppercase tracking-[0.22em] text-[#7D4698]">
          Team portal
        </span>
      </span>
    </div>
  );
}

function IdentityPicker({
  onChoose,
}: {
  onChoose: (identity: TeamIdentity) => void;
}) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const matchedUsername = VALID_TEAM_USERNAMES.find(
      (validUsername) =>
        validUsername.toLocaleLowerCase() ===
        username.trim().toLocaleLowerCase(),
    );
    const identity = (Object.keys(TEAM_IDENTITIES) as TeamIdentity[]).find(
      (identityKey) =>
        TEAM_IDENTITIES[identityKey].username === matchedUsername,
    );

    if (!identity) {
      setError(
        "That username isn't recognized. Check with your Understory contact.",
      );
      return;
    }

    setError(null);
    onChoose(identity);
  }

  return (
    <main className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#E9E0EF] px-5 py-8 text-[#28154F]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-[#CDB4DB]/65 blur-3xl" />
        <div className="absolute -bottom-36 -left-24 size-[30rem] rounded-full bg-[#FFF1B7]/75 blur-3xl" />
      </div>

      <section className="relative w-full max-w-xl rounded-[28px] border border-white/80 bg-[#FFFDF8] p-6 shadow-[0_28px_90px_rgba(40,21,79,0.18)] sm:p-10">
        <Image
          src={understoryLogo}
          alt="Understory"
          className="mx-auto size-12 rounded-2xl"
          priority
        />
        <div className="mt-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7D4698]">
            Understory team portal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#28154F] sm:text-4xl">
            Welcome to the Team Hub
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#75647F] sm:text-base">
            Enter your team username. Your access stays active while this
            browser tab is open.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8">
          <label
            htmlFor="team-hub-username"
            className="block text-xs font-semibold text-[#341F60]"
          >
            Username
          </label>
          <input
            id="team-hub-username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter your username"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "team-hub-login-error" : undefined}
            className="mt-2 w-full rounded-xl border border-[#CDBAD9] bg-white px-4 py-3.5 text-sm text-[#341F60] placeholder:text-[#AA98B4] focus:border-[#7D4698] focus:outline-none focus:ring-2 focus:ring-[#EEE3FA]"
          />
          {error && (
            <p
              id="team-hub-login-error"
              role="alert"
              className="mt-3 rounded-xl border border-[#E4B9B9] bg-[#FFF0F0] px-4 py-3 text-sm text-[#8B3E3E]"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!username.trim()}
            className="mt-5 w-full rounded-full bg-[#341F60] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(40,21,79,0.16)] transition hover:bg-[#28154F] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
          >
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}

function IdentityIndicator({
  identity,
  compact = false,
}: {
  identity: TeamIdentity;
  compact?: boolean;
}) {
  const { openIdentityPicker } = useTeamIdentity();
  const profile = TEAM_IDENTITIES[identity];

  return (
    <div
      className={`flex items-center rounded-xl border border-[#D7CBE0] bg-white ${
        compact ? "gap-2 px-2.5 py-2" : "gap-2.5 px-3 py-2.5"
      }`}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#341F60] text-[10px] font-semibold text-white">
        {profile.initials}
      </span>
      <span className="min-w-0">
        {!compact && (
          <span className="block text-[9px] uppercase tracking-[0.13em] text-[#8B7895]">
            Viewing as
          </span>
        )}
        <span className="block truncate text-[10px] font-semibold text-[#341F60] sm:text-xs">
          {profile.name} · {profile.title}
        </span>
      </span>
      <button
        type="button"
        onClick={openIdentityPicker}
        className="ml-1 text-[9px] font-semibold text-[#7D4698] hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
      >
        Switch
      </button>
    </div>
  );
}

function TeamNavigation({
  pathname,
  accessLevel,
  onNavigate,
}: {
  pathname: string;
  accessLevel: TeamAccessLevel;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Team Hub navigation" className="space-y-1.5">
      {navigation
        .filter((item) => accessLevel === "owner" || !item.ownerOnly)
        .map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698] ${
                isActive
                  ? "bg-[#341F60] text-white shadow-[0_8px_24px_rgba(40,21,79,0.16)]"
                  : "text-[#5F3378] hover:bg-white hover:text-[#28154F]"
              }`}
            >
              <TeamIcon
                name={item.icon}
                className={`size-4.5 shrink-0 ${
                  isActive ? "text-[#F4CE45]" : "text-[#7D4698]"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}

function TeamHubShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    identity,
    accessLevel,
    isReady,
    isPickerOpen,
    selectIdentity,
  } = useTeamIdentity();

  useEffect(() => {
    if (isReady && identity && !isPickerOpen && pathname === "/team-hub") {
      router.replace("/team-hub/dashboard");
    }
  }, [identity, isPickerOpen, isReady, pathname, router]);

  if (!isReady) {
    return <div className="min-h-screen bg-[#E9E0EF]" />;
  }

  if (!identity || !accessLevel || isPickerOpen) {
    return (
      <IdentityPicker
        onChoose={(nextIdentity) => {
          selectIdentity(nextIdentity);
          const nextProfile = TEAM_IDENTITIES[nextIdentity];
          const shouldUseDashboard =
            pathname === "/team-hub" ||
            (pathname.startsWith("/team-hub/management") &&
              nextProfile.accessLevel !== "owner");
          if (shouldUseDashboard) {
            router.replace("/team-hub/dashboard");
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EEF8] text-[#28154F]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[230px] flex-col border-r border-[#D7CBE0] bg-[#EEE3FA] px-4 py-5 md:flex">
        <div className="px-1">
          <Brand />
        </div>
        <div className="mt-7 flex-1">
          <TeamNavigation
            pathname={pathname}
            accessLevel={accessLevel}
          />
        </div>
        <p className="border-t border-[#D7CBE0] px-2 pt-4 text-[10px] leading-4 text-[#8B7895]">
          Understory · Internal workspace
        </p>
      </aside>

      <header className="sticky top-0 z-50 border-b border-[#D7CBE0] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <div className="flex items-center gap-2">
            <IdentityIndicator identity={identity} compact />
            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-team-navigation"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#CDBAD9] bg-white text-[#5F3378] transition hover:bg-[#EEE3FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
            >
              <TeamIcon
                name={isMobileMenuOpen ? "close" : "menu"}
                className="size-5"
              />
              <span className="sr-only">
                {isMobileMenuOpen ? "Close navigation" : "Open navigation"}
              </span>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            id="mobile-team-navigation"
            className="absolute inset-x-0 top-full border-b border-[#D7CBE0] bg-[#EEE3FA] px-4 py-4 shadow-[0_14px_35px_rgba(40,21,79,0.14)]"
          >
            <TeamNavigation
              pathname={pathname}
              accessLevel={accessLevel}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}
      </header>

      <div className="min-h-screen md:pl-[230px]">
        <div className="sticky top-0 z-30 hidden border-b border-[#D7CBE0] bg-white/90 px-8 py-3 backdrop-blur md:flex md:justify-end">
          <IdentityIndicator identity={identity} />
        </div>
        {children}
      </div>
    </div>
  );
}

export function TeamHubShell({ children }: { children: React.ReactNode }) {
  return (
    <TeamIdentityProvider>
      <TeamHubShellContent>{children}</TeamHubShellContent>
    </TeamIdentityProvider>
  );
}
