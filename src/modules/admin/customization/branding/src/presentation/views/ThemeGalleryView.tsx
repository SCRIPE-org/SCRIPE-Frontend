/* eslint-disable @typescript-eslint/no-explicit-any */
// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout — native <button> used for category filter
// pills and theme card overlay controls where @core/ui/button's sizing would break
// the compact card grid layout. Action buttons (Apply, Preview) use <Button>.
/**
 * Theme Gallery View — Full-Page Theme Browsing Experience
 *
 * Rich gallery for tenant admins to browse, preview, and apply themes.
 * Features:
 * - Hero section with featured carousel
 * - Category tabs with counts
 * - Rich filter bar (free, dark, a11y, sort)
 * - Theme grid with mini color-preview cards
 * - Pagination
 * - All strings use i18n via t()
 *
 * Route: /settings/themes/gallery (or accessed via sidebar)
 *
 * @module customization/presentation
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@/core/common/utils";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { EmptyState } from "@core/ui/empty-state";
import {
  Search,
  Heart,
  Sparkles,
  Star,
  Eye,
  Paintbrush,
  X,
  Lock,
  Moon,
  ShieldCheck,
  Blocks,
  Crown,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Check,
  Filter,
  ArrowUpDown,
  Palette,
  Accessibility,
  RotateCcw,
} from "lucide-react";
import { useThemeGalleryViewModel } from "../viewmodels/useThemeGalleryViewModel";
import { ThemeDetailModal } from "../components/ThemeDetailModal";
import { BundleGalleryTab } from "../components/BundleGalleryTab";
import type { ThemeCard } from "../../domain/entities/ThemeCard";

const G = "studio.gallery";

/**
 * Perceived (WCAG relative) luminance of a hex colour, 0 (black) - 1 (white).
 * Unparseable input is treated as light so callers fall back to dark ink.
 */
