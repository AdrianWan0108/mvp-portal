"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
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

type Status = "approval_needed" | "revision_in_progress" | "up_to_date";
type Category = {
  id: string;
  name: string;
  status: Status;
  description: string | null;
  route_slug: string;
};

type CategoryEditor = {
  id?: string;
  name: string;
  status: Status;
  description: string;
  routeSlug: string;
};

export default function AdminApprovalsPage() {
  const { clientId, clientName } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<CategoryEditor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    const { data, error: loadError } = await supabase
      .from("client_approval_categories")
      .select("id, name, status, description, route_slug")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });
    if (loadError) setError(loadError.message);
    else setCategories((data ?? []) as Category[]);
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveCategory() {
    if (
      !clientId ||
      !editor ||
      !editor.name.trim() ||
      !editor.routeSlug.trim() ||
      isSaving
    )
      return;
    setIsSaving(true);
    setError(null);
    const payload = {
      name: editor.name.trim(),
      route_slug: editor.routeSlug.trim(),
      description: editor.description.trim() || null,
      status: editor.status,
    };
    const { error: mutationError } = editor.id
      ? await supabase
          .from("client_approval_categories")
          .update(payload)
          .eq("id", editor.id)
      : await supabase
          .from("client_approval_categories")
          .insert({ client_id: clientId, ...payload });
    setIsSaving(false);
    if (mutationError) {
      setError(mutationError.message);
      return;
    }
    setEditor(null);
    void load();
  }

  async function deleteCategory() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    const { error: mutationError } = await supabase
      .from("client_approval_categories")
      .delete()
      .eq("id", deleteTarget.id);
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
        title="Approvals"
        description={`Manage approval categories and their client-facing status for ${clientName ?? "this client"}.`}
        action={
          <AdminButton
            onClick={() =>
              setEditor({
                name: "",
                status: "approval_needed",
                description: "",
                routeSlug: "",
              })
            }
          >
            + Add category
          </AdminButton>
        }
      />
      <AdminMessage error={error} />
      <div className="mt-7 overflow-hidden rounded-[22px] border border-[#D7CBE0] bg-white">
        {categories.length ? (
          categories.map((category) => (
            <article
              key={category.id}
              className="flex flex-col gap-4 border-b border-[#E5DBEA] p-5 last:border-0 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{category.name}</h2>
                <p className="mt-1 text-sm text-[#75647F]">
                  {category.description || "No description"}
                </p>
                <p className="mt-1 text-[10px] uppercase text-[#9A8AA3]">
                  /{category.route_slug}
                </p>
              </div>
              <select
                value={category.status}
                onChange={async (event) => {
                  const { error: mutationError } = await supabase
                    .from("client_approval_categories")
                    .update({ status: event.target.value as Status })
                    .eq("id", category.id);
                  if (mutationError) setError(mutationError.message);
                  else void load();
                }}
                className="rounded-xl border border-[#CDBAD9] bg-[#EEE3FA] px-3 py-2 text-xs font-semibold text-[#5F3378]"
              >
                <option value="approval_needed">Approval needed</option>
                <option value="revision_in_progress">
                  Revision in progress
                </option>
                <option value="up_to_date">Up to date</option>
              </select>
              <AdminButton
                tone="secondary"
                onClick={() =>
                  setEditor({
                    id: category.id,
                    name: category.name,
                    status: category.status,
                    description: category.description ?? "",
                    routeSlug: category.route_slug,
                  })
                }
              >
                Edit
              </AdminButton>
              <AdminButton
                tone="danger"
                onClick={() => setDeleteTarget(category)}
              >
                Delete
              </AdminButton>
            </article>
          ))
        ) : (
          <AdminEmpty>No approval categories yet.</AdminEmpty>
        )}
      </div>

      <AdminModal
        open={Boolean(editor)}
        title={`${editor?.id ? "Edit" : "Add"} approval category`}
        description="Set the category label, route, and client-facing review status."
        submitLabel={editor?.id ? "Save changes" : "Add category"}
        isSaving={isSaving}
        submitDisabled={!editor?.name.trim() || !editor?.routeSlug.trim()}
        onClose={() => setEditor(null)}
        onSubmit={(event) => {
          event.preventDefault();
          void saveCategory();
        }}
      >
        {editor && (
          <div className="grid gap-4">
            <label className="text-xs font-semibold text-[#341F60]">
              Category name
              <input
                autoFocus
                value={editor.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setEditor({
                    ...editor,
                    name,
                    routeSlug: editor.id
                      ? editor.routeSlug
                      : name
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, ""),
                  });
                }}
                className={`mt-2 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Route slug
              <input
                value={editor.routeSlug}
                onChange={(event) =>
                  setEditor({ ...editor, routeSlug: event.target.value })
                }
                placeholder="social-media"
                className={`mt-2 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Status
              <select
                value={editor.status}
                onChange={(event) =>
                  setEditor({
                    ...editor,
                    status: event.target.value as Status,
                  })
                }
                className={`mt-2 ${inputClass}`}
              >
                <option value="approval_needed">Approval needed</option>
                <option value="revision_in_progress">
                  Revision in progress
                </option>
                <option value="up_to_date">Up to date</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              Description
              <textarea
                rows={3}
                value={editor.description}
                onChange={(event) =>
                  setEditor({ ...editor, description: event.target.value })
                }
                className={`mt-2 resize-y ${inputClass}`}
              />
            </label>
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete approval category?"
        description={`This permanently removes “${deleteTarget?.name ?? "this category"}” from the client portal.`}
        isWorking={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteCategory()}
      />
    </main>
  );
}
