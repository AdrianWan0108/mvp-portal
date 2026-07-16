"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import understoryLogo from "@/public/under story logo-purple.png";
import {
  CLIENT_IDENTITIES,
  ClientIdentityProvider,
  type ClientIdentity,
  useClientIdentity,
} from "./ClientIdentity";

type NavIcon =
  | "dashboard"
  | "projects"
  | "approvals"
  | "gallery"
  | "invoices"
  | "documents"
  | "assets";

const navigation: Array<{
  href: string;
  label: string;
  icon: NavIcon;
  garyOnly?: boolean;
}> = [
  {
    href: "/client/portal/dashboard",
    label: "Dashboard",
    icon: "dashboard",
  },
  {
    href: "/client/portal/projects",
    label: "Projects",
    icon: "projects",
  },
  {
    href: "/client/portal/approvals",
    label: "Approvals",
    icon: "approvals",
  },
  {
    href: "/client/portal/gallery",
    label: "Gallery",
    icon: "gallery",
  },
  {
    href: "/client/portal/invoices",
    label: "Invoices",
    icon: "invoices",
    garyOnly: true,
  },
  {
    href: "/client/portal/documents",
    label: "Documents",
    icon: "documents",
    garyOnly: true,
  },
  {
    href: "/client/portal/assets",
    label: "Asset upload",
    icon: "assets",
  },
];

function PortalIcon({
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
    projects: (
      <>
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v8A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5Z" />
        <path d="M4 10h16" />
      </>
    ),
    approvals: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16M8 15l2 2 5-5" />
      </>
    ),
    gallery: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m4 17 5-5 3.5 3.5 2-2L20 19" />
      </>
    ),
    invoices: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),
    documents: (
      <>
        <path d="M7 3h7l4 4v14H7Z" />
        <path d="M14 3v5h5M10 13h5M10 17h5" />
      </>
    ),
    assets: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" />
        <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
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
      <span className="relative shrink-0">
        <Image
          src={understoryLogo}
          alt="Understory"
          className="size-10 rounded-xl"
          priority
        />
        <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-[#F4CE45]" />
      </span>
      <span>
        <span className="block text-sm font-semibold tracking-wide text-[#341F60]">
          Understory
        </span>
        <span className="block text-[9px] uppercase tracking-[0.22em] text-[#7D4698]">
          Client portal
        </span>
      </span>
    </div>
  );
}