function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) return 1;
  const channel = (start: number) => {
    const c = parseInt(full.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/**
 * The mini login-form mockup on each card draws structural "ink" directly over
 * the tenant's arbitrary accent colour, so the ink shade is derived from that
 * colour's own luminance rather than assumed white — a near-white accent must
 * not render invisible near-white marks on itself.
 */
function inkBaseFor(bgHex: string): "white" | "black" {
  return relativeLuminance(bgHex) > 0.5 ? "black" : "white";
}

const SORT_KEYS = ["popular", "newest", "trending", "nameAsc", "nameDesc"] as const;

/**
 * Presentation UI component rendering the theme gallery view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ThemeGalleryView() {
  const { t } = useI18n();
  const vm = useThemeGalleryViewModel();
  const [showFilters, setShowFilters] = useState(false);
  const [confirmApplySlug, setConfirmApplySlug] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <div className="mb-8 rounded-nx-lg border border-nx-line bg-nx-surface px-8 py-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Palette className="h-8 w-8 text-nx-accent" aria-hidden="true" />
          <h1 className="text-balance text-3xl font-bold tracking-tight text-nx-ink">
            {t(`${G}.heroTitle`)}
          </h1>
        </div>
        <p className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-nx-ink-2">
          {t(`${G}.heroSubtitle`)}
        </p>

        {/* Featured mini-carousel */}
        {vm.featuredThemes.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {vm.featuredThemes.slice(0, 5).map((theme) => (
              <button
                type="button"
                key={theme.slug}
                className="group flex flex-col items-center gap-1.5"
                onClick={() => vm.setPreviewSlug(theme.slug)}
              >
                <div
                  className="h-12 w-12 rounded-nx-md border border-nx-line shadow-nx-sm transition-colors duration-nx-micro group-hover:border-nx-accent group-focus-visible:border-nx-accent motion-reduce:transition-none"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accentColor || "#6b7280"}, color-mix(in srgb, ${theme.accentColor || "#6b7280"} 60%, black))`,
                  }}
                  aria-hidden="true"
                />
                <span className="max-w-[60px] truncate text-[10px] font-medium text-nx-ink-2">
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab Bar ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-nx-md border border-nx-line bg-nx-raised p-1">
          {(["browse", "featured", "favorites", "bundles"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => vm.setActiveTab(tab)}
              aria-pressed={vm.activeTab === tab}
              className={cn(
                "rounded-nx-control px-4 py-2 text-sm font-medium transition-colors duration-nx-micro motion-reduce:transition-none",
                "focus-visible:shadow-nx-focus focus-visible:outline-none",
                vm.activeTab === tab
                  ? "bg-nx-surface text-nx-ink shadow-nx-sm"
                  : "text-nx-ink-2 hover:text-nx-ink"
              )}
            >
              {tab === "browse" && t(`${G}.browseAll`)}
              {tab === "featured" && t(`studio.marketplace.featured`)}
              {tab === "favorites" && t(`studio.marketplace.favorites`)}
              {tab === "bundles" && t(`studio.bundles.title`)}
            </button>
          ))}
        </div>

        {/* Results count + Sort */}
        <div className="flex items-center gap-3">
          {!vm.isLoading && (
            <span className="text-xs text-nx-ink-2">
              {t(`${G}.resultsCount`, { count: vm.totalCount })}
            </span>
          )}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
            <Select
              value={vm.filters.sortBy}
              onValueChange={(value) => vm.setFilters({ sortBy: value as any })}
            >
              <SelectTrigger className="h-8 w-auto gap-1.5 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`${G}.sort.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Bundles Tab ── */}
      {vm.activeTab === "bundles" && <BundleGalleryTab />}

      {/* ── Category Chips + Filters ── */}
      {vm.activeTab === "browse" && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {vm.categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => vm.setFilters({ category: cat })}
                aria-pressed={vm.filters.category === cat}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-nx-micro motion-reduce:transition-none",
                  "focus-visible:shadow-nx-focus focus-visible:outline-none",
                  vm.filters.category === cat
                    ? "border-nx-accent bg-nx-accent-fill text-nx-on-fill shadow-nx-sm"
                    : "border-nx-line text-nx-ink-2 hover:border-nx-line-hi hover:text-nx-ink"
                )}
              >
                {t(`${G}.categories.${cat}`)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder={t(`${G}.searchPlaceholder`)}
              value={vm.filters.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                vm.setFilters({ search: e.target.value })
              }
              className="h-9 ps-9 text-sm"
            />
            {vm.filters.search && (
              <button
                type="button"
                onClick={() => vm.setFilters({ search: "" })}
                aria-label={t("common.clear")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-nx-ink-3 hover:text-nx-ink"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            aria-pressed={showFilters}
            className="gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            {t(`${G}.filters.title`)}
          </Button>

          {/* Clear filters */}
          {vm.hasActiveFilters && (
            <button
              type="button"
              onClick={vm.resetFilters}
              className="flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              {t(`${G}.clearFilters`)}
            </button>
          )}
        </div>
      )}

      {/* ── Filter Chips (collapsible) ── */}
      {showFilters && vm.activeTab === "browse" && (
        <div className="mb-6 flex flex-wrap gap-2 rounded-nx-lg border border-nx-line bg-nx-raised p-4">
          {(
            [
              { key: "isFree", label: t(`${G}.filters.freeOnly`), icon: Sparkles },
              { key: "hasDarkMode", label: t(`${G}.filters.darkMode`), icon: Moon },
              { key: "hasAccessibility", label: t(`${G}.filters.accessible`), icon: Accessibility },
              { key: "hasContentBlocks", label: t(`${G}.filters.contentBlocks`), icon: Blocks },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              type="button"
              key={key}
              onClick={() =>
                vm.setFilters({
                  [key]: vm.filters[key as keyof typeof vm.filters] ? undefined : true,
                })
              }
              aria-pressed={!!vm.filters[key as keyof typeof vm.filters]}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors duration-nx-micro motion-reduce:transition-none",
                "focus-visible:shadow-nx-focus focus-visible:outline-none",
                vm.filters[key as keyof typeof vm.filters]
                  ? "border-nx-accent bg-nx-accent-wash font-medium text-nx-accent"
                  : "border-nx-line text-nx-ink-2 hover:border-nx-line-hi hover:text-nx-ink"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {vm.isLoading && <LoadingSpinner size="lg" />}

      {/* ── Empty State ── */}
      {!vm.isLoading && vm.themes.length === 0 && (
        <EmptyState
          icon={Paintbrush}
          size="lg"
          title={vm.activeTab === "favorites" ? t(`${G}.emptyFavorites`) : t(`${G}.noResults`)}
          description={
            vm.activeTab === "favorites" ? t(`${G}.emptyFavoritesHint`) : t(`${G}.noResultsHint`)
          }
          action={
            vm.activeTab === "favorites" ? (
              <Button variant="outline" size="sm" onClick={() => vm.setActiveTab("browse")}>
                {t(`${G}.browseThemes`)}
              </Button>
            ) : vm.hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={vm.resetFilters}>
                <RotateCcw className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {t(`${G}.clearFilters`)}
              </Button>
            ) : undefined
          }
        />
      )}

      {/* ── Theme Grid ── */}
      {!vm.isLoading && vm.themes.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vm.themes.map((theme) => (
            <GalleryThemeCard
              key={theme.slug}
              theme={theme}
              isPreviewing={vm.previewSlug === theme.slug}
              isConfirmingApply={confirmApplySlug === theme.slug}
              isApplying={vm.isApplying && confirmApplySlug === theme.slug}
              onPreview={() => vm.setPreviewSlug(vm.previewSlug === theme.slug ? null : theme.slug)}
              onOpenDetail={() => vm.openDetail(theme.slug)}
              onToggleFavorite={() => vm.toggleFavorite(theme.slug)}
              onApplyClick={() => setConfirmApplySlug(theme.slug)}
              onApplyConfirm={(merge) => {
                vm.applyTheme(theme.slug, merge);
                setConfirmApplySlug(null);
              }}
              onApplyCancel={() => setConfirmApplySlug(null)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {vm.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => vm.setPage(vm.page - 1)}
            disabled={vm.page <= 1}
            aria-label={t("table.previousPage")}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(vm.totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (vm.totalPages <= 7) {
                pageNum = i + 1;
              } else if (vm.page <= 4) {
                pageNum = i + 1;
              } else if (vm.page >= vm.totalPages - 3) {
                pageNum = vm.totalPages - 6 + i;
              } else {
                pageNum = vm.page - 3 + i;
              }
              return (
                <button
                  type="button"
                  key={pageNum}
                  onClick={() => vm.setPage(pageNum)}
                  aria-current={vm.page === pageNum ? "page" : undefined}
                  aria-label={`${t("table.goToPage")} ${pageNum}`}
                  className={cn(
                    "h-8 w-8 rounded-nx-control text-xs font-medium transition-colors duration-nx-micro motion-reduce:transition-none",
                    "focus-visible:shadow-nx-focus focus-visible:outline-none",
                    vm.page === pageNum
                      ? "bg-nx-accent-fill text-nx-on-fill shadow-nx-sm"
                      : "text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => vm.setPage(vm.page + 1)}
            disabled={vm.page >= vm.totalPages}
            aria-label={t("table.nextPage")}
            className="gap-1"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* ── Theme Detail Modal ── */}
      <ThemeDetailModal
        theme={vm.selectedDetail}
        isOpen={!!vm.detailSlug}
        onClose={vm.closeDetail}
        onApply={(slug, merge) => vm.applyTheme(slug, merge)}
        onToggleFavorite={(slug) => vm.toggleFavorite(slug)}
        isApplying={vm.isApplying}
        themeDataJson={(vm.selectedDetail as any)?.themeDataJson ?? null}
      />
    </div>
  );
}

// ── Gallery Theme Card ────────────────────────────────────────

interface GalleryThemeCardProps {
  theme: ThemeCard;
  isPreviewing: boolean;
  isConfirmingApply: boolean;
  isApplying: boolean;
  onPreview: () => void;
  onOpenDetail: () => void;
  onToggleFavorite: () => void;
  onApplyClick: () => void;
  onApplyConfirm: (merge: boolean) => void;
  onApplyCancel: () => void;
}

function GalleryThemeCard({
  theme,
  isPreviewing,
  isConfirmingApply,
  isApplying,
  onPreview,
  onOpenDetail,
  onToggleFavorite,
  onApplyClick,
  onApplyConfirm,
  onApplyCancel,
}: GalleryThemeCardProps) {
  const { t } = useI18n();
  const accentColor = theme.accentColor || "#6b7280";
  const mockInk = inkBaseFor(accentColor);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-nx-lg border transition-colors duration-nx-standard motion-reduce:transition-none",
        isPreviewing
          ? "border-nx-accent ring-1 ring-nx-accent"
          : theme.isApplied
            ? "border-nx-accent"
            : "border-nx-line hover:border-nx-line-hi",
        theme.isDeprecated && "opacity-60"
      )}
    >
      {/* ── Color Preview Area ── */}
      <div
        role="button"
        tabIndex={0}
        aria-label={t("studio.marketplace.preview")}
        aria-pressed={isPreviewing}
        className="relative h-32 w-full cursor-pointer overflow-hidden focus-visible:shadow-nx-focus focus-visible:outline-none"
        onClick={onPreview}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onPreview();
          }
        }}
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 50%, black) 100%)`,
        }}
      >
        {/* Mock login form mini-preview */}
        <div className="absolute inset-4 flex items-center justify-center" aria-hidden="true">
          <div
            className="w-full max-w-[120px] space-y-1.5 rounded-nx-md px-4 py-3"
            style={{ background: `color-mix(in srgb, ${mockInk} 12%, transparent)` }}
          >
            <div
              className="h-1.5 w-8 rounded-full"
              style={{ background: `color-mix(in srgb, ${mockInk} 45%, transparent)` }}
            />
            <div
              className="h-4 w-full rounded-nx-sm border"
              style={{
                borderColor: `color-mix(in srgb, ${mockInk} 20%, transparent)`,
                background: `color-mix(in srgb, ${mockInk} 15%, transparent)`,
              }}
            />
            <div
              className="h-4 w-full rounded-nx-sm border"
              style={{
                borderColor: `color-mix(in srgb, ${mockInk} 20%, transparent)`,
                background: `color-mix(in srgb, ${mockInk} 15%, transparent)`,
              }}
            />
            <div
              className="h-4 w-full rounded-nx-sm"
              style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 80%, ${mockInk})` }}
            />
          </div>
        </div>

        {/* Top-left badges */}
        <div className="absolute start-2 top-2 flex gap-1.5">
          {theme.isFeatured && (
            <Badge className="h-5 gap-0.5 border-0 bg-warning px-1.5 py-0 text-[9px] text-warning-foreground">
              <Star className="h-2.5 w-2.5 fill-warning-foreground" aria-hidden="true" />
              {t(`${G}.card.featured`)}
            </Badge>
          )}
          {theme.isNew && (
            <Badge className="h-5 gap-0.5 border-0 bg-success px-1.5 py-0 text-[9px] text-success-foreground">
              <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
              {t(`${G}.card.new`)}
            </Badge>
          )}
          {isPreviewing && (
            <Badge className="h-5 gap-0.5 border-0 bg-nx-accent-fill px-1.5 py-0 text-[9px] text-nx-on-fill">
              <Eye className="h-2.5 w-2.5" aria-hidden="true" />
              {t(`${G}.card.preview`)}
            </Badge>
          )}
        </div>

        {/* Applied badge */}
        {theme.isApplied && (
          <div className="absolute end-2 top-2">
            <Badge className="h-5 gap-0.5 border-0 bg-nx-accent-fill px-1.5 py-0 text-[9px] text-nx-on-fill">
              <Check className="h-2.5 w-2.5" aria-hidden="true" />
              {t(`${G}.card.applied`)}
            </Badge>
          </div>
        )}

        {/* Favorite button — a fixed dark scrim (not the arbitrary accent) so the
            white glyph stays legible no matter how light the theme's accent is. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={
            theme.isFavorited ? t("studio.marketplace.favorited") : t("studio.marketplace.favorite")
          }
          aria-pressed={theme.isFavorited}
          className="absolute bottom-2 end-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 transition-colors duration-nx-micro hover:bg-black/60 motion-reduce:transition-none"
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 transition-colors duration-nx-micro motion-reduce:transition-none",
              theme.isFavorited ? "fill-destructive text-destructive" : "text-white"
            )}
            aria-hidden="true"
          />
        </button>

        {/* Feature icons */}
        <div className="absolute bottom-2 start-2 flex gap-1.5" aria-hidden="true">
          {theme.hasDarkMode && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40">
              <Moon className="h-3 w-3 text-white/80" />
            </div>
          )}
          {theme.hasAccessibilityPreset && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40">
              <ShieldCheck className="h-3 w-3 text-white/80" />
            </div>
          )}
          {theme.hasContentBlocks && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40">
              <Blocks className="h-3 w-3 text-white/80" />
            </div>
          )}
        </div>
      </div>

      {/* ── Card Info ── */}
      <div className="flex flex-col gap-2 p-4">
        {/* Name + Pricing */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-nx-ink">
              <button
                type="button"
                className="transition-colors duration-nx-micro hover:text-nx-accent motion-reduce:transition-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail();
                }}
              >
                {theme.name}
              </button>
            </h3>
            {theme.authorName && (
              <p className="mt-0.5 text-[10px] text-nx-ink-3">
                {t(`${G}.card.byAuthor`, { author: theme.authorName })}
              </p>
            )}
          </div>
          <PricingBadge theme={theme} />
        </div>

        {/* Description */}
        <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-nx-ink-2">
          {theme.description || ""}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[10px] text-nx-ink-3">
          <span className="flex items-center gap-1">
            <Paintbrush className="h-3 w-3" aria-hidden="true" />
            {t(`${G}.card.uses`, { count: theme.usageCount })}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" aria-hidden="true" />
            {theme.likeCount}
          </span>
          {theme.category && (
            <Badge variant="outline" className="h-4 px-1.5 py-0 text-[9px] capitalize">
              {theme.category}
            </Badge>
          )}
        </div>

        {/* ── Actions ── */}
        {isConfirmingApply ? (
          <div className="mt-1 flex flex-col gap-1.5">
            <p className="text-[10px] font-medium text-nx-ink-2">{t(`${G}.card.applyToDraft`)}</p>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="h-7 flex-1 text-xs"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onApplyConfirm(false);
                }}
                loading={isApplying}
              >
                {t(`${G}.card.replace`)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 flex-1 text-xs"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onApplyConfirm(true);
                }}
                disabled={isApplying}
              >
                {t(`${G}.card.merge`)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                aria-label={t("common.cancel")}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onApplyCancel();
                }}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex gap-2">
            {/* Preview */}
            <Button
              variant={isPreviewing ? "default" : "outline"}
              size="sm"
              className="h-8 flex-1 gap-1.5 text-xs"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onPreview();
              }}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              {isPreviewing ? t(`${G}.card.exitPreview`) : t(`${G}.card.preview`)}
            </Button>

            {/* Apply / Buy / Locked */}
            {theme.isAvailable ? (
              <Button
                size="sm"
                className="h-8 flex-1 gap-1.5 text-xs"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onApplyClick();
                }}
              >
                <Paintbrush className="h-3.5 w-3.5" aria-hidden="true" />
                {t(`${G}.card.apply`)}
              </Button>
            ) : theme.isBuyable ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-8 flex-1 gap-1.5 border-nx-accent text-xs text-nx-accent"
              >
                <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                {theme.price ? `$${theme.price.toFixed(0)}` : t(`${G}.card.buy`)}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-8 flex-1 gap-1.5 border-warning text-xs text-warning"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                {t(`${G}.card.upgrade`)}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pricing Badge ─────────────────────────────────────────────

