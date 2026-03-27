/**
 * ThemeMarketplacePanel — Studio sidebar panel for browsing and applying themes
 *
 * Features:
 * - Grid/List view toggle
 * - Category + sort filtering
 * - Theme cards with accent color, badges, and favorite toggle
 * - Quick apply button
 * - Opens detail modal on click
 *
 * All business logic (edition gating, enrichment) is server-side.
 * This component is PRESENTATION ONLY.
 *
 * @module customization/presentation
 */
"use client";

import { useState } from "react";
import {
  Search, Heart, Grid3X3, List, Filter, Sparkles, Download,
  Lock, Star, ChevronLeft, ChevronRight, Loader2, Check,
  Eye, Paintbrush, X, ShieldCheck, Moon, Blocks, Crown,
} from "lucide-react";
import { cn } from "@/core/common/utils";
import {
  THEME_CATEGORIES,
  THEME_SORT_OPTIONS,
  EDITION_LABELS,
  EDITION_COLORS,
} from "../../data/models/ThemeMarketplaceTypes";
import type { ThemeCard as ThemeCardEntity } from "../../domain/entities/ThemeCard";
import { useThemeMarketplace } from "../hooks/useThemeMarketplace";

interface ThemeMarketplacePanelProps {
  t: (key: string) => string;
  onApplySuccess?: () => void;
}

