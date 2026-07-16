"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Contract",
  "Strategy deck",
  "Event brief",
  "Other",
] as const;

type DocumentCategory = (typeof CATEGORIES)[number];
type CategoryFilter = DocumentCategory | "All";
type DocumentSourceType = "pdf_upload" | "google_doc" | "google_slide";

type ClientDocument = {
  id: string;
  client_id: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  category: DocumentCategory;
  uploaded_by: string | null;
  source_type: DocumentSourceType;
  google_link: string | null;
  created_at: string;
};

function formatUploadDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getGoogleEmbedUrl(
  link: string,
  sourceType: "google_doc" | "google_slide",
) {
  try {
    const url = new URL(link.trim());
    const resource = sourceType === "google_doc" ? "document" : "presentation";
    const match = url.pathname.match(
      new RegExp(`/${resource}/(?:u/\\d+/)?d/([^/]+)`),
    );

    if (!match?.[1]) return null;

    const mode = sourceType === "google_doc" ? "preview" : "embed";
    return `https://docs.google.com/${resource}/d/${match[1]}/${mode}`;
  } catch {
    return null;
  }
}

function sourceLabel(sourceType: DocumentSourceType) {
  if (sourceType === "google_doc") return "Google Doc";
  if (sourceType === "google_slide") return "Google Slides";
  return "PDF";
}

