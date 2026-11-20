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
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";

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
  const selectedTheme = mp.selectedTheme;
  useEffect(() => {
    if (previewingSlug && selectedTheme?.slug === previewingSlug && selectedTheme.themeDataJson) {
      onPreviewTheme?.(selectedTheme.themeDataJson);
    }
  }, [selectedTheme, previewingSlug, onPreviewTheme]);

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
          <Button
            key={tab}
            type="button"
            variant="ghost"
            onClick={() => mp.setActiveTab(tab)}
            className={cn(
              "relative h-auto flex-1 rounded-none px-3 py-2.5 text-xs font-medium transition-colors duration-nx-micro ease-nx-enter hover:bg-transparent motion-reduce:transition-none",
              mp.activeTab === tab
                ? "text-nx-accent hover:text-nx-accent"
                : "text-nx-ink-3 hover:text-nx-ink"
            )}
          >
            {tab === "browse" && t("studio.marketplace.tabBrowse")}
            {tab === "featured" && t("studio.marketplace.tabFeatured")}
            {tab === "favorites" && t("studio.marketplace.tabFavorites")}
            {mp.activeTab === tab && (
              <div className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-nx-accent-fill" />
            )}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4">
        {/* ── Search + Controls ── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-nx-ink-3" />
            <Input
              type="text"
              placeholder={t("studio.marketplace.search")}
              value={mp.filters.search}
              onChange={(e) => mp.setFilters({ search: e.target.value })}
              className="h-8 pe-7 ps-8 text-xs"
            />
            {mp.filters.search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => mp.setFilters({ search: "" })}
                aria-label={t("common.clear")}
                className="absolute end-1.5 top-1/2 h-5 w-5 -translate-y-1/2 p-0 text-nx-ink-3 hover:bg-transparent hover:text-nx-ink"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-nx-control border p-0 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              showFilters
                ? "border-nx-accent bg-nx-accent-wash text-nx-accent hover:bg-nx-accent-wash hover:text-nx-accent"
                : "border-nx-line text-nx-ink-3 hover:text-nx-ink"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
          </Button>
          <div className="flex overflow-hidden rounded-nx-control border border-nx-line">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => mp.setViewMode("grid")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-none p-0 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                mp.viewMode === "grid"
                  ? "bg-nx-accent-wash text-nx-accent hover:bg-nx-accent-wash hover:text-nx-accent"
                  : "text-nx-ink-3 hover:text-nx-ink"
              )}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => mp.setViewMode("list")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-none p-0 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                mp.viewMode === "list"
                  ? "bg-nx-accent-wash text-nx-accent hover:bg-nx-accent-wash hover:text-nx-accent"
                  : "text-nx-ink-3 hover:text-nx-ink"
              )}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ── Filters (collapsible) ── */}
        {showFilters && (
          <div className="flex flex-col gap-2 rounded-nx-md border border-nx-line bg-[color:color-mix(in_srgb,var(--nx-raised)_20%,transparent)] p-3">
            <div className="flex gap-2">
              <Select
                value={mp.filters.category || "__all__"}
                onValueChange={(v) => mp.setFilters({ category: v === "__all__" ? "" : v })}
              >
                <SelectTrigger className="h-7 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEME_CATEGORIES.map((c) => (
                    <SelectItem key={c.value || "__all__"} value={c.value || "__all__"}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={mp.filters.sortBy}
                onValueChange={(v) => mp.setFilters({ sortBy: v })}
              >
                <SelectTrigger className="h-7 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEME_SORT_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Button
                  key={key}
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    mp.setFilters({
                      [key]: mp.filters[key as keyof typeof mp.filters] ? undefined : true,
                    })
                  }
                  className={cn(
                    "flex h-auto items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-normal transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    mp.filters[key as keyof typeof mp.filters]
                      ? "border-nx-accent bg-nx-accent-wash text-nx-accent hover:bg-nx-accent-wash hover:text-nx-accent"
                      : "border-nx-line text-nx-ink-3 hover:text-nx-ink"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {t(labelKey)}
                </Button>
              ))}
              {(mp.filters.category ||
                mp.filters.isFree ||
                mp.filters.hasDarkMode ||
                mp.filters.hasAccessibility) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={mp.resetFilters}
                  className="flex h-auto items-center gap-1 rounded-full px-2 py-1 text-[10px] font-normal text-destructive hover:bg-transparent hover:text-destructive hover:underline"
                >
                  <X className="h-3 w-3" /> {t("studio.marketplace.clear")}
                </Button>
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
              <Button
                type="button"
                variant="ghost"
                onClick={() => mp.setActiveTab("browse")}
                className="h-auto p-0 text-xs font-normal text-nx-accent hover:bg-transparent hover:text-nx-accent hover:underline"
              >
                {t("studio.marketplace.browseAll")}
              </Button>
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
              {mp.totalCount} {t("studio.marketplace.themes")} • {t("studio.marketplace.page")}{" "}
              {mp.page}/{totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => mp.setPage(mp.page - 1)}
                disabled={mp.page <= 1}
                className="flex h-6 w-6 items-center justify-center rounded-nx-control border border-nx-line p-0 text-nx-ink-3 hover:bg-nx-hover disabled:opacity-30"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => mp.setPage(mp.page + 1)}
                disabled={mp.page >= totalPages}
                className="flex h-6 w-6 items-center justify-center rounded-nx-control border border-nx-line p-0 text-nx-ink-3 hover:bg-nx-hover disabled:opacity-30"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            disabled={isTogglingFavorite}
            className="flex h-6 w-6 items-center justify-center rounded-nx-control p-0 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none"
          >
            <Heart
              className={cn(
                "h-3 w-3",
                theme.isFavorited ? "fill-destructive text-destructive" : "text-nx-ink-3"
              )}
            />
          </Button>
          {/* Preview always visible */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-nx-control p-0 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              isPreviewing
                ? "bg-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] text-nx-accent hover:bg-[color:color-mix(in_srgb,var(--nx-accent)_25%,transparent)] hover:text-nx-accent"
                : "text-nx-ink-3 hover:bg-nx-hover"
            )}
          >
            <Eye className="h-3 w-3" />
          </Button>
          {/* Apply — only if available */}
          {theme.isAvailable ? (
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onApplyClick();
              }}
              className="h-6 rounded-nx-control bg-nx-accent-fill px-2 text-[10px] font-normal text-nx-on-fill transition-colors duration-nx-micro ease-nx-enter hover:bg-[color:color-mix(in_srgb,var(--nx-accent-fill)_90%,transparent)] hover:text-nx-on-fill motion-reduce:transition-none"
            >
              {t("studio.marketplace.apply")}
            </Button>
          ) : theme.isBuyable ? (
            <Button
              type="button"
              variant="ghost"
              disabled
              className="flex h-6 cursor-not-allowed items-center gap-0.5 rounded-nx-control border border-[color:color-mix(in_srgb,var(--nx-accent)_40%,transparent)] px-2 text-[10px] font-normal text-nx-accent opacity-80"
            >
              <ShoppingCart className="h-2.5 w-2.5" />
              {theme.price
                ? formatCurrency(theme.price, theme.priceCurrency || "USD")
                : t("studio.marketplace.buy")}
            </Button>
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
              <Crown className="h-2.5 w-2.5" />{" "}
              <Star className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          disabled={isTogglingFavorite}
          className="absolute bottom-1.5 end-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--nx-ink)_30%,transparent)] p-0 transition-colors duration-nx-micro ease-nx-enter hover:bg-[color:color-mix(in_srgb,var(--nx-ink)_50%,transparent)] motion-reduce:transition-none"
        >
          <Heart
            className={cn(
              "h-3 w-3",
              theme.isFavorited ? "fill-destructive text-destructive" : "text-[var(--scripe-white)]"
            )}
          />
        </Button>
        {/* Feature icons */}
        <div className="absolute bottom-1.5 start-1.5 flex gap-1">
          {theme.hasDarkMode && <Moon className="h-3 w-3 text-[color:color-mix(in_srgb,var(--scripe-white)_80%,transparent)]" />}
          {theme.hasAccessibilityPreset && <ShieldCheck className="h-3 w-3 text-[color:color-mix(in_srgb,var(--scripe-white)_80%,transparent)]" />}
          {theme.hasContentBlocks && <Blocks className="h-3 w-3 text-[color:color-mix(in_srgb,var(--scripe-white)_80%,transparent)]" />}
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
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyConfirm(false);
                }}
                disabled={isApplying}
                className="h-6 flex-1 rounded-nx-control bg-nx-accent-fill p-0 text-[9px] font-normal text-nx-on-fill hover:bg-[color:color-mix(in_srgb,var(--nx-accent-fill)_90%,transparent)] hover:text-nx-on-fill disabled:opacity-50"
              >
                {isApplying ? (
                  <LoadingSpinner size="inline" className="mx-auto" />
                ) : (
                  t("studio.marketplace.replace")
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyConfirm(true);
                }}
                disabled={isApplying}
                className="h-6 flex-1 rounded-nx-control border border-nx-accent p-0 text-[9px] font-normal text-nx-accent hover:bg-nx-accent-wash hover:text-nx-accent disabled:opacity-50"
              >
                {t("studio.marketplace.merge")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyCancel();
                }}
                className="flex h-6 w-6 items-center justify-center rounded-nx-control border border-nx-line p-0 text-nx-ink-3 hover:bg-nx-hover"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex gap-1">
            {/* Preview — ALWAYS visible for all themes */}
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className={cn(
                "flex h-6 flex-1 items-center justify-center gap-1 rounded-nx-control border p-0 text-[9px] font-normal transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                isPreviewing
                  ? "border-nx-accent bg-nx-accent-wash text-nx-accent hover:bg-nx-accent-wash hover:text-nx-accent"
                  : "border-nx-line text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"
              )}
            >
              <Eye className="h-3 w-3" />{" "}
              {isPreviewing ? t("studio.marketplace.exit") : t("studio.marketplace.preview")}
            </Button>
            {/* Apply — only if available */}
            {theme.isAvailable ? (
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyClick();
                }}
                className="flex h-6 flex-1 items-center justify-center gap-1 rounded-nx-control bg-nx-accent-fill p-0 text-[9px] font-normal text-nx-on-fill transition-colors duration-nx-micro ease-nx-enter hover:bg-[color:color-mix(in_srgb,var(--nx-accent-fill)_90%,transparent)] hover:text-nx-on-fill motion-reduce:transition-none"
              >
                <Paintbrush className="h-3 w-3" /> {t("studio.marketplace.apply")}
              </Button>
            ) : theme.isBuyable ? (
              <Button
                type="button"
                variant="ghost"
                disabled
                className="flex h-6 flex-1 cursor-not-allowed items-center justify-center gap-1 rounded-nx-control border border-[color:color-mix(in_srgb,var(--nx-accent)_40%,transparent)] p-0 text-[9px] font-normal text-nx-accent opacity-80"
                title={t("studio.marketplace.contactAdminToBuy")}
              >
                <ShoppingCart className="h-3 w-3" />
                {theme.price
                  ? formatCurrency(theme.price, theme.priceCurrency || "USD")
                  : t("studio.marketplace.buy")}
              </Button>
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
