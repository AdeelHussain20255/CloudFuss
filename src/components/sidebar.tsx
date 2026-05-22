"use client";

import React, { useState } from "react";
import { Cloud } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "all", name: "All Files", icon: "📁", created_at: "" },
  { id: "notes", name: "Notes", icon: "📝", created_at: "" },
  { id: "certificates", name: "Certificates", icon: "🎓", created_at: "" },
  { id: "pastpapers", name: "Past Papers", icon: "📄", created_at: "" },
  { id: "csstuff", name: "CS Stuff", icon: "💻", created_at: "" },
];

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onAddCategory: (name: string, icon: string) => void;
  storageUsed: number;
  storageTotal: number;
}

export function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  storageUsed,
  storageTotal,
}: SidebarProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📁");

  const storagePercent = (storageUsed / storageTotal) * 100;
  const storageGB = (storageUsed / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (storageTotal / (1024 * 1024 * 1024)).toFixed(0);

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim(), newCatIcon);
      setNewCatName("");
      setShowAddForm(false);
    }
  };

  return (
    <aside className="w-64 h-screen glass border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Cloud className="h-6 w-6 text-primary" />
          CloudFuse
        </h1>
      </div>

      <div className="p-4 border-b border-border">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Storage</span>
            <span className="font-mono">
              {storageGB} GB / {totalGB} GB
            </span>
          </div>
          <Progress
            value={storagePercent}
            className={cn(
              "h-2",
              storagePercent > 90 && "[&>div]:bg-red-500",
              storagePercent > 70 && "[&>div]:bg-yellow-500"
            )}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {[...DEFAULT_CATEGORIES, ...categories].map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
              selectedCategory === cat.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}

        {showAddForm ? (
          <div className="space-y-2 pt-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name"
              className="w-full px-3 py-2 text-sm bg-secondary rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                className="flex-1 px-3 py-1.5 text-xs bg-primary rounded-lg hover:bg-primary/90"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-3 py-1.5 text-xs bg-secondary rounded-lg hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <span>+</span>
            <span>Add Category</span>
          </button>
        )}
      </nav>
    </aside>
  );
}