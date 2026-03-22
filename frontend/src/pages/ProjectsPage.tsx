import PageTransition from "@/components/PageTransition";
import Projects from "@/sections/Projects";

export default function ProjectsPage() {
  return (
    <PageTransition>
      <div className="pt-24">
        <Projects />
      </div>
    </PageTransition>
  );
}
