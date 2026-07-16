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

type ActionItem = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  resolved: boolean;
};
type ClientUpdate = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};
type ClientMeeting = {
  id: string;
  title: string;
  meeting_date: string | null;
  notes: string | null;
};

type Editor = {
  kind: "action" | "update" | "meeting";
  id?: string;
  title: string;
  details: string;
  date: string;
};

type DeleteTarget = {
  table: string;
  id: string;
  label: string;
};

function dateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function AdminDashboardPage() {
  const { clientId, clientName } = useAdmin();
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [updates, setUpdates] = useState<ClientUpdate[]>([]);
  const [meetings, setMeetings] = useState<ClientMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    setIsLoading(true);
    const [actionResult, updateResult, meetingResult] = await Promise.all([
      supabase
        .from("client_action_items")
        .select("id, title, description, due_date, resolved")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
      supabase
        .from("client_updates")
        .select("id, title, description, created_at")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
      supabase
        .from("client_meetings")
        .select("id, title, meeting_date, notes")
        .eq("client_id", clientId)
        .order("meeting_date", { ascending: true }),
    ]);
    const firstError =
      actionResult.error ?? updateResult.error ?? meetingResult.error;
    if (firstError) setError(firstError.message);
    else {
      setActions((actionResult.data ?? []) as ActionItem[]);
      setUpdates((updateResult.data ?? []) as ClientUpdate[]);
      setMeetings((meetingResult.data ?? []) as ClientMeeting[]);
      setError(null);
    }
    setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveEditor() {
    if (!clientId || !editor || !editor.title.trim() || isSaving) return;
    if (editor.kind === "meeting" && !editor.date) return;
    setIsSaving(true);
    setError(null);
    let mutation;

    if (editor.kind === "action") {
      const payload = {
        title: editor.title.trim(),
        description: editor.details.trim() || null,
        due_date: editor.date || null,
      };
      mutation = editor.id
        ? supabase
            .from("client_action_items")
            .update(payload)
            .eq("id", editor.id)
        : supabase.from("client_action_items").insert({
            client_id: clientId,
            ...payload,
            resolved: false,
          });
    } else if (editor.kind === "update") {
      const payload = {
        title: editor.title.trim(),
        description: editor.details.trim() || null,
      };
      mutation = editor.id
        ? supabase.from("client_updates").update(payload).eq("id", editor.id)
        : supabase
            .from("client_updates")
            .insert({ client_id: clientId, ...payload });
    } else {
      const payload = {
        title: editor.title.trim(),
        meeting_date: new Date(editor.date).toISOString(),
        notes: editor.details.trim() || null,
      };
      mutation = editor.id
        ? supabase.from("client_meetings").update(payload).eq("id", editor.id)
        : supabase
            .from("client_meetings")
            .insert({ client_id: clientId, ...payload });
    }

    const { error: mutationError } = await mutation;
    setIsSaving(false);
    if (mutationError) {
      setError(mutationError.message);
      return;
    }
    setSuccess(`${editor.id ? "Updated" : "Added"} successfully.`);
    setEditor(null);
    void load();
  }

  async function remove() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    const { error: mutationError } = await supabase
      .from(deleteTarget.table)
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
        title="Dashboard"
        description={`Manage action items, updates, and meetings published to ${clientName ?? "this client"}.`}
      />
      <AdminMessage error={error} success={success} />

      <div className="mt-8 grid gap-8 xl:grid-cols-3">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Action items</h2>
            <AdminButton
              onClick={() =>
                setEditor({
                  kind: "action",
                  title: "",
                  details: "",
                  date: "",
                })
              }
            >
              + Add
            </AdminButton>
          </div>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <AdminEmpty>Loading…</AdminEmpty>
            ) : actions.length ? (
              actions.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#D7CBE0] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-1 text-xs text-[#75647F]">
                        {item.description || "No description"}
                      </p>
                      <p className="mt-2 text-[10px] uppercase text-[#8B7895]">
                        {item.due_date ? `Due ${item.due_date}` : "No due date"}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.resolved}
                      aria-label={`Mark ${item.title} resolved`}
                      onChange={async () => {
                        await supabase
                          .from("client_action_items")
                          .update({ resolved: !item.resolved })
                          .eq("id", item.id);
                        void load();
                      }}
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <AdminButton
                      tone="secondary"
                      onClick={() =>
                        setEditor({
                          kind: "action",
                          id: item.id,
                          title: item.title,
                          details: item.description ?? "",
                          date: item.due_date ?? "",
                        })
                      }
                    >
                      Edit
                    </AdminButton>
                    <AdminButton
                      tone="danger"
                      onClick={() =>
                        setDeleteTarget({
                          table: "client_action_items",
                          id: item.id,
                          label: "action item",
                        })
                      }
                    >
                      Delete
                    </AdminButton>
                  </div>
                </article>
              ))
            ) : (
              <AdminEmpty>No action items yet.</AdminEmpty>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent updates</h2>
            <AdminButton
              onClick={() =>
                setEditor({
                  kind: "update",
                  title: "",
                  details: "",
                  date: "",
                })
              }
            >
              + Add
            </AdminButton>
          </div>
          <div className="mt-4 space-y-3">
            {updates.length ? (
              updates.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#D7CBE0] bg-white p-4"
                >
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#75647F]">
                    {item.description || "No description"}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <AdminButton
                      tone="secondary"
                      onClick={() =>
                        setEditor({
                          kind: "update",
                          id: item.id,
                          title: item.title,
                          details: item.description ?? "",
                          date: "",
                        })
                      }
                    >
                      Edit
                    </AdminButton>
                    <AdminButton
                      tone="danger"
                      onClick={() =>
                        setDeleteTarget({
                          table: "client_updates",
                          id: item.id,
                          label: "update",
                        })
                      }
                    >
                      Delete
                    </AdminButton>
                  </div>
                </article>
              ))
            ) : (
              <AdminEmpty>No updates yet.</AdminEmpty>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Meetings</h2>
            <AdminButton
              onClick={() =>
                setEditor({
                  kind: "meeting",
                  title: "",
                  details: "",
                  date: "",
                })
              }
            >
              + Add
            </AdminButton>
          </div>
          <div className="mt-4 space-y-3">
            {meetings.length ? (
              meetings.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[#D7CBE0] bg-white p-4"
                >
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs text-[#75647F]">
                    {item.meeting_date
                      ? new Date(item.meeting_date).toLocaleString("en-CA")
                      : "No date"}
                  </p>
                  <p className="mt-2 text-xs text-[#75647F]">
                    {item.notes || "No notes"}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <AdminButton
                      tone="secondary"
                      onClick={() =>
                        setEditor({
                          kind: "meeting",
                          id: item.id,
                          title: item.title,
                          details: item.notes ?? "",
                          date: dateTimeLocalValue(item.meeting_date),
                        })
                      }
                    >
                      Edit
                    </AdminButton>
                    <AdminButton
                      tone="danger"
                      onClick={() =>
                        setDeleteTarget({
                          table: "client_meetings",
                          id: item.id,
                          label: "meeting",
                        })
                      }
                    >
                      Delete
                    </AdminButton>
                  </div>
                </article>
              ))
            ) : (
              <AdminEmpty>No meetings yet.</AdminEmpty>
            )}
          </div>
        </section>
      </div>

      <AdminModal
        open={Boolean(editor)}
        title={`${editor?.id ? "Edit" : "Add"} ${editor?.kind ?? "record"}`}
        description="Changes are published to the selected client portal."
        submitLabel={editor?.id ? "Save changes" : "Add record"}
        isSaving={isSaving}
        submitDisabled={
          !editor?.title.trim() ||
          (editor?.kind === "meeting" && !editor.date)
        }
        onClose={() => setEditor(null)}
        onSubmit={(event) => {
          event.preventDefault();
          void saveEditor();
        }}
      >
        {editor && (
          <div className="grid gap-4">
            <label className="text-xs font-semibold text-[#341F60]">
              Title
              <input
                autoFocus
                value={editor.title}
                onChange={(event) =>
                  setEditor({ ...editor, title: event.target.value })
                }
                className={`mt-2 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-[#341F60]">
              {editor.kind === "meeting"
                ? "Notes"
                : editor.kind === "action"
                  ? "Description"
                  : "Update details"}
              <textarea
                rows={4}
                value={editor.details}
                onChange={(event) =>
                  setEditor({ ...editor, details: event.target.value })
                }
                className={`mt-2 resize-y ${inputClass}`}
              />
            </label>
            {editor.kind === "action" && (
              <label className="text-xs font-semibold text-[#341F60]">
                Due date
                <input
                  type="date"
                  value={editor.date}
                  onChange={(event) =>
                    setEditor({ ...editor, date: event.target.value })
                  }
                  className={`mt-2 ${inputClass}`}
                />
              </label>
            )}
            {editor.kind === "meeting" && (
              <label className="text-xs font-semibold text-[#341F60]">
                Meeting date and time
                <input
                  type="datetime-local"
                  required
                  value={editor.date}
                  onChange={(event) =>
                    setEditor({ ...editor, date: event.target.value })
                  }
                  className={`mt-2 ${inputClass}`}
                />
              </label>
            )}
          </div>
        )}
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.label ?? "record"}?`}
        description="This permanently removes the record from the client portal."
        isWorking={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void remove()}
      />
    </main>
  );
}
