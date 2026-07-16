"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "../_components/AdminContext";
import {
  AdminButton,
  AdminConfirmDialog,
  AdminEmpty,
  AdminMessage,
  AdminPageHeader,
} from "../_components/AdminUi";

const BUCKET = "client-assets";
type Asset = {
  id: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
};

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

export default function AdminAssetsPage() {
  const { clientId, clientName } = useAdmin();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    const { data, error: loadError } = await supabase
      .from("client_assets")
      .select(
        "id, file_url, file_name, file_type, uploaded_by, created_at",
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setAssets((data ?? []) as Asset[]);
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeAsset() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    const asset = deleteTarget;
    const path = storagePath(asset.file_url);
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
    const { error: mutationError } = await supabase
      .from("client_assets")
      .delete()
      .eq("id", asset.id);
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
        title="Client assets"
        description={`Review and remove files uploaded by ${clientName ?? "this client"}. Uploading remains client-driven.`}
      />
      <AdminMessage error={error} />
      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {assets.length ? (
          assets.map((asset) => (
            <article
              key={asset.id}
              className="overflow-hidden rounded-[20px] border border-[#D7CBE0] bg-white"
            >
              <a href={asset.file_url} target="_blank" rel="noreferrer">
                {asset.file_type?.startsWith("image/") ? (
                  <img
                    src={asset.file_url}
                    alt={asset.file_name ?? "Client asset"}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : asset.file_type?.startsWith("video/") ? (
                  <video
                    src={asset.file_url}
                    muted
                    preload="metadata"
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-[#EEE3FA] text-sm text-[#75647F]">
                    Open file
                  </div>
                )}
              </a>
              <div className="p-4">
                <h2 className="truncate font-semibold">
                  {asset.file_name || "Untitled asset"}
                </h2>
                <p className="mt-1 text-xs text-[#75647F]">
                  Uploaded by {asset.uploaded_by || "Client"}
                </p>
                <AdminButton
                  tone="danger"
                  className="mt-4"
                  onClick={() => setDeleteTarget(asset)}
                >
                  Delete
                </AdminButton>
              </div>
            </article>
          ))
        ) : (
          <AdminEmpty>No client assets yet.</AdminEmpty>
        )}
      </div>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete client asset?"
        description={`This permanently removes “${deleteTarget?.file_name ?? "this file"}” from storage and the client asset library.`}
        isWorking={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void removeAsset()}
      />
    </main>
  );
}
