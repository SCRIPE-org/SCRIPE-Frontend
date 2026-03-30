/**
 * Theme Management View
 *
 * Admin page for managing marketplace themes.
 * Uses GenericCrudView with rich columns, status badges,
 * and custom actions (duplicate, deprecate, delete).
 *
 * All user-facing strings use i18n via t().
 *
 * Route: /settings/themes (system admin only)
 *
 * @module customization/presentation
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type {
  CrudConfig,
  CrudAction,
} from "@core/crud/components/generic-crud-view";
import type { ThemeCard } from "../../domain/entities/ThemeCard";
import { useThemeManagementViewModel } from "../viewmodels/useThemeManagementViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import {
  Eye,
  Copy,
  Trash2,
  Star,
  Archive,
  Palette,
  Crown,
  Sparkles,
  Moon,
  Accessibility,
  Blocks,
  Users,
  Heart,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ── Prefix helper ──
const T = "studio.themeManagement";

/** Tier badge component */
function TierBadge({
  isFree,
  pricingType,
  minTierLevel, }: {
  isFree: boolean;
  pricingType: string;
  minTierLevel: number;
}) {
  const { t } = useI18n();
  if (isFree) {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold"
      >
        <Sparkles className="h-3 w-3 mr-0.5" />
        {t(`${T}.tier.free`)}
      </Badge>
    );
  }
  if (pricingType === "StandaloneOnly") {
    return (
      <Badge
        variant="outline"
        className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-[10px] font-semibold"
      >
        <Crown className="h-3 w-3 mr-0.5" />
        {t(`${T}.tier.premium`)}
      </Badge>
    );
  }
  const tierMap: Record<number, string> = {
    0: t(`${T}.tier.free`),
    1: t(`${T}.tier.starter`),
    2: t(`${T}.tier.pro`),
    3: t(`${T}.tier.enterprise`),
  };
  return (
    <Badge
      variant="outline"
      className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-semibold"
    >
      <Crown className="h-3 w-3 mr-0.5" />
      {tierMap[minTierLevel] || t(`${T}.tier.tierN`, { n: minTierLevel })}
    </Badge>
  );
}

/** Feature badges */
function FeatureBadges({
  theme, }: {
  theme: ThemeCard;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap gap-1">
      {theme.hasDarkMode && (
        <Badge
          variant="outline"
          className="text-[9px] px-1.5 py-0 h-4 bg-slate-800/10 text-slate-600 border-slate-300/40"
        >
          <Moon className="h-2.5 w-2.5 mr-0.5" />
          {t(`${T}.features.dark`)}
        </Badge>
      )}
      {theme.hasAccessibilityPreset && (
        <Badge
          variant="outline"
          className="text-[9px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-600 border-blue-300/40"
        >
          <Accessibility className="h-2.5 w-2.5 mr-0.5" />
          {t(`${T}.features.a11y`)}
        </Badge>
      )}
      {theme.hasContentBlocks && (
        <Badge
          variant="outline"
          className="text-[9px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-600 border-purple-300/40"
        >
          <Blocks className="h-2.5 w-2.5 mr-0.5" />
          {t(`${T}.features.blocks`)}
        </Badge>
      )}
    </div>
  );
}

