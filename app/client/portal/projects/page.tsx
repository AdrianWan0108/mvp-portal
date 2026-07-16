"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ProjectType = "project" | "program";

type ProjectTask = {
  id: string;
  project_id: string;
  title: string;
  done: boolean;
  note: string | null;
  created_at: string;
};

type ClientProject = {
  id: string;
  client_id: string;
  name: string;
  project_type: ProjectType;
  status_note: string | null;
  image_url: string | null;
  created_at: string;
  client_project_tasks: ProjectTask[] | null;
};

const programDescriptions: Record<string, string> = {
  "Social media management":
    "Ongoing planning, production, publishing, and performance support for MVP’s social channels.",
  "Website optimisation":
    "Continuous improvements to site content, usability, conversion paths, and performance.",
};

function CheckIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ProjectCover({ project }: { project: ClientProject }) {
  const [hasFailed, setHasFailed] = useState(false);

  if (!project.image_url || hasFailed) {
    return (
      <div className="flex h-36 items-center justify-center bg-[linear-gradient(135deg,#EEE3FA_0%,#FFF9EF_62%,#FBE9A5_100%)] px-6 text-center sm:h-40">
        <div>
          <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-[#7D4698] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(52,31,96,0.15)]">
            U
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7D4698]">
            Understory project
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={project.image_url}
      alt={`${project.name} cover`}
      className="h-36 w-full object-cover sm:h-40"
      onError={() => setHasFailed(true)}
    />
  );
}

function ProjectCard({ project }: { project: ClientProject }) {
  const tasks = project.client_project_tasks ?? [];
  const completedTasks = tasks.filter((task) => task.done).length;
  const progress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#E3D8EA] bg-white shadow-[0_8px_28px_rgba(52,31,96,0.055)]">
      <ProjectCover project={project} />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B7895]">
              Active project
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#341F60]">
              {project.name}
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-[#EEE3FA] px-3 py-1.5 text-[11px] font-semibold text-[#5F3378]">
            {completedTasks} of {tasks.length} done
          </span>
        </div>

        <div className="mt-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#EEE3FA]">
            <div
              className="h-full rounded-full bg-[#7D4698] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-[#8B7895]">
            <span>Project progress</span>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tasks.map((task) => (
            <span
              key={task.id}
              title={task.note ?? undefined}
              className={`inline-flex max-w-full items-start gap-1.5 rounded-2xl border px-3 py-2 text-[11px] font-semibold ${
                task.done
                  ? "border-[#D2C4DA] bg-[#F4EEF8] text-[#75647F]"
                  : "border-[#E7CA68] bg-[#FFF5C9] text-[#725A00]"
              }`}
            >
              {task.done ? (
                <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-[#7D4698]" />
              ) : (
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#D0A323]" />
              )}
              <span className="min-w-0">
                <span className="block">{task.title}</span>
                {task.note && (
                  <span className="mt-0.5 block font-normal leading-4 opacity-75">
                    {task.note}
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function ProgramRow({ project }: { project: ClientProject }) {
  return (
    <article className="flex flex-col gap-4 border-b border-[#E9E0EF] px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[#341F60]">
          {project.name}
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-[#75647F]">
          {programDescriptions[project.name] ??
            "Ongoing strategic and delivery support for this workstream."}
        </p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[#DFC15D] bg-[#FFF4C7] px-3.5 py-2 text-[11px] font-semibold text-[#725A00] sm:self-auto">
        <span className="size-1.5 rounded-full bg-[#D0A323]" />
        {project.status_note ?? "In progress"}
      </span>
    </article>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeProjects = useMemo(
    () => projects.filter((project) => project.project_type === "project"),
    [projects],
  );
  const ongoingPrograms = useMemo(
    () => projects.filter((project) => project.project_type === "program"),
    [projects],
  );

  useEffect(() => {
    let isActive = true;

    async function loadProjects() {
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
        .from("client_projects")
        .select(
          "id, client_id, name, project_type, status_note, image_url, created_at, client_project_tasks(id, project_id, title, done, note, created_at)",
        )
        .eq("client_id", client.id)
        .order("created_at", { ascending: true });

      if (!isActive) return;
      if (error) {
        setErrorMessage(`Could not load projects: ${error.message}`);
        setProjects([]);
        setIsLoading(false);
        return;
      }

      const loadedProjects = (data ?? []).map((project) => ({
        ...project,
        project_type:
          project.project_type === "program" ? "program" : "project",
        client_project_tasks: [...(project.client_project_tasks ?? [])].sort(
          (a, b) => a.created_at.localeCompare(b.created_at),
        ),
      })) as ClientProject[];

      setProjects(loadedProjects);
      setErrorMessage(null);
      setIsLoading(false);
    }

    void loadProjects();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7D4698]">
            Client portal · MVP
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#341F60] sm:text-4xl">
            Projects
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75647F] sm:text-base">
            A clear view of current project progress and ongoing support from
            the Understory team.
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mt-7 rounded-2xl border border-[#E4C88F] bg-[#FFF7E6] px-4 py-3 text-sm leading-6 text-[#805A22]"
          >
            {errorMessage}
          </div>
        )}

        <section className="mt-10" aria-labelledby="active-projects-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B7895]">
                Deliverables
              </p>
              <h2
                id="active-projects-heading"
                className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#341F60]"
              >
                Active projects
              </h2>
            </div>
            {!isLoading && (
              <span className="rounded-full bg-[#EEE3FA] px-3 py-1.5 text-[11px] font-semibold text-[#5F3378]">
                {activeProjects.length} projects
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {isLoading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="h-[26rem] animate-pulse rounded-[24px] border border-[#E3D8EA] bg-white"
                  />
                ))
              : activeProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
          </div>

          {!isLoading && activeProjects.length === 0 && !errorMessage && (
            <p className="mt-5 rounded-[24px] border border-dashed border-[#D8C6E4] bg-white px-6 py-10 text-center text-sm text-[#75647F]">
              No active projects are available yet.
            </p>
          )}
        </section>

        <section className="mt-12" aria-labelledby="ongoing-programs-heading">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B7895]">
              Retained support
            </p>
            <h2
              id="ongoing-programs-heading"
              className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#341F60]"
            >
              Ongoing programs
            </h2>
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-[#E3D8EA] bg-white shadow-[0_8px_28px_rgba(52,31,96,0.055)]">
            {isLoading ? (
              <div className="space-y-px bg-[#E9E0EF]">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse bg-white"
                  />
                ))}
              </div>
            ) : ongoingPrograms.length > 0 ? (
              ongoingPrograms.map((project) => (
                <ProgramRow key={project.id} project={project} />
              ))
            ) : (
              <p className="px-6 py-10 text-center text-sm text-[#75647F]">
                No ongoing programs are available yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
