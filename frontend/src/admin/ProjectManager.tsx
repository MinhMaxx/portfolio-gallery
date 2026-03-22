import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import { Plus, Trash2, Loader2, X, Pencil, Check } from "lucide-react";
import api from "@/lib/api";
import { getThumbnailUrl } from "@/lib/constants";
import ImageUploader from "./ImageUploader";

interface Screenshot {
  _id: string;
  s3Key: string;
  caption: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  technologiesUsed: string[];
  link?: string;
  githubLink?: string;
  demoLink?: string;
  screenshots: Screenshot[];
}

export default function ProjectManager() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get("/project");
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project and all its screenshots?")) return;
    await api.delete(`/project/${id}`);
    setItems((prev) => prev.filter((p) => p._id !== id));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {showForm && (
        <ProjectForm
          existing={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetchItems();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-text-muted" />
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary">
                    {item.name}
                  </h3>
                  <p className="text-text-secondary text-sm mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.technologiesUsed.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-muted">
                    {item.githubLink && <span>GitHub: {item.githubLink}</span>}
                    {item.demoLink && <span>Demo: {item.demoLink}</span>}
                    {!item.githubLink && !item.demoLink && item.link && (
                      <span>Link: {item.link}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() =>
                      setExpanded(expanded === item._id ? null : item._id)
                    }
                    className="px-3 py-1.5 text-xs bg-surface-hover rounded-lg text-text-secondary hover:text-text-primary"
                  >
                    {expanded === item._id
                      ? "Close"
                      : `Images (${item.screenshots?.length || 0})`}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(item);
                      setShowForm(true);
                    }}
                    className="p-1.5 text-text-muted hover:text-accent"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-text-muted hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {expanded === item._id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <ScreenshotUploader
                    projectId={item._id}
                    screenshots={item.screenshots || []}
                    onUpdate={fetchItems}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectForm({
  existing,
  onSaved,
  onCancel,
}: {
  existing: Project | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(existing?.name || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [technologies, setTechnologies] = useState(
    existing?.technologiesUsed.join(", ") || ""
  );
  const [startDate, setStartDate] = useState(
    existing?.startDate ? existing.startDate.slice(0, 10) : ""
  );
  const [endDate, setEndDate] = useState(
    existing?.endDate ? existing.endDate.slice(0, 10) : ""
  );
  const [githubLink, setGithubLink] = useState(existing?.githubLink || "");
  const [demoLink, setDemoLink] = useState(existing?.demoLink || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      description,
      technologiesUsed: technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      startDate,
      endDate: endDate || undefined,
      githubLink: githubLink || undefined,
      demoLink: demoLink || undefined,
    };
    try {
      if (existing) {
        await api.put(`/project/${existing._id}`, payload);
      } else {
        await api.post("/project", payload);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-4 py-2.5 mb-3 text-text-primary text-sm focus:outline-none focus:border-accent";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-xl p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">
          {existing ? "Edit Project" : "New Project"}
        </h3>
        <button type="button" onClick={onCancel} className="text-text-muted">
          <X size={16} />
        </button>
      </div>

      <input
        placeholder="Project name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClass}
      />
      <textarea
        placeholder="Description"
        required
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={`${inputClass} resize-none`}
      />
      <input
        placeholder="Technologies (comma-separated)"
        value={technologies}
        onChange={(e) => setTechnologies(e.target.value)}
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputClass}
        />
        <input
          type="date"
          placeholder="End date (optional)"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={inputClass}
        />
      </div>
      <input
        placeholder="GitHub URL (optional)"
        value={githubLink}
        onChange={(e) => setGithubLink(e.target.value)}
        className={inputClass}
      />
      <input
        placeholder="Live Demo URL (optional)"
        value={demoLink}
        onChange={(e) => setDemoLink(e.target.value)}
        className={inputClass}
      />

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {existing ? "Save Changes" : "Create"}
      </button>
    </form>
  );
}

function ScreenshotUploader({
  projectId,
  screenshots,
  onUpdate,
}: {
  projectId: string;
  screenshots: Screenshot[];
  onUpdate: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const captionRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: File[]) => {
    const results = await Promise.all(
      files.map(async (f) => {
        const res = await api.post(`/project/${projectId}/screenshots`, {
          filename: f.name,
          contentType: f.type,
        });
        return res.data;
      })
    );
    setTimeout(onUpdate, 1000);
    return results;
  };

  const handleDeleteScreenshot = async (screenshotId: string) => {
    await api.delete(`/project/${projectId}/screenshots/${screenshotId}`);
    onUpdate();
  };

  const startEditing = (ss: Screenshot) => {
    setEditingId(ss._id);
    setCaptionDraft(ss.caption || "");
    setTimeout(() => captionRef.current?.focus(), 50);
  };

  const saveCaption = async (screenshotId: string) => {
    await api.patch(`/project/${projectId}/screenshots/${screenshotId}`, {
      caption: captionDraft,
    });
    setEditingId(null);
    onUpdate();
  };

  return (
    <div>
      <ImageUploader onUpload={handleUpload} />
      {screenshots.length > 0 && (
        <div className="space-y-3 mt-4">
          {screenshots.map((ss) => (
            <div
              key={ss._id}
              className="flex items-start gap-3 bg-background rounded-lg p-3 border border-border"
            >
              <img
                src={getThumbnailUrl(ss.s3Key)}
                alt={ss.caption || "Screenshot"}
                className="w-24 h-16 rounded object-cover shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                {editingId === ss._id ? (
                  <div className="flex gap-2">
                    <input
                      ref={captionRef}
                      value={captionDraft}
                      onChange={(e) => setCaptionDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveCaption(ss._id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      placeholder="Add a description for this image..."
                      className="flex-1 bg-surface border border-border rounded px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => saveCaption(ss._id)}
                      className="p-1.5 text-green-400 hover:text-green-300"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-text-muted hover:text-text-primary"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm cursor-pointer ${
                        ss.caption
                          ? "text-text-secondary"
                          : "text-text-muted italic"
                      }`}
                      onClick={() => startEditing(ss)}
                    >
                      {ss.caption || "Click to add description..."}
                    </p>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => startEditing(ss)}
                        className="p-1 text-text-muted hover:text-accent"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteScreenshot(ss._id)}
                        className="p-1 text-text-muted hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
