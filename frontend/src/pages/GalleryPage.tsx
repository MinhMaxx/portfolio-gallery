import PageTransition from "@/components/PageTransition";
import Photography from "@/sections/Photography";

export default function GalleryPage() {
  return (
    <PageTransition>
      <div className="pt-24">
        <Photography />
      </div>
    </PageTransition>
  );
}
