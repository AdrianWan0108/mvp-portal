"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTeamIdentity } from "../_components/TeamIdentity";
import {
  TeamButton,
  TeamModal,
  teamInputClass,
} from "../_components/TeamHubUi";

const BUCKET = "sales-prospect-images";

type Stage =
  | "prospecting"
  | "contacted"
  | "meeting_scheduled"
  | "negotiating"
  | "won"
  | "lost";

const STAGE_ORDER: Stage[] = [
  "prospecting",
  "contacted",
  "meeting_scheduled",
  "negotiating",
  "won",
  "lost",
];

const STAGE_LABELS: Record<Stage, string> = {
  prospecting: "Prospecting",
  contacted: "Contacted",
  meeting_scheduled: "Meeting scheduled",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
};

const STAGE_STYLES: Record<Stage, string> = {
  prospecting: "border-[#CDBAD9] bg-[#EEE3FA] text-[#5F3378]",
  contacted: "border-[#B9CBE4] bg-[#EAF1FB] text-[#33507A]",
  meeting_scheduled: "border-[#C9B9E4] bg-[#F1EAFB] text-[#5B337A]",
  negotiating: "border-[#E5C760] bg-[#FFF4C7] text-[#725A00]",
  won: "border-[#BFD8C7] bg-[#EDF7EF] text-[#356346]",
  lost: "border-[#E4B9B9] bg-[#FFF0F0] text-[#8B3E3E]",
};

