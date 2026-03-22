import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import {
  ArrowRight,
  Camera,
  MapPin,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import BentoCard from "@/components/BentoCard";
import PageTransition from "@/components/PageTransition";
import api from "@/lib/api";
import { getThumbnailUrl, getImageUrl } from "@/lib/constants";
import { useTheme } from "@/lib/ThemeProvider";
import type { HeroCard } from "@/admin/HeroEditor";

interface Location {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

interface Employment {
  _id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
}

interface SocialLinks {
  github: string;
  linkedin: string;
  email: string;
}

interface ProjectScreenshot {
  s3Key: string;
  thumbnailKey?: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  technologiesUsed?: string[];
  link?: string;
  githubLink?: string;
  screenshots?: ProjectScreenshot[];
}

interface Photo {
  _id: string;
  title: string;
  s3Key: string;
}

const DEFAULT_LAYOUT: HeroCard[] = [
  { i: "intro-1", type: "intro", x: 0, y: 0, w: 4, h: 2 },
  { i: "location-1", type: "location", x: 4, y: 0, w: 1, h: 1 },
  { i: "social-1", type: "social", x: 5, y: 0, w: 1, h: 1 },
  { i: "techStack-1", type: "techStack", x: 4, y: 1, w: 2, h: 1 },
  { i: "featuredProject-1", type: "featuredProject", x: 0, y: 2, w: 2, h: 1 },
  { i: "featuredProject-2", type: "featuredProject", x: 2, y: 2, w: 2, h: 1 },
  { i: "allProjects-1", type: "allProjects", x: 4, y: 2, w: 2, h: 1 },
  { i: "gallery-1", type: "gallery", x: 0, y: 3, w: 4, h: 2 },
  { i: "experience-1", type: "experience", x: 4, y: 3, w: 1, h: 2 },
  { i: "contact-1", type: "contact", x: 5, y: 3, w: 1, h: 2 },
];

function LocationTiles({ lat, lon }: { lat: number; lon: number }) {
  const z = 10;
  const radius = 2;
  const size = radius * 2 + 1;
  const { tiles, offsetX, offsetY } = useMemo(() => {
    const n = 1 << z;
    const xExact = ((lon + 180) / 360) * n;
    const yExact =
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) +
            1 / Math.cos((lat * Math.PI) / 180),
        ) /
          Math.PI) /
        2) *
      n;
    const cx = Math.floor(xExact);
    const cy = Math.floor(yExact);
    const fracX = xExact - cx;
    const fracY = yExact - cy;

    const out: { x: number; y: number; row: number; col: number }[] = [];
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        out.push({
          x: cx + dc,
          y: cy + dr,
          row: dr + radius,
          col: dc + radius,
        });
      }
    }
    return {
      tiles: out,
      offsetX: -(fracX * 256 + radius * 256),
      offsetY: -(fracY * 256 + radius * 256),
    };
  }, [lat, lon]);

  return (
    <div className="absolute inset-0 opacity-[0.3] saturate-0 overflow-hidden">
      <div
        className="absolute"
        style={{
          width: 256 * size,
          height: 256 * size,
          top: "50%",
          left: "50%",
          marginLeft: offsetX,
          marginTop: offsetY,
        }}
      >
        {tiles.map((t) => (
          <img
            key={`${t.x}-${t.y}`}
            alt=""
            src={`https://tile.openstreetmap.org/${z}/${t.x}/${t.y}.png`}
            width={256}
            height={256}
            loading="lazy"
            draggable={false}
            style={{
              position: "absolute",
              left: t.col * 256,
              top: t.row * 256,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [layout, setLayout] = useState<HeroCard[]>(DEFAULT_LAYOUT);
  const [employment, setEmployment] = useState<Employment[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    github: "",
    linkedin: "",
    email: "",
  });

  useEffect(() => {
    api
      .get("/project")
      .then((r) => setProjects(r.data.slice(0, 3)))
      .catch(() => {});
    api
      .get("/photo", { params: { limit: 6 } })
      .then((r) => setPhotos(r.data.photos))
      .catch(() => {});
    api
      .get("/settings/location")
      .then((r) => {
        if (r.data.value) setLocation(r.data.value);
      })
      .catch(() => {});
    api
      .get("/settings/heroTechStack")
      .then((r) => {
        if (r.data.value) setTechStack(r.data.value);
      })
      .catch(() => {});
    api
      .get("/settings/heroLayout")
      .then((r) => {
        if (
          r.data.value &&
          Array.isArray(r.data.value) &&
          r.data.value.length > 0
        ) {
          setLayout(r.data.value);
        }
      })
      .catch(() => {});
    api
      .get("/employment")
      .then((r) => setEmployment(r.data))
      .catch(() => {});
    api
      .get("/settings/socialLinks")
      .then((r) => {
        if (r.data.value) setSocialLinks(r.data.value);
      })
      .catch(() => {});
  }, []);

  const projectCounter = { current: 0 };

  const renderCard = (card: HeroCard, delay: number) => {
    switch (card.type) {
      case "intro":
        return (
          <BentoCard
            key={card.i}
            className="h-full"
            delay={delay}
          >
            <div className="p-8 md:p-10 flex flex-col justify-between h-full">
              <div>
                <p className="text-text-muted text-xs tracking-[0.3em] uppercase mb-3">
                  Full Stack Developer
                </p>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9]">
                  <span
                    className={theme === "light" ? "text-sunrise" : ""}
                  >
                    BINH MINH
                  </span>
                  <br />
                  <span className="light-sunrise-stroke text-transparent [-webkit-text-stroke:1.5px_var(--color-text)]">
                    NGUYEN
                  </span>
                </h1>
              </div>
              <div className="text-lg md:text-xl text-text-secondary font-light mt-6 h-7">
                <TypeAnimation
                  sequence={[
                    "Building with AWS & Salesforce",
                    2500,
                    "Capturing moments through a lens",
                    2500,
                    "Turning complexity into clarity",
                    2500,
                  ]}
                  wrapper="span"
                  speed={40}
                  repeat={Infinity}
                />
              </div>
            </div>
          </BentoCard>
        );

      case "location":
        return (
          <BentoCard
            key={card.i}
            className="h-full overflow-hidden"
            delay={delay}
          >
            <div className="relative h-full">
              {location && (
                <LocationTiles lat={location.lat} lon={location.lon} />
              )}
              <div className="relative p-5 flex flex-col justify-between h-full">
                <MapPin size={18} className="text-accent" />
                <div>
                  <p className="text-text font-semibold text-sm">
                    {location?.city || "Perth, WA"}
                  </p>
                  <p className="text-text-muted text-xs">
                    {location?.country || "Australia"}
                  </p>
                </div>
              </div>
            </div>
          </BentoCard>
        );

      case "social":
        return (
          <BentoCard key={card.i} className="h-full" delay={delay}>
            <div className="p-5 flex flex-col justify-between h-full">
              <p className="text-text-muted text-xs tracking-wider uppercase">
                Connect
              </p>
              <div className="flex gap-3">
                {socialLinks.github && (
                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all"
                  >
                    <Github size={14} className="text-text-secondary" />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all"
                  >
                    <Linkedin size={14} className="text-text-secondary" />
                  </a>
                )}
                {socialLinks.email && (
                  <a
                    href={`mailto:${socialLinks.email}`}
                    className="w-9 h-9 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all"
                  >
                    <Mail size={14} className="text-text-secondary" />
                  </a>
                )}
              </div>
            </div>
          </BentoCard>
        );

      case "techStack":
        return (
          <BentoCard
            key={card.i}
            className="h-full"
            delay={delay}
            onClick={() => navigate("/experience")}
          >
            <div className="p-5 flex flex-col justify-between h-full">
              <p className="text-text-muted text-xs tracking-wider uppercase">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 text-[11px] rounded-full bg-border/50 text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </BentoCard>
        );

      case "featuredProject": {
        const idx = projectCounter.current++;
        const project = card.config?.projectId
          ? projects.find((p) => p._id === card.config?.projectId) ||
            projects[idx]
          : projects[idx];
        if (!project) return null;

        const isLarge = card.h >= 2;
        const thumb = project.screenshots?.[0];
        const thumbSrc = thumb
          ? getThumbnailUrl(thumb.thumbnailKey || thumb.s3Key)
          : null;

        return (
          <BentoCard
            key={card.i}
            className="h-full"
            delay={delay}
            onClick={() => navigate("/projects")}
          >
            <div className="flex flex-col h-full group">
              {isLarge && thumbSrc && (
                <div className="relative flex-1 min-h-0 overflow-hidden">
                  <img
                    src={thumbSrc}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback && thumb) {
                        img.dataset.fallback = "1";
                        img.src = getImageUrl(thumb.s3Key);
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                  <div className="absolute top-3 left-4 right-4 flex items-start justify-between">
                    <p className="text-text-muted text-xs tracking-wider uppercase">
                      Project
                    </p>
                    <ArrowRight
                      size={14}
                      className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              )}
              <div className={isLarge && thumbSrc ? "p-4" : "p-5 flex flex-col justify-between flex-1"}>
                {!(isLarge && thumbSrc) && (
                  <div className="flex items-start justify-between mb-auto">
                    <p className="text-text-muted text-xs tracking-wider uppercase">
                      Project
                    </p>
                    <ArrowRight
                      size={14}
                      className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-text font-bold text-base group-hover:text-accent transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-text-secondary text-xs mt-1 line-clamp-2">
                    {project.description}
                  </p>
                  {isLarge && project.technologiesUsed && project.technologiesUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologiesUsed.slice(0, 6).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-[10px] rounded-full bg-border/50 text-text-secondary"
                        >
                          {t}
                        </span>
                      ))}
                      {project.technologiesUsed.length > 6 && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-border/50 text-text-muted">
                          +{project.technologiesUsed.length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </BentoCard>
        );
      }

      case "allProjects":
        return (
          <BentoCard
            key={card.i}
            className="h-full"
            delay={delay}
            onClick={() => navigate("/projects")}
          >
            <div className="p-5 flex flex-col justify-between h-full group">
              <p className="text-text-muted text-xs tracking-wider uppercase">
                Portfolio
              </p>
              <div className="flex items-center gap-3">
                <span className="text-text font-semibold text-sm group-hover:text-accent transition-colors">
                  View all projects
                </span>
                <span className="w-6 h-px bg-text-muted group-hover:w-10 group-hover:bg-sunrise transition-all duration-300" />
              </div>
            </div>
          </BentoCard>
        );

      case "gallery":
        return (
          <BentoCard
            key={card.i}
            className="h-full"
            delay={delay}
            onClick={() => navigate("/gallery")}
          >
            <div className="h-full flex flex-col">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={14} className="text-accent" />
                  <p className="text-text-muted text-xs tracking-wider uppercase">
                    Photography
                  </p>
                </div>
                <div className="flex items-center gap-2 group">
                  <span className="text-text-muted text-xs group-hover:text-text transition-colors">
                    View Gallery
                  </span>
                  <ArrowRight size={12} className="text-text-muted" />
                </div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-1 px-1 pb-1 min-h-0">
                {photos.slice(0, 6).map((photo) => (
                  <div
                    key={photo._id}
                    className="overflow-hidden rounded-lg"
                  >
                    <img
                      src={getThumbnailUrl(photo.s3Key)}
                      alt={photo.title || "Photo"}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                ))}
                {photos.length === 0 &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-border/30 animate-pulse"
                    />
                  ))}
              </div>
            </div>
          </BentoCard>
        );

      case "experience": {
        const showTotalYears = (card.config?.showTotalYears as boolean) ?? true;
        const showCurrentRole =
          (card.config?.showCurrentRole as boolean) ?? true;
        const includedIds = (card.config?.includedIds as string[]) ?? [];
        const roleLabel = (card.config?.roleLabel as string) ?? "";

        const countedJobs =
          includedIds.length > 0
            ? employment.filter((e) => includedIds.includes(e._id))
            : employment;

        const currentJob = employment.find((e) => !e.endDate);
        const totalYears =
          countedJobs.length > 0
            ? (() => {
                const earliest = countedJobs.reduce((min, e) => {
                  const d = new Date(e.startDate).getTime();
                  return d < min ? d : min;
                }, Infinity);
                return Math.floor(
                  (Date.now() - earliest) / (365.25 * 24 * 60 * 60 * 1000),
                );
              })()
            : 0;

        const formatDate = (iso: string) => {
          const d = new Date(iso);
          return d.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
        };

        return (
          <BentoCard
            key={card.i}
            className="h-full"
            delay={delay}
            onClick={() => navigate("/experience")}
          >
            <div className="p-5 flex flex-col justify-center h-full group">
              <div>
                {showTotalYears && (
                  <>
                    <p className="text-3xl font-black text-border-light">
                      {totalYears > 0 ? `${totalYears}+ Years` : "—"}
                    </p>
                    <p className="text-text-secondary text-xs mt-1">
                      {roleLabel ? `as ${roleLabel}` : "of experience"}
                    </p>
                  </>
                )}
                {showCurrentRole && currentJob && (
                  <div className={showTotalYears ? "mt-3" : ""}>
                    <p className="text-text text-sm font-semibold leading-tight">
                      {currentJob.position}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {currentJob.company} &middot;{" "}
                      {formatDate(currentJob.startDate)} – Present
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-text-muted text-xs group-hover:text-accent transition-colors">
                    View
                  </span>
                  <ArrowRight size={10} className="text-text-muted" />
                </div>
              </div>
            </div>
          </BentoCard>
        );
      }

      case "contact":
        return (
          <BentoCard
            key={card.i}
            className="h-full"
            delay={delay}
            onClick={() => navigate("/contact")}
          >
            <div className="p-5 flex flex-col justify-between h-full group bg-gradient-to-br from-sunrise-yellow/5 via-sunrise-orange/3 to-transparent">
              <Mail size={18} className="text-accent" />
              <div>
                <h3 className="text-text font-bold text-sm">
                  {(card.config?.heading as string) || "Let\u2019s talk"}
                </h3>
                <p className="text-text-muted text-xs mt-1">
                  {(card.config?.subtitle as string) || "Open to opportunities"}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-text-muted text-xs group-hover:text-accent transition-colors">
                    {(card.config?.linkLabel as string) || "Contact"}
                  </span>
                  <ArrowRight size={10} className="text-text-muted" />
                </div>
              </div>
            </div>
          </BentoCard>
        );

      default:
        return null;
    }
  };

  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 md:px-8 pt-28 pb-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[160px]">
            {sorted.map((card, i) => {
              const el = renderCard(card, i * 0.06);
              if (!el) return null;
              return (
                <div
                  key={card.i}
                  className="h-full"
                  style={{
                    gridColumn: `span ${card.w}`,
                    gridRow: `span ${card.h}`,
                  }}
                >
                  {el}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
