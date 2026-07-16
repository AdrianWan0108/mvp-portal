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

type ProjectTask = {
  id: string;
  title: string;
  done: boolean;
  note: string | null;
};
type Project = {
  id: string;
  name: string;
  project_type: "project" | "program";
  status_note: string | null;
  image_url: string | null;
  client_project_tasks: ProjectTask[] | null;
};

type Editor =
  | {
      kind: "project";
      id?: string;
      name: string;
      projectType: "project" | "program";
      statusNote: string;
      imageUrl: string;
    }
  | {
      kind: "task";
      id?: string;
      projectId: string;
      title: string;
      note: string;
    };

type DeleteTarget = {
  table: "client_projects" | "client_project_tasks";
  id: string;
  label: string;
};

export default function AdminProjectsPage() {
  const { clientId, clientName } = useAdmin();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    const { data, error: loadError } = await supabase
      .from("client_projects")
      .select(
        "id, name, project_type, status_note, image_url, client_project_tasks(id, title, done, note)",
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });
    if (loadError) setError(loadError.message);
    else setProjects((data ?? []) as Project[]);
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveEditor() {
    if (!clientId || !editor || isSaving) return;
    setIsSaving(true);
    setError(null);
    let mutation;

    if (editor.kind === "project") {
      if (!editor.name.trim()) {
        setIsSaving(false);
        return;
      }
      const payload = {
        name: editor.name.trim(),
        project_type: editor.projectType,
        status_note:
          editor.projectType === "program"
            ? editor.statusNote.trim() || null
            : null,
        image_url:
          editor.projectType === "project"
            ? editor.imageUrl.trim() || null
            : null,
      };
      mutation = editor.id
        ? supabase.from("client_projects").update(payload).eq("id", editor.id)
        : supabase
            .from("client_projects")
            .insert({ client_id: clientId, ...payload });
    } else {
      if (!editor.title.trim()) {
        setIsSaving(false);
        return;
      }
      const payload = {
        title: editor.title.trim(),
        note: editor.note.trim() || null,
      };
      mutation = editor.id
        ? supabase
            .from("client_project_tasks")
            .update(payload)
            .eq("id", editor.id)
        : supabase.from("client_project_tasks").insert({
            project_id: editor.projectId,
            ...payload,
            done: false,
          });
    }

    const { error: mutationError } = await mutation;
    setIsSaving(false);
    if (mutationError) {
      setError(mutationError.message);
      return;
    }
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
        title="Projects"
        description={`Manage projects, ongoing programs, and task progress for ${clientName ?? "this client"}.`}
        action={
          <AdminButton
            onClick={() =>
              setEditor({
                kind: "project",
                name: "",
                projectType: "project",
                statusNote: "",
                imageUrl: "",
              })
            }
          >
            + Add project
          </AdminButton>
        }
      />
      <AdminMessage error={error} />
      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        {projects.length ? (
          projects.map((project) => (
            <article
              key={project.id}
              className="overflow-hidden rounded-[24px] border border-[#D7CBE0] bg-white"
            >
              <div className="h-28 bg-[linear-gradient(135deg,#341F60,#7D4698)] p-5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F4CE45]">
                  {project.project_type}
                </span>
                <h2 className="mt-2 text-xl font-semibold">{project.name}</h2>
              </div>
              <div className="p-5">
                {project.status_note && (
                  <p className="mb-4 text-sm text-[#75647F]">
                    {project.status_note}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <AdminButton
                    tone="secondary"
                    onClick={() =>
                      setEditor({
                        kind: "project",
                        id: project.id,
                        name: project.name,
                        projectType: project.project_type,
                        statusNote: project.status_note ?? "",
                        imageUrl: project.image_url ?? "",
                      })
                    }
                  >
                    Edit project
                  </AdminButton>
                  <AdminButton
                    onClick={() =>
                      setEditor({
                        kind: "task",
                        projectId: project.id,
                        title: "",
                        note: "",
                      })
                    }
                    disabled={project.project_type === "program"}
                  >
                    + Task
                  </AdminButton>
                  <AdminButton
                    tone="danger"
                    onClick={() =>
                      setDeleteTarget({
                        table: "client_projects",
                        id: project.id,
                        label: "project",
                      })
                    }
                  >
                    Delete
                  </AdminButton>
                </div>

                {project.project_type === "project" && (
                  <div className="mt-5 space-y-2">
                    {(project.client_project_tasks ?? []).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 rounded-xl border border-[#E4D9EA] bg-[#FFFDF8] p-3"
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={async () => {
                            await supabase
                              .from("client_project_tasks")
                              .update({ done: !task.done })
                              .eq("id", task.id);
                            void load();
                          }}
                          className="mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              task.done ? "text-[#8B7895] line-through" : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs text-[#75647F]">
                            {task.note || "No note"}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setEditor({
                              kind: "task",
                              id: task.id,
                              projectId: project.id,
                              title: task.title,
                              note: task.note ?? "",
                            })
                          }
                          className="text-xs font-semibold text-[#7D4698]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              table: "client_project_tasks",
                              id: task.id,
                              label: "task",
                            })
                          }
                          className="text-xs font-semibold text-[#9A4040]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {(project.client_project_tasks ?? []).length === 0 && (
                      <p className="py-4 text-center text-xs text-[#8B7895]">
                        No tasks yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))
        ) : (
          <AdminEmpty>No projects yet.</AdminEmpty>
        )}
      </div>

      <AdminModal
        open={Boolean(editor)}
        title={
          editor?.kind === "task"
            ? `${editor.id ? "Edit" : "Add"} task`
            : `${editor?.id ? "Edit" : "Add"} project`
        }
        submitLabel={editor?.id ? "Save changes" : "Add"}
        isSaving={isSaving}
        submitDisabled={
          editor?.kind === "project"
            ? !editor.name.trim()
            : !editor?.title.trim()
        }
        onClose={() => setEditor(null)}
        onSubmit={(event) => {
          event.preventDefault();
          void saveEditor();
        }}
      >
        {editor?.kind === "project" ? (
          <div className="grid gap-4">
            <label className="text-xs font-semibold text-[#341F60]">
              Project name
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
              Type
              <select
                value={editor.projectType}
                onChange={(event) =>
                  setEditor({
                    ...editor,
                    projectType: event.target.value as "project" | "program",
                  })
                }
                className={`mt-2 ${inputClass}`}
              >
                <option value="project">Project</option>
                <option value="program">Program</option>
              </select>
            </label>
            {editor.projectType === "program" ? (
              <label className="text-xs font-semibold text-[#341F60]">
                Status note
                <input
                  value={editor.statusNote}
                  onChange={(event) =>
                    setEditor({ ...editor, statusNote: event.target.value })
                  }
                  placeholder="Starting August · prep underway"
                  className={`mt-2 ${inputClass}`}
                />
              </label>
            ) : (
              <label className="text-xs font-semibold text-[#341F60]">
                Cover image URL
                <input
                  type="url"
                  value={editor.imageUrl}
                  onChange={(event) =>
                    setEditor({ ...editor, imageUrl: event.target.value })
                  }
                  placeholder="https://..."
                  className={`mt-2 ${inputClass}`}
                />
              </label>
            )}
          </div>
        ) : editor ? (
          <div className="grid gap-4">
            <label className="text-xs font-semibold text-[#341F60]">
              Task title
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
              Task note
              <textarea
                rows={3}
                value={editor.note}
                onChange={(event) =>
                  setEditor({ ...editor, note: event.target.value })
                }
                className={`mt-2 resize-y ${inputClass}`}
              />
            </label>
          </div>
        ) : null}
      </AdminModal>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.label ?? "record"}?`}
        description={
          deleteTarget?.table === "client_projects"
            ? "This permanently deletes the project and all of its tasks."
            : "This permanently deletes the task."
        }
        isWorking={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void remove()}
      />
    </main>
  );
}
