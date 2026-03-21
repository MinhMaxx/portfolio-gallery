import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github, ChevronRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import api from "@/lib/api";
import { getThumbnailUrl, getImageUrl } from "@/lib/constants";

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  technologiesUsed?: string[];
  link?: string;
}

interface WorkShowcase {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  screenshots: {
    _id: string;
    s3Key: string;
    thumbnailKey: string;
    caption: string;
  }[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showcases, setShowcases] = useState<WorkShowcase[]>([]);
  const [selectedShowcase, setSelectedShowcase] = useState<WorkShowcase | null>(
    null
  );

  useEffect(() => {
    api.get("/project").then((r) => setProjects(r.data)).catch(() => {});
    api
      .get("/work-showcase")
      .then((r) => setShowcases(r.data))
      .catch(() => {});
  }, []);

  return (
    <section id="projects" className="py-24 px-6 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          title="Projects"
          subtitle="Things I've built and worked on"
        />

        {projects.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-text-primary mb-6">
              GitHub Projects
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {projects.map((project, i) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group bg-surface rounded-xl border border-border p-6 hover:border-accent/30 transition-all hover:-translate-y-1"
                >
                  <h4 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                    {project.name}
                  </h4>
                  <p className="text-text-secondary text-sm mt-2 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {project.technologiesUsed &&
                    project.technologiesUsed.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {project.technologiesUsed.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors"
                    >
                      {project.link.includes("github") ? (
                        <Github size={14} />
                      ) : (
                        <ExternalLink size={14} />
                      )}
                      View Project
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}

        {showcases.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-text-primary mb-6">
              Work Showcase
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {showcases.map((showcase, i) => (
                <motion.div
                  key={showcase._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group bg-surface rounded-xl border border-border overflow-hidden hover:border-accent/30 transition-all cursor-pointer"
                  onClick={() => setSelectedShowcase(showcase)}
                >
                  {showcase.screenshots.length > 0 && (
                    <div className="aspect-video overflow-hidden bg-background">
                      <img
                        src={getThumbnailUrl(showcase.screenshots[0].s3Key)}
                        alt={showcase.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h4 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                      {showcase.title}
                    </h4>
                    <p className="text-text-secondary text-sm mt-2 line-clamp-2">
                      {showcase.description}
                    </p>
                    {showcase.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {showcase.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm text-text-muted group-hover:text-accent transition-colors">
                      View Details <ChevronRight size={14} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {selectedShowcase && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedShowcase(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-text-primary">
                  {selectedShowcase.title}
                </h3>
                <p className="text-text-secondary mt-3 leading-relaxed">
                  {selectedShowcase.description}
                </p>
                {selectedShowcase.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedShowcase.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-sm rounded-full bg-accent/10 text-accent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-8 grid gap-4">
                  {selectedShowcase.screenshots.map((ss) => (
                    <div key={ss._id}>
                      <img
                        src={getImageUrl(ss.s3Key)}
                        alt={ss.caption || selectedShowcase.title}
                        className="w-full rounded-lg"
                        loading="lazy"
                      />
                      {ss.caption && (
                        <p className="text-text-muted text-sm mt-2 text-center">
                          {ss.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
