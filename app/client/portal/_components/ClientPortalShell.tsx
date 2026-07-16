"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import understoryLogo from "@/public/under story logo-purple.png";

type NavIcon =
  | "dashboard"
  | "approvals"
  | "gallery"
  | "invoices"
  | "assets";

const navigation: Array<{
  href: string;
  label: string;
  icon: NavIcon;
}> = [
  {
    href: "/client/portal/dashboard",
    label: "Project dashboard",
    icon: "dashboard",
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
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Client portal navigation" className="space-y-1.5">
      {navigation.map((item) => {
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

export function ClientPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="client-portal-theme min-h-screen bg-[#FFF9EF] text-[#341F60]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] flex-col border-r border-[#E3D8EA] bg-white px-4 py-5 md:flex">
        <div className="px-1">
          <Brand />
        </div>
        <div className="mt-8 flex-1">
          <PortalNavigation pathname={pathname} />
        </div>
        <p className="border-t border-[#E9E0EF] px-2 pt-4 text-[10px] leading-4 text-[#8B7895]">
          Understory · Client workspace
        </p>
      </aside>

      <header className="sticky top-0 z-50 border-b border-[#E3D8EA] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-4">
          <Brand />
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

        {isMobileMenuOpen && (
          <div
            id="mobile-client-navigation"
            className="absolute inset-x-0 top-full border-b border-[#E3D8EA] bg-white px-4 py-4 shadow-[0_14px_35px_rgba(52,31,96,0.12)]"
          >
            <PortalNavigation
              pathname={pathname}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}
      </header>

      <div className="min-h-screen md:pl-[220px]">{children}</div>
    </div>
  );
}
