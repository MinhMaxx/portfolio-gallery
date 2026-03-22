import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import api from "@/lib/api";

interface Project {
  _id: string;
  name: string;
  demoLink?: string;
}

function resolveDemoUrl(demoLink: string): string {
  if (demoLink.startsWith("http")) return demoLink;
  if (import.meta.env.DEV && demoLink.startsWith("/api")) {
    return `http://localhost:3000${demoLink}`;
  }
  return demoLink;
}

export default function ProjectDemoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/project/${id}`)
      .then((r) => setProject(r.data))
      .catch(() => navigate("/projects"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project?.demoLink) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-4">
        <p className="text-text-secondary">No demo available for this project.</p>
        <button
          onClick={() => navigate("/projects")}
          className="text-accent text-sm hover:underline"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const toolbarH = "46px";
  const padding = "24px";
  const iframeHeight = fullscreen
    ? "100vh"
    : `calc(100vh - ${toolbarH} - ${padding} * 2)`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-bg flex flex-col overflow-hidden"
    >
      {!fullscreen && (
        <div className="bg-surface border-b border-border px-6 flex items-center justify-between shrink-0" style={{ height: toolbarH }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-2 text-text-secondary hover:text-text text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Projects
            </button>
            <span className="text-border">|</span>
            <h1 className="text-text font-semibold text-sm">{project.name}</h1>
            <span className="text-text-muted text-xs px-2 py-0.5 rounded-full border border-border">
              Live Demo
            </span>
          </div>
          <button
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-1.5 text-text-muted hover:text-text text-xs transition-colors"
          >
            <Maximize2 size={14} />
            Fullscreen
          </button>
        </div>
      )}

      <div className={`flex-1 relative ${fullscreen ? "" : "p-6"}`} style={{ overflow: "hidden" }}>
        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg/80 backdrop-blur border border-border text-text-muted hover:text-text text-xs transition-colors"
          >
            <Minimize2 size={14} />
            Exit
          </button>
        )}

        <iframe
          src={resolveDemoUrl(project.demoLink)}
          title={`${project.name} — Live Demo`}
          className={`w-full border-0 block ${fullscreen ? "" : "rounded-xl border border-border shadow-lg"}`}
          style={{ height: iframeHeight }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </motion.div>
  );
}
