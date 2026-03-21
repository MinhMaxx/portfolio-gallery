import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/SectionHeading";
import api from "@/lib/api";
import { getThumbnailUrl, getImageUrl } from "@/lib/constants";

interface Photo {
  _id: string;
  title: string;
  description: string;
  category: string;
  s3Key: string;
  thumbnailKey: string;
}

export default function Photography() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    api
      .get("/photo", { params: { limit: 100 } })
      .then((r) => setPhotos(r.data.photos))
      .catch(() => {});
    api
      .get("/photo/categories")
      .then((r) => setCategories(r.data))
      .catch(() => {});
  }, []);

  const filtered =
    activeCategory === "all"
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) =>
          i !== null ? (i + 1) % filtered.length : null
        );
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) =>
          i !== null ? (i - 1 + filtered.length) % filtered.length : null
        );
    },
    [lightboxIndex, filtered.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <section id="gallery" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="Photography"
          subtitle="Moments captured through my lens"
        />

        {categories.length > 0 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm transition-all whitespace-nowrap",
                activeCategory === "all"
                  ? "bg-accent text-white"
                  : "bg-surface text-text-secondary hover:text-text-primary"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm transition-all whitespace-nowrap capitalize",
                  activeCategory === cat
                    ? "bg-accent text-white"
                    : "bg-surface text-text-secondary hover:text-text-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map((photo, i) => (
            <motion.div
              key={photo._id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (i % 8) * 0.05 }}
              className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg"
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={getThumbnailUrl(photo.s3Key)}
                alt={photo.title || "Photo"}
                className="w-full block group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {photo.title && (
                  <p className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium">
                    {photo.title}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-text-muted text-center py-16">
            No photos to display yet.
          </p>
        )}

        <AnimatePresence>
          {lightboxIndex !== null && filtered[lightboxIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
              onClick={() => setLightboxIndex(null)}
            >
              <button
                className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
                onClick={() => setLightboxIndex(null)}
              >
                <X size={28} />
              </button>

              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + filtered.length) % filtered.length
                  );
                }}
              >
                <ChevronLeft size={36} />
              </button>

              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % filtered.length);
                }}
              >
                <ChevronRight size={36} />
              </button>

              <motion.img
                key={filtered[lightboxIndex]._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                src={getImageUrl(filtered[lightboxIndex].s3Key)}
                alt={filtered[lightboxIndex].title || "Photo"}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />

              {filtered[lightboxIndex].title && (
                <div className="absolute bottom-6 text-center text-white">
                  <p className="font-medium">
                    {filtered[lightboxIndex].title}
                  </p>
                  {filtered[lightboxIndex].description && (
                    <p className="text-white/60 text-sm mt-1">
                      {filtered[lightboxIndex].description}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
