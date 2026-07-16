"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClientSelect } from "@/app/_components/ClientSelect";
import {
  DIVISIONS,
  DIVISION_DESCRIPTIONS,
  DIVISION_LABELS,
  DIVISION_TASK_STATUSES,
  DIVISION_TASK_STATUS_DETAILS,
  EMPTY_CONTENT_BRIEF_DATA,
  specializedDivisionHref,
  type Division,
  type DivisionTaskStatus,
  type DivisionTaskTemplate,
} from "@/lib/division-tasks";
import { supabase } from "@/lib/supabase";
import {
  projectClientInitial,
  projectInputClass,
} from "@/lib/project-client-theme";
import {
  WORKSPACE_CLIENTS,
  WORKSPACE_CLIENT_SLUGS,
  type WorkspaceClientSlug,
} from "@/lib/workspace-clients";
import {
  TeamButton,
  TeamModal,
} from "../_components/TeamHubUi";
import { useProjectTheme } from "./_components/ProjectThemeProvider";

type DivisionTask = {
  id: string;
  client_id: string;
  division: Division;
  title: string;
  description: string | null;
  status: DivisionTaskStatus;
  template_type: DivisionTaskTemplate;
  content_brief_data: unknown;
  research_entries: unknown;
  figjam_embed_url: string | null;
  created_at: string;
};

type TemplateOption = {
  id: DivisionTaskTemplate;
  label: string;
  description: string;
  defaultTitle: string;
};

const socialMediaTemplates: TemplateOption[] = [
  {
    id: "content_brief",
    label: "Content brief",
    description:
      "Define the campaign goal, audience, key messages, themes, and due date.",
    defaultTitle: "Content brief",
  },
  {
    id: "content_calendar",
    label: "Content calendar",
    description:
      "Create an empty post-and-slide review workspace using the existing calendar structure.",
    defaultTitle: "Content calendar",
  },
  {
    id: "analytics_results_hub",
    label: "Social media content research",
    description:
      "Log reference links, formats, hooks, storytelling approaches, and trending audio.",
    defaultTitle: "Social media content research",
  },
];

const genericTemplate: TemplateOption = {
  id: "generic",
  label: "Blank task",
  description: "Start with a title, description, and status.",
  defaultTitle: "",
};

function DivisionIcon({ division }: { division: Division }) {
  const paths = {
    "social-media": (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    website: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      </>
    ),
    ads: (
      <>
        <path d="m4 13 12-5v10L4 13Z" />
        <path d="M16 10h2a3 3 0 0 1 0 6h-2M6 14l1 6h4l-2-7" />
      </>
    ),
    branding: (
      <>
        <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3.5A5.5 5.5 0 0 0 21 7.5C21 5 17 3 12 3Z" />
        <circle cx="8" cy="9" r="1" fill="currentColor" stroke="none" />
        <circle cx="11" cy="6.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="7" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    event: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18" />
        <path d="m9 16 2 2 4-5" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[division]}
    </svg>
  );
}