function PricingBadge({ theme }: { theme: ThemeCard }) {
  const { t } = useI18n();
  if (theme.isFree) {
    return (
      <Badge className="shrink-0 border-success/20 bg-success/10 text-[10px] font-semibold text-success">
        <Sparkles className="me-0.5 h-3 w-3" aria-hidden="true" />
        {t("studio.marketplace.free")}
      </Badge>
    );
  }
  if (theme.isIncluded) {
    return (
      <Badge className="shrink-0 border-info/20 bg-info/10 text-[10px] font-semibold text-info">
        {t("studio.marketplace.included")}
      </Badge>
    );
  }
  if (theme.isPurchased) {
    return (
      <Badge className="shrink-0 border-nx-accent text-[10px] font-semibold text-nx-accent">
        {t("studio.marketplace.purchased")}
      </Badge>
    );
  }
  if (theme.isBuyable) {
    return (
      <Badge className="shrink-0 border-nx-accent text-[10px] font-semibold text-nx-accent">
        <Crown className="me-0.5 h-3 w-3" aria-hidden="true" />
        {theme.price ? `$${theme.price.toFixed(0)}` : t(`${G}.card.buy`)}
      </Badge>
    );
  }
  return (
    <Badge className="shrink-0 border-warning/20 bg-warning/10 text-[10px] font-semibold text-warning">
      <Lock className="me-0.5 h-3 w-3" aria-hidden="true" />
      {t(`${G}.card.locked`)}
    </Badge>
  );
}
