import { useState, useEffect, useCallback } from "react";
import { Trash2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { getThumbnailUrl } from "@/lib/constants";
import ImageUploader from "./ImageUploader";

interface Photo {
  _id: string;
  title: string;
  category: string;
  s3Key: string;
}

export default function PhotoManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("general");

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
      category,
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
        <label className="text-sm text-text-secondary block mb-2">
          Upload category
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. landscape, street, portrait"
          className="bg-surface border border-border rounded-lg px-4 py-2 text-text-primary text-sm w-64 focus:outline-none focus:border-accent"
        />
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
                alt={photo.title || "Photo"}
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(photo._id)}
                  className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-white text-xs truncate capitalize">
                  {photo.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
