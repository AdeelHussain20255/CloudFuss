"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { FileGrid } from "@/components/file-grid";
import { UploadZone } from "@/components/upload-zone";
import { QuickNoteModal } from "@/components/quick-note-modal";
import { ToastProvider, useToast } from "@/components/toast-provider";
import { supabase } from "@/lib/supabase";
import type { File, Category } from "@/types";

function DashboardContent() {
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [newFileId, setNewFileId] = useState<string | undefined>();
  const [storageUsed] = useState(2 * 1024 * 1024 * 1024);
  const storageTotal = 30 * 1024 * 1024 * 1024;
  const [userName] = useState("Student");
  const { addToast } = useToast();

  const fetchFiles = useCallback(async () => {
    try {
      const url = selectedCategory === "all"
        ? "/api/files"
        : `/api/files?categoryId=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchCategories();
  }, [fetchFiles]);

  useEffect(() => {
    const channel = supabase
      .channel("files-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "files" },
        (payload) => {
          const newFile = payload.new as File;
          setFiles((prev) => [newFile, ...prev]);
          setNewFileId(newFile.id);
          addToast(`New file from ${newFile.user_name}: ${newFile.name}`, "info");
          setTimeout(() => setNewFileId(undefined), 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addToast]);

  const handleAddCategory = async (name: string, icon: string) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon }),
      });
      if (res.ok) {
        fetchCategories();
        addToast(`Category "${name}" created`, "success");
      }
    } catch {
      addToast("Failed to create category", "error");
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryName =
    selectedCategory === "all"
      ? "All Files"
      : selectedCategory === "notes"
      ? "Notes"
      : selectedCategory === "certificates"
      ? "Certificates"
      : selectedCategory === "pastpapers"
      ? "Past Papers"
      : selectedCategory === "csstuff"
      ? "CS Stuff"
      : categories.find((c) => c.id === selectedCategory)?.name || "Files";

  return (
    <div className="flex h-screen">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onAddCategory={handleAddCategory}
        storageUsed={storageUsed}
        storageTotal={storageTotal}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-6 border-b border-border flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{categoryName}</h2>
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50"
              />
            </div>
            <Button onClick={() => setQuickNoteOpen(true)}>
              📝 Quick Note
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <UploadZone
            categoryId={selectedCategory}
            userName={userName}
            onUploadComplete={fetchFiles}
          />

          <FileGrid files={filteredFiles} newFileId={newFileId} />
        </div>
      </main>

      <QuickNoteModal
        open={quickNoteOpen}
        onOpenChange={setQuickNoteOpen}
        categoryId={selectedCategory}
        userName={userName}
        onNoteCreated={fetchFiles}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}