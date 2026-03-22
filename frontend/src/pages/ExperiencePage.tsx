import PageTransition from "@/components/PageTransition";
import Experience from "@/sections/Experience";

export default function ExperiencePage() {
  return (
    <PageTransition>
      <div className="pt-24">
        <Experience />
      </div>
    </PageTransition>
  );
}
