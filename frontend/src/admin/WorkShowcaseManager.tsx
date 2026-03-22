import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import { Plus, Trash2, Loader2, X, Pencil, Check } from "lucide-react";
import api from "@/lib/api";
import { getThumbnailUrl } from "@/lib/constants";
import ImageUploader from "./ImageUploader";

interface WorkShowcase {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  screenshots: { _id: string; s3Key: string; caption: string }[];
}

export default function WorkShowcaseManager() {
  const [items, setItems] = useState<WorkShowcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<WorkShowcase | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get("/work-showcase");
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this work showcase and all its screenshots?")) return;
    await api.delete(`/work-showcase/${id}`);
    setItems((prev) => prev.filter((w) => w._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Work Showcase</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors"
        >
          <Plus size={16} />
          New Showcase
        </button>
      </div>

      {showForm && (
        <CreateForm
          onCreated={() => {
            setShowForm(false);
            fetchItems();
          }}
          onCancel={() => setShowForm(false)}
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
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary text-sm mt-1">
                    {item.description}
                  </p>
                  {item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.technologies.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setSelected(selected?._id === item._id ? null : item)
                    }
                    className="px-3 py-1.5 text-xs bg-surface-hover rounded-lg text-text-secondary hover:text-text-primary"
                  >
                    {selected?._id === item._id
                      ? "Close"
                      : `Screenshots (${item.screenshots.length})`}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-text-muted hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {selected?._id === item._id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <ScreenshotUploader
                    showcaseId={item._id}
                    screenshots={item.screenshots}
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

function CreateForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/work-showcase", {
        title,
        description,
        technologies: technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-xl p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">New Work Showcase</h3>
        <button type="button" onClick={onCancel} className="text-text-muted">
          <X size={16} />
        </button>
      </div>
      <input
        placeholder="Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 mb-3 text-text-primary text-sm focus:outline-none focus:border-accent"
      />
      <textarea
        placeholder="Description"
        required
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 mb-3 text-text-primary text-sm focus:outline-none focus:border-accent resize-none"
      />
      <input
        placeholder="Technologies (comma-separated)"
        value={technologies}
        onChange={(e) => setTechnologies(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 mb-4 text-text-primary text-sm focus:outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        Create
      </button>
    </form>
  );
}

function ScreenshotUploader({
  showcaseId,
  screenshots,
  onUpdate,
}: {
  showcaseId: string;
  screenshots: { _id: string; s3Key: string; caption: string }[];
  onUpdate: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const captionRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: File[]) => {
    const results = await Promise.all(
      files.map(async (f) => {
        const res = await api.post(`/work-showcase/${showcaseId}/screenshots`, {
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
    await api.delete(
      `/work-showcase/${showcaseId}/screenshots/${screenshotId}`
    );
    onUpdate();
  };

  const startEditing = (ss: { _id: string; caption: string }) => {
    setEditingId(ss._id);
    setCaptionDraft(ss.caption || "");
    setTimeout(() => captionRef.current?.focus(), 50);
  };

  const saveCaption = async (screenshotId: string) => {
    await api.patch(
      `/work-showcase/${showcaseId}/screenshots/${screenshotId}`,
      { caption: captionDraft }
    );
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
