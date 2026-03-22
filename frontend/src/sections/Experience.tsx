import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/ScrollReveal";
import api from "@/lib/api";
import { getFileUrl } from "@/lib/constants";

interface Employment {
  _id: string;
  company: string;
  companyDescription?: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
  highlights: string[];
  techStack: string[];
}

interface Degree {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description?: string;
  link?: string;
  fileKey?: string;
}

interface Certificate {
  _id: string;
  organization: string;
  certificateName: string;
  dateReceived: string;
  description?: string;
  link?: string;
  fileKey?: string;
}

type Tab = "employment" | "education" | "certificates";

function formatYear(dateStr: string) {
  return new Date(dateStr).getFullYear().toString();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    month: "short",
    year: "numeric",
  });
}

/* ─── PDF Viewer Overlay ─── */

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5];

function PdfViewerOverlay({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const [zoomIdx, setZoomIdx] = useState(2);
  const zoom = ZOOM_STEPS[zoomIdx];

  const zoomIn = useCallback(
    () => setZoomIdx((i) => Math.min(i + 1, ZOOM_STEPS.length - 1)),
    [],
  );
  const zoomOut = useCallback(
    () => setZoomIdx((i) => Math.max(i - 1, 0)),
    [],
  );
  const zoomReset = useCallback(() => setZoomIdx(2), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "=") {
        e.preventDefault();
        zoomIn();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault();
        zoomReset();
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, zoomIn, zoomOut, zoomReset]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-700 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-semibold text-sm truncate mr-4">
          {title}
        </h3>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={zoomOut}
            disabled={zoomIdx === 0}
            className="p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom out (Ctrl+-)"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={zoomReset}
            className="px-2.5 py-1 rounded-md hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-xs font-mono min-w-[50px] text-center"
            title="Reset zoom (Ctrl+0)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={zoomIdx === ZOOM_STEPS.length - 1}
            className="p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom in (Ctrl+=)"
          >
            <ZoomIn size={16} />
          </button>

          <div className="w-px h-5 bg-neutral-700 mx-1" />

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            title="Open in new tab"
          >
            <Maximize2 size={16} />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* PDF container — scrollable when zoomed */}
      <div
        className="flex-1 overflow-auto"
        onClick={onClose}
      >
        <div
          className="min-h-full flex items-start justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded shadow-2xl overflow-hidden transition-transform duration-200 origin-top"
            style={{
              width: `min(90vw, 900px)`,
              height: `calc(100vh - 60px)`,
              transform: `scale(${zoom})`,
            }}
          >
            <iframe
              src={`${url}#toolbar=0&navpanes=0&view=FitH`}
              className="w-full h-full border-0"
              title={title}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Group employment by company ─── */

interface CompanyGroup {
  company: string;
  companyDescription?: string;
  overallStart: string;
  overallEnd?: string;
  positions: Employment[];
}

function groupByCompany(items: Employment[]): CompanyGroup[] {
  const map = new Map<string, Employment[]>();
  for (const item of items) {
    const key = item.company;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }

  const groups: CompanyGroup[] = [];
  for (const [company, positions] of map) {
    const sorted = [...positions].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
    const earliest = sorted[sorted.length - 1];
    const latest = sorted[0];
    groups.push({
      company,
      companyDescription: sorted[0].companyDescription,
      overallStart: earliest.startDate,
      overallEnd: latest.endDate,
      positions: sorted,
    });
  }

  return groups;
}

/* ─── Single Position Row ─── */

function PositionRow({ item, isLast }: { item: Employment; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("py-6", !isLast && "border-b border-border/50")}>
      <div className="flex items-start gap-4">
        {/* Timeline dot + line */}
        <div className="flex flex-col items-center pt-2 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
            <h4 className="text-lg font-bold text-text">{item.position}</h4>
            <span className="text-text-muted text-sm">
              {formatDate(item.startDate)} —{" "}
              {item.endDate ? formatDate(item.endDate) : "Present"}
            </span>
          </div>

          {item.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface-elevated text-text-secondary border border-border"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {item.description && (
            <p className="text-text-secondary mt-3 leading-relaxed max-w-3xl whitespace-pre-line text-sm">
              {item.description}
            </p>
          )}

          {item.highlights.length > 0 && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 mt-3 text-sm text-text-muted hover:text-accent transition-colors"
              >
                {expanded ? (
                  <>
                    Hide details <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Show details ({item.highlights.length}){" "}
                    <ChevronDown size={14} />
                  </>
                )}
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-3 space-y-2 max-w-3xl"
                  >
                    {item.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-text-secondary text-sm leading-relaxed"
                      >
                        <span className="text-accent mt-1 shrink-0">▸</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Company Group Card ─── */

function CompanyCard({ group }: { group: CompanyGroup }) {
  return (
    <div className="py-10 border-b border-border">
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-12">
        {/* Year range */}
        <div className="shrink-0 md:w-[120px] text-center">
          <span className="block text-3xl md:text-4xl font-black text-border-light leading-none">
            {formatYear(group.overallStart)}
          </span>
          <span className="block text-border-light text-lg my-1">—</span>
          <span className="block text-3xl md:text-4xl font-black text-border-light leading-none">
            {group.overallEnd ? formatYear(group.overallEnd) : "Now"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Company header */}
          <h3 className="text-xl md:text-2xl font-bold text-accent">
            {group.company}
          </h3>
          {group.companyDescription && (
            <p className="text-text-secondary text-sm mt-2 italic leading-relaxed max-w-3xl">
              {group.companyDescription}
            </p>
          )}

          {/* Position timeline */}
          <div className="mt-6">
            {group.positions.map((pos, i) => (
              <PositionRow
                key={pos._id}
                item={pos}
                isLast={i === group.positions.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── View Button ─── */

function ViewButton({
  fileKey,
  link,
  label,
  onViewPdf,
}: {
  fileKey?: string;
  link?: string;
  label: string;
  onViewPdf: (url: string, title: string) => void;
}) {
  if (fileKey) {
    return (
      <button
        onClick={() => onViewPdf(getFileUrl(fileKey), label)}
        className="inline-flex items-center gap-1.5 mt-3 text-sm text-text-muted hover:text-accent transition-colors group/link"
      >
        <FileText size={14} />
        <span className="group-hover/link:underline underline-offset-2">
          View Certificate
        </span>
      </button>
    );
  }

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 mt-3 text-sm text-text-muted hover:text-accent transition-colors group/link"
      >
        <ExternalLink size={14} />
        <span className="group-hover/link:underline underline-offset-2">
          {label}
        </span>
      </a>
    );
  }

  return null;
}

/* ─── Main Component ─── */

export default function Experience() {
  const [activeTab, setActiveTab] = useState<Tab>("employment");
  const [employment, setEmployment] = useState<Employment[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [pdfViewer, setPdfViewer] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    api.get("/employment").then((r) => setEmployment(r.data)).catch(() => {});
    api.get("/degree").then((r) => setDegrees(r.data)).catch(() => {});
    api
      .get("/certificate")
      .then((r) => setCertificates(r.data))
      .catch(() => {});
  }, []);

  const openPdf = useCallback((url: string, title: string) => {
    setPdfViewer({ url, title });
  }, []);

  const closePdf = useCallback(() => setPdfViewer(null), []);

  const tabs: Tab[] = ["employment", "education", "certificates"];

  return (
    <section className="py-16 md:py-32 px-8">
      <div className="max-w-[1400px] mx-auto">
        <ScrollReveal>
          <p className="text-text-muted text-sm tracking-[0.3em] uppercase mb-4">
            Background
          </p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight light-sunrise">
            Experience
          </h2>
        </ScrollReveal>

        <div className="mt-12 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative px-6 py-3 text-sm uppercase tracking-[0.15em] transition-colors duration-300",
                activeTab === tab
                  ? "text-text"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-sunrise"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-12 border-t border-border">
          {activeTab === "employment" &&
            groupByCompany(employment).map((group, i) => (
              <ScrollReveal key={group.company} delay={i * 0.1}>
                <CompanyCard group={group} />
              </ScrollReveal>
            ))}

          {activeTab === "education" &&
            degrees.map((item, i) => (
              <ScrollReveal key={item._id} delay={i * 0.1}>
                <div className="group py-10 border-b border-border hover:border-border-light transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-12">
                    <div className="shrink-0 md:w-[120px]">
                      <span className="text-3xl md:text-4xl font-black text-border-light group-hover:text-text-muted transition-colors leading-none">
                        {formatYear(item.endDate || item.startDate)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-text">
                        {item.degree}
                      </h3>
                      <p className="text-accent text-base mt-1 font-medium">
                        {item.institution}
                      </p>
                      <p className="text-text-secondary text-sm mt-1">
                        {item.fieldOfStudy}
                      </p>
                      <p className="text-text-muted text-sm mt-1">
                        {formatDate(item.startDate)} —{" "}
                        {item.endDate ? formatDate(item.endDate) : "Present"}
                      </p>
                      {item.description && (
                        <p className="text-text-secondary mt-3 text-sm leading-relaxed max-w-3xl">
                          {item.description}
                        </p>
                      )}
                      <ViewButton
                        fileKey={item.fileKey}
                        link={item.link}
                        label="View Document"
                        onViewPdf={openPdf}
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}

          {activeTab === "certificates" &&
            certificates.map((item, i) => (
              <ScrollReveal key={item._id} delay={i * 0.1}>
                <div className="group py-10 border-b border-border hover:border-border-light transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-12">
                    <div className="shrink-0 md:w-[120px]">
                      <span className="text-3xl md:text-4xl font-black text-border-light group-hover:text-text-muted transition-colors leading-none">
                        {formatYear(item.dateReceived)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-text">
                        {item.certificateName}
                      </h3>
                      <p className="text-accent text-base mt-1 font-medium">
                        {item.organization}
                      </p>
                      {item.description && (
                        <p className="text-text-secondary mt-3 text-sm leading-relaxed max-w-3xl">
                          {item.description}
                        </p>
                      )}
                      <ViewButton
                        fileKey={item.fileKey}
                        link={item.link}
                        label="View Certificate"
                        onViewPdf={openPdf}
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
        </div>
      </div>

      <AnimatePresence>
        {pdfViewer && (
          <PdfViewerOverlay
            url={pdfViewer.url}
            title={pdfViewer.title}
            onClose={closePdf}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