export function ThemeMarketplacePanel({ t, onApplySuccess }: ThemeMarketplacePanelProps) {
  const mp = useThemeMarketplace();
  const [showFilters, setShowFilters] = useState(false);
  const [confirmApply, setConfirmApply] = useState<string | null>(null);

  const totalPages = Math.ceil(mp.totalCount / mp.pageSize);

  const handleApply = async (slug: string, merge: boolean = false) => {
    const success = await mp.applyTheme(slug, merge);
    if (success) {
      setConfirmApply(null);
      onApplySuccess?.();
    }
  };

  return (
    <div className="flex flex-col gap-3 -mx-4 -mt-4">
      {/* ── Tab Bar ── */}
      <div className="flex border-b border-border bg-muted/20 px-1">
        {(["browse", "featured", "favorites"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => mp.setActiveTab(tab)}
            className={cn(
              "flex-1 px-3 py-2.5 text-xs font-medium transition-colors relative",
              mp.activeTab === tab
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "browse" && "Browse"}
            {tab === "featured" && "Featured"}
            {tab === "favorites" && "Favorites"}
            {mp.activeTab === tab && (
              <div className="absolute bottom-0 inset-x-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-3">
        {/* ── Search + Controls ── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("themes.search") || "Search themes..."}
              value={mp.filters.search}
              onChange={(e) => mp.setFilters({ search: e.target.value })}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {mp.filters.search && (
              <button
                onClick={() => mp.setFilters({ search: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-8 w-8 flex items-center justify-center rounded-md border transition-colors",
              showFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
          <div className="flex border border-border rounded-md overflow-hidden">
            <button
              onClick={() => mp.setViewMode("grid")}
              className={cn(
                "h-8 w-8 flex items-center justify-center transition-colors",
                mp.viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => mp.setViewMode("list")}
              className={cn(
                "h-8 w-8 flex items-center justify-center transition-colors",
                mp.viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Filters (collapsible) ── */}
        {showFilters && (
          <div className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-muted/20">
            <div className="flex gap-2">
              <select
                value={mp.filters.category}
                onChange={(e) => mp.setFilters({ category: e.target.value })}
                className="flex-1 h-7 text-xs rounded-md border border-border bg-background px-2"
              >
                {THEME_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <select
                value={mp.filters.sortBy}
                onChange={(e) => mp.setFilters({ sortBy: e.target.value })}
                className="flex-1 h-7 text-xs rounded-md border border-border bg-background px-2"
              >
                {THEME_SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {([
                { key: "isFree", label: "Free Only", icon: Sparkles },
                { key: "hasDarkMode", label: "Dark Mode", icon: Moon },
                { key: "hasAccessibility", label: "Accessible", icon: ShieldCheck },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => mp.setFilters({
                    [key]: mp.filters[key as keyof typeof mp.filters] ? undefined : true,
                  })}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 text-[10px] rounded-full border transition-colors",
                    mp.filters[key as keyof typeof mp.filters]
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
              {(mp.filters.category || mp.filters.isFree || mp.filters.hasDarkMode || mp.filters.hasAccessibility) && (
                <button
                  onClick={mp.resetFilters}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-full text-destructive hover:underline"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {mp.isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}

        {/* ── Empty State ── */}
        {!mp.isLoading && mp.themes.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Paintbrush className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              {mp.activeTab === "favorites"
                ? "No favorite themes yet"
                : "No themes match your filters"}
            </p>
            {mp.activeTab !== "browse" && (
              <button
                onClick={() => mp.setActiveTab("browse")}
                className="text-xs text-primary hover:underline"
              >
                Browse all themes
              </button>
            )}
          </div>
        )}

        {/* ── Theme Cards ── */}
        {!mp.isLoading && mp.themes.length > 0 && (
          <div className={cn(
            mp.viewMode === "grid"
              ? "grid grid-cols-2 gap-2"
              : "flex flex-col gap-2"
          )}>
            {mp.themes.map((theme) => (
              <ThemeCard
                key={theme.slug}
                theme={theme}
                viewMode={mp.viewMode}
                isTogglingFavorite={mp.isTogglingFavorite === theme.slug}
                isApplying={mp.isApplying && confirmApply === theme.slug}
                confirmApply={confirmApply === theme.slug}
                onToggleFavorite={() => mp.toggleFavorite(theme.slug)}
                onPreview={() => mp.openDetail(theme.slug)}
                onApplyClick={() => setConfirmApply(theme.slug)}
                onApplyConfirm={(merge) => handleApply(theme.slug, merge)}
                onApplyCancel={() => setConfirmApply(null)}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <span className="text-[10px] text-muted-foreground">
              {mp.totalCount} themes • Page {mp.page}/{totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => mp.setPage(mp.page - 1)}
                disabled={mp.page <= 1}
                className="h-6 w-6 flex items-center justify-center rounded border border-border text-muted-foreground disabled:opacity-30 hover:bg-muted"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                onClick={() => mp.setPage(mp.page + 1)}
                disabled={mp.page >= totalPages}
                className="h-6 w-6 flex items-center justify-center rounded border border-border text-muted-foreground disabled:opacity-30 hover:bg-muted"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Theme Card Component ──────────────────────────────────────

interface ThemeCardProps {
  theme: ThemeCardEntity;
  viewMode: "grid" | "list";
  isTogglingFavorite: boolean;
  isApplying: boolean;
  confirmApply: boolean;
  onToggleFavorite: () => void;
  onPreview: () => void;
  onApplyClick: () => void;
  onApplyConfirm: (merge: boolean) => void;
  onApplyCancel: () => void;
}

function ThemeCard({
  theme, viewMode, isTogglingFavorite, isApplying, confirmApply,
  onToggleFavorite, onPreview, onApplyClick, onApplyConfirm, onApplyCancel,
}: ThemeCardProps) {
  const editionLabel = theme.isFree ? "Free" : EDITION_LABELS[theme.requiredEdition || ""] || theme.requiredEdition;
  const editionColor = theme.isFree ? "bg-emerald-500/10 text-emerald-600" : EDITION_COLORS[theme.requiredEdition || ""] || "";

  if (viewMode === "list") {
    return (
      <div className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer group",
        theme.isApplied ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30",
        theme.deprecationNotice && "opacity-60"
      )} onClick={onPreview}>
        {/* Color dot */}
        <div
          className="h-8 w-8 rounded-md shrink-0 shadow-inner"
          style={{ backgroundColor: theme.accentColor || "#6b7280" }}
        />
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-foreground truncate">{theme.name}</span>
            {theme.isNew && <span className="flex items-center gap-0.5 text-[9px] text-amber-500"><Sparkles className="h-2.5 w-2.5" />New</span>}
            {theme.isApplied && <Check className="h-3 w-3 text-primary shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", editionColor)}>{editionLabel}</span>
            <span className="text-[9px] text-muted-foreground">{theme.usageCount} uses</span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            disabled={isTogglingFavorite}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
          >
            <Heart className={cn("h-3 w-3", theme.isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
          </button>
          {!theme.isAvailable ? (
            <Lock className="h-3 w-3 text-muted-foreground" />
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onApplyClick(); }}
              className="h-6 px-2 text-[10px] rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Grid view ──
  return (
    <div className={cn(
      "relative flex flex-col rounded-lg border overflow-hidden transition-all cursor-pointer group",
      theme.isApplied ? "border-primary/40 ring-1 ring-primary/20" : "border-border hover:border-primary/30",
      theme.deprecationNotice && "opacity-60"
    )} onClick={onPreview}>
      {/* Color Preview Bar */}
      <div
        className="h-16 w-full relative"
        style={{
          background: `linear-gradient(135deg, ${theme.accentColor || "#6b7280"} 0%, ${theme.accentColor || "#6b7280"}88 100%)`,
        }}
      >
        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          {theme.isNew && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500 text-white">
              <Sparkles className="h-2.5 w-2.5" /> NEW
            </span>
          )}
          {theme.isFeatured && !theme.isNew && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-white/90 text-gray-900">
              <Crown className="h-2.5 w-2.5" /> ★
            </span>
          )}
        </div>
        {/* Applied badge */}
        {theme.isApplied && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-primary text-primary-foreground">
            <Check className="h-2.5 w-2.5" /> Active
          </div>
        )}
        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          disabled={isTogglingFavorite}
          className="absolute bottom-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
        >
          <Heart className={cn("h-3 w-3", theme.isFavorited ? "fill-red-500 text-red-500" : "text-white")} />
        </button>
        {/* Feature icons */}
        <div className="absolute bottom-1.5 left-1.5 flex gap-1">
          {theme.hasDarkMode && <Moon className="h-3 w-3 text-white/80" />}
          {theme.hasAccessibilityPreset && <ShieldCheck className="h-3 w-3 text-white/80" />}
          {theme.hasContentBlocks && <Blocks className="h-3 w-3 text-white/80" />}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-2.5">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-semibold text-foreground leading-tight line-clamp-1">{theme.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", editionColor)}>
            {editionLabel}
          </span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
            <Download className="h-2.5 w-2.5" /> {theme.usageCount}
          </span>
          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
            <Heart className="h-2.5 w-2.5" /> {theme.likeCount}
          </span>
        </div>

        {/* Apply / Confirm */}
        {confirmApply ? (
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-[9px] text-muted-foreground">Apply to draft?</p>
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onApplyConfirm(false); }}
                disabled={isApplying}
                className="flex-1 h-6 text-[9px] rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isApplying ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "Replace"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onApplyConfirm(true); }}
                disabled={isApplying}
                className="flex-1 h-6 text-[9px] rounded border border-primary text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                Merge
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onApplyCancel(); }}
                className="h-6 w-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-1 mt-1">
            {!theme.isAvailable ? (
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Upgrade to {EDITION_LABELS[theme.requiredEdition || ""] || "unlock"}
              </div>
            ) : (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onPreview(); }}
                  className="flex-1 h-6 text-[9px] rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center gap-1 transition-colors"
                >
                  <Eye className="h-3 w-3" /> Preview
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onApplyClick(); }}
                  className="flex-1 h-6 text-[9px] rounded bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1 transition-colors"
                >
                  <Paintbrush className="h-3 w-3" /> Apply
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
