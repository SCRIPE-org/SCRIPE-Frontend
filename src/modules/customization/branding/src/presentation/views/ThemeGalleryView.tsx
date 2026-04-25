/**
 * Theme Gallery View — Full-Page Theme Browsing Experience
 *
 * Rich gallery for tenant admins to browse, preview, and apply themes.
 * Features:
 * - Animated hero section with featured carousel
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
// UI-EXCEPTION: compact gallery layout — native <button> used for category filter
// pills and theme card overlay controls where @core/ui/button's sizing would break
// the compact card grid layout. Action buttons (Apply, Preview) use <Button>.

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@/core/common/utils";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
  Search, Heart, Sparkles, Star, Eye, Paintbrush, X,
  Lock, Moon, ShieldCheck, Blocks, Crown, ShoppingCart,
  ChevronLeft, ChevronRight, Loader2, Check, Filter,
  ArrowUpDown, Palette, Accessibility, RotateCcw,
} from "lucide-react";
import { useThemeGalleryViewModel } from "../viewmodels/useThemeGalleryViewModel";
import { ThemeDetailModal } from "../components/ThemeDetailModal";
import { BundleGalleryTab } from "../components/BundleGalleryTab";
import type { ThemeCard } from "../../domain/entities/ThemeCard";

const G = "studio.gallery";

export function ThemeGalleryView() {
  const { t } = useI18n();
  const vm = useThemeGalleryViewModel();
  const [showFilters, setShowFilters] = useState(false);
  const [confirmApplySlug, setConfirmApplySlug] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 mb-8">
        {/* Decorative background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-violet-500/5 blur-3xl" />
        </div>
        <div className="relative px-8 py-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Palette className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t(`${G}.heroTitle`)}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            {t(`${G}.heroSubtitle`)}
          </p>

          {/* Featured mini-carousel */}
          {vm.featuredThemes.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              {vm.featuredThemes.slice(0, 5).map((theme) => (
                <button
                  key={theme.slug}
                  className="group flex flex-col items-center gap-1.5 transition-transform hover:scale-105"
                  onClick={() => vm.setPreviewSlug(theme.slug)}
                >
                  <div
                    className="h-12 w-12 rounded-xl shadow-lg border-2 border-white/50 transition-all group-hover:ring-2 group-hover:ring-primary/50"
                    style={{
                      background: `linear-gradient(135deg, ${theme.accentColor || "#6b7280"}, color-mix(in srgb, ${theme.accentColor || "#6b7280"} 60%, black))`,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[60px]">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/50">
          {(["browse", "featured", "favorites", "bundles"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => vm.setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                vm.activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
            <span className="text-xs text-muted-foreground">
              {t(`${G}.resultsCount`, { count: vm.totalCount })}
            </span>
          )}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={vm.filters.sortBy}
              onChange={(e) => vm.setFilters({ sortBy: e.target.value as any })}
              className="h-8 text-xs rounded-md border border-border bg-background px-2 pr-6 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {(["popular", "newest", "trending", "nameAsc", "nameDesc"] as const).map((key) => (
                <option key={key} value={key}>
                  {t(`${G}.sort.${key}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Bundles Tab ── */}
      {vm.activeTab === "bundles" && (
        <BundleGalleryTab />
      )}

      {/* ── Category Chips + Filters ── */}
      {vm.activeTab === "browse" && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Category chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {vm.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => vm.setFilters({ category: cat })}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-all",
                  vm.filters.category === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                )}
              >
                {t(`${G}.categories.${cat}`)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t(`${G}.searchPlaceholder`)}
              value={vm.filters.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => vm.setFilters({ search: e.target.value })}
              className="pl-9 h-9 text-sm"
            />
            {vm.filters.search && (
              <button
                onClick={() => vm.setFilters({ search: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            {t(`${G}.filters.title`)}
          </Button>

          {/* Clear filters */}
          {vm.hasActiveFilters && (
            <button
              onClick={vm.resetFilters}
              className="flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              {t(`${G}.clearFilters`)}
            </button>
          )}
        </div>
      )}

      {/* ── Filter Chips (collapsible) ── */}
      {showFilters && vm.activeTab === "browse" && (
        <div className="flex flex-wrap gap-2 mb-6 p-4 rounded-xl border border-border bg-muted/20">
          {([
            { key: "isFree", label: t(`${G}.filters.freeOnly`), icon: Sparkles },
            { key: "hasDarkMode", label: t(`${G}.filters.darkMode`), icon: Moon },
            { key: "hasAccessibility", label: t(`${G}.filters.accessible`), icon: Accessibility },
            { key: "hasContentBlocks", label: t(`${G}.filters.contentBlocks`), icon: Blocks },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() =>
                vm.setFilters({
                  [key]: vm.filters[key as keyof typeof vm.filters] ? undefined : true,
                })
              }
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all",
                vm.filters[key as keyof typeof vm.filters]
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {vm.isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
        </div>
      )}

      {/* ── Empty State ── */}
      {!vm.isLoading && vm.themes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Paintbrush className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {vm.activeTab === "favorites"
                ? t(`${G}.emptyFavorites`)
                : t(`${G}.noResults`)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {vm.activeTab === "favorites"
                ? t(`${G}.emptyFavoritesHint`)
                : t(`${G}.noResultsHint`)}
            </p>
          </div>
          {vm.activeTab === "favorites" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.setActiveTab("browse")}
            >
              {t(`${G}.browseThemes`)}
            </Button>
          ) : vm.hasActiveFilters ? (
            <Button
              variant="outline"
              size="sm"
              onClick={vm.resetFilters}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              {t(`${G}.clearFilters`)}
            </Button>
          ) : null}
        </div>
      )}

      {/* ── Theme Grid ── */}
      {!vm.isLoading && vm.themes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
          {vm.themes.map((theme) => (
            <GalleryThemeCard
              key={theme.slug}
              theme={theme}
              isPreviewing={vm.previewSlug === theme.slug}
              isConfirmingApply={confirmApplySlug === theme.slug}
              isApplying={vm.isApplying && confirmApplySlug === theme.slug}
              onPreview={() =>
                vm.setPreviewSlug(vm.previewSlug === theme.slug ? null : theme.slug)
              }
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
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
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
                  key={pageNum}
                  onClick={() => vm.setPage(pageNum)}
                  className={cn(
                    "h-8 w-8 text-xs font-medium rounded-md transition-all",
                    vm.page === pageNum
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
            className="gap-1"
          >
            <ChevronRight className="h-4 w-4" />
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
  theme, isPreviewing, isConfirmingApply, isApplying, onPreview, onOpenDetail, onToggleFavorite, onApplyClick, onApplyConfirm, onApplyCancel,
}: GalleryThemeCardProps) {
  const { t } = useI18n();
  const accentColor = theme.accentColor || "#6b7280";

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-0.5",
        isPreviewing
          ? "border-violet-500/50 ring-2 ring-violet-500/20 shadow-violet-500/5"
          : theme.isApplied
          ? "border-primary/40 ring-1 ring-primary/20 shadow-primary/5"
          : "border-border/60 hover:border-primary/30",
        theme.isDeprecated && "opacity-60"
      )}
    >
      {/* ── Color Preview Area ── */}
      <div
        className="h-32 w-full relative cursor-pointer overflow-hidden"
        onClick={onPreview}
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 50%, black) 100%)`,
        }}
      >
        {/* Mock login form mini-preview */}
        <div className="absolute inset-4 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 w-full max-w-[120px] space-y-1.5">
            <div className="h-1.5 w-8 rounded-full bg-white/40" />
            <div className="h-4 w-full rounded bg-white/15 border border-white/20" />
            <div className="h-4 w-full rounded bg-white/15 border border-white/20" />
            <div
              className="h-4 w-full rounded"
              style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 80%, white)` }}
            />
          </div>
        </div>

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {theme.isFeatured && (
            <Badge className="bg-amber-500 text-white border-0 text-[9px] px-1.5 py-0 h-5 gap-0.5 shadow-sm">
              <Star className="h-2.5 w-2.5 fill-white" />
              {t(`${G}.card.featured`)}
            </Badge>
          )}
          {theme.isNew && (
            <Badge className="bg-emerald-500 text-white border-0 text-[9px] px-1.5 py-0 h-5 gap-0.5 shadow-sm">
              <Sparkles className="h-2.5 w-2.5" />
              {t(`${G}.card.new`)}
            </Badge>
          )}
          {isPreviewing && (
            <Badge className="bg-violet-500 text-white border-0 text-[9px] px-1.5 py-0 h-5 gap-0.5 shadow-sm">
              <Eye className="h-2.5 w-2.5" />
              {t(`${G}.card.preview`)}
            </Badge>
          )}
        </div>

        {/* Applied badge */}
        {theme.isApplied && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary text-primary-foreground border-0 text-[9px] px-1.5 py-0 h-5 gap-0.5 shadow-sm">
              <Check className="h-2.5 w-2.5" />
              {t(`${G}.card.applied`)}
            </Badge>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute bottom-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              theme.isFavorited ? "fill-red-500 text-red-500" : "text-white"
            )}
          />
        </button>

        {/* Feature icons */}
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          {theme.hasDarkMode && (
            <div className="h-5 w-5 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Moon className="h-3 w-3 text-white/80" />
            </div>
          )}
          {theme.hasAccessibilityPreset && (
            <div className="h-5 w-5 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <ShieldCheck className="h-3 w-3 text-white/80" />
            </div>
          )}
          {theme.hasContentBlocks && (
            <div className="h-5 w-5 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
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
            <h3
              className="text-sm font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={(e) => { e.stopPropagation(); onOpenDetail(); }}
            >
              {theme.name}
            </h3>
            {theme.authorName && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t(`${G}.card.byAuthor`, { author: theme.authorName })}
              </p>
            )}
          </div>
          <PricingBadge theme={theme} />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {theme.description || ""}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Paintbrush className="h-3 w-3" />
            {t(`${G}.card.uses`, { count: theme.usageCount })}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {theme.likeCount}
          </span>
          {theme.category && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 capitalize">
              {theme.category}
            </Badge>
          )}
        </div>

        {/* ── Actions ── */}
        {isConfirmingApply ? (
          <div className="flex flex-col gap-1.5 mt-1">
            <p className="text-[10px] text-muted-foreground font-medium">
              {t(`${G}.card.applyToDraft`)}
            </p>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onApplyConfirm(false); }}
                loading={isApplying}
              >
                {t(`${G}.card.replace`)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onApplyConfirm(true); }}
                disabled={isApplying}
              >
                {t(`${G}.card.merge`)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onApplyCancel(); }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mt-1">
            {/* Preview */}
            <Button
              variant={isPreviewing ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex-1 h-8 text-xs gap-1.5",
                isPreviewing && "bg-violet-500 hover:bg-violet-600 text-white"
              )}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onPreview(); }}
            >
              <Eye className="h-3.5 w-3.5" />
              {isPreviewing ? t(`${G}.card.exitPreview`) : t(`${G}.card.preview`)}
            </Button>

            {/* Apply / Buy / Locked */}
            {theme.isAvailable ? (
              <Button
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onApplyClick(); }}
              >
                <Paintbrush className="h-3.5 w-3.5" />
                {t(`${G}.card.apply`)}
              </Button>
            ) : theme.isBuyable ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex-1 h-8 text-xs gap-1.5 border-violet-300 text-violet-600"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {theme.price ? `$${theme.price.toFixed(0)}` : t(`${G}.card.buy`)}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex-1 h-8 text-xs gap-1.5 border-amber-300/50 text-amber-600"
              >
                <Lock className="h-3.5 w-3.5" />
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

function PricingBadge({
  theme, }: {
  theme: ThemeCard;
}) {
  const { t } = useI18n();
  if (theme.isFree) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold shrink-0">
        <Sparkles className="h-3 w-3 mr-0.5" />
        {t("studio.marketplace.free")}
      </Badge>
    );
  }
  if (theme.isIncluded) {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-semibold shrink-0">
        {t("studio.marketplace.included")}
      </Badge>
    );
  }
  if (theme.isPurchased) {
    return (
      <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-[10px] font-semibold shrink-0">
        {t("studio.marketplace.purchased")}
      </Badge>
    );
  }
  if (theme.isBuyable) {
    return (
      <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-[10px] font-semibold shrink-0">
        <Crown className="h-3 w-3 mr-0.5" />
        {theme.price ? `$${theme.price.toFixed(0)}` : t(`${G}.card.buy`)}
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-semibold shrink-0">
      <Lock className="h-3 w-3 mr-0.5" />
      {t(`${G}.card.locked`)}
    </Badge>
  );
}
