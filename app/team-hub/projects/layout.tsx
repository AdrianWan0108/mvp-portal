import { AssistantBubble } from "./_components/AssistantBubble";
import { ProjectThemeProvider } from "./_components/ProjectThemeProvider";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectThemeProvider>
      {children}
      <AssistantBubble />
    </ProjectThemeProvider>
  );
}
