import "server-only";

export type SlackWebhookTarget = "mvp" | "boardwalk" | "admin";

const webhookEnvironmentVariables: Record<SlackWebhookTarget, string> = {
  mvp: "SLACK_WEBHOOK_MVP",
  boardwalk: "SLACK_WEBHOOK_BOARDWALK",
  admin: "SLACK_WEBHOOK_ADMIN",
};

export async function sendSlackMessage(
  target: SlackWebhookTarget,
  text: string,
) {
  const environmentVariable = webhookEnvironmentVariables[target];
  const webhookUrl = process.env[environmentVariable];

  if (!webhookUrl) {
    throw new Error(
      `Missing Slack webhook environment variable: ${environmentVariable}`,
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Slack webhook returned ${response.status}.`);
  }
}
