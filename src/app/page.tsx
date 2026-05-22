"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, WifiOff } from "lucide-react";
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
  const [storageUsed, setStorageUsed] = useState(2 * 1024 * 1024 * 1024);
  const [storageTotal, setStorageTotal] = useState(50 * 1024 * 1024 * 1024);
  const [userName] = useState("Student");
  const [isOnline, setIsOnline] = useState(() => 
    typeof window !== "undefined" ? window.navigator.onLine : true
  );
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

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  const fetchStorage = useCallback(async () => {
    try {
      const res = await fetch("/api/storage");
      const data = await res.json();
      if (data.success && data.storage) {
        setStorageUsed(data.storage.used);
        setStorageTotal(data.storage.total);
      }
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
    }
  }, []);

  const handleUploadOrNoteComplete = useCallback(() => {
    fetchFiles();
    fetchStorage();
  }, [fetchFiles, fetchStorage]);

  // Handle network state changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      addToast("Connection restored. Synchronizing...", "success");
      fetchFiles();
      fetchStorage();
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast("Connection lost. Working offline...", "error");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addToast, fetchFiles, fetchStorage]);

  // Load dashboard data in parallel asynchronously to prevent cascading renders
  useEffect(() => {
    let active = true;

    const loadDashboardData = async () => {
      await Promise.all([
        fetchFiles(),
        fetchCategories(),
        fetchStorage()
      ]);
    };

    if (active) {
      loadDashboardData();
    }

    return () => {
      active = false;
    };
  }, [fetchFiles, fetchCategories, fetchStorage]);

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
          fetchStorage(); // Update storage dynamically when new files arrive
          setTimeout(() => setNewFileId(undefined), 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addToast, fetchStorage]);

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
      : categories.find((c) => c.id === selectedCategory)?.name || "Files";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onAddCategory={handleAddCategory}
        storageUsed={storageUsed}
        storageTotal={storageTotal}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Connection Lost Glowing Banner */}
        {!isOnline && (
          <div className="bg-destructive/20 border-b border-destructive/30 text-destructive-foreground px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 animate-pulse z-50">
            <WifiOff className="h-4.5 w-4.5 text-destructive" />
            <span>Connection lost. Working offline...</span>
          </div>
        )}

        <header className="p-6 border-b border-border flex items-center justify-between gap-4 bg-background/50 backdrop-blur-md">
          <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {categoryName}
          </h2>
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/40 focus:border-primary/50 transition-all rounded-xl"
              />
            </div>
            <Button 
              onClick={() => setQuickNoteOpen(true)}
              className="rounded-xl font-semibold bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all shadow-md shadow-primary/20"
            >
              📝 Quick Note
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <UploadZone
            categoryId={selectedCategory}
            userName={userName}
            onUploadComplete={handleUploadOrNoteComplete}
          />

          <FileGrid files={filteredFiles} newFileId={newFileId} />
        </div>
      </main>

      <QuickNoteModal
        open={quickNoteOpen}
        onOpenChange={setQuickNoteOpen}
        categoryId={selectedCategory}
        userName={userName}
        onNoteCreated={handleUploadOrNoteComplete}
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