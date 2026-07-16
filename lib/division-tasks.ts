import type { WorkspaceClientSlug } from "@/lib/workspace-clients";

export const DIVISIONS = [
  "social-media",
  "website",
  "ads",
  "branding",
  "event",
] as const;

export type Division = (typeof DIVISIONS)[number];

export const DIVISION_LABELS: Record<Division, string> = {
  "social-media": "Social media",
  website: "Website",
  ads: "Ads",
  branding: "Branding",
  event: "Event",
};

export const DIVISION_DESCRIPTIONS: Record<Division, string> = {
  "social-media": "Content calendars, production, and social review work.",
  website: "Website planning, page production, QA, and launch work.",
  ads: "Campaign strategy, creative production, and paid-media assets.",
  branding: "Identity, collateral, and visual-system projects.",
  event: "Event planning, promotion, production, and launch materials.",
};

export const DIVISION_TASK_STATUSES = [
  "planning",
  "production",
  "review",
  "approved",
] as const;

export type DivisionTaskStatus = (typeof DIVISION_TASK_STATUSES)[number];

export const DIVISION_TASK_TEMPLATES = [
  "generic",
  "content_brief",
  "content_calendar",
  "analytics_results_hub",
  "website_dashboard",
] as const;

export type DivisionTaskTemplate =
  (typeof DIVISION_TASK_TEMPLATES)[number];

export type ContentBriefData = {
  campaign_goal: string;
  target_audience: string;
  key_messages: string;
  content_pillars: string;
  due_date: string;
};

export const EMPTY_CONTENT_BRIEF_DATA: ContentBriefData = {
  campaign_goal: "",
  target_audience: "",
  key_messages: "",
  content_pillars: "",
  due_date: "",
};

export const DIVISION_TASK_STATUS_DETAILS: Record<
  DivisionTaskStatus,
  { label: string; className: string; dot: string }
> = {
  planning: {
    label: "Planning",
    className: "border-[#DDD5E1] bg-[#F5F2F6] text-[#695E70]",
    dot: "bg-[#9A8FA0]",
  },
  production: {
    label: "Production",
    className: "border-[#E8CF91] bg-[#FFF4D2] text-[#7B5A08]",
    dot: "bg-[#D3A72B]",
  },
  review: {
    label: "Review",
    className: "border-[#BFCBE7] bg-[#EDF2FF] text-[#405A91]",
    dot: "bg-[#6683C1]",
  },
  approved: {
    label: "Approved",
    className: "border-[#BFD8C7] bg-[#EDF7EF] text-[#356346]",
    dot: "bg-[#6D967A]",
  },
};

export const FIGJAM_DIVISIONS: Division[] = ["ads", "branding", "event"];

export function isDivision(value: string): value is Division {
  return DIVISIONS.includes(value as Division);
}

export function isDivisionTaskStatus(
  value: string,
): value is DivisionTaskStatus {
  return DIVISION_TASK_STATUSES.includes(value as DivisionTaskStatus);
}

export function isDivisionTaskTemplate(
  value: string,
): value is DivisionTaskTemplate {
  return DIVISION_TASK_TEMPLATES.includes(value as DivisionTaskTemplate);
}

export function normalizeContentBriefData(
  value: unknown,
): ContentBriefData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...EMPTY_CONTENT_BRIEF_DATA };
  }

  const record = value as Record<string, unknown>;
  return {
    campaign_goal:
      typeof record.campaign_goal === "string" ? record.campaign_goal : "",
    target_audience:
      typeof record.target_audience === "string"
        ? record.target_audience
        : "",
    key_messages:
      typeof record.key_messages === "string" ? record.key_messages : "",
    content_pillars:
      typeof record.content_pillars === "string"
        ? record.content_pillars
        : "",
    due_date: typeof record.due_date === "string" ? record.due_date : "",
  };
}

export function specializedDivisionHref(
  division: Division,
  client: WorkspaceClientSlug,
  taskId?: string,
  templateType?: DivisionTaskTemplate,
) {
  if (
    division === "social-media" &&
    templateType === "content_calendar" &&
    taskId
  ) {
    return `/team-hub/projects/${encodeURIComponent(taskId)}/calendar?calendar=${encodeURIComponent(taskId)}`;
  }

  if (division === "website") {
    return `/team-hub/projects/website?client=${client}`;
  }

  return null;
}
