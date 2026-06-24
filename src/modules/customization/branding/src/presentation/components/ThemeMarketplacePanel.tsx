// FILE-EXCEPTION: file length
/**
 * ThemeMarketplacePanel — Studio sidebar panel for browsing and applying themes
 *
 * Features:
 * - Grid/List view toggle
 * - Category + sort filtering
 * - Theme cards with pricing badges (Free/Included/Locked/Buyable)
 * - Preview any theme (even locked), apply only if available
 * - Quick apply with Replace/Merge confirmation
 *
 * Uses hybrid pricing model: Free / EditionGated / StandaloneOnly.
 * All business logic (edition gating, purchase checks) is server-side.
 * This component is PRESENTATION ONLY.
 *
 * @module customization/presentation
 */
"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Heart,
  Grid3X3,
  List,
  Filter,
  Sparkles,
  Download,
  Lock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Eye,
  Paintbrush,
  X,
  ShieldCheck,
  Moon,
  Blocks,
  Crown,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/core/common/utils";
import { THEME_CATEGORIES, THEME_SORT_OPTIONS } from "../../domain/types/ThemeTypes";
import type { ThemeCardDto } from "../../domain/types/ThemeServiceTypes";
import { getThemeBadge } from "../../domain/types/ThemeServiceTypes";
import { useThemeMarketplace } from "../hooks/useThemeMarketplace";
import { useI18n } from "@core/providers/i18n-provider";

interface ThemeMarketplacePanelProps {
  onApplySuccess?: () => void;
  onPreviewTheme?: (themeDataJson: string) => void;
  onExitPreview?: () => void;
}

