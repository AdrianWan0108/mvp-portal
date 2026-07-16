"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "./_components/AdminContext";

export default function AdminPage() {
  const router = useRouter();
  const { clientSlug } = useAdmin();

  useEffect(() => {
    if (clientSlug) router.replace("/admin/dashboard");
  }, [clientSlug, router]);

  return null;
}