type SalesProspect = {
  id: string;
  client_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  stage: Stage;
  service_needed: string | null;
  quote_sent: boolean;
  quote_amount: number | null;
  quote_sent_at: string | null;
  expected_resources: string | null;
  expected_cost: number | null;
  preview_image_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

type ProspectEditor = {
  record?: SalesProspect;
  clientName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  stage: Stage;
  serviceNeeded: string;
  quoteSent: boolean;
  quoteAmount: string;
  expectedResources: string;
  expectedCost: string;
  notes: string;
  imageFile: File | null;
  removeImage: boolean;
};

function emptyEditor(): ProspectEditor {
  return {
    clientName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    stage: "prospecting",
    serviceNeeded: "",
    quoteSent: false,
    quoteAmount: "",
    expectedResources: "",
    expectedCost: "",
    notes: "",
    imageFile: null,
    removeImage: false,
  };
}

function editorFromRecord(record: SalesProspect): ProspectEditor {
  return {
    record,
    clientName: record.client_name,
    contactName: record.contact_name ?? "",
    contactEmail: record.contact_email ?? "",
    contactPhone: record.contact_phone ?? "",
    stage: record.stage,
    serviceNeeded: record.service_needed ?? "",
    quoteSent: record.quote_sent,
    quoteAmount: record.quote_amount != null ? String(record.quote_amount) : "",
    expectedResources: record.expected_resources ?? "",
    expectedCost: record.expected_cost != null ? String(record.expected_cost) : "",
    notes: record.notes ?? "",
    imageFile: null,
    removeImage: false,
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

function storagePath(url: string | null) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  try {
    const parsed = new URL(url);
    const index = parsed.pathname.indexOf(marker);
    return index < 0
      ? null
      : decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

export default function TeamHubSalesPage() {
  const router = useRouter();
  const { username, accessLevel, isReady } = useTeamIdentity();
  const [prospects, setProspects] = useState<SalesProspect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<ProspectEditor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && accessLevel && accessLevel !== "owner") {
      router.replace("/team-hub/dashboard");
    }
  }, [accessLevel, isReady, router]);

  const loadProspects = useCallback(async () => {
    if (!isReady || accessLevel !== "owner") return;
    setIsLoading(true);
    const { data, error: loadError } = await supabase
      .from("sales_prospects")
      .select(
        "id, client_name, contact_name, contact_email, contact_phone, stage, service_needed, quote_sent, quote_amount, quote_sent_at, expected_resources, expected_cost, preview_image_url, notes, created_by, created_at",
      )
      .order("created_at", { ascending: false });
    if (loadError) {
      setError(`Could not load prospects: ${loadError.message}`);
    } else {
      setProspects((data ?? []) as SalesProspect[]);
      setError(null);
    }
    setIsLoading(false);
  }, [accessLevel, isReady]);

  useEffect(() => {
    void loadProspects();
  }, [loadProspects]);

  const groups = useMemo(() => {
    return STAGE_ORDER.map((stage) => ({
      stage,
      rows: prospects.filter((prospect) => prospect.stage === stage),
    })).filter((group) => group.rows.length > 0);
  }, [prospects]);

  const activeProspects = useMemo(
    () => prospects.filter((p) => p.stage !== "won" && p.stage !== "lost"),
    [prospects],
  );
  const quotedValue = useMemo(
    () =>
      activeProspects.reduce(
        (sum, p) => sum + (p.quote_sent ? Number(p.quote_amount ?? 0) : 0),
        0,
      ),
    [activeProspects],
  );

  if (!isReady || accessLevel !== "owner") {
    return (
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto h-40 max-w-6xl animate-pulse rounded-[24px] bg-[#EEE3FA]" />
      </main>
    );
  }

  async function saveProspect() {
    if (!editor || !editor.clientName.trim() || isSaving) return;
    if (editor.quoteAmount && Number.isNaN(Number(editor.quoteAmount))) {
      setError("Quote amount must be a number.");
      return;
    }
    if (editor.expectedCost && Number.isNaN(Number(editor.expectedCost))) {
      setError("Expected cost must be a number.");
      return;
    }

    setIsSaving(true);
    setError(null);
    let uploadedPath: string | null = null;
    try {
      let previewImageUrl = editor.record?.preview_image_url ?? null;
      if (editor.imageFile) {
        if (!editor.imageFile.type.startsWith("image/")) {
          throw new Error("Preview must be an image file.");
        }
        uploadedPath = `${crypto.randomUUID()}-${editor.imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(uploadedPath, editor.imageFile, {
            contentType: editor.imageFile.type,
            upsert: false,
          });
        if (uploadError) throw uploadError;
        previewImageUrl = supabase.storage.from(BUCKET).getPublicUrl(
          uploadedPath,
        ).data.publicUrl;
      } else if (editor.removeImage) {
        previewImageUrl = null;
      }

      const quoteSentAt = editor.quoteSent
        ? (editor.record?.quote_sent ? editor.record.quote_sent_at : null) ??
          new Date().toISOString()
        : null;

      const payload = {
        client_name: editor.clientName.trim(),
        contact_name: editor.contactName.trim() || null,
        contact_email: editor.contactEmail.trim() || null,
        contact_phone: editor.contactPhone.trim() || null,
        stage: editor.stage,
        service_needed: editor.serviceNeeded.trim() || null,
        quote_sent: editor.quoteSent,
        quote_amount: editor.quoteAmount ? Number(editor.quoteAmount) : null,
        quote_sent_at: quoteSentAt,
        expected_resources: editor.expectedResources.trim() || null,
        expected_cost: editor.expectedCost ? Number(editor.expectedCost) : null,
        preview_image_url: previewImageUrl,
        notes: editor.notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error: mutationError } = editor.record
        ? await supabase
            .from("sales_prospects")
            .update(payload)
            .eq("id", editor.record.id)
        : await supabase
            .from("sales_prospects")
            .insert({ ...payload, created_by: username });
      if (mutationError) throw mutationError;

      const previousPath = storagePath(editor.record?.preview_image_url ?? null);
      if (previousPath && (uploadedPath || editor.removeImage)) {
        await supabase.storage.from(BUCKET).remove([previousPath]);
      }

      setEditor(null);
      void loadProspects();
    } catch (caught) {
      if (uploadedPath) {
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
      }
      setError(
        caught instanceof Error ? caught.message : "Could not save prospect.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProspect(prospect: SalesProspect) {
    if (deleteId !== prospect.id) {
      setDeleteId(prospect.id);
      return;
    }
    const { error: mutationError } = await supabase
      .from("sales_prospects")
      .delete()
      .eq("id", prospect.id);
    if (mutationError) {
      setError(mutationError.message);
      return;
    }
    const path = storagePath(prospect.preview_image_url);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
    setDeleteId(null);
    void loadProspects();
  }

  return (
    <main className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <section className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7D4698]">
              Owner access
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#28154F] sm:text-4xl">
              Sales
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75647F] sm:text-base">
              Track prospecting clients, what stage they&apos;re at, the
              service they need, and quote status.
            </p>
          </div>
          <div className="flex items-end gap-3">
            {!isLoading && (
              <div className="rounded-[20px] border border-[#D7CBE0] bg-white px-5 py-4 shadow-[0_6px_20px_rgba(40,21,79,0.05)]">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8B7895]">
                  Active pipeline
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#341F60]">
                  {activeProspects.length}
                </p>
                <p className="mt-1 text-[11px] text-[#8B7895]">
                  {formatCurrency(quotedValue)} quoted
                </p>
              </div>
            )}
            <TeamButton onClick={() => setEditor(emptyEditor())}>
              + Add prospect
            </TeamButton>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-7 rounded-2xl border border-[#E4B9B9] bg-[#FFF0F0] px-4 py-3 text-sm text-[#8B3E3E]"
          >
            {error}
          </div>
        )}

        <section className="mt-9 space-y-8">
          {isLoading ? (
            <div className="h-52 animate-pulse rounded-[24px] border border-[#D7CBE0] bg-white" />
          ) : groups.length ? (
            groups.map((group) => (
              <div key={group.stage}>
                <div className="flex items-center gap-3">
                  <span
                    className={`w-fit rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${STAGE_STYLES[group.stage]}`}
                  >
                    {STAGE_LABELS[group.stage]}
                  </span>
                  <span className="text-xs text-[#8B7895]">
                    {group.rows.length} prospect
                    {group.rows.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.rows.map((prospect) => (
                    <article
                      key={prospect.id}
                      className="overflow-hidden rounded-[24px] border border-[#D7CBE0] bg-white shadow-[0_8px_28px_rgba(40,21,79,0.055)]"
                    >
                      {prospect.preview_image_url ? (
                        <img
                          src={prospect.preview_image_url}
                          alt={prospect.client_name}
                          className="aspect-[16/9] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[16/9] items-center justify-center bg-[#EEE3FA] text-xs font-semibold text-[#7D4698]">
                          No preview image
                        </div>
                      )}
                      <div className="p-5">
                        <h2 className="text-lg font-semibold text-[#341F60]">
                          {prospect.client_name}
                        </h2>
                        {(prospect.contact_name ||
                          prospect.contact_email ||
                          prospect.contact_phone) && (
                          <p className="mt-1 text-xs text-[#75647F]">
                            {[
                              prospect.contact_name,
                              prospect.contact_email,
                              prospect.contact_phone,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        {prospect.service_needed && (
                          <p className="mt-3 text-sm leading-5 text-[#28154F]">
                            <span className="font-semibold">Service: </span>
                            {prospect.service_needed}
                          </p>
                        )}
                        <p className="mt-2 text-sm leading-5 text-[#28154F]">
                          <span className="font-semibold">Quote: </span>
                          {prospect.quote_sent
                            ? `Sent${
                                prospect.quote_amount != null
                                  ? ` · ${formatCurrency(Number(prospect.quote_amount))}`
                                  : ""
                              }${
                                prospect.quote_sent_at
                                  ? ` on ${new Date(
                                      prospect.quote_sent_at,
                                    ).toLocaleDateString("en-CA")}`
                                  : ""
                              }`
                            : "Not sent yet"}
                        </p>
                        {(prospect.expected_resources ||
                          prospect.expected_cost != null) && (
                          <p className="mt-2 text-sm leading-5 text-[#28154F]">
                            <span className="font-semibold">Resources: </span>
                            {prospect.expected_resources || "—"}
                            {prospect.expected_cost != null && (
                              <span className="text-[#75647F]">
                                {" "}
                                (est. {formatCurrency(Number(prospect.expected_cost))})
                              </span>
                            )}
                          </p>
                        )}
                        {prospect.notes && (
                          <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-[#75647F]">
                            {prospect.notes}
                          </p>
                        )}
                        <p className="mt-4 text-[10px] uppercase tracking-[0.08em] text-[#8B7895]">
                          Added{" "}
                          {new Date(prospect.created_at).toLocaleDateString(
                            "en-CA",
                          )}
                        </p>
                        <div className="mt-4 flex gap-2 border-t border-[#E9E0EF] pt-4">
                          <TeamButton
                            tone="secondary"
                            onClick={() =>
                              setEditor(editorFromRecord(prospect))
                            }
                          >
                            Edit
                          </TeamButton>
                          <TeamButton
                            tone="danger"
                            onClick={() => void deleteProspect(prospect)}
                          >
                            {deleteId === prospect.id
                              ? "Confirm delete?"
                              : "Delete"}
                          </TeamButton>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#CDBAD9] bg-white px-6 py-14 text-center">
              <p className="text-sm font-semibold text-[#5F4D70]">
                No prospects yet.
              </p>
              <p className="mt-1 text-xs text-[#8B7895]">
                Add the first prospecting client above.
              </p>
            </div>
          )}
        </section>
      </div>

      <TeamModal
        open={Boolean(editor)}
        title={`${editor?.record ? "Edit" : "Add"} prospect`}
        description="Track where this client stands and what it would take to deliver."
        submitLabel={editor?.record ? "Save changes" : "Add prospect"}
        isSaving={isSaving}
        submitDisabled={!editor?.clientName.trim()}
        onClose={() => setEditor(null)}
        onSubmit={(event) => {
          event.preventDefault();
          void saveProspect();
        }}
      >
        {editor && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[#341F60] sm:col-span-2">
              Client name
              <input
                value={editor.clientName}
                onChange={(event) =>
                  setEditor({ ...editor, clientName: event.target.value })
                }
                className={`mt-2 ${teamInputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Contact name
              <input
                value={editor.contactName}
                onChange={(event) =>
                  setEditor({ ...editor, contactName: event.target.value })
                }
                className={`mt-2 ${teamInputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Contact email
              <input
                type="email"
                value={editor.contactEmail}
                onChange={(event) =>
                  setEditor({ ...editor, contactEmail: event.target.value })
                }
                className={`mt-2 ${teamInputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Contact phone
              <input
                value={editor.contactPhone}
                onChange={(event) =>
                  setEditor({ ...editor, contactPhone: event.target.value })
                }
                className={`mt-2 ${teamInputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Stage
              <select
                value={editor.stage}
                onChange={(event) =>
                  setEditor({
                    ...editor,
                    stage: event.target.value as Stage,
                  })
                }
                className={`mt-2 ${teamInputClass}`}
              >
                {STAGE_ORDER.map((stage) => (
                  <option key={stage} value={stage}>
                    {STAGE_LABELS[stage]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-[#341F60] sm:col-span-2">
              Service needed
              <input
                value={editor.serviceNeeded}
                onChange={(event) =>
                  setEditor({ ...editor, serviceNeeded: event.target.value })
                }
                placeholder="Social media management, website design…"
                className={`mt-2 ${teamInputClass}`}
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#341F60]">
              <input
                type="checkbox"
                checked={editor.quoteSent}
                onChange={(event) =>
                  setEditor({ ...editor, quoteSent: event.target.checked })
                }
                className="size-4 accent-[#7D4698]"
              />
              Quote sent
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Quote amount (CAD)
              <input
                type="number"
                min="0"
                step="0.01"
                value={editor.quoteAmount}
                onChange={(event) =>
                  setEditor({ ...editor, quoteAmount: event.target.value })
                }
                className={`mt-2 ${teamInputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60] sm:col-span-2">
              Expected resources
              <textarea
                rows={2}
                value={editor.expectedResources}
                onChange={(event) =>
                  setEditor({
                    ...editor,
                    expectedResources: event.target.value,
                  })
                }
                placeholder="Who and what it would take to deliver this"
                className={`mt-2 resize-y ${teamInputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Expected cost (CAD)
              <input
                type="number"
                min="0"
                step="0.01"
                value={editor.expectedCost}
                onChange={(event) =>
                  setEditor({ ...editor, expectedCost: event.target.value })
                }
                className={`mt-2 ${teamInputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60] sm:col-span-2">
              Notes
              <textarea
                rows={3}
                value={editor.notes}
                onChange={(event) =>
                  setEditor({ ...editor, notes: event.target.value })
                }
                className={`mt-2 resize-y ${teamInputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60] sm:col-span-2">
              Preview image
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setEditor({
                    ...editor,
                    imageFile: event.target.files?.[0] ?? null,
                    removeImage: false,
                  })
                }
                className={`mt-2 ${teamInputClass}`}
              />
              {editor.record?.preview_image_url && !editor.imageFile && (
                <span className="mt-2 flex items-center justify-between gap-3 text-[11px] text-[#75647F]">
                  {editor.removeImage
                    ? "Image will be removed on save."
                    : "Leave empty to keep the current image."}
                  <button
                    type="button"
                    onClick={() =>
                      setEditor({
                        ...editor,
                        removeImage: !editor.removeImage,
                      })
                    }
                    className="font-semibold text-[#7D4698] hover:underline"
                  >
                    {editor.removeImage ? "Undo" : "Remove image"}
                  </button>
                </span>
              )}
            </label>
          </div>
        )}
      </TeamModal>
    </main>
  );
}
