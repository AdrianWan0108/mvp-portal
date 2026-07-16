"use client";

import { ComingSoon } from "../../_components/ComingSoon";
import { useClientIdentity } from "../../_components/ClientIdentity";

export default function WebsiteApprovalsPage() {
  const { clientName } = useClientIdentity();

  return (
    <ComingSoon
      eyebrow={`Approvals · ${clientName ?? "Client"}`}
      title="Website"
      message={`No website approvals yet for ${clientName ?? "this client"}. New review items will appear here when they are ready.`}
    />
  );
}
