import { useState, useEffect, useCallback } from "react";
import { GridLayout, type LayoutItem, verticalCompactor, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import {
  Trash2,
  Save,
  Loader2,
  Check,
  RotateCcw,
  Type,
  MapPin,
  Share2,
  Code2,
  FolderOpen,
  Camera,
  Briefcase,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { LocationEditor, TechStackEditor } from "./AdminDashboard";

export interface HeroCard {
  i: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config?: Record<string, unknown>;
}

interface CardTypeSpec {
  type: string;
  label: string;
  icon: React.ReactNode;
  minW: number;
  minH: number;
  maxW: number;
  maxH: number;
  defaultW: number;
  defaultH: number;
}

const CARD_TYPES: CardTypeSpec[] = [
  { type: "intro", label: "Intro", icon: <Type size={14} />, minW: 2, minH: 2, maxW: 6, maxH: 3, defaultW: 4, defaultH: 2 },
  { type: "location", label: "Location", icon: <MapPin size={14} />, minW: 1, minH: 1, maxW: 2, maxH: 2, defaultW: 1, defaultH: 1 },
  { type: "social", label: "Social Links", icon: <Share2 size={14} />, minW: 1, minH: 1, maxW: 2, maxH: 1, defaultW: 1, defaultH: 1 },
  { type: "techStack", label: "Tech Stack", icon: <Code2 size={14} />, minW: 2, minH: 1, maxW: 4, maxH: 2, defaultW: 2, defaultH: 1 },
  { type: "featuredProject", label: "Featured Project", icon: <FolderOpen size={14} />, minW: 2, minH: 1, maxW: 3, maxH: 2, defaultW: 2, defaultH: 1 },
  { type: "allProjects", label: "All Projects CTA", icon: <FolderOpen size={14} />, minW: 1, minH: 1, maxW: 2, maxH: 1, defaultW: 2, defaultH: 1 },
  { type: "gallery", label: "Photo Gallery", icon: <Camera size={14} />, minW: 2, minH: 2, maxW: 6, maxH: 3, defaultW: 4, defaultH: 2 },
  { type: "experience", label: "Experience CTA", icon: <Briefcase size={14} />, minW: 1, minH: 1, maxW: 2, maxH: 2, defaultW: 1, defaultH: 2 },
  { type: "contact", label: "Contact CTA", icon: <Mail size={14} />, minW: 1, minH: 1, maxW: 2, maxH: 2, defaultW: 1, defaultH: 2 },
];

const COLS = 6;
const ROW_HEIGHT = 100;

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

function cardTypeColor(type: string): string {
  const map: Record<string, string> = {
    intro: "bg-blue-500/20 border-blue-500/40 text-blue-400",
    location: "bg-green-500/20 border-green-500/40 text-green-400",
    social: "bg-purple-500/20 border-purple-500/40 text-purple-400",
    techStack: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400",
    featuredProject: "bg-orange-500/20 border-orange-500/40 text-orange-400",
    allProjects: "bg-amber-500/20 border-amber-500/40 text-amber-400",
    gallery: "bg-pink-500/20 border-pink-500/40 text-pink-400",
    experience: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
    contact: "bg-rose-500/20 border-rose-500/40 text-rose-400",
  };
  return map[type] || "bg-surface border-border text-text-secondary";
}

export default function HeroEditor() {
  const [cards, setCards] = useState<HeroCard[]>(DEFAULT_LAYOUT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { width: containerWidth, containerRef, mounted } = useContainerWidth();

  useEffect(() => {
    api
      .get("/settings/heroLayout")
      .then((r) => {
        if (r.data.value && Array.isArray(r.data.value) && r.data.value.length > 0) {
          setCards(r.data.value);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const handleLayoutChange = useCallback(
    (layout: readonly LayoutItem[]) => {
      setCards((prev) =>
        prev.map((card) => {
          const item = layout.find((l) => l.i === card.i);
          if (!item) return card;
          return { ...card, x: item.x, y: item.y, w: item.w, h: item.h };
        }),
      );
    },
    [],
  );

  const addCard = (spec: CardTypeSpec) => {
    const count = cards.filter((c) => c.type === spec.type).length;
    const id = `${spec.type}-${count + 1}`;
    const maxY = cards.reduce(
      (max, c) => Math.max(max, c.y + c.h),
      0,
    );
    setCards((prev) => [
      ...prev,
      {
        i: id,
        type: spec.type,
        x: 0,
        y: maxY,
        w: spec.defaultW,
        h: spec.defaultH,
      },
    ]);
    setSelectedId(id);
  };

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.i !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/settings/heroLayout", { value: cards });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save hero layout:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (confirm("Reset to the default layout? Unsaved changes will be lost.")) {
      setCards(DEFAULT_LAYOUT);
      setSelectedId(null);
    }
  };

  const gridLayout: LayoutItem[] = cards.map((card) => {
    const spec = CARD_TYPES.find((s) => s.type === card.type);
    return {
      i: card.i,
      x: card.x,
      y: card.y,
      w: card.w,
      h: card.h,
      minW: spec?.minW ?? 1,
      minH: spec?.minH ?? 1,
      maxW: spec?.maxW ?? 6,
      maxH: spec?.maxH ?? 4,
    };
  });

  const MARGIN = 8;
  const PADDING = 12;
  const bottomRow = cards.reduce((max, c) => Math.max(max, c.y + c.h), 0);
  const computedHeight = bottomRow * (ROW_HEIGHT + MARGIN) - MARGIN + PADDING * 2;

  const selectedCard = cards.find((c) => c.i === selectedId);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Hero Layout</h1>
        <div className="flex gap-2">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary border border-border hover:border-accent hover:text-accent transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              saving
                ? "bg-surface-elevated text-text-muted"
                : saved
                  ? "bg-green-500/10 text-green-500"
                  : "bg-accent hover:bg-accent-hover text-white",
            )}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <Check size={14} />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving..." : saved ? "Saved" : "Save Layout"}
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-hidden">
        {/* Grid editor */}
        <div className="w-[60%] min-w-0">
          <div className="bg-surface rounded-xl border border-border p-3">
            <p className="text-xs text-text-muted mb-2">
              Drag to reposition, resize from edges. Click a card to configure it.
            </p>
            <div ref={containerRef}>
              {mounted && <GridLayout
                className="layout bg-background rounded-lg border border-dashed border-border/60"
                style={{ height: computedHeight }}
                layout={gridLayout}
                width={containerWidth}
                gridConfig={{
                  cols: COLS,
                  rowHeight: ROW_HEIGHT,
                  margin: [MARGIN, MARGIN] as const,
                  containerPadding: [PADDING, PADDING] as const,
                  maxRows: Infinity,
                }}
                onLayoutChange={handleLayoutChange}
                compactor={verticalCompactor}
              >
                {cards.map((card) => {
                  const spec = CARD_TYPES.find((s) => s.type === card.type);
                  return (
                    <div
                      key={card.i}
                      className={cn(
                        "rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative group",
                        cardTypeColor(card.type),
                        selectedId === card.i && "ring-2 ring-accent",
                      )}
                      onClick={() => setSelectedId(card.i)}
                    >
                      {spec?.icon}
                      <span className="text-[10px] mt-1 font-medium">
                        {spec?.label || card.type}
                      </span>
                      <span className="text-[9px] opacity-60">
                        {card.w}x{card.h}
                      </span>
                      <button
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-red-500/80 text-white transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCard(card.i);
                        }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  );
                })}
              </GridLayout>}
            </div>
          </div>
        </div>

        {/* Right panel: Add cards + config */}
        <div className="w-[40%] min-w-0 space-y-3 overflow-y-auto max-h-[calc(100vh-160px)]">
          <div className="bg-surface rounded-xl border border-border p-3">
            <h3 className="text-xs font-semibold text-text-primary mb-2">
              Add Card
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {CARD_TYPES.map((spec) => (
                <button
                  key={spec.type}
                  onClick={() => addCard(spec)}
                  className="flex flex-col items-center gap-1 px-1.5 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors border border-transparent hover:border-border"
                  title={spec.label}
                >
                  {spec.icon}
                  <span className="text-[9px] leading-tight text-center">{spec.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedCard && (
            <div className="bg-surface rounded-xl border border-border p-3">
              <h3 className="text-xs font-semibold text-text-primary mb-1">
                {CARD_TYPES.find((s) => s.type === selectedCard.type)?.label}
              </h3>
              <p className="text-[10px] text-text-muted mb-2">
                {selectedCard.i} &middot; {selectedCard.w}x{selectedCard.h}
              </p>

              {selectedCard.type === "location" && <LocationEditor />}
              {selectedCard.type === "techStack" && <TechStackEditor />}
              {selectedCard.type === "featuredProject" && (
                <ProjectSelector
                  card={selectedCard}
                  onChange={(config) =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.i === selectedCard.i ? { ...c, config } : c,
                      ),
                    )
                  }
                />
              )}
              {selectedCard.type === "experience" && (
                <ExperienceConfig
                  card={selectedCard}
                  onChange={(config) =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.i === selectedCard.i ? { ...c, config } : c,
                      ),
                    )
                  }
                />
              )}
              {selectedCard.type === "social" && <SocialLinksEditor />}
              {selectedCard.type === "contact" && (
                <ContactConfig
                  card={selectedCard}
                  onChange={(config) =>
                    setCards((prev) =>
                      prev.map((c) =>
                        c.i === selectedCard.i ? { ...c, config } : c,
                      ),
                    )
                  }
                />
              )}
              {!["location", "techStack", "featuredProject", "experience", "social", "contact"].includes(
                selectedCard.type,
              ) && (
                <p className="text-xs text-text-muted italic">
                  No additional configuration needed.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EmploymentEntry {
  _id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
}

function ExperienceConfig({
  card,
  onChange,
}: {
  card: HeroCard;
  onChange: (config: Record<string, unknown>) => void;
}) {
  const [jobs, setJobs] = useState<EmploymentEntry[]>([]);

  useEffect(() => {
    api
      .get("/employment")
      .then((r) => setJobs(r.data))
      .catch(() => {});
  }, []);

  const showTotalYears = (card.config?.showTotalYears as boolean) ?? true;
  const showCurrentRole = (card.config?.showCurrentRole as boolean) ?? true;
  const includedIds = (card.config?.includedIds as string[]) ?? [];
  const roleLabel = (card.config?.roleLabel as string) ?? "";

  const allSelected = includedIds.length === 0;

  const update = (patch: Record<string, unknown>) =>
    onChange({ ...card.config, ...patch });

  const toggleJob = (id: string) => {
    if (allSelected) {
      update({ includedIds: jobs.filter((j) => j._id !== id).map((j) => j._id) });
    } else if (includedIds.includes(id)) {
      const next = includedIds.filter((i) => i !== id);
      update({ includedIds: next.length === jobs.length ? [] : next });
    } else {
      const next = [...includedIds, id];
      update({ includedIds: next.length === jobs.length ? [] : next });
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showTotalYears}
          onChange={(e) => update({ showTotalYears: e.target.checked })}
          className="accent-accent"
        />
        <span className="text-xs text-text-primary">
          Show total years of experience
        </span>
      </label>

      {showTotalYears && jobs.length > 0 && (
        <div className="pl-5 space-y-1.5">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
            Positions to count
          </p>
          {jobs.map((j) => {
            const checked = allSelected || includedIds.includes(j._id);
            return (
              <label
                key={j._id}
                className="flex items-start gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleJob(j._id)}
                  className="accent-accent mt-0.5"
                />
                <span className="text-xs text-text-secondary leading-tight">
                  {j.position}{" "}
                  <span className="text-text-muted">
                    @ {j.company} ({fmtDate(j.startDate)} –{" "}
                    {j.endDate ? fmtDate(j.endDate) : "Present"})
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      {showTotalYears && (
        <div className="pl-5">
          <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
            Display role label
          </label>
          <input
            type="text"
            value={roleLabel}
            onChange={(e) => update({ roleLabel: e.target.value })}
            placeholder="e.g. Full Stack Developer"
            className="w-full px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-text-muted/50"
          />
          <p className="text-[10px] text-text-muted mt-1">
            Shown below the years number. Leave empty to show "Years of experience".
          </p>
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showCurrentRole}
          onChange={(e) => update({ showCurrentRole: e.target.checked })}
          className="accent-accent"
        />
        <span className="text-xs text-text-primary">
          Show current company &amp; role
        </span>
      </label>
    </div>
  );
}

function ProjectSelector({
  card,
  onChange,
}: {
  card: HeroCard;
  onChange: (config: Record<string, unknown>) => void;
}) {
  const [projects, setProjects] = useState<
    { _id: string; name: string }[]
  >([]);

  useEffect(() => {
    api
      .get("/project")
      .then((r) => setProjects(r.data))
      .catch(() => {});
  }, []);

  const selected = (card.config?.projectId as string) || "";

  return (
    <div>
      <label className="text-xs text-text-muted mb-1 block">
        Select Project
      </label>
      <select
        value={selected}
        onChange={(e) => onChange({ projectId: e.target.value })}
        className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
      >
        <option value="">Auto (by order)</option>
        {projects.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SocialLinks {
  github: string;
  linkedin: string;
  email: string;
}

function SocialLinksEditor() {
  const [links, setLinks] = useState<SocialLinks>({
    github: "",
    linkedin: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get("/settings/socialLinks")
      .then((r) => {
        if (r.data.value) setLinks(r.data.value);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/settings/socialLinks", { value: links });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      console.error("Failed to save social links");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-text-muted/50";

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
          GitHub URL
        </label>
        <input
          type="url"
          value={links.github}
          onChange={(e) => setLinks((l) => ({ ...l, github: e.target.value }))}
          placeholder="https://github.com/username"
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
          LinkedIn URL
        </label>
        <input
          type="url"
          value={links.linkedin}
          onChange={(e) => setLinks((l) => ({ ...l, linkedin: e.target.value }))}
          placeholder="https://linkedin.com/in/username"
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
          Email
        </label>
        <input
          type="email"
          value={links.email}
          onChange={(e) => setLinks((l) => ({ ...l, email: e.target.value }))}
          placeholder="you@example.com"
          className={inputCls}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
          saving
            ? "bg-surface-elevated text-text-muted"
            : saved
              ? "bg-green-500/10 text-green-500"
              : "bg-accent hover:bg-accent-hover text-white",
        )}
      >
        {saving ? (
          <Loader2 size={12} className="animate-spin" />
        ) : saved ? (
          <Check size={12} />
        ) : (
          <Save size={12} />
        )}
        {saving ? "Saving..." : saved ? "Saved" : "Save Links"}
      </button>
    </div>
  );
}

function ContactConfig({
  card,
  onChange,
}: {
  card: HeroCard;
  onChange: (config: Record<string, unknown>) => void;
}) {
  const heading = (card.config?.heading as string) ?? "";
  const subtitle = (card.config?.subtitle as string) ?? "";
  const linkLabel = (card.config?.linkLabel as string) ?? "";

  const update = (patch: Record<string, unknown>) =>
    onChange({ ...card.config, ...patch });

  const inputCls =
    "w-full px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-text-muted/50";

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
          Heading
        </label>
        <input
          type="text"
          value={heading}
          onChange={(e) => update({ heading: e.target.value })}
          placeholder="Let's talk"
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
          Subtitle
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Open to opportunities"
          className={inputCls}
        />
      </div>
      <div>
        <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
          Link text
        </label>
        <input
          type="text"
          value={linkLabel}
          onChange={(e) => update({ linkLabel: e.target.value })}
          placeholder="Contact"
          className={inputCls}
        />
      </div>
    </div>
  );
}