function PortalNavigation({
  pathname,
  identity,
  onNavigate,
}: {
  pathname: string;
  identity: ClientIdentity;
  onNavigate?: () => void;
}) {
  const visibleNavigation = navigation.filter(
    (item) => identity === "gary" || !item.garyOnly,
  );

  return (
    <nav aria-label="Client portal navigation" className="space-y-1.5">
      {visibleNavigation.map((item) => {
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
                ? "bg-[#7D4698] text-white shadow-[0_8px_24px_rgba(52,31,96,0.16)]"
                : "text-[#695677] hover:bg-[#EEE3FA] hover:text-[#341F60]"
            }`}
          >
            <PortalIcon
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

function IdentityPicker({
  onChoose,
}: {
  onChoose: (identity: ClientIdentity) => void;
}) {
  return (
    <div className="client-portal-theme fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#EEE3FA] px-5 py-8 text-[#341F60]">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#DCC7EE]/70 blur-3xl" />
        <div className="absolute -bottom-36 -left-24 h-[30rem] w-[30rem] rounded-full bg-[#FFF1B7]/75 blur-3xl" />
      </div>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-identity-title"
        aria-describedby="portal-identity-description"
        className="relative w-full max-w-2xl rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_28px_90px_rgba(52,31,96,0.16)] sm:p-10"
      >
        <div className="mx-auto mb-7 flex size-12 items-center justify-center rounded-2xl bg-[#EEE3FA] text-[#7D4698]">
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
            <path d="M7.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm9-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20v-2.2c0-2.65 2.24-4.8 5-4.8s5 2.15 5 4.8V20m1-6.5c.8-.55 1.84-.86 3-.86 2.76 0 5 1.8 5 4.02V20" />
          </svg>
        </div>

        <div className="text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7D4698]">
            Motion Vitality Pilates
          </p>
          <h1
            id="portal-identity-title"
            className="text-3xl font-semibold tracking-[-0.04em] text-[#341F60] sm:text-4xl"
          >
            Who is reviewing today?
          </h1>
          <p
            id="portal-identity-description"
            className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#75647F] sm:text-base"
          >
            Choose your identity before entering the portal. Your selection
            stays active while this browser tab is open.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {(Object.keys(CLIENT_IDENTITIES) as ClientIdentity[]).map(
            (identity) => {
              const person = CLIENT_IDENTITIES[identity];

              return (
                <button
                  key={identity}
                  type="button"
                  onClick={() => onChoose(identity)}
                  className="group flex items-center gap-4 rounded-2xl border border-[#E3D8EA] bg-white p-4 text-left shadow-[0_8px_24px_rgba(52,31,96,0.04)] transition hover:-translate-y-0.5 hover:border-[#7D4698]/45 hover:shadow-[0_12px_28px_rgba(52,31,96,0.09)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#EEE3FA] text-xl font-semibold text-[#5F3378]">
                    {person.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-[#341F60]">
                      {person.name}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#75647F]">
                      {person.role}
                    </span>
                  </span>
                  <svg
                    aria-hidden="true"
                    className="size-5 text-[#B09CBA] transition group-hover:translate-x-0.5 group-hover:text-[#7D4698]"
                    fill="none"
                    viewBox="0 0 20 20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m7.5 4.5 5 5-5 5" />
                  </svg>
                </button>
              );
            },
          )}
        </div>

        <div className="mt-7 flex items-start gap-2.5 rounded-xl bg-[#FFF7D8] px-4 py-3 text-xs leading-5 text-[#725A00]">
          <span className="mt-0.5 size-2 shrink-0 rounded-full bg-[#D0A323]" />
          <p>
            Choose your own identity so approvals and change requests are
            attributed correctly.
          </p>
        </div>
      </section>
    </div>
  );
}

function IdentityIndicator({
  identity,
  compact = false,
}: {
  identity: ClientIdentity;
  compact?: boolean;
}) {
  const { openIdentityPicker } = useClientIdentity();
  const person = CLIENT_IDENTITIES[identity];

  return (
    <button
      type="button"
      onClick={openIdentityPicker}
      aria-label={`Viewing as ${person.name}. Switch identity.`}
      className={`group flex items-center rounded-xl border border-[#E3D8EA] bg-[#FFFDF8] text-left transition hover:border-[#CDB4DB] hover:bg-[#EEE3FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698] ${
        compact ? "gap-2 px-2.5 py-2" : "w-full gap-2.5 px-3 py-2.5"
      }`}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#7D4698] text-[10px] font-semibold text-white">
        {person.initials}
      </span>
      {compact ? (
        <span className="text-[10px] font-semibold text-[#341F60]">
          {person.name}
        </span>
      ) : (
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] uppercase tracking-[0.13em] text-[#8B7895]">
            Viewing as
          </span>
          <span className="block truncate text-xs font-semibold text-[#341F60]">
            {person.name}
          </span>
        </span>
      )}
      {!compact && (
        <span className="text-[9px] font-semibold text-[#7D4698] group-hover:underline">
          Switch
        </span>
      )}
    </button>
  );
}

function UnavailableSection() {
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[24px] border border-[#E3D8EA] bg-white p-8 text-center shadow-[0_8px_28px_rgba(52,31,96,0.055)] sm:p-12">
          <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-[#EEE3FA] text-[#7D4698]">
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
              <rect x="5" y="10" width="14" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#341F60]">
            This section isn&apos;t available
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#75647F]">
            This portal view is not included for the currently selected role.
          </p>
        </section>
      </div>
    </main>
  );
}

function ClientPortalShellContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { identity, isPickerOpen, isReady, selectIdentity } =
    useClientIdentity();

  if (!isReady) {
    return <div className="min-h-screen bg-[#EEE3FA]" />;
  }

  if (!identity || isPickerOpen) {
    return <IdentityPicker onChoose={selectIdentity} />;
  }

  const isRestrictedRoute =
    identity === "dorothy" &&
    (pathname === "/client/portal/invoices" ||
      pathname.startsWith("/client/portal/invoices/") ||
      pathname === "/client/portal/documents" ||
      pathname.startsWith("/client/portal/documents/"));

  return (
    <div className="client-portal-theme min-h-screen bg-[#FFF9EF] text-[#341F60]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] flex-col border-r border-[#E3D8EA] bg-white px-4 py-5 md:flex">
        <div className="px-1">
          <Brand />
        </div>
        <div className="mt-5">
          <IdentityIndicator identity={identity} />
        </div>
        <div className="mt-6 flex-1">
          <PortalNavigation pathname={pathname} identity={identity} />
        </div>
        <p className="border-t border-[#E9E0EF] px-2 pt-4 text-[10px] leading-4 text-[#8B7895]">
          Understory · Client workspace
        </p>
      </aside>

      <header className="sticky top-0 z-50 border-b border-[#E3D8EA] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-4">
          <Brand />
          <div className="flex items-center gap-2">
            <IdentityIndicator identity={identity} compact />
            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-client-navigation"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="flex size-10 items-center justify-center rounded-full border border-[#DED0E7] bg-white text-[#5F3378] transition hover:bg-[#EEE3FA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
            >
              <PortalIcon
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
            id="mobile-client-navigation"
            className="absolute inset-x-0 top-full border-b border-[#E3D8EA] bg-white px-4 py-4 shadow-[0_14px_35px_rgba(52,31,96,0.12)]"
          >
            <PortalNavigation
              pathname={pathname}
              identity={identity}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}
      </header>

      <div className="min-h-screen md:pl-[220px]">
        {isRestrictedRoute ? <UnavailableSection /> : children}
      </div>
    </div>
  );
}

export function ClientPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientIdentityProvider>
      <ClientPortalShellContent>{children}</ClientPortalShellContent>
    </ClientIdentityProvider>
  );
}
