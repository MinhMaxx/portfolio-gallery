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
import { getThumbnailUrl } from "@/lib/constants";
import { useTheme } from "@/lib/ThemeProvider";

interface Location {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

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
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
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
        out.push({ x: cx + dc, y: cy + dr, row: dr + radius, col: dc + radius });
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

interface Project {
  _id: string;
  name: string;
  description: string;
  technologiesUsed?: string[];
  link?: string;
}

interface Photo {
  _id: string;
  title: string;
  s3Key: string;
}


export default function HomePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [techStack, setTechStack] = useState<string[]>([]);

  useEffect(() => {
    api.get("/project").then((r) => setProjects(r.data.slice(0, 3))).catch(() => {});
    api.get("/photo", { params: { limit: 6 } }).then((r) => setPhotos(r.data.photos)).catch(() => {});
    api.get("/settings/location").then((r) => { if (r.data.value) setLocation(r.data.value); }).catch(() => {});
    api.get("/settings/heroTechStack").then((r) => { if (r.data.value) setTechStack(r.data.value); }).catch(() => {});
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen px-4 md:px-8 pt-28 pb-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 auto-rows-[140px] md:auto-rows-[160px]">
            {/* Hero — large intro card */}
            <BentoCard
              className="col-span-2 md:col-span-4 lg:col-span-4 row-span-2"
              delay={0}
            >
              <div className="p-8 md:p-10 flex flex-col justify-between h-full">
                <div>
                  <p className="text-text-muted text-xs tracking-[0.3em] uppercase mb-3">
                    Full Stack Developer
                  </p>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9]">
                    <span className={theme === "light" ? "text-sunrise" : ""}>
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

            {/* Location card */}
            <BentoCard
              className="col-span-1 row-span-1 overflow-hidden"
              delay={0.1}
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

            {/* Social links */}
            <BentoCard className="col-span-1 row-span-1" delay={0.15}>
              <div className="p-5 flex flex-col justify-between h-full">
                <p className="text-text-muted text-xs tracking-wider uppercase">
                  Connect
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/MinhMaxx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all"
                  >
                    <Github size={14} className="text-text-secondary" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/bminhnguyen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all"
                  >
                    <Linkedin size={14} className="text-text-secondary" />
                  </a>
                  <a
                    href="mailto:contact@bminhnguyen.dev"
                    className="w-9 h-9 rounded-full border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all"
                  >
                    <Mail size={14} className="text-text-secondary" />
                  </a>
                </div>
              </div>
            </BentoCard>

            {/* Tech stack card */}
            <BentoCard
              className="col-span-2 row-span-1"
              delay={0.2}
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

            {/* Featured project cards */}
            {projects.slice(0, 2).map((project, i) => (
              <BentoCard
                key={project._id}
                className="col-span-2 row-span-1"
                delay={0.25 + i * 0.08}
                onClick={() => navigate("/projects")}
              >
                <div className="p-5 flex flex-col justify-between h-full group">
                  <div className="flex items-start justify-between">
                    <p className="text-text-muted text-xs tracking-wider uppercase">
                      Project
                    </p>
                    <ArrowRight
                      size={14}
                      className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all"
                    />
                  </div>
                  <div>
                    <h3 className="text-text font-bold text-base group-hover:text-accent transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-text-secondary text-xs mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>
              </BentoCard>
            ))}

            {/* View all projects CTA */}
            <BentoCard
              className="col-span-2 row-span-1"
              delay={0.4}
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

            {/* Photo gallery preview */}
            <BentoCard
              className="col-span-2 md:col-span-4 lg:col-span-4 row-span-2"
              delay={0.45}
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
                    <div key={photo._id} className="overflow-hidden rounded-lg">
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

            {/* Experience CTA */}
            <BentoCard
              className="col-span-1 row-span-2"
              delay={0.5}
              onClick={() => navigate("/experience")}
            >
              <div className="p-5 flex flex-col justify-between h-full group">
                <p className="text-text-muted text-xs tracking-wider uppercase">
                  Background
                </p>
                <div>
                  <p className="text-5xl font-black text-border-light">2+</p>
                  <p className="text-text-secondary text-xs mt-1">
                    Years of experience
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-text-muted text-xs group-hover:text-accent transition-colors">
                      View
                    </span>
                    <ArrowRight size={10} className="text-text-muted" />
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Contact CTA */}
            <BentoCard
              className="col-span-1 row-span-2"
              delay={0.55}
              onClick={() => navigate("/contact")}
            >
              <div className="p-5 flex flex-col justify-between h-full group bg-gradient-to-br from-sunrise-yellow/5 via-sunrise-orange/3 to-transparent">
                <Mail size={18} className="text-accent" />
                <div>
                  <h3 className="text-text font-bold text-sm">
                    Let&apos;s talk
                  </h3>
                  <p className="text-text-muted text-xs mt-1">
                    Open to opportunities
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-text-muted text-xs group-hover:text-accent transition-colors">
                      Contact
                    </span>
                    <ArrowRight size={10} className="text-text-muted" />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
