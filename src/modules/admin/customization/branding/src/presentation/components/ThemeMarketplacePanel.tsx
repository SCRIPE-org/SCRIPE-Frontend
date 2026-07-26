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
  Check,
  Eye,
  Paintbrush,
  X,
  ShieldCheck,
  Moon,
  Blocks,
  Crown,
  ShoppingCart,
  Star,
} from "lucide-react";
import { cn, formatCurrency } from "@/core/common/utils";
import { THEME_CATEGORIES, THEME_SORT_OPTIONS } from "../../domain/types/ThemeTypes";
import type { ThemeCardDto } from "../../domain/types/ThemeServiceTypes";
import { getThemeBadge } from "../../domain/types/ThemeServiceTypes";
import { useThemeMarketplace } from "../hooks/useThemeMarketplace";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";

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
      <div className="flex border-b border-nx-line bg-[color:color-mix(in_srgb,var(--nx-raised)_20%,transparent)] px-1">
        {(["browse", "featured", "favorites"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => mp.setActiveTab(tab)}
            className={cn(
              "relative flex-1 px-3 py-2.5 text-xs font-medium transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              mp.activeTab === tab ? "text-nx-accent" : "text-nx-ink-3 hover:text-nx-ink"
            )}
          >
            {tab === "browse" && t("studio.marketplace.tabBrowse")}
            {tab === "featured" && t("studio.marketplace.tabFeatured")}
            {tab === "favorites" && t("studio.marketplace.tabFavorites")}
            {mp.activeTab === tab && (
              <div className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-nx-accent-fill" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4">
        {/* ── Search + Controls ── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-nx-ink-3" />
            {/* // UI-EXCEPTION: compact studio layout — native input for tight sidebar spacing */}
            <input
              type="text"
              placeholder={t("studio.marketplace.search")}
              value={mp.filters.search}
              onChange={(e) => mp.setFilters({ search: e.target.value })}
              className="h-8 w-full rounded-nx-control border border-nx-line bg-nx-ground ps-8 pe-3 text-xs text-nx-ink placeholder:text-nx-ink-3 focus:outline-none focus:ring-1 focus:ring-nx-accent"
            />
            {mp.filters.search && (
              <button
                onClick={() => mp.setFilters({ search: "" })}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-nx-ink-3 hover:text-nx-ink"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-nx-control border transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              showFilters
                ? "border-nx-accent bg-nx-accent-wash text-nx-accent"
                : "border-nx-line text-nx-ink-3 hover:text-nx-ink"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
          <div className="flex overflow-hidden rounded-nx-control border border-nx-line">
            <button
              onClick={() => mp.setViewMode("grid")}
              className={cn(
                "flex h-8 w-8 items-center justify-center transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                mp.viewMode === "grid"
                  ? "bg-nx-accent-wash text-nx-accent"
                  : "text-nx-ink-3 hover:text-nx-ink"
              )}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => mp.setViewMode("list")}
              className={cn(
                "flex h-8 w-8 items-center justify-center transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                mp.viewMode === "list"
                  ? "bg-nx-accent-wash text-nx-accent"
                  : "text-nx-ink-3 hover:text-nx-ink"
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Filters (collapsible) ── */}
        {showFilters && (
          <div className="flex flex-col gap-2 rounded-nx-md border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-raised)_20%,transparent)] p-3">
            <div className="flex gap-2">
              {/* // UI-EXCEPTION: compact studio layout — native select for tight sidebar spacing */}
              <select
                value={mp.filters.category}
                onChange={(e) => mp.setFilters({ category: e.target.value })}
                className="h-7 flex-1 rounded-nx-control border border-nx-line bg-nx-ground px-2 text-xs"
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
                className="h-7 flex-1 rounded-nx-control border border-nx-line bg-nx-ground px-2 text-xs"
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
                    icon: Sparkles,
                  },
                  {
                    key: "hasDarkMode",
                    labelKey: "studio.marketplace.filterDark",
                    icon: Moon,
                  },
                  {
                    key: "hasAccessibility",
                    labelKey: "studio.marketplace.filterAccessible",
                    icon: ShieldCheck,
                  },
                ] as const
              ).map(({ key, labelKey, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() =>
                    mp.setFilters({
                      [key]: mp.filters[key as keyof typeof mp.filters] ? undefined : true,
                    })
                  }
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    mp.filters[key as keyof typeof mp.filters]
                      ? "border-nx-accent bg-nx-accent-wash text-nx-accent"
                      : "border-nx-line text-nx-ink-3 hover:text-nx-ink"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {t(labelKey)}
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
                  <X className="h-3 w-3" /> {t("studio.marketplace.clear")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {mp.isLoading && <LoadingSpinner size="sm" showText={false} className="py-8" />}

        {/* ── Empty State ── */}
        {!mp.isLoading && mp.themes.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Paintbrush className="h-8 w-8 text-[color:color-mix(in_srgb,var(--nx-ink-3)_50%,transparent)]" />
            <p className="text-xs text-nx-ink-3">
              {mp.activeTab === "favorites"
                ? t("studio.marketplace.emptyFavorites")
                : t("studio.marketplace.emptyResults")}
            </p>
            {mp.activeTab !== "browse" && (
              <button
                onClick={() => mp.setActiveTab("browse")}
                className="text-xs text-nx-accent hover:underline"
              >
                {t("studio.marketplace.browseAll")}
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
            <span className="text-[10px] text-nx-ink-3">
              {mp.totalCount} {t("studio.marketplace.themes")} •{" "}
              {t("studio.marketplace.page")} {mp.page}/{totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => mp.setPage(mp.page - 1)}
                disabled={mp.page <= 1}
                className="flex h-6 w-6 items-center justify-center rounded-nx-control border border-nx-line text-nx-ink-3 hover:bg-nx-hover disabled:opacity-30"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                onClick={() => mp.setPage(mp.page + 1)}
                disabled={mp.page >= totalPages}
                className="flex h-6 w-6 items-center justify-center rounded-nx-control border border-nx-line text-nx-ink-3 hover:bg-nx-hover disabled:opacity-30"
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
          "group flex cursor-pointer items-center gap-3 rounded-nx-md border p-2.5 transition-[border-color,background-color,box-shadow] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
          isPreviewing
            ? "border-[color:color-mix(in_srgb,var(--nx-accent)_50%,transparent)] bg-[color:color-mix(in_srgb,var(--nx-accent)_5%,transparent)] ring-1 ring-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)]"
            : theme.isApplied
              ? "border-[color:color-mix(in_srgb,var(--nx-accent)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--nx-accent)_5%,transparent)]"
              : "border-nx-line hover:border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] hover:bg-nx-hover",
          theme.deprecationNotice && "opacity-60"
        )}
        onClick={onPreview}
      >
        {/* Color dot */}
        <div
          className="h-8 w-8 shrink-0 rounded-nx-sm shadow-inner"
          style={{ backgroundColor: theme.accentColor || "#6b7280" }}
        />
        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-medium text-nx-ink">{theme.name}</span>
            {theme.isNew && (
              <span className="flex items-center gap-0.5 text-[9px] text-warning">
                <Sparkles className="h-2.5 w-2.5" />
                {t("studio.marketplace.new")}
              </span>
            )}
            {theme.isApplied && <Check className="h-3 w-3 shrink-0 text-nx-accent" />}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-medium", badge.color)}>
              {t(badge.labelKey, badge.labelParams)}
            </span>
            <span className="text-[9px] text-nx-ink-3">
              {theme.usageCount} {t("studio.marketplace.uses")}
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
            className="flex h-6 w-6 items-center justify-center rounded-nx-control transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover"
          >
            <Heart
              className={cn(
                "h-3 w-3",
                theme.isFavorited ? "fill-destructive text-destructive" : "text-nx-ink-3"
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
              "flex h-6 w-6 items-center justify-center rounded-nx-control transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              isPreviewing
                ? "bg-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] text-nx-accent"
                : "text-nx-ink-3 hover:bg-nx-hover"
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
              className="h-6 rounded-nx-control bg-nx-accent-fill px-2 text-[10px] text-nx-on-fill transition-colors duration-nx-micro ease-nx-enter hover:bg-[color:color-mix(in_srgb,var(--nx-accent-fill)_90%,transparent)] motion-reduce:transition-none"
            >
              {t("studio.marketplace.apply")}
            </button>
          ) : theme.isBuyable ? (
            <button
              disabled
              className="flex h-6 cursor-not-allowed items-center gap-0.5 rounded-nx-control border border-[color:color-mix(in_srgb,var(--nx-accent)_40%,transparent)] px-2 text-[10px] text-nx-accent opacity-80"
            >
              <ShoppingCart className="h-2.5 w-2.5" />
              {theme.price ? formatCurrency(theme.price, theme.priceCurrency || "USD") : t("studio.marketplace.buy")}
            </button>
          ) : (
            <Lock className="h-3 w-3 text-nx-ink-3" />
          )}
        </div>
      </div>
    );
  }

  // ── Grid view ──
  return (
    <div
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-nx-md border transition-[border-color,box-shadow] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
        isPreviewing
          ? "border-[color:color-mix(in_srgb,var(--nx-accent)_50%,transparent)] ring-1 ring-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)]"
          : theme.isApplied
            ? "border-[color:color-mix(in_srgb,var(--nx-accent)_40%,transparent)] ring-1 ring-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)]"
            : "border-nx-line hover:border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)]",
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
        <div className="absolute start-1.5 top-1.5 flex gap-1">
          {theme.isNew && (
            <span className="flex items-center gap-0.5 rounded-full bg-warning px-1.5 py-0.5 text-[9px] font-bold text-warning-foreground">
              <Sparkles className="h-2.5 w-2.5" /> {t("studio.marketplace.new")}
            </span>
          )}
          {theme.isFeatured && !theme.isNew && (
            <span className="flex items-center gap-0.5 rounded-full bg-[color:color-mix(in_srgb,var(--nx-ground)_90%,transparent)] px-1.5 py-0.5 text-[9px] font-bold text-nx-ink">
              <Crown className="h-2.5 w-2.5" /> <Star className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
            </span>
          )}
          {isPreviewing && (
            <span className="flex items-center gap-0.5 rounded-full bg-nx-accent-fill px-1.5 py-0.5 text-[9px] font-bold text-nx-on-fill">
              <Eye className="h-2.5 w-2.5" /> {t("studio.marketplace.preview")}
            </span>
          )}
        </div>
        {/* Applied badge */}
        {theme.isApplied && (
          <div className="absolute end-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-nx-accent-fill px-1.5 py-0.5 text-[9px] font-bold text-nx-on-fill">
            <Check className="h-2.5 w-2.5" /> {t("studio.marketplace.active")}
          </div>
        )}
        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          disabled={isTogglingFavorite}
          className="absolute bottom-1.5 end-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--nx-ink)_30%,transparent)] transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-[color:color-mix(in_srgb,var(--nx-ink)_50%,transparent)]"
        >
          <Heart
            className={cn(
              "h-3 w-3",
              theme.isFavorited ? "fill-destructive text-destructive" : "text-white"
            )}
          />
        </button>
        {/* Feature icons */}
        <div className="absolute bottom-1.5 start-1.5 flex gap-1">
          {theme.hasDarkMode && <Moon className="h-3 w-3 text-white/80" />}
          {theme.hasAccessibilityPreset && <ShieldCheck className="h-3 w-3 text-white/80" />}
          {theme.hasContentBlocks && <Blocks className="h-3 w-3 text-white/80" />}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-2.5">
        <div className="flex items-start justify-between">
          <span className="line-clamp-1 text-[11px] font-semibold leading-tight text-nx-ink">
            {theme.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-medium", badge.color)}>
            {t(badge.labelKey, badge.labelParams)}
          </span>
          <span className="flex items-center gap-0.5 text-[9px] text-nx-ink-3">
            <Download className="h-2.5 w-2.5" /> {theme.usageCount}
          </span>
          <span className="flex items-center gap-0.5 text-[9px] text-nx-ink-3">
            <Heart className="h-2.5 w-2.5" /> {theme.likeCount}
          </span>
        </div>

        {/* Apply / Confirm */}
        {confirmApply ? (
          <div className="mt-1 flex flex-col gap-1">
            <p className="text-[9px] text-nx-ink-3">{t("studio.marketplace.applyToDraft")}</p>
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyConfirm(false);
                }}
                disabled={isApplying}
                className="h-6 flex-1 rounded-nx-control bg-nx-accent-fill text-[9px] text-nx-on-fill hover:bg-[color:color-mix(in_srgb,var(--nx-accent-fill)_90%,transparent)] disabled:opacity-50"
              >
                {isApplying ? (
                  <LoadingSpinner size="inline" className="mx-auto" />
                ) : (
                  t("studio.marketplace.replace")
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyConfirm(true);
                }}
                disabled={isApplying}
                className="h-6 flex-1 rounded-nx-control border border-nx-accent text-[9px] text-nx-accent hover:bg-nx-accent-wash disabled:opacity-50"
              >
                {t("studio.marketplace.merge")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyCancel();
                }}
                className="flex h-6 w-6 items-center justify-center rounded-nx-control border border-nx-line text-nx-ink-3 hover:bg-nx-hover"
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
                "flex h-6 flex-1 items-center justify-center gap-1 rounded-nx-control border text-[9px] transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                isPreviewing
                  ? "border-nx-accent bg-nx-accent-wash text-nx-accent"
                  : "border-nx-line text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"
              )}
            >
              <Eye className="h-3 w-3" />{" "}
              {isPreviewing ? t("studio.marketplace.exit") : t("studio.marketplace.preview")}
            </button>
            {/* Apply — only if available */}
            {theme.isAvailable ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyClick();
                }}
                className="flex h-6 flex-1 items-center justify-center gap-1 rounded-nx-control bg-nx-accent-fill text-[9px] text-nx-on-fill transition-colors duration-nx-micro ease-nx-enter hover:bg-[color:color-mix(in_srgb,var(--nx-accent-fill)_90%,transparent)] motion-reduce:transition-none"
              >
                <Paintbrush className="h-3 w-3" /> {t("studio.marketplace.apply")}
              </button>
            ) : theme.isBuyable ? (
              <button
                disabled
                className="flex h-6 flex-1 cursor-not-allowed items-center justify-center gap-1 rounded-nx-control border border-[color:color-mix(in_srgb,var(--nx-accent)_40%,transparent)] text-[9px] text-nx-accent opacity-80"
                title="Contact your system administrator to purchase this theme"
              >
                <ShoppingCart className="h-3 w-3" />
                {theme.price ? formatCurrency(theme.price, theme.priceCurrency || "USD") : t("studio.marketplace.buy")}
              </button>
            ) : (
              <div className="flex h-6 flex-1 items-center justify-center gap-1 rounded-nx-control border border-warning/50 bg-warning/5 text-[9px] text-warning">
                <Lock className="h-3 w-3" /> {t("studio.marketplace.upgrade")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
