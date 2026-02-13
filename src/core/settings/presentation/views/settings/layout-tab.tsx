"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import {
  Check,
  PanelLeft,
  Columns3,
  LayoutDashboard,
  Sparkles,
  Minus,
  Square,
  PanelLeftClose,
  LayoutList,
  PanelRight,
  Command,
  Layers,
  Monitor,
  Anchor,
  Briefcase,
  BookOpen,
  Search,
  AlignVerticalJustifyStart,
  Aperture,
  Orbit,
  Zap,
  Clock3,
  Waves,
  Newspaper,
  Clapperboard,
  Vault,
} from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
interface LayoutOption {
  value: string;
  icon: React.ElementType;
  preview: React.ReactNode;
}

type LayoutCategory = "sidebar" | "alternative" | "structural" | "visual" | "specialized";

// ────────────────────────────────────────────
// Inline SVG Layout Previews
// ────────────────────────────────────────────
function SidebarPreview({ variant }: { variant: string }) {
  // ── Minimal: topbar-only, no sidebar at all ──
  if (variant === "minimal") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        {/* Full-width topbar with inline nav items */}
        <div className="h-[16%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="flex gap-1 flex-1">
            {[18, 14, 16, 12].map((w, i) => (
              <div key={i} className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        {/* Content area — full width */}
        <div className="flex-1 p-3">
          <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-2" />
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2 mb-2" />
          <div className="h-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-full w-2/3" />
        </div>
      </div>
    );
  }

  // ── Floating: dashed ghost sidebar (hidden by default) ──
  if (variant === "floating") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        {/* Full-width header with menu toggle */}
        <div className="h-[14%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1">
          <div className="w-2.5 h-2 bg-slate-400 dark:bg-slate-500 rounded-sm" />
          <div className="flex-1" />
          <div className="w-3 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>
        <div className="flex-1 flex relative">
          {/* Ghost sidebar — dashed border indicating hidden by default */}
          <div className="w-[24%] mx-1 my-1 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
          </div>
          {/* Content */}
          <div className="flex-1 p-2">
            <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // ── Modern: icon rail + expandable panel ──
  if (variant === "modern") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
        {/* Thin icon rail */}
        <div className="w-[8%] bg-gradient-to-b from-slate-700 to-slate-800 rounded-l-md flex flex-col items-center pt-2 gap-1">
          {[false, true, false, false].map((active, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded",
                active ? "bg-primary/80" : "bg-white/20"
              )}
            />
          ))}
        </div>
        {/* Expandable panel */}
        <div className="w-[18%] bg-slate-50 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 p-1 pt-2">
          <div className="space-y-1">
            {[65, 50, 55].map((w, i) => (
              <div key={i} className="h-1 bg-slate-300/60 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="h-[14%] bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-700/50" />
          <div className="flex-1 p-2">
            <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // ── Standard sidebar layouts: classic, compact, elegant, navigation ──
  const configs: Record<string, { sidebar: string; header: string; extra?: React.ReactNode; sidebarContent?: React.ReactNode }> = {
    classic: {
      sidebar: "w-[26%] bg-slate-200 dark:bg-slate-700 border-r border-slate-300 dark:border-slate-600 rounded-l-md",
      header: "h-[12%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700",
      sidebarContent: (
        <div className="p-1.5 space-y-1 mt-2">
          {/* Search bar indicator */}
          <div className="h-1.5 bg-white/30 rounded border border-white/10 mb-1.5" />
          {[70, 55, 45, 60].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-white/20" style={{ width: `${w}%` }} />
          ))}
        </div>
      ),
    },
    compact: {
      sidebar: "w-[16%] bg-slate-200 dark:bg-slate-700 rounded-l-md",
      header: "h-[10%] bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700",
    },
    elegant: {
      sidebar: "w-[24%] bg-gradient-to-b from-indigo-900/90 to-violet-900/90 rounded-l-md mx-0.5 my-0.5 rounded-lg",
      header: "h-[14%] bg-white/80 dark:bg-slate-800/80",
    },
    navigation: {
      sidebar: "w-[10%] bg-slate-800 rounded-l-md",
      header: "h-[14%] bg-white dark:bg-slate-900",
      extra: <div className="w-[18%] border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />,
    },
  };

  const c = configs[variant] || configs.classic;

  return (
    <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
      <div className={cn(c.sidebar)}>
        {c.sidebarContent || (
          <div className="p-1.5 space-y-1 mt-3">
            {[70, 55, 45, 60].map((w, i) => (
              <div key={i} className={cn("h-1 rounded-full bg-white/20")} style={{ width: `${w}%` }} />
            ))}
          </div>
        )}
      </div>
      {c.extra}
      <div className="flex-1 flex flex-col">
        <div className={cn(c.header)} />
        <div className="flex-1 p-2">
          <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
        </div>
      </div>
    </div>
  );
}

