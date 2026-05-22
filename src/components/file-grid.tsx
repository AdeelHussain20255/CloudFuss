"use client";

import { FileText } from "lucide-react";
import { FileCard } from "./file-card";
import type { File } from "@/types";

interface FileGridProps {
  files: File[];
  newFileId?: string;
}

export function FileGrid({ files, newFileId }: FileGridProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No files yet</h3>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Drop files above or click to upload
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <FileCard key={file.id} file={file} isNew={file.id === newFileId} />
      ))}
    </div>
  );
}