import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Github,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import api from "@/lib/api";
import { getThumbnailUrl, getImageUrl } from "@/lib/constants";

interface Screenshot {
  _id: string;
  s3Key: string;
  thumbnailKey: string;
  caption: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  technologiesUsed?: string[];
  githubLink?: string;
  demoLink?: string;
  screenshots?: Screenshot[];
}

interface WorkShowcase {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  screenshots: Screenshot[];
  startDate?: string;
  endDate?: string;
}

interface OverlayItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  screenshots: Screenshot[];
  githubLink?: string;
  demoLink?: string;
  startDate?: string;
  endDate?: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    month: "short",
    year: "numeric",
  });
}

function toOverlayItem(project: Project): OverlayItem {
  return {
    id: project._id,
    name: project.name,
    description: project.description,
    technologies: project.technologiesUsed || [],
    screenshots: project.screenshots || [],
    githubLink: project.githubLink,
    demoLink: project.demoLink,
    startDate: project.startDate,
    endDate: project.endDate,
  };
}

function showcaseToOverlay(s: WorkShowcase): OverlayItem {
  return {
    id: s._id,
    name: s.title,
    description: s.description,
    technologies: s.technologies,
    screenshots: s.screenshots,
    startDate: s.startDate,
    endDate: s.endDate,
  };
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showcases, setShowcases] = useState<WorkShowcase[]>([]);
  const [selected, setSelected] = useState<OverlayItem | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    api.get("/project").then((r) => setProjects(r.data)).catch(() => {});
    api
      .get("/work-showcase")
      .then((r) => setShowcases(r.data))
      .catch(() => {});
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selected && e.key === "Escape" && lightboxIdx === null)
        setSelected(null);
      if (lightboxIdx !== null && selected) {
        const len = selected.screenshots.length;
        if (e.key === "Escape") setLightboxIdx(null);
        if (e.key === "ArrowRight")
          setLightboxIdx((i) => (i !== null ? (i + 1) % len : null));
        if (e.key === "ArrowLeft")
          setLightboxIdx((i) => (i !== null ? (i - 1 + len) % len : null));
      }
    },
    [selected, lightboxIdx]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const hasLinks = selected?.githubLink || selected?.demoLink;

  return (
    <section className="py-16 md:py-32 px-8">
      <div className="max-w-[1400px] mx-auto">
        <ScrollReveal>
          <p className="text-text-muted text-sm tracking-[0.3em] uppercase mb-4">
            Selected Work
          </p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight light-sunrise">
            Projects
          </h2>
        </ScrollReveal>

        {/* GitHub Projects — card grid */}
        {projects.length > 0 && (
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => {
              const hasCover =
                project.screenshots && project.screenshots.length > 0;
              return (
                <ScrollReveal key={project._id} delay={i * 0.08}>
                  <motion.div
                    className="group relative overflow-hidden rounded-2xl bg-surface border border-border cursor-pointer h-full flex flex-col"
                    whileHover={{ y: -6 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.33, 1, 0.68, 1],
                    }}
                    onClick={() => setSelected(toOverlayItem(project))}
                  >
                    {hasCover ? (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={getThumbnailUrl(project.screenshots![0].s3Key)}
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.fallback) {
                              img.dataset.fallback = "1";
                              img.src = getImageUrl(project.screenshots![0].s3Key);
                            }
                          }}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-surface-hover to-surface flex items-center justify-center overflow-hidden">
                        <span className="text-3xl font-black text-border-light/60 tracking-tight select-none group-hover:text-border-light transition-colors duration-300">
                          {project.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 3)}
                        </span>
                      </div>
                    )}

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold text-text group-hover:text-accent transition-colors duration-300 line-clamp-1">
                          {project.name}
                        </h3>
                        <ArrowUpRight
                          size={14}
                          className="text-text-muted group-hover:text-accent shrink-0 mt-0.5 transition-colors"
                        />
                      </div>
                      <p className="text-text-secondary text-xs mt-1.5 line-clamp-2 leading-relaxed flex-1">
                        {project.description}
                      </p>
                      {project.technologiesUsed &&
                        project.technologiesUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {project.technologiesUsed
                              .slice(0, 4)
                              .map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-muted bg-border/50 rounded-full"
                                >
                                  {tech}
                                </span>
                              ))}
                            {project.technologiesUsed.length > 4 && (
                              <span className="px-2 py-0.5 text-[10px] text-text-muted">
                                +{project.technologiesUsed.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </motion.div>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* Work Showcases */}
        {showcases.length > 0 && (
          <div className="mt-24">
            <ScrollReveal>
              <p className="text-text-muted text-sm tracking-[0.3em] uppercase mb-8">
                Professional Work
              </p>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {showcases.map((showcase, i) => (
                <ScrollReveal key={showcase._id} delay={i * 0.1}>
                  <motion.div
                    className="group relative overflow-hidden rounded-2xl bg-surface border border-border cursor-pointer h-full flex flex-col"
                    whileHover={{ y: -6 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.33, 1, 0.68, 1],
                    }}
                    onClick={() => setSelected(showcaseToOverlay(showcase))}
                  >
                    {showcase.screenshots.length > 0 ? (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={getThumbnailUrl(showcase.screenshots[0].s3Key)}
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.fallback) {
                              img.dataset.fallback = "1";
                              img.src = getImageUrl(showcase.screenshots[0].s3Key);
                            }
                          }}
                          alt={showcase.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-surface-hover to-surface flex items-center justify-center overflow-hidden">
                        <span className="text-3xl font-black text-border-light/60 tracking-tight select-none group-hover:text-border-light transition-colors duration-300">
                          {showcase.title
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 3)}
                        </span>
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold text-text group-hover:text-accent transition-colors duration-300 line-clamp-1">
                          {showcase.title}
                        </h3>
                        <ArrowUpRight
                          size={14}
                          className="text-text-muted group-hover:text-accent shrink-0 mt-0.5 transition-colors"
                        />
                      </div>
                      <p className="text-text-secondary text-xs mt-1.5 line-clamp-2 leading-relaxed flex-1">
                        {showcase.description}
                      </p>
                      {showcase.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {showcase.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 text-[10px] uppercase tracking-wider text-text-muted bg-border/50 rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                          {showcase.technologies.length > 4 && (
                            <span className="px-2 py-0.5 text-[10px] text-text-muted">
                              +{showcase.technologies.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}

        {/* Unified detail overlay */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-bg/90 backdrop-blur-xl flex items-start justify-center overflow-y-auto py-12 px-4"
              onClick={() => {
                setSelected(null);
                setLightboxIdx(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                className="bg-surface border border-border rounded-2xl max-w-4xl w-full my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between p-8 pb-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-3xl md:text-4xl font-bold text-text">
                      {selected.name}
                    </h3>
                    {selected.startDate && (
                      <p className="text-text-muted text-sm mt-2">
                        {formatDate(selected.startDate)}
                        {selected.endDate
                          ? ` — ${formatDate(selected.endDate)}`
                          : " — Present"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelected(null);
                      setLightboxIdx(null);
                    }}
                    className="w-10 h-10 rounded-full border border-border hover:border-text-muted flex items-center justify-center transition-colors shrink-0 ml-4"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Tech pills */}
                {selected.technologies.length > 0 && (
                  <div className="px-8 mt-4 flex flex-wrap gap-2">
                    {selected.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs uppercase tracking-wider text-accent bg-accent/10 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div className="px-8 mt-6">
                  <p className="text-text-secondary leading-relaxed text-base whitespace-pre-line">
                    {selected.description}
                  </p>
                </div>

                {/* Action buttons — right after description */}
                {hasLinks && (
                  <div className="px-8 mt-6 flex flex-wrap gap-3">
                    {selected.githubLink && (
                      <a
                        href={selected.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:border-border-light bg-surface-hover/50 text-text text-sm font-medium transition-all hover:bg-surface-hover"
                      >
                        <Github size={16} />
                        View on GitHub
                      </a>
                    )}
                    {selected.demoLink && (
                      <button
                        onClick={() => {
                          setSelected(null);
                          setLightboxIdx(null);
                          navigate(`/projects/${selected.id}/demo`);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sunrise text-white text-sm font-medium transition-opacity hover:opacity-90"
                      >
                        <Play size={16} />
                        Live Demo
                      </button>
                    )}
                  </div>
                )}

                {/* Screenshots gallery */}
                {selected.screenshots.length > 0 && (
                  <div className="px-8 mt-8">
                    {!hasLinks && (
                      <p className="text-text-muted text-xs uppercase tracking-[0.2em] mb-4">
                        Gallery
                      </p>
                    )}
                    <div className="space-y-6">
                      {selected.screenshots.map((ss, idx) => (
                        <div key={ss._id}>
                          <div
                            className="cursor-pointer overflow-hidden rounded-xl border border-border/50"
                            onClick={() => setLightboxIdx(idx)}
                          >
                            <img
                              src={getImageUrl(ss.s3Key)}
                              alt={ss.caption || selected.name}
                              className="w-full rounded-xl hover:scale-[1.01] transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          {ss.caption && (
                            <p className={`mt-3 leading-relaxed ${hasLinks ? "text-text-muted text-sm text-center" : "text-text-secondary text-sm"}`}>
                              {ss.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-8" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screenshot lightbox */}
        <AnimatePresence>
          {lightboxIdx !== null &&
            selected &&
            selected.screenshots[lightboxIdx] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-bg/95 backdrop-blur-xl flex items-center justify-center"
                onClick={() => setLightboxIdx(null)}
              >
                <button
                  className="absolute top-6 right-6 w-10 h-10 rounded-full border border-border-light hover:border-text-muted flex items-center justify-center transition-colors z-10"
                  onClick={() => setLightboxIdx(null)}
                >
                  <X size={16} className="text-text-secondary" />
                </button>

                {selected.screenshots.length > 1 && (
                  <>
                    <button
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border-light hover:border-text-muted flex items-center justify-center transition-colors z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        const len = selected.screenshots.length;
                        setLightboxIdx(
                          (lightboxIdx - 1 + len) % len
                        );
                      }}
                    >
                      <ChevronLeft
                        size={18}
                        className="text-text-secondary"
                      />
                    </button>
                    <button
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border-light hover:border-text-muted flex items-center justify-center transition-colors z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIdx(
                          (lightboxIdx + 1) % selected.screenshots.length
                        );
                      }}
                    >
                      <ChevronRight
                        size={18}
                        className="text-text-secondary"
                      />
                    </button>
                  </>
                )}

                <motion.img
                  key={selected.screenshots[lightboxIdx]._id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.3 }}
                  src={getImageUrl(selected.screenshots[lightboxIdx].s3Key)}
                  alt={
                    selected.screenshots[lightboxIdx].caption || selected.name
                  }
                  className="max-h-[85vh] max-w-[90vw] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="absolute bottom-8 left-0 right-0 text-center px-8">
                  {selected.screenshots[lightboxIdx].caption && (
                    <p className="text-text text-sm font-medium max-w-2xl mx-auto">
                      {selected.screenshots[lightboxIdx].caption}
                    </p>
                  )}
                  {selected.screenshots.length > 1 && (
                    <p className="text-text-muted text-xs mt-1">
                      {lightboxIdx + 1} / {selected.screenshots.length}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </section>
  );
}
