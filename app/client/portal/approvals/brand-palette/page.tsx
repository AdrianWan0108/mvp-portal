"use client";

import { ComingSoon } from "../../_components/ComingSoon";
import { useClientIdentity } from "../../_components/ClientIdentity";

export default function BrandPaletteApprovalsPage() {
  const { clientName } = useClientIdentity();

  return (
    <ComingSoon
      eyebrow={`Approvals · ${clientName ?? "Client"}`}
      title="Brand palette"
      message={`No brand palette approvals yet for ${clientName ?? "this client"}. New review items will appear here when they are ready.`}
    />
  );
}
