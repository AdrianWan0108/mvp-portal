"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CLIENT_IDENTITIES,
  useClientIdentity,
} from "../_components/ClientIdentity";

const ASSET_BUCKET = "client-assets";

type UploadPhase = "uploading" | "saving" | null;

type ClientAsset = {
  id: string;
  client_id: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
};

function formatUploadDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function sanitizeFileName(fileName: string) {
  const sanitized = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || "asset";
}

function isAcceptedFile(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

function getStoragePath(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    const marker = `/storage/v1/object/public/${ASSET_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

function UploadIcon({ className = "size-6" }: { className?: string }) {
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
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      className="ml-0.5 size-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="m8.5 6.25 9 5.75-9 5.75Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
    </svg>
  );
}

function AssetPreview({ asset }: { asset: ClientAsset }) {
  const isImage = asset.file_type?.startsWith("image/");
  const isVideo = asset.file_type?.startsWith("video/");

  return (
    <a
      href={asset.file_url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${asset.file_name ?? "uploaded asset"} in a new tab`}
      className="group relative block aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#EEE3FA,#FFF9EF)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#7D4698]"
    >
      {isImage ? (
        <img
          src={asset.file_url}
          alt={asset.file_name ?? "Uploaded image"}
          className="size-full object-cover transition duration-500 group-hover:scale-[1.025]"
        />
      ) : isVideo ? (
        <>
          <video
            src={asset.file_url}
            aria-label={asset.file_name ?? "Uploaded video"}
            muted
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
          <span className="absolute inset-0 bg-[#341F60]/10 transition group-hover:bg-[#341F60]/20" />
          <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#7D4698] shadow-[0_8px_24px_rgba(52,31,96,0.18)] backdrop-blur-sm">
            <PlayIcon />
          </span>
        </>
      ) : (
        <div className="flex size-full items-center justify-center px-6 text-center text-sm text-[#75647F]">
          Preview unavailable
        </div>
      )}

      <span className="absolute bottom-3 right-3 rounded-full bg-[#341F60]/75 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
        {isVideo ? "Video" : isImage ? "Image" : "File"}
      </span>
    </a>
  );
}

