"use client";

import React, { useState } from "react";
import { Cloud } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const DEFAULT_CATEGORIES: Category[] = [
  { id: "all", name: "All Files", icon: "📁", created_at: "" },
];

const EMOJI_OPTIONS = ["📁", "📝", "🎓", "📄", "💻", "🎨", "🧪", "📅", "🎵", "📚"];

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

  const storagePercent = Math.min((storageUsed / storageTotal) * 100, 100);
  const storageGB = (storageUsed / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (storageTotal / (1024 * 1024 * 1024)).toFixed(0);

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim(), newCatIcon);
      setNewCatName("");
      setNewCatIcon("📁");
      setShowAddForm(false);
    }
  };

  return (
    <aside className="w-64 h-screen glass border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Cloud className="h-6 w-6 text-primary animate-pulse" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CloudFuse
          </span>
        </h1>
      </div>

      <div className="p-4 border-b border-border">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Storage</span>
            <span className="font-mono text-[10px] bg-secondary/80 px-1.5 py-0.5 rounded text-foreground">
              {storageGB} GB / {totalGB} GB
            </span>
          </div>
          <Progress
            value={storagePercent}
            className={cn(
              "h-2 bg-secondary overflow-hidden rounded-full",
              storagePercent > 90
                ? "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-rose-600"
                : storagePercent > 70
                ? "[&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-orange-500"
                : "[&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent"
            )}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
        {[...DEFAULT_CATEGORIES, ...categories].map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group relative border",
                isSelected
                  ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border-transparent"
              )}
            >
              <span className="text-base group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </span>
              <span className="font-medium truncate">{cat.name}</span>
              {isSelected && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}

        {showAddForm ? (
          <div className="space-y-3 pt-3 p-3 rounded-xl bg-secondary/30 border border-border/50 animate-fadeIn">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name"
              className="w-full px-3 py-2 text-sm bg-secondary/80 rounded-lg border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/60 transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCategory();
              }}
            />
            
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Select Icon
              </span>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-background/50 rounded-lg border border-border/30">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewCatIcon(emoji)}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded-md text-base hover:bg-white/10 active:scale-95 transition-all",
                      newCatIcon === emoji && "bg-primary/20 border border-primary/40 shadow-inner"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddCategory}
                disabled={!newCatName.trim()}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-primary hover:bg-primary/95 text-white rounded-lg active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCatName("");
                  setNewCatIcon("📁");
                }}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground rounded-lg active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary/40 hover:text-foreground border border-dashed border-border/50 hover:border-primary/30 transition-all duration-200 mt-2"
          >
            <span className="text-base font-semibold">+</span>
            <span className="font-medium">Add Category</span>
          </button>
        )}
      </nav>
    </aside>
  );
}