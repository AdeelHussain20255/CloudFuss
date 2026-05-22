"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { File } from "@/types";

interface FileCardProps {
  file: File;
  isNew?: boolean;
}

export function FileCard({ file, isNew }: FileCardProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext || "")) return "📕";
    if (["doc", "docx"].includes(ext || "")) return "📘";
    if (["xls", "xlsx"].includes(ext || "")) return "📗";
    if (["ppt", "pptx"].includes(ext || "")) return "📙";
    if (["txt", "md"].includes(ext || "")) return "📝";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "🖼️";
    if (["zip", "rar", "7z"].includes(ext || "")) return "📦";
    if (["js", "ts", "py", "java", "cpp", "c"].includes(ext || "")) return "💻";
    return "📁";
  };

  return (
    <div
      className={cn(
        "glass rounded-xl p-4 hover:bg-white/10 transition-all duration-200 group",
        isNew && "file-enter"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getFileIcon(file.name)}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="font-mono">{formatSize(file.size)}</span>
            <span>•</span>
            <span>{formatDate(file.created_at)}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            by {file.user_name}
          </div>
        </div>
        <a
          href={file.mega_url}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-primary/20"
        >
          <Download className="h-4 w-4 text-primary" />
        </a>
      </div>
    </div>
  );
}