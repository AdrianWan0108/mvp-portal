"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "../_components/AdminContext";
import {
  AdminButton,
  AdminConfirmDialog,
  AdminEmpty,
  AdminMessage,
  AdminModal,
  AdminPageHeader,
  inputClass,
} from "../_components/AdminUi";

const BUCKET = "client-documents";
const categories = ["Contract", "Strategy deck", "Event brief", "Other"];
type Source = "pdf_upload" | "google_doc" | "google_slide";
type DocumentRow = {
  id: string;
  file_url: string | null;
  file_name: string | null;
  category: string;
  source_type: Source;
  google_link: string | null;
  uploaded_by: string | null;
  created_at: string;
};

type DocumentEditor = {
  document: DocumentRow;
  name: string;
  category: string;
};

function detectGoogleSource(link: string): Source | null {
  if (/docs\.google\.com\/document\//i.test(link)) return "google_doc";
  if (/docs\.google\.com\/presentation\//i.test(link)) return "google_slide";
  return null;
}

function storagePath(url: string) {
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

export default function AdminDocumentsPage() {
  const { clientId, clientName } = useAdmin();
  const fileRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [mode, setMode] = useState<"pdf" | "google">("pdf");
  const [category, setCategory] = useState(categories[0]);
  const [name, setName] = useState("");
  const [googleLink, setGoogleLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editor, setEditor] = useState<DocumentEditor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    const { data, error: loadError } = await supabase
      .from("client_documents")
      .select(
        "id, file_url, file_name, category, source_type, google_link, uploaded_by, created_at",
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setDocuments((data ?? []) as DocumentRow[]);
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveDocument() {
    if (!clientId || isSaving) return;
    setIsSaving(true);
    setError(null);
    let uploadedPath: string | null = null;
    try {
      let payload: Record<string, unknown>;
      if (mode === "pdf") {
        if (!file) throw new Error("Choose a PDF file.");
        if (
          file.type !== "application/pdf" &&
          !file.name.toLowerCase().endsWith(".pdf")
        )
          throw new Error("Only PDF files are supported.");
        uploadedPath = `${clientId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(uploadedPath, file, {
            contentType: "application/pdf",
            upsert: false,
          });
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET).getPublicUrl(uploadedPath);
        payload = {
          client_id: clientId,
          file_url: publicUrl,
          file_name: file.name,
          file_type: "application/pdf",
          category,
          source_type: "pdf_upload",
          google_link: null,
          uploaded_by: "Understory admin",
        };
      } else {
        const source = detectGoogleSource(googleLink);
        if (!source) throw new Error("Enter a valid Google Doc or Slides URL.");
        payload = {
          client_id: clientId,
          file_url: null,
          file_name:
            name.trim() ||
            (source === "google_doc" ? "Google Doc" : "Google Slides"),
          file_type: null,
          category,
          source_type: source,
          google_link: googleLink.trim(),
          uploaded_by: "Understory admin",
        };
      }
      const { error: insertError } = await supabase
        .from("client_documents")
        .insert(payload);
      if (insertError) throw insertError;
      setSuccess("Document added.");
      setName("");
      setGoogleLink("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      void load();
    } catch (caught) {
      if (uploadedPath) await supabase.storage.from(BUCKET).remove([uploadedPath]);
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setIsSaving(false);
    }
  }

  async function editDocument() {
    if (!editor || !editor.name.trim() || isEditing) return;
    setIsEditing(true);
    setError(null);
    const { error: mutationError } = await supabase
      .from("client_documents")
      .update({ file_name: editor.name.trim(), category: editor.category })
      .eq("id", editor.document.id);
    setIsEditing(false);
    if (mutationError) {
      setError(mutationError.message);
      return;
    }
    setEditor(null);
    void load();
  }

  async function removeDocument() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    const document = deleteTarget;
    if (document.file_url) {
      const path = storagePath(document.file_url);
      if (path) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET)
          .remove([path]);
        if (storageError) {
          setError(storageError.message);
          setIsDeleting(false);
          return;
        }
      }
    }
    const { error: mutationError } = await supabase
      .from("client_documents")
      .delete()
      .eq("id", document.id);
    setIsDeleting(false);
    if (mutationError) {
      setError(mutationError.message);
      return;
    }
    setDeleteTarget(null);
    void load();
  }

  return (
    <main className="px-5 py-10 sm:px-8 lg:px-10">
      <AdminPageHeader
        title="Documents"
        description={`Publish PDFs, Google Docs, and Google Slides to ${clientName ?? "this client"}.`}
      />
      <AdminMessage error={error} success={success} />

      <section className="mt-7 rounded-[22px] border border-[#D7CBE0] bg-white p-5">
        <h2 className="text-lg font-semibold">Add document</h2>
        <div className="mt-4 flex gap-2">
          {(["pdf", "google"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                mode === value
                  ? "bg-[#341F60] text-white"
                  : "bg-[#EEE3FA] text-[#5F3378]"
              }`}
            >
              {value === "pdf" ? "Upload PDF" : "Google link"}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={`mt-2 ${inputClass}`}
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          {mode === "pdf" ? (
            <label className="text-xs font-semibold">
              PDF file
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className={`mt-2 ${inputClass}`}
              />
            </label>
          ) : (
            <>
              <label className="text-xs font-semibold">
                Display name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={`mt-2 ${inputClass}`}
                  placeholder="Document name"
                />
              </label>
              <label className="text-xs font-semibold sm:col-span-2">
                Google Docs or Slides link
                <input
                  value={googleLink}
                  onChange={(event) => setGoogleLink(event.target.value)}
                  className={`mt-2 ${inputClass}`}
                  placeholder="https://docs.google.com/..."
                />
              </label>
            </>
          )}
        </div>
        <AdminButton
          className="mt-5"
          onClick={() => void saveDocument()}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : "Add document"}
        </AdminButton>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documents.length ? (
          documents.map((document) => (
            <article
              key={document.id}
              className="rounded-[20px] border border-[#D7CBE0] bg-white p-5"
            >
              <span className="rounded-full bg-[#EEE3FA] px-2.5 py-1 text-[9px] font-bold uppercase text-[#5F3378]">
                {document.source_type.replace("_", " ")}
              </span>
              <h2 className="mt-4 font-semibold">
                {document.file_name || "Untitled document"}
              </h2>
              <p className="mt-1 text-xs text-[#75647F]">
                {document.category}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(document.google_link || document.file_url) && (
                  <a
                    href={document.google_link ?? document.file_url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#341F60] px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    Open ↗
                  </a>
                )}
                <AdminButton
                  tone="secondary"
                  onClick={() =>
                    setEditor({
                      document,
                      name: document.file_name ?? "",
                      category: document.category,
                    })
                  }
                >
                  Edit
                </AdminButton>
                <AdminButton
                  tone="danger"
                  onClick={() => setDeleteTarget(document)}
                >
                  Delete
                </AdminButton>
              </div>
            </article>
          ))
        ) : (
          <AdminEmpty>No documents yet.</AdminEmpty>
        )}
      </section>

      <AdminModal
        open={Boolean(editor)}
        title="Edit document"
        description="Update the display name and category shown in the client portal."
        submitLabel="Save changes"
        isSaving={isEditing}
        submitDisabled={!editor?.name.trim()}
        onClose={() => setEditor(null)}
        onSubmit={(event) => {
          event.preventDefault();
          void editDocument();
        }}
      >
        {editor && (
          <div className="grid gap-4">
            <label className="text-xs font-semibold text-[#341F60]">
              Document name
              <input
                autoFocus
                value={editor.name}
                onChange={(event) =>
                  setEditor({ ...editor, name: event.target.value })
                }
                className={`mt-2 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Category
              <select
                value={editor.category}
                onChange={(event) =>
                  setEditor({ ...editor, category: event.target.value })
                }
                className={`mt-2 ${inputClass}`}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete document?"
        description={`This permanently removes “${deleteTarget?.file_name ?? "this document"}”${deleteTarget?.file_url ? " and its uploaded PDF" : ""}.`}
        isWorking={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void removeDocument()}
      />
    </main>
  );
}
