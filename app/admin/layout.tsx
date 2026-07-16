import type { Metadata } from "next";
import { AdminShell } from "./_components/AdminShell";

export const metadata: Metadata = {
  title: "Admin Console | Understory",
  description: "Internal client portal administration.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
