import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/ScrollReveal";
import api from "@/lib/api";
import { getThumbnailUrl, getImageUrl } from "@/lib/constants";

interface Photo {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  s3Key: string;
}

const PAGE_SIZE = 20;

export default function Photography() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [batchStart, setBatchStart] = useState(0);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadPage = useCallback(
    async (pageNum: number, reset = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      try {
        const params: Record<string, string | number> = {
          page: pageNum,
          limit: PAGE_SIZE,
        };
        if (activeCategory !== "all") params.category = activeCategory;

        const { data } = await api.get("/photo", { params });

        setPhotos((prev) => {
          const next = reset ? data.photos : [...prev, ...data.photos];
          if (!reset) setBatchStart(prev.length);
          else setBatchStart(0);
          return next;
        });
        setPage(pageNum);
        setHasMore(pageNum < data.pages);
      } catch {
        /* noop */
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [activeCategory]
  );

  useEffect(() => {
    api
      .get("/photo/categories")
      .then((r) => setCategories(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    setBatchStart(0);
    loadPage(1, true);
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadPage(page + 1);
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, page, loadPage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) =>
          i !== null ? (i + 1) % photos.length : null
        );
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) =>
          i !== null ? (i - 1 + photos.length) % photos.length : null
        );
    },
    [lightboxIndex, photos.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <section className="py-16 md:py-32 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <ScrollReveal>
          <p className="text-text-muted text-sm tracking-[0.3em] uppercase mb-4">
            Through My Lens
          </p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight light-sunrise">
            Gallery
          </h2>
        </ScrollReveal>

        {categories.length > 0 && (
          <ScrollReveal delay={0.2}>
            <div className="flex flex-wrap gap-2 mt-10">
              <button
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm tracking-wide transition-all duration-300 capitalize",
                  activeCategory === "all"
                    ? "bg-text text-bg"
                    : "bg-surface border border-border text-text-muted hover:text-text hover:border-border-light"
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm tracking-wide transition-all duration-300 capitalize",
                    activeCategory === cat
                      ? "bg-text text-bg"
                      : "bg-surface border border-border text-text-muted hover:text-text hover:border-border-light"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Photo wall — masonry grid */}
        <div className="mt-12 columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {photos.map((photo, i) => (
            <motion.div
              key={photo._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: ((i - batchStart) % PAGE_SIZE) * 0.04,
              }}
              className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-xl"
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={getThumbnailUrl(photo.s3Key)}
                alt={photo.title || "Photo"}
                className="w-full block group-hover:scale-[1.03] transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                {photo.title && (
                  <p className="absolute bottom-3 left-4 right-4 text-white text-sm font-medium">
                    {photo.title}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sentinel for IntersectionObserver */}
        <div ref={sentinelRef} className="h-1" />

        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-text-muted"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && photos.length === 0 && (
          <p className="text-text-muted text-center py-24 text-lg">
            No photos yet — check back soon.
          </p>
        )}

        {!hasMore && photos.length > 0 && (
          <p className="text-text-muted/40 text-center text-xs tracking-widest uppercase py-8">
            End of gallery
          </p>
        )}

        <AnimatePresence>
          {lightboxIndex !== null && photos[lightboxIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-xl flex items-center justify-center"
              onClick={() => setLightboxIndex(null)}
            >
              <button
                className="absolute top-6 right-6 w-10 h-10 rounded-full border border-border-light hover:border-text-muted flex items-center justify-center transition-colors z-10"
                onClick={() => setLightboxIndex(null)}
              >
                <X size={16} className="text-text-secondary" />
              </button>

              <button
                className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border-light hover:border-text-muted flex items-center justify-center transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + photos.length) % photos.length
                  );
                }}
              >
                <ChevronLeft size={18} className="text-text-secondary" />
              </button>

              <button
                className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border-light hover:border-text-muted flex items-center justify-center transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % photos.length);
                }}
              >
                <ChevronRight size={18} className="text-text-secondary" />
              </button>

              <motion.img
                key={photos[lightboxIndex]._id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3 }}
                src={getImageUrl(photos[lightboxIndex].s3Key)}
                alt={photos[lightboxIndex].title || "Photo"}
                className="max-h-[85vh] max-w-[90vw] object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              <div className="absolute bottom-8 text-center">
                {photos[lightboxIndex].title && (
                  <p className="text-text text-sm font-medium">
                    {photos[lightboxIndex].title}
                  </p>
                )}
                <p className="text-text-muted text-xs mt-1">
                  {lightboxIndex + 1} / {photos.length}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
