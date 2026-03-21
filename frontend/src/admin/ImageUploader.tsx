import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadResult {
  photo: { _id: string; s3Key: string };
  uploadUrl: string;
}

interface Props {
  onUpload: (files: File[]) => Promise<UploadResult[]>;
  accept?: string;
  multiple?: boolean;
}

interface FileStatus {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
}

export default function ImageUploader({
  onUpload,
  accept = "image/*",
  multiple = true,
}: Props) {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const newFiles = Array.from(fileList);
      const statuses: FileStatus[] = newFiles.map((f) => ({
        file: f,
        status: "pending",
        progress: 0,
      }));
      setFiles((prev) => [...prev, ...statuses]);

      try {
        const results = await onUpload(newFiles);

        const uploads = results.map(async (result, i) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === newFiles[i] ? { ...f, status: "uploading" } : f
            )
          );

          try {
            await fetch(result.uploadUrl, {
              method: "PUT",
              body: newFiles[i],
              headers: { "Content-Type": newFiles[i].type },
            });

            setFiles((prev) =>
              prev.map((f) =>
                f.file === newFiles[i]
                  ? { ...f, status: "done", progress: 100 }
                  : f
              )
            );
          } catch {
            setFiles((prev) =>
              prev.map((f) =>
                f.file === newFiles[i] ? { ...f, status: "error" } : f
              )
            );
          }
        });

        await Promise.all(uploads);
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            newFiles.includes(f.file) ? { ...f, status: "error" } : f
          )
        );
      }
    },
    [onUpload]
  );

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          dragging
            ? "border-accent bg-accent/5"
            : "border-border hover:border-text-muted"
        )}
      >
        <Upload className="mx-auto mb-3 text-text-muted" size={32} />
        <p className="text-text-secondary text-sm">
          Drag & drop images here, or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map(({ file, status }) => (
            <div
              key={`${file.name}-${file.lastModified}`}
              className="flex items-center gap-3 bg-surface rounded-lg p-3 border border-border"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-10 h-10 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">
                  {file.name}
                </p>
                <p className="text-xs text-text-muted">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              {status === "uploading" && (
                <Loader2 size={16} className="animate-spin text-accent" />
              )}
              {status === "done" && (
                <CheckCircle2 size={16} className="text-green-400" />
              )}
              {status === "error" && (
                <span className="text-red-400 text-xs">Failed</span>
              )}
              <button
                onClick={() => removeFile(file)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