/**
 * Presentation UI component rendering the theme marketplace panel.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ThemeMarketplacePanel({
  onApplySuccess,
  onPreviewTheme,
  onExitPreview,
}: ThemeMarketplacePanelProps) {
  const { t } = useI18n();
  const mp = useThemeMarketplace();
  const [showFilters, setShowFilters] = useState(false);
  const [confirmApply, setConfirmApply] = useState<string | null>(null);
  const [previewingSlug, setPreviewingSlug] = useState<string | null>(null);

  const totalPages = Math.ceil(mp.totalCount / mp.pageSize);

  // When selectedTheme loads with data and we're actively previewing, forward to parent
  useEffect(() => {
    if (
      previewingSlug &&
      mp.selectedTheme?.slug === previewingSlug &&
      mp.selectedTheme.themeDataJson
    ) {
      onPreviewTheme?.(mp.selectedTheme.themeDataJson);
    }
  }, [mp.selectedTheme, previewingSlug, onPreviewTheme]);

  const handleApply = async (slug: string, merge: boolean = false) => {
    const success = await mp.applyTheme(slug, merge);
    if (success) {
      setConfirmApply(null);
      setPreviewingSlug(null);
      onApplySuccess?.();
    }
  };

  const handlePreview = async (slug: string) => {
    if (previewingSlug === slug) {
      // Exit preview
      setPreviewingSlug(null);
      onExitPreview?.();
      return;
    }
    setPreviewingSlug(slug);
    // Fetch detail to get themeDataJson, then pass to parent for preview
    await mp.openDetail(slug);
  };

  return (
    <div className="-mx-4 -mt-4 flex flex-col gap-3">
      {/* ── Tab Bar ── */}
      <div className="flex border-b border-border bg-muted/20 px-1">
        {(["browse", "featured", "favorites"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => mp.setActiveTab(tab)}
            className={cn(
              "relative flex-1 px-3 py-2.5 text-xs font-medium transition-colors",
              mp.activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "browse" && (t("studio.marketplace.tabBrowse") || "Browse")}
            {tab === "featured" && (t("studio.marketplace.tabFeatured") || "Featured")}
            {tab === "favorites" && (t("studio.marketplace.tabFavorites") || "Favorites")}
            {mp.activeTab === tab && (
              <div className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4">
        {/* ── Search + Controls ── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            {/* // UI-EXCEPTION: compact studio layout — native input for tight sidebar spacing */}
            <input
              type="text"
              placeholder={t("studio.marketplace.search") || "Search themes..."}
              value={mp.filters.search}
              onChange={(e) => mp.setFilters({ search: e.target.value })}
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
              "flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
              showFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
          <div className="flex overflow-hidden rounded-md border border-border">
            <button
              onClick={() => mp.setViewMode("grid")}
              className={cn(
                "flex h-8 w-8 items-center justify-center transition-colors",
                mp.viewMode === "grid"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => mp.setViewMode("list")}
              className={cn(
                "flex h-8 w-8 items-center justify-center transition-colors",
                mp.viewMode === "list"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Filters (collapsible) ── */}
        {showFilters && (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex gap-2">
              {/* // UI-EXCEPTION: compact studio layout — native select for tight sidebar spacing */}
              <select
                value={mp.filters.category}
                onChange={(e) => mp.setFilters({ category: e.target.value })}
                className="h-7 flex-1 rounded-md border border-border bg-background px-2 text-xs"
              >
                {THEME_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <select
                value={mp.filters.sortBy}
                onChange={(e) => mp.setFilters({ sortBy: e.target.value })}
                className="h-7 flex-1 rounded-md border border-border bg-background px-2 text-xs"
              >
                {THEME_SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  {
                    key: "isFree",
                    labelKey: "studio.marketplace.filterFree",
                    fallback: "Free Only",
                    icon: Sparkles,
                  },
                  {
                    key: "hasDarkMode",
                    labelKey: "studio.marketplace.filterDark",
                    fallback: "Dark Mode",
                    icon: Moon,
                  },
                  {
                    key: "hasAccessibility",
                    labelKey: "studio.marketplace.filterAccessible",
                    fallback: "Accessible",
                    icon: ShieldCheck,
                  },
                ] as const
              ).map(({ key, labelKey, fallback, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() =>
                    mp.setFilters({
                      [key]: mp.filters[key as keyof typeof mp.filters] ? undefined : true,
                    })
                  }
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] transition-colors",
                    mp.filters[key as keyof typeof mp.filters]
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {t(labelKey) || fallback}
                </button>
              ))}
              {(mp.filters.category ||
                mp.filters.isFree ||
                mp.filters.hasDarkMode ||
                mp.filters.hasAccessibility) && (
                <button
                  onClick={mp.resetFilters}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] text-destructive hover:underline"
                >
                  <X className="h-3 w-3" /> {t("studio.marketplace.clear") || "Clear"}
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
                ? t("studio.marketplace.emptyFavorites") || "No favorite themes yet"
                : t("studio.marketplace.emptyResults") || "No themes match your filters"}
            </p>
            {mp.activeTab !== "browse" && (
              <button
                onClick={() => mp.setActiveTab("browse")}
                className="text-xs text-primary hover:underline"
              >
                {t("studio.marketplace.browseAll") || "Browse all themes"}
              </button>
            )}
          </div>
        )}

        {/* ── Theme Cards ── */}
        {!mp.isLoading && mp.themes.length > 0 && (
          <div
            className={cn(
              mp.viewMode === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"
            )}
          >
            {mp.themes.map((theme) => (
              <ThemeCard
                key={theme.slug}
                theme={theme}
                viewMode={mp.viewMode}
                isPreviewing={previewingSlug === theme.slug}
                isTogglingFavorite={mp.isTogglingFavorite === theme.slug}
                isApplying={mp.isApplying && confirmApply === theme.slug}
                confirmApply={confirmApply === theme.slug}
                onToggleFavorite={() => mp.toggleFavorite(theme.slug)}
                onPreview={() => handlePreview(theme.slug)}
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
              {mp.totalCount} {t("studio.marketplace.themes") || "themes"} •{" "}
              {t("studio.marketplace.page") || "Page"} {mp.page}/{totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => mp.setPage(mp.page - 1)}
                disabled={mp.page <= 1}
                className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                onClick={() => mp.setPage(mp.page + 1)}
                disabled={mp.page >= totalPages}
                className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted disabled:opacity-30"
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
  theme: ThemeCardDto;
  viewMode: "grid" | "list";
  isPreviewing: boolean;
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
  theme,
  viewMode,
  isPreviewing,
  isTogglingFavorite,
  isApplying,
  confirmApply,
  onToggleFavorite,
  onPreview,
  onApplyClick,
  onApplyConfirm,
  onApplyCancel,
}: ThemeCardProps) {
  const { t } = useI18n();
  const badge = getThemeBadge(theme);

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-all",
          isPreviewing
            ? "border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/20"
            : theme.isApplied
              ? "border-primary/40 bg-primary/5"
              : "border-border hover:border-primary/30 hover:bg-muted/30",
          theme.deprecationNotice && "opacity-60"
        )}
        onClick={onPreview}
      >
        {/* Color dot */}
        <div
          className="h-8 w-8 shrink-0 rounded-md shadow-inner"
          style={{ backgroundColor: theme.accentColor || "#6b7280" }}
        />
        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-medium text-foreground">{theme.name}</span>
            {theme.isNew && (
              <span className="flex items-center gap-0.5 text-[9px] text-amber-500">
                <Sparkles className="h-2.5 w-2.5" />
                {t("studio.marketplace.new") || "New"}
              </span>
            )}
            {theme.isApplied && <Check className="h-3 w-3 shrink-0 text-primary" />}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-medium", badge.color)}>
              {badge.label}
            </span>
            <span className="text-[9px] text-muted-foreground">
              {theme.usageCount} {t("studio.marketplace.uses") || "uses"}
            </span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            disabled={isTogglingFavorite}
            className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-muted"
          >
            <Heart
              className={cn(
                "h-3 w-3",
                theme.isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
          </button>
          {/* Preview always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded transition-colors",
              isPreviewing
                ? "bg-violet-500/20 text-violet-600"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Eye className="h-3 w-3" />
          </button>
          {/* Apply — only if available */}
          {theme.isAvailable ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApplyClick();
              }}
              className="h-6 rounded bg-primary px-2 text-[10px] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("studio.marketplace.apply") || "Apply"}
            </button>
          ) : theme.isBuyable ? (
            <button
              disabled
              className="flex h-6 cursor-not-allowed items-center gap-0.5 rounded border border-violet-300 px-2 text-[10px] text-violet-600 opacity-80"
            >
              <ShoppingCart className="h-2.5 w-2.5" />
              {theme.price ? `$${theme.price.toFixed(0)}` : t("studio.marketplace.buy") || "Buy"}
            </button>
          ) : (
            <Lock className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>
    );
  }

  // ── Grid view ──
  return (
    <div
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border transition-all",
        isPreviewing
          ? "border-violet-500/50 ring-1 ring-violet-500/20"
          : theme.isApplied
            ? "border-primary/40 ring-1 ring-primary/20"
            : "border-border hover:border-primary/30",
        theme.deprecationNotice && "opacity-60"
      )}
      onClick={onPreview}
    >
      {/* Color Preview Bar */}
      <div
        className="relative h-16 w-full"
        style={{
          background: `linear-gradient(135deg, ${theme.accentColor || "#6b7280"} 0%, ${theme.accentColor || "#6b7280"}88 100%)`,
        }}
      >
        {/* Badges */}
        <div className="absolute left-1.5 top-1.5 flex gap-1">
          {theme.isNew && (
            <span className="flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              <Sparkles className="h-2.5 w-2.5" /> NEW
            </span>
          )}
          {theme.isFeatured && !theme.isNew && (
            <span className="flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-gray-900">
              <Crown className="h-2.5 w-2.5" /> ★
            </span>
          )}
          {isPreviewing && (
            <span className="flex items-center gap-0.5 rounded-full bg-violet-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              <Eye className="h-2.5 w-2.5" /> {t("studio.marketplace.preview") || "Preview"}
            </span>
          )}
        </div>
        {/* Applied badge */}
        {theme.isApplied && (
          <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
            <Check className="h-2.5 w-2.5" /> {t("studio.marketplace.active") || "Active"}
          </div>
        )}
        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          disabled={isTogglingFavorite}
          className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <Heart
            className={cn(
              "h-3 w-3",
              theme.isFavorited ? "fill-red-500 text-red-500" : "text-white"
            )}
          />
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
          <span className="line-clamp-1 text-[11px] font-semibold leading-tight text-foreground">
            {theme.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-medium", badge.color)}>
            {badge.label}
          </span>
          <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
            <Download className="h-2.5 w-2.5" /> {theme.usageCount}
          </span>
          <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
            <Heart className="h-2.5 w-2.5" /> {theme.likeCount}
          </span>
        </div>

        {/* Apply / Confirm */}
        {confirmApply ? (
          <div className="mt-1 flex flex-col gap-1">
            <p className="text-[9px] text-muted-foreground">
              {t("studio.marketplace.applyToDraft") || "Apply to draft?"}
            </p>
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyConfirm(false);
                }}
                disabled={isApplying}
                className="h-6 flex-1 rounded bg-primary text-[9px] text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isApplying ? (
                  <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                ) : (
                  t("studio.marketplace.replace") || "Replace"
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyConfirm(true);
                }}
                disabled={isApplying}
                className="h-6 flex-1 rounded border border-primary text-[9px] text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                {t("studio.marketplace.merge") || "Merge"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyCancel();
                }}
                className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex gap-1">
            {/* Preview — ALWAYS visible for all themes */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className={cn(
                "flex h-6 flex-1 items-center justify-center gap-1 rounded border text-[9px] transition-colors",
                isPreviewing
                  ? "border-violet-400 bg-violet-500/10 text-violet-600"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Eye className="h-3 w-3" />{" "}
              {isPreviewing
                ? t("studio.marketplace.exit") || "Exit"
                : t("studio.marketplace.preview") || "Preview"}
            </button>
            {/* Apply — only if available */}
            {theme.isAvailable ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyClick();
                }}
                className="flex h-6 flex-1 items-center justify-center gap-1 rounded bg-primary text-[9px] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Paintbrush className="h-3 w-3" /> {t("studio.marketplace.apply") || "Apply"}
              </button>
            ) : theme.isBuyable ? (
              <button
                disabled
                className="flex h-6 flex-1 cursor-not-allowed items-center justify-center gap-1 rounded border border-violet-300 text-[9px] text-violet-600 opacity-80"
                title="Contact your system administrator to purchase this theme"
              >
                <ShoppingCart className="h-3 w-3" />
                {theme.price ? `$${theme.price.toFixed(0)}` : t("studio.marketplace.buy") || "Buy"}
              </button>
            ) : (
              <div className="flex h-6 flex-1 items-center justify-center gap-1 rounded border border-amber-300/50 bg-amber-500/5 text-[9px] text-amber-600">
                <Lock className="h-3 w-3" /> {t("studio.marketplace.upgrade") || "Upgrade"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
