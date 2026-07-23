import { InternalApprovalWorkspace } from "./workspace";

export default async function InternalApprovalPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <InternalApprovalWorkspace taskId={taskId} />;
}