export default function AssetUploadPage() {
  const { identity } = useClientIdentity();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [assets, setAssets] = useState<ClientAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAssets() {
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
        .from("client_assets")
        .select(
          "id, client_id, file_url, file_name, file_type, uploaded_by, created_at",
        )
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      if (!isActive) return;

      setClientId(client.id);
      if (error) {
        setErrorMessage(`Could not load uploaded assets: ${error.message}`);
        setAssets([]);
      } else {
        setAssets((data ?? []) as ClientAsset[]);
        setErrorMessage(null);
      }
      setIsLoading(false);
    }

    void loadAssets();
    return () => {
      isActive = false;
    };
  }, []);

  async function uploadFile(file: File) {
    if (!clientId || !identity || uploadPhase) return;

    if (!isAcceptedFile(file)) {
      setErrorMessage("Choose an image or video file to upload.");
      setSuccessMessage(null);
      return;
    }

    const uploader = CLIENT_IDENTITIES[identity].name;
    const storagePath = `${clientId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

    setUploadPhase("uploading");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error: uploadError } = await supabase.storage
        .from(ASSET_BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadPhase("saving");
      const {
        data: { publicUrl },
      } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(storagePath);

      const { data, error: insertError } = await supabase
        .from("client_assets")
        .insert({
          client_id: clientId,
          file_url: publicUrl,
          file_name: file.name,
          file_type: file.type,
          uploaded_by: uploader,
        })
        .select(
          "id, client_id, file_url, file_name, file_type, uploaded_by, created_at",
        )
        .single();

      if (insertError || !data) {
        await supabase.storage.from(ASSET_BUCKET).remove([storagePath]);
        throw insertError ?? new Error("The asset record could not be saved.");
      }

      setAssets((current) => [data as ClientAsset, ...current]);
      setSuccessMessage(`${file.name} was uploaded successfully.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The upload could not be completed.",
      );
    } finally {
      setUploadPhase(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteAsset(asset: ClientAsset) {
    const confirmed = window.confirm(
      `Delete ${asset.file_name ?? "this asset"}? This cannot be undone.`,
    );
    if (!confirmed || deletingId) return;

    const storagePath = getStoragePath(asset.file_url);
    if (!storagePath) {
      setErrorMessage("The storage path for this asset could not be determined.");
      return;
    }

    setDeletingId(asset.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error: storageError } = await supabase.storage
        .from(ASSET_BUCKET)
        .remove([storagePath]);

      if (storageError) throw storageError;

      const { error: databaseError } = await supabase
        .from("client_assets")
        .delete()
        .eq("id", asset.id);

      if (databaseError) throw databaseError;

      setAssets((current) =>
        current.filter((currentAsset) => currentAsset.id !== asset.id),
      );
      setSuccessMessage(`${asset.file_name ?? "Asset"} was deleted.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The asset could not be deleted.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleFileSelection(files: FileList | null) {
    const file = files?.[0];
    if (file) void uploadFile(file);
  }

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7D4698]">
            Client portal · MVP
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#341F60] sm:text-4xl">
            Asset upload
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75647F] sm:text-base">
            Send photography and video files directly to the Understory team.
          </p>
        </header>

        <section className="mt-10" aria-labelledby="upload-heading">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B7895]">
              New asset
            </p>
            <h2
              id="upload-heading"
              className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#341F60]"
            >
              Upload a file
            </h2>
          </div>

          <div
            onDragEnter={(event) => {
              event.preventDefault();
              if (!uploadPhase) setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              const nextTarget = event.relatedTarget;
              if (
                !nextTarget ||
                !event.currentTarget.contains(nextTarget as Node)
              ) {
                setIsDragging(false);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFileSelection(event.dataTransfer.files);
            }}
            className={`mt-5 rounded-[28px] border-2 border-dashed px-6 py-12 text-center transition sm:px-10 sm:py-14 ${
              isDragging
                ? "border-[#7D4698] bg-[#EEE3FA] shadow-[0_12px_32px_rgba(52,31,96,0.08)]"
                : "border-[#D8C6E4] bg-white"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              disabled={!clientId || Boolean(uploadPhase)}
              onChange={(event) => handleFileSelection(event.target.files)}
              className="sr-only"
            />

            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#EEE3FA] text-[#7D4698]">
              <UploadIcon />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-[#341F60]">
              Drag an image or video here
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75647F]">
              Or choose a file from your device. The upload will be attributed
              to {identity ? CLIENT_IDENTITIES[identity].name : "your identity"}.
            </p>
            <button
              type="button"
              disabled={!clientId || Boolean(uploadPhase)}
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 rounded-full bg-[#7D4698] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(52,31,96,0.15)] transition hover:bg-[#69377F] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7D4698]"
            >
              {uploadPhase ? "Uploading…" : "Choose file"}
            </button>
            <p className="mt-3 text-[11px] text-[#9A8AA3]">
              Accepted formats: images and videos
            </p>

            {uploadPhase && (
              <div className="mx-auto mt-7 max-w-md" aria-live="polite">
                <div
                  role="progressbar"
                  aria-label="Upload progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={uploadPhase === "uploading" ? 65 : 90}
                  className="h-2 overflow-hidden rounded-full bg-[#E2D4EB]"
                >
                  <div
                    className={`h-full rounded-full bg-[#7D4698] transition-[width] duration-500 ${
                      uploadPhase === "uploading" ? "w-2/3 animate-pulse" : "w-[90%]"
                    }`}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-[#5F3378]">
                  {uploadPhase === "uploading"
                    ? "Uploading file…"
                    : "Saving file details…"}
                </p>
              </div>
            )}
          </div>
        </section>

        {(errorMessage || successMessage) && (
          <div
            role={errorMessage ? "alert" : "status"}
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm leading-6 ${
              errorMessage
                ? "border-[#E4C88F] bg-[#FFF7E6] text-[#805A22]"
                : "border-[#BFD8C7] bg-[#EDF7EF] text-[#356346]"
            }`}
          >
            {errorMessage ?? successMessage}
          </div>
        )}

        <section className="mt-12" aria-labelledby="uploaded-assets-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B7895]">
                Shared files
              </p>
              <h2
                id="uploaded-assets-heading"
                className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#341F60]"
              >
                Uploaded assets
              </h2>
            </div>
            {!isLoading && (
              <span className="rounded-full bg-[#EEE3FA] px-3 py-1.5 text-[11px] font-semibold text-[#5F3378]">
                {assets.length} files
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="h-72 animate-pulse rounded-[22px] border border-[#E3D8EA] bg-white"
                  />
                ))
              : assets.map((asset) => (
                  <article
                    key={asset.id}
                    className="overflow-hidden rounded-[22px] border border-[#E3D8EA] bg-white shadow-[0_8px_28px_rgba(52,31,96,0.055)]"
                  >
                    <AssetPreview asset={asset} />
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[#341F60]">
                          {asset.file_name ?? "Untitled asset"}
                        </h3>
                        <p className="mt-1 text-[11px] leading-5 text-[#8B7895]">
                          Uploaded by {asset.uploaded_by ?? "Client"} ·{" "}
                          {formatUploadDate(asset.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void deleteAsset(asset)}
                        disabled={Boolean(deletingId)}
                        aria-label={`Delete ${asset.file_name ?? "asset"}`}
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#E5D9EA] bg-white text-[#9A5A5A] transition hover:border-[#D7AAAA] hover:bg-[#FFF0F0] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A5A5A]"
                      >
                        {deletingId === asset.id ? (
                          <span className="size-4 animate-spin rounded-full border-2 border-[#DDBBBB] border-t-[#9A5A5A]" />
                        ) : (
                          <TrashIcon />
                        )}
                      </button>
                    </div>
                  </article>
                ))}
          </div>

          {!isLoading && assets.length === 0 && !errorMessage && (
            <div className="mt-5 rounded-[24px] border border-dashed border-[#D8C6E4] bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[#341F60]">
                No assets have been uploaded yet.
              </p>
              <p className="mt-1 text-xs text-[#75647F]">
                Your uploaded images and videos will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
