"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";

interface QuickNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  userName: string;
  onNoteCreated: () => void;
}

export function QuickNoteModal({
  open,
  onOpenChange,
  categoryId,
  userName,
  onNoteCreated,
}: QuickNoteModalProps) {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/quick-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          categoryId: categoryId === "all" ? "notes" : categoryId,
          userName,
        }),
      });

      if (!response.ok) throw new Error("Failed to create note");

      addToast("Note saved successfully!", "success");
      setContent("");
      onNoteCreated();
      onOpenChange(false);
    } catch {
      addToast("Failed to save note", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>Quick Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            className="w-full h-48 bg-secondary/50 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!content.trim() || isSaving}>
              {isSaving ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}