function AlternativePreview({ variant }: { variant: string }) {
  if (variant === "tabbed") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-[14%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-end px-2 gap-1">
          <div className="w-6 h-[70%] bg-primary/20 rounded-t-sm" />
          <div className="w-6 h-[60%] bg-slate-200 dark:bg-slate-700 rounded-t-sm" />
          <div className="w-6 h-[60%] bg-slate-200 dark:bg-slate-700 rounded-t-sm" />
        </div>
        <div className="flex flex-1">
          <div className="w-[20%] bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-1">
            <div className="space-y-1 mt-1">
              {[85, 65, 70].map((w, i) => (
                <div key={i} className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          <div className="flex-1 p-2">
            <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "dual") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
        <div className="w-[20%] bg-slate-200 dark:bg-slate-800 rounded-l-md p-1 space-y-1 pt-3">
          {[70, 55, 60].map((w, i) => (
            <div key={i} className="h-1 bg-slate-400/40 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex-1 border-x border-slate-200 dark:border-slate-700 p-2">
          <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
        </div>
        <div className="w-[25%] bg-slate-50 dark:bg-slate-800 p-1.5 pt-3 space-y-1">
          {[80, 60].map((w, i) => (
            <div key={i} className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "command") {
    return (
      <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col items-center justify-center border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-[12%] w-full bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <span className="text-[5px] font-mono text-muted-foreground">⌘K</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
        <div className="h-[14%] bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700" />
        <div className="absolute top-[14%] left-0 w-[24%] h-[86%] bg-slate-200/90 dark:bg-slate-800/90 shadow-lg backdrop-blur-sm border-r border-slate-300 dark:border-slate-600 p-1 space-y-1 pt-2">
          {[70, 55, 60, 50].map((w, i) => (
            <div key={i} className="h-1 bg-slate-400/40 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="p-2 ml-[5%]">
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3 mb-1.5" />
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === "hud") {
    return (
      <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-[12%] bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
        <div className="flex-1 p-2">
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
          <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
        </div>
        <div className="h-[18%] bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 px-3">
          {[false, true, false, false, false].map((active, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded",
                active
                  ? "bg-primary/30 ring-1 ring-primary/50"
                  : "bg-slate-300 dark:bg-slate-600"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ────────────────────────────────────────────
// New Layout Previews — Structural
// ────────────────────────────────────────────
function StructuralPreview({ variant }: { variant: string }) {
  // Dock — bottom bar with magnified icons
  if (variant === "dock") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-[10%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="flex-1" />
          <div className="w-3 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>
        <div className="flex-1 p-2">
          <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
        </div>
        <div className="h-[16%] border-t border-slate-200 dark:border-slate-700 flex items-end justify-center gap-1 pb-1 px-3">
          {[2, 2.5, 3, 3.5, 3, 2.5, 2].map((h, i) => (
            <div key={i} className={cn("rounded bg-slate-300 dark:bg-slate-600 transition-all", i === 3 && "bg-primary/40")} style={{ width: `${h * 2.5}px`, height: `${h * 2.5}px` }} />
          ))}
        </div>
      </div>
    );
  }

  // Executive — double header with tab bar
  if (variant === "executive") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-[16%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="flex-1" />
          <div className="w-3 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
          <div className="w-2 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>
        <div className="h-[8%] bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-0.5">
          <div className="w-3 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
          <div className="w-1 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
          <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>
        <div className="h-[10%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-end px-2 gap-1">
          <div className="w-5 h-[70%] border-b-2 border-primary" />
          <div className="w-5 h-[60%]" />
          <div className="w-5 h-[60%]" />
        </div>
        <div className="flex-1 p-2">
          <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
        </div>
      </div>
    );
  }

  // Magazine — slim rail + centered content + right sidebar
  if (variant === "magazine") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
        <div className="w-[6%] bg-slate-200 dark:bg-slate-800 flex flex-col items-center pt-2 gap-1">
          {[false, true, false, false].map((a, i) => (
            <div key={i} className={cn("w-1.5 h-1.5 rounded", a ? "bg-primary/60" : "bg-slate-400/30")} />
          ))}
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-[60%] p-2">
            <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2 mb-1" />
            <div className="h-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-full w-2/3" />
          </div>
        </div>
        <div className="w-[18%] bg-slate-50 dark:bg-slate-800/60 border-l border-slate-200 dark:border-slate-700 p-1 pt-2 space-y-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
        </div>
      </div>
    );
  }

  // Spotlight — big search + category pills
  if (variant === "spotlight") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-[8%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="flex-1" />
          <div className="w-2 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>
        {/* Big search */}
        <div className="flex items-center justify-center py-2.5">
          <div className="w-[65%] h-3 bg-white dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-600 flex items-center px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          </div>
        </div>
        {/* Pills */}
        <div className="flex items-center justify-center gap-1 pb-1.5">
          {[true, false, false, false].map((a, i) => (
            <div key={i} className={cn("h-1.5 rounded-full", a ? "w-4 bg-primary/30" : "w-3 bg-slate-300 dark:bg-slate-600")} />
          ))}
        </div>
        <div className="flex-1 p-2">
          <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
          <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
        </div>
      </div>
    );
  }

  // Rail — permanent icon strip with popover
  if (variant === "rail") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
        <div className="w-[8%] bg-slate-200 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 flex flex-col items-center pt-2 gap-1.5">
          {[false, true, false, false, false].map((a, i) => (
            <div key={i} className={cn("w-2 h-2 rounded", a ? "bg-primary/60 ring-1 ring-primary/30" : "bg-slate-400/30")} />
          ))}
        </div>
        {/* Floating popover */}
        <div className="relative flex-1">
          <div className="absolute top-3 left-1 w-[30%] bg-white dark:bg-slate-800 rounded shadow-lg border border-slate-200 dark:border-slate-700 p-1 space-y-0.5">
            <div className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full w-4/5" />
            <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-3/5" />
            <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="h-[14%] bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-700/50" />
            <div className="flex-1 p-2 pt-10">
              <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ────────────────────────────────────────────
// New Layout Previews — Visual Identity
// ────────────────────────────────────────────
function VisualPreview({ variant }: { variant: string }) {
  // Glassmorphism — transparent panels over gradient
  if (variant === "glassmorphism") {
    return (
      <div className="w-full aspect-[16/10] rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-400/40 via-fuchsia-400/30 to-cyan-400/40" />
        <div className="w-[24%] bg-white/15 backdrop-blur-sm border-r border-white/20 p-1 pt-3 space-y-1 relative">
          {[70, 55, 45].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-white/30" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex-1 flex flex-col relative">
          <div className="h-[14%] bg-white/10 backdrop-blur-sm border-b border-white/15" />
          <div className="flex-1 p-2">
            <div className="h-1.5 bg-white/25 rounded-full w-3/4 mb-1.5" />
            <div className="h-1.5 bg-white/15 rounded-full w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Galaxy — layered depth with shadows
  if (variant === "galaxy") {
    return (
      <div className="w-full aspect-[16/10] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-md overflow-hidden flex border border-slate-700/50" style={{ perspective: "200px" }}>
        <div className="w-[24%] bg-slate-800 border-r border-slate-700 p-1 pt-3 space-y-1" style={{ boxShadow: "4px 0 15px rgba(0,0,0,0.4)" }}>
          {[70, 55, 45].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-slate-600" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-[14%] bg-slate-800/80 border-b border-slate-700" />
          <div className="flex-1 p-2">
            <div className="h-4 bg-slate-700/80 rounded-lg mb-1.5 shadow-lg" />
            <div className="h-3 bg-slate-800/60 rounded-lg shadow" />
          </div>
        </div>
      </div>
    );
  }

  // Neon — dark with glowing borders
  if (variant === "neon") {
    return (
      <div className="w-full aspect-[16/10] bg-[#0a0a0f] rounded-md overflow-hidden flex border border-cyan-500/30">
        <div className="w-[24%] border-r border-cyan-500/20 p-1 pt-3 space-y-1" style={{ boxShadow: "inset -1px 0 8px rgba(0,255,255,0.05)" }}>
          {[70, 55, 45].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-cyan-500/30" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-[14%] border-b border-cyan-500/20" />
          <div className="flex-1 p-2 relative">
            <div className="h-1.5 bg-cyan-500/20 rounded-full w-3/4 mb-1.5" />
            <div className="h-1.5 bg-magenta-500/10 rounded-full w-1/2" style={{ backgroundColor: "rgba(255,0,255,0.1)" }} />
          </div>
        </div>
      </div>
    );
  }

  // Retro — Windows 95 look
  if (variant === "retro") {
    return (
      <div className="w-full aspect-[16/10] bg-[#008080] rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        {/* Window */}
        <div className="m-1 flex-1 bg-[#c0c0c0] flex flex-col" style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}>
          <div className="h-[18%] bg-gradient-to-r from-[#000080] to-[#1084d0] flex items-center px-1 gap-0.5">
            <div className="w-2 h-1 bg-white/50 rounded-sm" />
            <div className="flex-1" />
            <div className="flex gap-px">
              {['─', '□', '×'].map((c, i) => (
                <div key={i} className="w-2 h-2 bg-[#c0c0c0] flex items-center justify-center" style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080", fontSize: "4px", lineHeight: 1 }}>
                  <span className="text-black">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-1">
            <div className="h-1 bg-[#808080] rounded-none w-3/4 mb-1" />
            <div className="h-1 bg-[#808080]/60 rounded-none w-1/2" />
          </div>
        </div>
        {/* Taskbar */}
        <div className="h-[12%] bg-[#c0c0c0] border-t border-white flex items-center px-1 gap-1" style={{ boxShadow: "inset 0 1px 0 #fff" }}>
          <div className="h-[75%] px-1 bg-[#c0c0c0] flex items-center" style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080", fontSize: "3px" }}>
            <span className="text-black font-bold">Start</span>
          </div>
          <div className="flex-1" />
          <div className="h-[65%] px-1 bg-[#c0c0c0]" style={{ boxShadow: "inset -1px -1px 0 #fff, inset 1px 1px 0 #808080", fontSize: "3px" }}>
            <span className="text-black">12:00</span>
          </div>
        </div>
      </div>
    );
  }

  // Aurora — animated gradient sidebar + conic borders
  if (variant === "aurora") {
    return (
      <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
        <div className="w-[24%] bg-gradient-to-b from-purple-500/60 via-blue-500/50 to-teal-500/60 p-1 pt-3 space-y-1">
          {[70, 55, 45].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-white/30" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-[14%] bg-white/60 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700" />
          <div className="flex-1 p-2">
            <div className="h-4 rounded-lg bg-gradient-to-r from-purple-200/30 to-blue-200/30 dark:from-purple-900/20 dark:to-blue-900/20 p-1 mb-1.5 ring-1 ring-purple-400/20">
              <div className="h-1 bg-slate-400/40 rounded-full w-3/4" />
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ────────────────────────────────────────────
// New Layout Previews — Specialized
// ────────────────────────────────────────────
function SpecializedPreview({ variant }: { variant: string }) {
  // Newspaper — masthead with date + tabs
  if (variant === "newspaper") {
    return (
      <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-[8%] bg-slate-50 dark:bg-slate-800 flex items-center px-2">
          <div className="w-8 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
          <div className="flex-1" />
          <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>
        <div className="h-[14%] border-b-2 border-foreground/10 flex items-center px-2 gap-1">
          <div className="w-3 h-3 rounded-full bg-primary/30" />
          <div className="w-6 h-1 bg-slate-400 dark:bg-slate-500 rounded-full" />
        </div>
        <div className="h-[10%] border-b border-slate-200 dark:border-slate-700 flex items-end px-2 gap-1">
          {[true, false, false, false].map((a, i) => (
            <div key={i} className={cn("h-[60%] w-5 border-b-2", a ? "border-foreground" : "border-transparent")} />
          ))}
        </div>
        <div className="flex-1 p-2">
          <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
        </div>
      </div>
    );
  }

  // Cinema — hero gradient + overlay
  if (variant === "cinema") {
    return (
      <div className="w-full aspect-[16/10] rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-[45%] bg-gradient-to-br from-primary/70 via-primary/50 to-primary/30 relative">
          <div className="absolute top-0 left-0 right-0 h-[30%] flex items-center px-2 gap-1">
            <div className="w-2 h-2 bg-white/40 rounded" />
            <div className="flex-1" />
            <div className="w-3 h-1 bg-white/30 rounded-full" />
            <div className="w-2 h-1 bg-white/30 rounded-full" />
          </div>
          <div className="absolute bottom-2 left-2">
            <div className="h-1.5 bg-white/60 rounded-full w-12 mb-1" />
            <div className="h-1 bg-white/30 rounded-full w-8" />
          </div>
        </div>
        <div className="h-3 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-2">
          <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
        </div>
      </div>
    );
  }

  // Vault — mega menu grid
  if (variant === "vault") {
    return (
      <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
        <div className="h-[14%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1">
          <div className="w-3 h-2 bg-primary/30 rounded-sm" />
          <div className="w-5 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
          <div className="flex-1" />
          <div className="w-4 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        </div>
        {/* Mega menu overlay */}
        <div className="flex-1 bg-white/95 dark:bg-slate-800/95 p-1.5">
          <div className="h-1.5 w-8 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-0.5">
                <div className="h-0.5 bg-slate-400/40 rounded-full w-3/4 mb-0.5" />
                <div className="space-y-px">
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-1 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ────────────────────────────────────────────
// Layout Data
// ────────────────────────────────────────────
const sidebarLayouts: LayoutOption[] = [
  { value: "modern", icon: PanelLeft, preview: <SidebarPreview variant="modern" /> },
  { value: "classic", icon: LayoutDashboard, preview: <SidebarPreview variant="classic" /> },
  { value: "compact", icon: PanelLeftClose, preview: <SidebarPreview variant="compact" /> },
  { value: "elegant", icon: Sparkles, preview: <SidebarPreview variant="elegant" /> },
  { value: "minimal", icon: Minus, preview: <SidebarPreview variant="minimal" /> },
  { value: "floating", icon: Square, preview: <SidebarPreview variant="floating" /> },
  { value: "navigation", icon: Columns3, preview: <SidebarPreview variant="navigation" /> },
];

const alternativeLayouts: LayoutOption[] = [
  { value: "tabbed", icon: LayoutList, preview: <AlternativePreview variant="tabbed" /> },
  { value: "dual", icon: PanelRight, preview: <AlternativePreview variant="dual" /> },
  { value: "command", icon: Command, preview: <AlternativePreview variant="command" /> },
  { value: "stacked", icon: Layers, preview: <AlternativePreview variant="stacked" /> },
  { value: "hud", icon: Monitor, preview: <AlternativePreview variant="hud" /> },
];

const structuralLayouts: LayoutOption[] = [
  { value: "dock", icon: Anchor, preview: <StructuralPreview variant="dock" /> },
  { value: "executive", icon: Briefcase, preview: <StructuralPreview variant="executive" /> },
  { value: "magazine", icon: BookOpen, preview: <StructuralPreview variant="magazine" /> },
  { value: "spotlight", icon: Search, preview: <StructuralPreview variant="spotlight" /> },
  { value: "rail", icon: AlignVerticalJustifyStart, preview: <StructuralPreview variant="rail" /> },
];

const visualLayouts: LayoutOption[] = [
  { value: "glassmorphism", icon: Aperture, preview: <VisualPreview variant="glassmorphism" /> },
  { value: "galaxy", icon: Orbit, preview: <VisualPreview variant="galaxy" /> },
  { value: "neon", icon: Zap, preview: <VisualPreview variant="neon" /> },
  { value: "retro", icon: Clock3, preview: <VisualPreview variant="retro" /> },
  { value: "aurora", icon: Waves, preview: <VisualPreview variant="aurora" /> },
];

const specializedLayouts: LayoutOption[] = [
  { value: "newspaper", icon: Newspaper, preview: <SpecializedPreview variant="newspaper" /> },
  { value: "cinema", icon: Clapperboard, preview: <SpecializedPreview variant="cinema" /> },
  { value: "vault", icon: Vault, preview: <SpecializedPreview variant="vault" /> },
];

// ────────────────────────────────────────────
// Layout Card Component
// ────────────────────────────────────────────
function LayoutCard({
  layout,
  isSelected,
  onSelect,
  name,
  description,
}: {
  layout: LayoutOption;
  isSelected: boolean;
  onSelect: () => void;
  name: string;
  description: string;
}) {
  const Icon = layout.icon;

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-0.5",
        isSelected
          ? "border-primary bg-primary/[0.03] shadow-md shadow-primary/10 ring-2 ring-primary/20"
          : "border-border hover:border-primary/40 hover:bg-muted/30"
      )}
      onClick={onSelect}
    >
      {/* Preview */}
      <div className={cn(
        "mb-3 rounded-lg overflow-hidden transition-all duration-300",
        "ring-1 ring-slate-200/50 dark:ring-slate-700/50",
        isSelected && "ring-primary/30"
      )}>
        {layout.preview}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2.5">
        <div className={cn(
          "flex items-center justify-center w-7 h-7 rounded-lg shrink-0 transition-colors",
          isSelected
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary/70"
        )}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "text-sm font-semibold truncate transition-colors",
            isSelected && "text-primary"
          )}>
            {name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/30 animate-in zoom-in-50 duration-200">
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// Layout Category Section
// ────────────────────────────────────────────
function LayoutCategorySection({
  layouts,
  category,
  categoryLabel,
  categoryDesc,
  selectedLayout,
  onSelectLayout,
  t,
}: {
  layouts: LayoutOption[];
  category: LayoutCategory;
  categoryLabel: string;
  categoryDesc: string;
  selectedLayout: string;
  onSelectLayout: (value: string) => void;
  t: (key: string) => string;
}) {
  const selectedInCategory = layouts.some((l) => l.value === selectedLayout);

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{categoryLabel}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{categoryDesc}</p>
        </div>
        {selectedInCategory && (
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
            {t("common.active")}
          </Badge>
        )}
      </div>

      {/* Layout Grid */}
      <div className={cn(
        "grid gap-4",
        category === "sidebar"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {layouts.map((layout) => (
          <LayoutCard
            key={layout.value}
            layout={layout}
            isSelected={selectedLayout === layout.value}
            onSelect={() => onSelectLayout(layout.value)}
            name={t(`settings.layoutTemplate.options.${layout.value}.name`)}
            description={t(`settings.layoutTemplate.options.${layout.value}.description`)}
          />
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Main Export
// ────────────────────────────────────────────
export function LayoutTab() {
  const { t } = useI18n();
  const settings = useSettings();

  const cardStyles = [
    { value: "default", name: t("cardStyle.default"), class: "border bg-card" },
    { value: "glass", name: t("cardStyle.glass"), class: "bg-white/10 backdrop-blur border border-white/20" },
    { value: "solid", name: t("cardStyle.solid"), class: "bg-gray-100 border-0" },
    { value: "bordered", name: t("cardStyle.bordered"), class: "border-2 bg-card" },
    { value: "elevated", name: t("settings.cardStyleOptions.elevated"), class: "shadow-lg bg-card border-0" },
  ];

  return (
    <>
      {/* ── Layout Templates ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.layoutTemplate.title")}</CardTitle>
          <CardDescription>{t("settings.layoutTemplate.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Sidebar Layouts */}
          <LayoutCategorySection
            layouts={sidebarLayouts}
            category="sidebar"
            categoryLabel={t("settings.layoutTemplate.categories.sidebar")}
            categoryDesc={t("settings.layoutTemplate.categories.sidebarDesc")}
            selectedLayout={settings.layoutTemplate}
            onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
            t={t}
          />

          <div className="border-t" />

          {/* Alternative Layouts */}
          <LayoutCategorySection
            layouts={alternativeLayouts}
            category="alternative"
            categoryLabel={t("settings.layoutTemplate.categories.alternative")}
            categoryDesc={t("settings.layoutTemplate.categories.alternativeDesc")}
            selectedLayout={settings.layoutTemplate}
            onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
            t={t}
          />

          <div className="border-t" />

          {/* Structural Layouts */}
          <LayoutCategorySection
            layouts={structuralLayouts}
            category="structural"
            categoryLabel={t("settings.layoutTemplate.categories.structural")}
            categoryDesc={t("settings.layoutTemplate.categories.structuralDesc")}
            selectedLayout={settings.layoutTemplate}
            onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
            t={t}
          />

          <div className="border-t" />

          {/* Visual Identity Layouts */}
          <LayoutCategorySection
            layouts={visualLayouts}
            category="visual"
            categoryLabel={t("settings.layoutTemplate.categories.visual")}
            categoryDesc={t("settings.layoutTemplate.categories.visualDesc")}
            selectedLayout={settings.layoutTemplate}
            onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
            t={t}
          />

          <div className="border-t" />

          {/* Specialized Layouts */}
          <LayoutCategorySection
            layouts={specializedLayouts}
            category="specialized"
            categoryLabel={t("settings.layoutTemplate.categories.specialized")}
            categoryDesc={t("settings.layoutTemplate.categories.specializedDesc")}
            selectedLayout={settings.layoutTemplate}
            onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
            t={t}
          />
        </CardContent>
      </Card>

      {/* ── Dual Layout Options (visible only when dual is selected) ── */}
      {settings.layoutTemplate === "dual" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.dualLayout.title")}</CardTitle>
            <CardDescription>{t("settings.dualLayout.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{t("settings.dualLayout.showPanel")}</label>
                <p className="text-xs text-muted-foreground">{t("settings.dualLayout.showPanelDesc")}</p>
              </div>
              <Switch
                checked={settings.showDetailPanel}
                onCheckedChange={settings.setShowDetailPanel}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Header Styles ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.headerStyle.title")}</CardTitle>
          <CardDescription>{t("settings.headerStyle.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(["default", "compact", "elevated", "transparent"] as const).map((style) => (
              <div
                key={style}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                  settings.headerStyle === style
                    ? "border-primary ring-2 ring-primary/20 bg-primary/[0.03]"
                    : "border-border hover:border-primary/40"
                )}
                onClick={() => settings.setHeaderStyle(style)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{t(`settings.headerStyle.options.${style}.name`)}</h4>
                  <p className="text-xs text-muted-foreground">{t(`settings.headerStyle.options.${style}.description`)}</p>
                  <div
                    className={cn(
                      "h-8 bg-muted rounded-md transition-all",
                      style === "compact" && "h-6",
                      style === "elevated" && "shadow-md",
                      style === "transparent" && "bg-transparent border border-muted"
                    )}
                  />
                </div>
                {settings.headerStyle === style && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Sidebar Styles ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.sidebarStyle.title")}</CardTitle>
          <CardDescription>{t("settings.sidebarStyle.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(["default", "compact", "floating", "minimal"] as const).map((style) => (
              <div
                key={style}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                  settings.sidebarStyle === style
                    ? "border-primary ring-2 ring-primary/20 bg-primary/[0.03]"
                    : "border-border hover:border-primary/40"
                )}
                onClick={() => settings.setSidebarStyle(style)}
              >
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{t(`settings.sidebarStyle.options.${style}.name`)}</h4>
                  <p className="text-xs text-muted-foreground">{t(`settings.sidebarStyle.options.${style}.description`)}</p>
                  <div className="flex gap-1">
                    <div
                      className={cn(
                        "bg-muted rounded h-8",
                        style === "compact" && "w-8",
                        style === "floating" && "w-12 shadow-md rounded-lg",
                        style === "minimal" && "w-10 bg-transparent border border-muted",
                        style === "default" && "w-12"
                      )}
                    />
                    <div className="flex-1 bg-muted/50 rounded h-8" />
                  </div>
                </div>
                {settings.sidebarStyle === style && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Card Styles ── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.cardStyle.title")}</CardTitle>
          <CardDescription>{t("settings.cardStyle.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {cardStyles.map((style) => (
              <div
                key={style.value}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                  settings.cardStyle === style.value
                    ? "border-primary ring-2 ring-primary/20 bg-primary/[0.03]"
                    : "border-border hover:border-primary/40"
                )}
                onClick={() => settings.setCardStyle(style.value as any)}
              >
                <div className="space-y-3">
                  <div className={cn("h-12 rounded-md p-2", style.class)}>
                    <div className="h-2 bg-current opacity-20 rounded mb-1" />
                    <div className="h-2 bg-current opacity-20 rounded w-2/3" />
                  </div>
                  <p className="text-sm font-medium text-center">{style.name}</p>
                </div>
                {settings.cardStyle === style.value && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
