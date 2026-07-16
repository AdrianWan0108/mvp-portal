import type { Metadata } from "next";
import { TeamHubShell } from "./_components/TeamHubShell";

export const metadata: Metadata = {
  title: "Team Hub | Understory",
  description: "Understory's internal team workspace.",
};

export default function TeamHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeamHubShell>{children}</TeamHubShell>;
}
