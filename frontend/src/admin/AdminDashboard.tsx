import { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  Briefcase,
  FolderOpen,
  LogOut,
  Settings,
  Upload,
  FileText,
  Check,
  Loader2,
  MapPin,
  Save,
  Code2,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { getFileUrl } from "@/lib/constants";
import PhotoManager from "./PhotoManager";
import ProjectManager from "./ProjectManager";
import ExperienceManager from "./ExperienceManager";
import HeroEditor from "./HeroEditor";
import SortableTagList from "./components/SortableTagList";

interface Props {
  onLogout: () => void;
}

type View = "photos" | "projects" | "experience" | "hero" | "settings";

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "photos", label: "Photos", icon: <Camera size={16} /> },
  { id: "projects", label: "Projects", icon: <FolderOpen size={16} /> },
  { id: "experience", label: "Experience", icon: <Briefcase size={16} /> },
  { id: "hero", label: "Hero", icon: <LayoutGrid size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

export default function AdminDashboard({ onLogout }: Props) {
  const [view, setView] = useState<View>("photos");

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 bg-surface border-r border-border p-4 flex flex-col">
        <h2 className="text-lg font-bold text-text-primary mb-6">Admin</h2>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                view === id
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            onLogout();
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {view === "photos" && <PhotoManager />}
        {view === "projects" && <ProjectManager />}
        {view === "experience" && <ExperienceManager />}
        {view === "hero" && <HeroEditor />}
        {view === "settings" && <SiteSettings />}
      </main>
    </div>
  );
}


function SiteSettings() {
  const [resumeKey, setResumeKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadResume = useCallback(() => {
    api
      .get("/resume")
      .then((r) => setResumeKey(r.data.fileKey || null))
      .catch(() => {});
  }, []);

  useState(() => {
    loadResume();
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadDone(false);
    try {
      const { data } = await api.post("/resume/upload", {
        filename: file.name,
        contentType: file.type,
      });

      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setResumeKey(data.fileKey);
      setUploadDone(true);
      setTimeout(() => setUploadDone(false), 3000);
    } catch (err) {
      console.error("Resume upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Site Settings
      </h2>

      <div className="bg-surface rounded-xl border border-border p-6 max-w-xl mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          Resume / CV
        </h3>
        <p className="text-sm text-text-muted mb-4">
          Upload a new PDF to replace the resume shown on the Contact page.
        </p>

        {resumeKey && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-surface-elevated rounded-lg border border-border">
            <FileText size={16} className="text-accent shrink-0" />
            <a
              href={getFileUrl(resumeKey)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-accent transition-colors truncate"
            >
              {resumeKey.split("/").pop()}
            </a>
          </div>
        )}

        <label
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors",
            uploading
              ? "bg-surface-elevated text-text-muted cursor-wait"
              : "bg-accent/10 text-accent hover:bg-accent/20"
          )}
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Uploading...
            </>
          ) : uploadDone ? (
            <>
              <Check size={16} />
              Updated
            </>
          ) : (
            <>
              <Upload size={16} />
              {resumeKey ? "Replace Resume" : "Upload Resume"}
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      
    </div>
  );
}

export function LocationEditor() {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get("/settings/location")
      .then((r) => {
        const v = r.data.value;
        if (v) {
          setCity(v.city || "");
          setCountry(v.country || "");
          setLat(String(v.lat ?? ""));
          setLon(String(v.lon ?? ""));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (!city || !country || isNaN(latNum) || isNaN(lonNum)) return;

    setSaving(true);
    setSaved(false);
    try {
      await api.put("/settings/location", {
        value: { city, country, lat: latNum, lon: lonNum },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save location:", err);
    } finally {
      setSaving(false);
    }
  };

  const mapPreviewUrl =
    lat && lon && !isNaN(+lat) && !isNaN(+lon)
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${+lon - 0.15},${+lat - 0.08},${+lon + 0.15},${+lat + 0.08}&layer=mapnik&marker=${lat},${lon}`
      : null;

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={18} className="text-accent" />
        <h3 className="text-lg font-semibold text-text-primary">Location</h3>
      </div>
      <p className="text-sm text-text-muted mb-4">
        Shown on the homepage bento grid with a live map.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-text-muted mb-1 block">City</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Perth, WA"
            className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Country</label>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Australia"
            className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">
            Latitude
          </label>
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="-31.9505"
            className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">
            Longitude
          </label>
          <input
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="115.8605"
            className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {mapPreviewUrl && (
        <div className="mb-4 rounded-lg overflow-hidden border border-border h-40">
          <iframe
            title="Map preview"
            src={mapPreviewUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !city || !country || !lat || !lon}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
          saving
            ? "bg-surface-elevated text-text-muted cursor-wait"
            : saved
              ? "bg-green-500/10 text-green-500"
              : "bg-accent/10 text-accent hover:bg-accent/20"
        )}
      >
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check size={16} />
            Saved
          </>
        ) : (
          <>
            <Save size={16} />
            Save Location
          </>
        )}
      </button>
    </div>
  );
}

export function TechStackEditor() {
  const [selected, setSelected] = useState<string[]>([]);
  const [allTech, setAllTech] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get("/settings/heroTechStack")
      .then((r) => {
        if (r.data.value) setSelected(r.data.value);
      })
      .catch(() => {});
    api
      .get("/employment/tech/all")
      .then((r) => setAllTech(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/settings/heroTechStack", { value: selected });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save tech stack:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6 mt-6">
      <div className="flex items-center gap-2 mb-1">
        <Code2 size={18} className="text-accent" />
        <h3 className="text-lg font-semibold text-text-primary">
          Hero Tech Stack
        </h3>
      </div>
      <p className="text-sm text-text-muted mb-4">
        Drag to reorder. Technologies shown on the homepage bento grid.
      </p>

      <SortableTagList
        items={selected}
        onReorder={setSelected}
        onRemove={(t) => setSelected((prev) => prev.filter((x) => x !== t))}
        onAdd={(t) => {
          if (!selected.includes(t)) setSelected((prev) => [...prev, t]);
        }}
        placeholder="Add custom tech..."
        suggestions={allTech.filter((t) => !selected.includes(t))}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mt-4",
          saving
            ? "bg-surface-elevated text-text-muted cursor-wait"
            : saved
              ? "bg-green-500/10 text-green-500"
              : "bg-accent/10 text-accent hover:bg-accent/20"
        )}
      >
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check size={16} />
            Saved
          </>
        ) : (
          <>
            <Save size={16} />
            Save Tech Stack
          </>
        )}
      </button>
    </div>
  );
}
