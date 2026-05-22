"use client";

import { useCallback, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast-provider";

interface UploadZoneProps {
  categoryId: string;
  userName: string;
  onUploadComplete: () => void;
}

export function UploadZone({ categoryId, userName, onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleUpload = useCallback(async (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      addToast("File too large. Max 500MB.", "error");
      return;
    }

    setIsUploading(true);
    setCurrentFile(file.name);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoryId", categoryId === "all" ? "notes" : categoryId);
    formData.append("userName", userName);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 90));
      }, 100);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      addToast(`${file.name} uploaded successfully!`, "success");
      onUploadComplete();
    } catch {
      addToast(`Failed to upload ${file.name}`, "error");
    } finally {
      setIsUploading(false);
      setCurrentFile(null);
      setUploadProgress(0);
    }
  }, [categoryId, userName, addToast, onUploadComplete]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      files.forEach(handleUpload);
    },
    [handleUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach(handleUpload);
      e.target.value = "";
    },
    [handleUpload]
  );

  if (isUploading) {
    return (
      <div className="border-2 border-primary border-dashed rounded-xl p-8 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-medium">{currentFile}</p>
        <div className="w-full max-w-xs h-2 bg-secondary rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <button
          onClick={() => {
            setIsUploading(false);
            setCurrentFile(null);
          }}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer",
        isDragging && "border-primary bg-primary/5 scale-[1.02]"
      )}
    >
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
        <Upload
          className={cn(
            "h-8 w-8 mb-3 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )}
        />
        <p className="text-sm font-medium">
          {isDragging ? "Release to upload" : "Drop files here or click to upload"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Max 500MB per file</p>
      </label>
    </div>
  );
}