function DocumentIcon({ sourceType }: { sourceType: DocumentSourceType }) {
  const isSlides = sourceType === "google_slide";

  return (
    <span
      className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
        isSlides
          ? "bg-[#FFF4C8] text-[#876900]"
          : sourceType === "google_doc"
            ? "bg-[#E7EEFF] text-[#34558E]"
            : "bg-[#EEE3FA] text-[#7D4698]"
      }`}
    >
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
        <path d="M7 3h7l4 4v14H7Z" />
        <path d="M14 3v5h5" />
        {isSlides ? (
          <rect x="10" y="12" width="5" height="4" rx=".5" />
        ) : (
          <path d="M10 13h5M10 17h5" />
        )}
      </svg>
    </span>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function GoogleDocumentPreview({ document }: { document: ClientDocument }) {
  const [didLoad, setDidLoad] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const embedUrl =
    document.google_link && document.source_type !== "pdf_upload"
      ? getGoogleEmbedUrl(document.google_link, document.source_type)
      : null;

  useEffect(() => {
    if (!embedUrl || didLoad) return;

    const timer = window.setTimeout(() => setTimedOut(true), 3000);
    return () => window.clearTimeout(timer);
  }, [didLoad, embedUrl]);

  if (!embedUrl || timedOut) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#D8C6E4] bg-[#FFFDF8] px-6 text-center sm:min-h-[520px]">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EEE3FA] text-[#7D4698]">
          <DocumentIcon sourceType={document.source_type} />
        </span>
        <p className="mt-5 max-w-lg text-sm font-semibold leading-6 text-[#341F60]">
          This document can&apos;t be previewed here — make sure it&apos;s shared
          as &apos;Anyone with the link can view&apos;, or open it directly.
        </p>
        {document.google_link && (
          <a
            href={document.google_link}
            target="_blank"
            rel="noreferrer"
            className="mt-5 rounded-full bg-[#7D4698] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#69377F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
          >
            Open original link
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[22px] border border-[#DCCFE4] bg-white sm:min-h-[520px]">
      {!didLoad && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FFFDF8] text-sm font-medium text-[#75647F]">
          Loading preview…
        </div>
      )}
      <iframe
        src={embedUrl}
        title={`Preview of ${document.file_name ?? sourceLabel(document.source_type)}`}
        onLoad={() => setDidLoad(true)}
        className="h-[70vh] min-h-[360px] w-full border-0 sm:min-h-[520px] sm:max-h-[720px]"
      />
    </div>
  );
}

function DocumentPreviewModal({
  document,
  onClose,
}: {
  document: ClientDocument;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#341F60]/45 px-4 py-6 backdrop-blur-sm sm:px-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-preview-title"
    >
      <div className="mx-auto max-w-6xl rounded-[28px] border border-white/60 bg-[#FFF9EF] p-4 shadow-[0_28px_90px_rgba(52,31,96,0.24)] sm:p-7">
        <div className="flex items-start justify-between gap-5 pb-5">
          <div className="flex min-w-0 items-center gap-3">
            <DocumentIcon sourceType={document.source_type} />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7D4698]">
                {sourceLabel(document.source_type)} · {document.category}
              </p>
              <h2
                id="document-preview-title"
                className="mt-1 truncate text-xl font-semibold text-[#341F60] sm:text-2xl"
              >
                {document.file_name ?? sourceLabel(document.source_type)}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close document preview"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#E3D8EA] bg-white text-[#695677] transition hover:bg-[#EEE3FA] hover:text-[#341F60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
          >
            <CloseIcon />
          </button>
        </div>

        {document.source_type === "pdf_upload" ? (
          document.file_url ? (
            <iframe
              src={document.file_url}
              title={`Preview of ${document.file_name ?? "PDF document"}`}
              className="h-[70vh] min-h-[360px] w-full rounded-[22px] border border-[#DCCFE4] bg-white sm:min-h-[520px] sm:max-h-[720px]"
            />
          ) : (
            <div className="flex min-h-[360px] items-center justify-center rounded-[22px] border border-dashed border-[#D8C6E4] bg-white px-6 text-center text-sm text-[#75647F] sm:min-h-[520px]">
              This PDF no longer has a file attached.
            </div>
          )
        ) : (
          <GoogleDocumentPreview key={document.id} document={document} />
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#75647F]">
          <span>
            Uploaded by {document.uploaded_by ?? "Client"} ·{" "}
            {formatUploadDate(document.created_at)}
          </span>
          {(document.google_link || document.file_url) && (
            <a
              href={document.google_link ?? document.file_url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#7D4698] hover:underline"
            >
              Open in a new tab ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  // Document creation belongs in an internal/admin interface, not the client portal.
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [selectedDocument, setSelectedDocument] =
    useState<ClientDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const filteredDocuments = useMemo(
    () =>
      categoryFilter === "All"
        ? documents
        : documents.filter((document) => document.category === categoryFilter),
    [categoryFilter, documents],
  );

  useEffect(() => {
    let isActive = true;

    async function loadDocuments() {
      setIsLoading(true);

      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("slug", "mvp")
        .single();

      if (!isActive) return;
      if (clientError || !client) {
        setErrorMessage(
          `Could not load the MVP client: ${clientError?.message ?? "Client not found."}`,
        );
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("client_documents")
        .select(
          "id, client_id, file_url, file_name, file_type, category, uploaded_by, source_type, google_link, created_at",
        )
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      if (!isActive) return;

      if (error) {
        setDocuments([]);
        setErrorMessage(`Could not load documents: ${error.message}`);
      } else {
        setDocuments((data ?? []) as ClientDocument[]);
        setErrorMessage(null);
      }
      setIsLoading(false);
    }

    void loadDocuments();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7D4698]">
              Client portal · MVP
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#341F60] sm:text-4xl">
              Documents
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75647F] sm:text-base">
              Contracts, strategy decks, event briefs, and shared project files.
            </p>
          </div>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-[#E4C88F] bg-[#FFF7E6] px-4 py-3 text-sm leading-6 text-[#805A22]"
          >
            {errorMessage}
          </div>
        )}

        <section className="mt-10" aria-labelledby="document-library-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B7895]">
                Shared library
              </p>
              <h2
                id="document-library-heading"
                className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#341F60]"
              >
                All documents
              </h2>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Filter by category">
              {(["All", ...CATEGORIES] as CategoryFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setCategoryFilter(filter)}
                  aria-pressed={categoryFilter === filter}
                  className={`rounded-full px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698] ${
                    categoryFilter === filter
                      ? "bg-[#7D4698] text-white"
                      : "border border-[#E3D8EA] bg-white text-[#695677] hover:bg-[#EEE3FA]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="h-44 animate-pulse rounded-[22px] border border-[#E3D8EA] bg-white"
                  />
                ))
              : filteredDocuments.map((document) => (
                  <article
                    key={document.id}
                    className="rounded-[22px] border border-[#E3D8EA] bg-white p-5 shadow-[0_8px_28px_rgba(52,31,96,0.055)] transition hover:-translate-y-0.5 hover:border-[#CDB4DB] hover:shadow-[0_12px_30px_rgba(52,31,96,0.09)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <DocumentIcon sourceType={document.source_type} />
                      <span className="rounded-full bg-[#EEE3FA] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5F3378]">
                        {sourceLabel(document.source_type)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDocument(document)}
                      className="mt-5 block w-full text-left focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
                    >
                      <h3 className="truncate text-base font-semibold text-[#341F60]">
                        {document.file_name ?? sourceLabel(document.source_type)}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-[#7D4698]">
                        {document.category}
                      </p>
                      <p className="mt-3 text-[11px] leading-5 text-[#8B7895]">
                        Added by {document.uploaded_by ?? "Client"} ·{" "}
                        {formatUploadDate(document.created_at)}
                      </p>
                    </button>
                    <div className="mt-4 border-t border-[#EEE6F1] pt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedDocument(document)}
                        className="text-xs font-semibold text-[#7D4698] hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
                      >
                        Preview document
                      </button>
                    </div>
                  </article>
                ))}
          </div>

          {!isLoading && filteredDocuments.length === 0 && (
            <div className="mt-6 rounded-[24px] border border-dashed border-[#D8C6E4] bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[#341F60]">
                {categoryFilter === "All"
                  ? "No documents have been added yet."
                  : `No ${categoryFilter.toLocaleLowerCase()} documents yet.`}
              </p>
              <p className="mt-1 text-xs text-[#75647F]">
                PDFs, Google Docs, and Google Slides will appear here.
              </p>
            </div>
          )}
        </section>
      </div>

      {selectedDocument && (
        <DocumentPreviewModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </main>
  );
}