function StatusBadge({ status }: { status: DivisionTaskStatus }) {
  const details = DIVISION_TASK_STATUS_DETAILS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${details.className}`}
    >
      <span className={`size-1.5 rounded-full ${details.dot}`} />
      {details.label}
    </span>
  );
}

function ClientMark({ client }: { client: WorkspaceClientSlug }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-foreground)] shadow-sm"
    >
      {projectClientInitial(client)}
    </span>
  );
}

export default function TeamHubProjectsPage() {
  const [division, setDivision] = useState<Division>("social-media");
  const { client, isReady: isClientReady, setClient } = useProjectTheme();
  const [clientId, setClientId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<DivisionTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChoosingTemplate, setIsChoosingTemplate] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<DivisionTaskTemplate>("generic");
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<DivisionTaskStatus>("planning");

  const clientOptions = WORKSPACE_CLIENT_SLUGS.map((slug) => ({
    value: slug,
    label: WORKSPACE_CLIENTS[slug].name,
  }));

  useEffect(() => {
    if (!isClientReady) return;
    let isActive = true;

    async function loadTasks() {
      setIsLoading(true);
      setError(null);
      setClientId(null);

      const { data: clientRecord, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("slug", client)
        .single();

      if (!isActive) return;
      if (clientError || !clientRecord) {
        setTasks([]);
        setError(
          `Could not load ${WORKSPACE_CLIENTS[client].name}: ${
            clientError?.message ?? "Client not found."
          }`,
        );
        setIsLoading(false);
        return;
      }

      setClientId(clientRecord.id);
      const { data, error: taskError } = await supabase
        .from("division_tasks")
        .select(
          "id, client_id, division, title, description, status, template_type, content_brief_data, research_entries, figjam_embed_url, created_at",
        )
        .eq("client_id", clientRecord.id)
        .eq("division", division)
        .order("created_at", { ascending: false });

      if (!isActive) return;
      if (taskError) {
        setTasks([]);
        setError(`Could not load division tasks: ${taskError.message}`);
      } else {
        setTasks((data ?? []) as DivisionTask[]);
      }
      setIsLoading(false);
    }

    void loadTasks();
    return () => {
      isActive = false;
    };
  }, [client, division, isClientReady]);

  function selectClient(value: WorkspaceClientSlug) {
    setClient(value);
  }

  function closeTaskModal() {
    if (isSaving) return;
    setIsAddingTask(false);
    setTitle("");
    setDescription("");
    setStatus("planning");
    setSelectedTemplate("generic");
  }

  function chooseTemplate(template: TemplateOption) {
    setSelectedTemplate(template.id);
    setTitle(template.defaultTitle);
    setDescription("");
    setStatus("planning");
    setIsChoosingTemplate(false);
    setIsAddingTask(true);
  }

  async function addTask() {
    if (!clientId || !title.trim() || isSaving) return;

    setIsSaving(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("division_tasks")
      .insert({
        client_id: clientId,
        division,
        title: title.trim(),
        description: description.trim() || null,
        status,
        template_type: selectedTemplate,
        content_brief_data:
          selectedTemplate === "content_brief"
            ? EMPTY_CONTENT_BRIEF_DATA
            : null,
        research_entries: [],
      })
      .select(
        "id, client_id, division, title, description, status, template_type, content_brief_data, research_entries, figjam_embed_url, created_at",
      )
      .single();
    setIsSaving(false);

    if (insertError || !data) {
      setError(
        `Could not add the task: ${insertError?.message ?? "No task returned."}`,
      );
      return;
    }

    setTasks((current) => [data as DivisionTask, ...current]);
    closeTaskModal();
  }

  return (
    <main className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              Team Hub · Production
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
              Projects
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
              Choose a division, then open or create the work that belongs to
              it.
            </p>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted-foreground)] lg:text-right">
              Client
            </p>
            <div className="flex items-center gap-3">
              <ClientMark client={client} />
              <ClientSelect
                value={client}
                onChange={(value) =>
                  selectClient(value as WorkspaceClientSlug)
                }
                options={clientOptions}
                ariaLabel="Select project client"
                tone="themed"
              />
            </div>
          </div>
        </header>

        <nav
          aria-label="Project divisions"
          className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          {DIVISIONS.map((item) => {
            const isActive = item === division;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setDivision(item)}
                className={`rounded-[20px] border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] ${
                  isActive
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_10px_28px_rgba(40,50,55,0.14)]"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--primary)]"
                }`}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "bg-[var(--muted)] text-[var(--primary)]"
                  }`}
                >
                  <DivisionIcon division={item} />
                </span>
                <span className="mt-3 block text-sm font-semibold">
                  {DIVISION_LABELS[item]}
                </span>
              </button>
            );
          })}
        </nav>

        <section className="mt-8">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                {WORKSPACE_CLIENTS[client].name} · Division
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                {DIVISION_LABELS[division]}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                {DIVISION_DESCRIPTIONS[division]}
              </p>
            </div>
            <TeamButton
              type="button"
              themed
              disabled={!clientId || isLoading}
              onClick={() => setIsChoosingTemplate(true)}
            >
              + Add task
            </TeamButton>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-[#E4B9B9] bg-[#FFF0F0] px-4 py-3 text-sm text-[#8B3E3E]"
            >
              {error}
            </p>
          )}

          {isLoading ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-48 animate-pulse rounded-[22px] border border-[var(--border)] bg-[var(--card)]"
                />
              ))}
            </div>
          ) : tasks.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tasks.map((task) => {
                const specializedHref = specializedDivisionHref(
                  task.division,
                  client,
                  task.id,
                  task.template_type,
                );
                const href =
                  specializedHref ?? `/team-hub/projects/${task.id}`;

                return (
                  <Link
                    key={task.id}
                    href={href}
                    className="group flex min-h-48 flex-col rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_8px_24px_rgba(40,50,55,0.045)] transition hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-[0_14px_34px_rgba(40,50,55,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {task.template_type === "analytics_results_hub" ? (
                        <span className="rounded-full border border-[var(--border)] bg-[var(--muted)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--foreground)]">
                          Research log
                        </span>
                      ) : (
                        <StatusBadge status={task.status} />
                      )}
                      <span
                        aria-hidden="true"
                        className="text-[var(--muted-foreground)] transition group-hover:translate-x-1 group-hover:text-[var(--primary)]"
                      >
                        →
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                      {task.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted-foreground)]">
                      {task.description || "No description yet."}
                    </p>
                    <p className="mt-auto pt-5 text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--primary)]">
                      {specializedHref
                        ? `Open ${DIVISION_LABELS[task.division]} workspace`
                        : "Open task details"}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                No {DIVISION_LABELS[division].toLowerCase()} tasks yet.
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Add the first task for {WORKSPACE_CLIENTS[client].name}.
              </p>
            </div>
          )}
        </section>
      </div>

      <TeamModal
        open={isChoosingTemplate}
        title={`Choose a ${DIVISION_LABELS[division]} template`}
        description="Select the starting structure for this task."
        themed
        hideSubmit
        onClose={() => setIsChoosingTemplate(false)}
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="grid gap-3">
          {(division === "social-media"
            ? socialMediaTemplates
            : [genericTemplate]
          ).map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => chooseTemplate(template)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-left transition hover:border-[var(--primary)] hover:bg-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              <span className="block text-sm font-semibold text-[var(--foreground)]">
                {template.label}
              </span>
              <span className="mt-1.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                {template.description}
              </span>
            </button>
          ))}
        </div>
      </TeamModal>

      <TeamModal
        open={isAddingTask}
        title={`Add ${
          (division === "social-media"
            ? socialMediaTemplates
            : [genericTemplate]
          ).find((template) => template.id === selectedTemplate)?.label ??
          DIVISION_LABELS[division]
        }`}
        description={`Create this task for ${WORKSPACE_CLIENTS[client].name}.`}
        submitLabel="Add task"
        isSaving={isSaving}
        submitDisabled={!title.trim()}
        themed
        onClose={closeTaskModal}
        onSubmit={(event) => {
          event.preventDefault();
          void addTask();
        }}
      >
        <div className="grid gap-4">
          <label className="text-xs font-semibold text-[var(--foreground)]">
            Task title
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={`mt-2 ${projectInputClass}`}
              placeholder="Task title"
            />
          </label>
          <label className="text-xs font-semibold text-[var(--foreground)]">
            Description
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`mt-2 resize-y ${projectInputClass}`}
              placeholder="What does this task cover?"
            />
          </label>
          {selectedTemplate !== "analytics_results_hub" && (
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Initial status
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as DivisionTaskStatus)
                }
                className={`mt-2 ${projectInputClass}`}
              >
                {DIVISION_TASK_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {DIVISION_TASK_STATUS_DETAILS[option].label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </TeamModal>
    </main>
  );
}
