import { ProjectThemeProvider } from "./_components/ProjectThemeProvider";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProjectThemeProvider>{children}</ProjectThemeProvider>;
}
