import { useState, useEffect, useCallback, useRef } from "react";
import { Trash2, Loader2, X, Hash } from "lucide-react";
import api from "@/lib/api";
import { getThumbnailUrl, getImageUrl } from "@/lib/constants";
import ImageUploader from "./ImageUploader";
import { cn } from "@/lib/utils";

interface Photo {
  _id: string;
  title: string;
  tags: string[];
  s3Key: string;
}

function TagInput({
  tags,
  onChange,
  placeholder = "Add tag...",
  className,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.replace(/^#/, "").trim().toLowerCase();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput("");
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 items-center bg-surface-elevated border border-border rounded-lg px-3 py-2 cursor-text",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent"
        >
          #{t}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(tags.filter((x) => x !== t));
            }}
            className="hover:text-red-400"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(input);
          }
          if (e.key === "Backspace" && !input && tags.length > 0) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="bg-transparent outline-none text-sm text-text-primary min-w-[80px] flex-1"
      />
    </div>
  );
}

function PhotoTagEditor({
  photo,
  onSave,
}: {
  photo: Photo;
  onSave: () => void;
}) {
  const [tags, setTags] = useState(photo.tags || []);
  const [saving, setSaving] = useState(false);
  const changed =
    JSON.stringify(tags) !== JSON.stringify(photo.tags || []);

  const save = async () => {
    if (!changed) return;
    setSaving(true);
    try {
      await api.put(`/photo/${photo._id}`, { tags });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-2 space-y-2" onClick={(e) => e.stopPropagation()}>
      <TagInput tags={tags} onChange={setTags} placeholder="#landscape" />
      {changed && (
        <button
          onClick={save}
          disabled={saving}
          className="text-xs px-2 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Tags"}
        </button>
      )}
    </div>
  );
}

export default function PhotoManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadTags, setUploadTags] = useState<string[]>(["general"]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await api.get("/photo", { params: { limit: 200 } });
      setPhotos(res.data.photos);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleUpload = async (files: File[]) => {
    const payload = {
      files: files.map((f) => ({
        filename: f.name,
        contentType: f.type,
        title: "",
        description: "",
      })),
      tags: uploadTags,
    };
    const res = await api.post("/photo/batch", payload);
    setTimeout(fetchPhotos, 1000);
    return res.data;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    await api.delete(`/photo/${id}`);
    setPhotos((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Photo Gallery
      </h1>

      <div className="mb-6">
        <label className="flex items-center gap-1.5 text-sm text-text-secondary mb-2">
          <Hash size={14} />
          Upload tags
        </label>
        <TagInput
          tags={uploadTags}
          onChange={setUploadTags}
          placeholder="#landscape, #street, #portrait"
          className="max-w-md"
        />
        <p className="text-xs text-text-muted mt-1">
          These tags will be applied to all photos in the next upload batch.
        </p>
      </div>

      <ImageUploader onUpload={handleUpload} />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-text-muted" />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className="relative group rounded-lg overflow-hidden bg-surface border border-border"
            >
              <img
                src={getThumbnailUrl(photo.s3Key)}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = "1";
                    img.src = getImageUrl(photo.s3Key);
                  }
                }}
                alt={photo.title || "Photo"}
                className="w-full aspect-square object-cover cursor-pointer"
                loading="lazy"
                onClick={() =>
                  setEditingId(editingId === photo._id ? null : photo._id)
                }
              />
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(photo._id)}
                  className="p-1.5 bg-red-500/80 rounded-full text-white hover:bg-red-500"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {editingId !== photo._id && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 flex flex-wrap gap-1">
                  {(photo.tags || []).map((t) => (
                    <span
                      key={t}
                      className="text-white/90 text-[10px] leading-tight"
                    >
                      #{t}
                    </span>
                  ))}
                  {(!photo.tags || photo.tags.length === 0) && (
                    <span className="text-white/50 text-[10px] italic">
                      no tags
                    </span>
                  )}
                </div>
              )}
              {editingId === photo._id && (
                <PhotoTagEditor
                  photo={photo}
                  onSave={() => {
                    setEditingId(null);
                    fetchPhotos();
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
