import type { WorkspaceClientSlug } from "@/lib/workspace-clients";

export type SlackNotification =
  | {
      type: "client_review";
      clientSlug: "mvp" | "boardwalk";
      action: "approved" | "requested_changes";
      title: string;
      reviewerName: string;
      comment?: string;
      assigneeNames?: string[];
    }
  | {
      type: "task_review";
      clientSlug: WorkspaceClientSlug;
      title: string;
    }
  | {
      type: "client_invoice";
      clientSlug: WorkspaceClientSlug;
      invoiceName: string;
      amount: number;
    }
  | {
      type: "payroll_invoice";
      staffUsername: string;
      amount: number;
    };

export async function sendSlackNotification(
  notification: SlackNotification,
) {
  try {
    const response = await fetch("/api/slack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notification),
      keepalive: true,
    });

    if (!response.ok) {
      throw new Error(
        `Slack notification endpoint returned ${response.status}.`,
      );
    }
  } catch (error) {
    console.error("Slack notification failed:", error);
  }
}