export function ThemeManagementView() {
  const { t } = useI18n();
  const router = useRouter();
  const {
    vm,
    getConfigBase,
    handleDuplicate,
    handleDeprecate,
    handleToggleFavorite,
    statistics,
  } = useThemeManagementViewModel();
  const configBase = getConfigBase();

  const config: CrudConfig<ThemeCard> = useMemo(
    () => ({
      titleKey: `${T}.title`,
      subtitleKey: `${T}.subtitle`,
      resource: "themes",
      columns: [
        {
          key: "name",
          label: t(`${T}.columns.theme`),
          sortable: true,
          render: (_val: unknown, item: ThemeCard) => (
            <div className="flex items-center gap-3 min-w-[200px]">
              {/* Color accent swatch */}
              <div
                className="h-9 w-9 rounded-lg border border-border/50 shrink-0 shadow-sm"
                style={{
                  background: item.accentColor
                    ? `linear-gradient(135deg, ${item.accentColor}, color-mix(in srgb, ${item.accentColor} 60%, black))`
                    : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.6))",
                }}
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold truncate">
                    {item.name}
                  </span>
                  {item.isFeatured && (
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  )}
                  {item.isNew && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-3.5 bg-green-500/10 text-green-600 border-green-500/30"
                    >
                      {t(`${T}.new`)}
                    </Badge>
                  )}
                  {item.isDeprecated && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-3.5 bg-red-500/10 text-red-600 border-red-500/30"
                    >
                      {t(`${T}.deprecated`)}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                  {item.description || t(`${T}.noDescription`)}
                </span>
              </div>
            </div>
          ),
        },
        {
          key: "category",
          label: t(`${T}.columns.category`),
          sortable: true,
          render: (_val: unknown, item: ThemeCard) => (
            <Badge variant="outline" className="text-xs capitalize">
              <Palette className="h-3 w-3 mr-1" />
              {item.category || t(`${T}.uncategorized`)}
            </Badge>
          ),
        },
        {
          key: "pricingType",
          label: t(`${T}.columns.tier`),
          render: (_val: unknown, item: ThemeCard) => (
            <TierBadge
              isFree={item.isFree}
              pricingType={item.pricingType}
              minTierLevel={item.minTierLevel}
            />
          ),
        },
        {
          key: "features",
          label: t(`${T}.columns.features`),
          render: (_val: unknown, item: ThemeCard) => (
            <FeatureBadges theme={item} />
          ),
        },
        {
          key: "usageCount",
          label: t(`${T}.columns.usage`),
          sortable: true,
          render: (_val: unknown, item: ThemeCard) => (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{item.usageCount}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{item.likeCount}</span>
              </div>
            </div>
          ),
        },
        {
          key: "isSystem",
          label: t(`${T}.columns.type`),
          render: (_val: unknown, item: ThemeCard) => (
            <Badge
              variant={item.isSystem ? "default" : "outline"}
              className={`text-[10px] ${
                item.isSystem
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : ""
              }`}
            >
              {item.isSystem
                ? t(`${T}.type.system`)
                : t(`${T}.type.custom`)}
            </Badge>
          ),
        },
      ],
      getItemDisplayName: configBase.getItemDisplayName,
      deleteService: configBase.deleteService,
      getActions: (
        _vmInstance: any,
        tFn: any,
        handleDeleteFn: any
      ): CrudAction<ThemeCard>[] => [
        {
          label: t(`${T}.actions.preview`),
          onClick: (item: ThemeCard) =>
            router.push(`/customizer?preview=${item.slug}`),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: t(`${T}.actions.duplicate`),
          onClick: (item: ThemeCard) => handleDuplicate(item),
          variant: "ghost" as const,
          icon: <Copy className="h-4 w-4" />,
          requiredPermission: "themes:create",
        },
        {
          label: t(`${T}.actions.toggleFavorite`),
          onClick: (item: ThemeCard) => handleToggleFavorite(item),
          variant: "ghost" as const,
          icon: <Star className="h-4 w-4" />,
        },
        {
          label: t(`${T}.actions.deprecate`),
          onClick: (item: ThemeCard) => handleDeprecate(item),
          variant: "ghost" as const,
          icon: <Archive className="h-4 w-4" />,
          requiredPermission: "themes:update",
          confirmTitle: t(`${T}.confirm.deprecateTitle`),
          confirmDescription: t(`${T}.confirm.deprecateDescription`),
          confirmVariant: "default" as const,
        },
        {
          label: tFn("common.delete") || t("common.delete"),
          onClick: (item: ThemeCard) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          icon: <Trash2 className="h-4 w-4" />,
          requiredPermission: "themes:delete",
          confirmTitle: t(`${T}.confirm.deleteTitle`),
          confirmDescription: t(`${T}.confirm.deleteDescription`),
          confirmVariant: "destructive" as const,
        },
      ],
    }),
    [
      t,
      configBase,
      handleDuplicate,
      handleDeprecate,
      handleToggleFavorite,
      router,
    ]
  );

  return (
    <div className="space-y-6">
      {/* ── Statistics Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Palette className="h-5 w-5" />}
          label={t(`${T}.stats.total`)}
          value={statistics.total}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label={t(`${T}.stats.free`)}
          value={statistics.free}
          color="text-emerald-600"
          bgColor="bg-emerald-500/10"
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label={t(`${T}.stats.featured`)}
          value={statistics.featured}
          color="text-amber-600"
          bgColor="bg-amber-500/10"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label={t(`${T}.stats.system`)}
          value={statistics.system}
          color="text-indigo-600"
          bgColor="bg-indigo-500/10"
        />
        <StatCard
          icon={<Archive className="h-5 w-5" />}
          label={t(`${T}.stats.deprecated`)}
          value={statistics.deprecated}
          color="text-red-600"
          bgColor="bg-red-500/10"
        />
      </div>

      {/* ── CRUD Table ── */}
      <GenericCrudView viewModel={vm} config={config} />
    </div>
  );
}

/** Stat card component */
function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-3 shadow-sm transition-all hover:shadow-md">
      <div
        className={`h-10 w-10 rounded-lg ${bgColor} flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
