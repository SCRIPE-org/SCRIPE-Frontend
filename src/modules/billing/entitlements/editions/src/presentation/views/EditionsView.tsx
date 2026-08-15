/**
 * Editions View
 *
 * CRUD view for managing subscription editions (plans).
 */
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useEditionsViewModel } from "../viewmodels/useEditionsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { Edition } from "../../domain/entities/Edition";
import { Badge } from "@core/ui/badge";
import { Pencil, Trash2, Eye, Settings2, Columns, AlertCircle } from "lucide-react";
import { formatUtc } from "@core/common/utils";
import { useModuleLocales } from "@core/hooks/use-module-locales";

/**
 * Presentation UI component rendering the editions view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function EditionsView() {
  useModuleLocales(() => import("../../../locales"), "editions");
  const { t, language } = useI18n();
  const vm = useEditionsViewModel();
  const router = useRouter();

  const config: CrudConfig<Edition> = useMemo(
    () => ({
      titleKey: "entitlements.editions.title",
      subtitleKey: "entitlements.editions.description",
      resource: "editions",
      customActions: [
        {
          label: t("entitlements.editions.comparison.heroTitle"),
          onClick: async () => {
            router.push("/entitlements/editions/compare");
          },
          variant: "outline" as const,
          icon: <Columns className="h-4 w-4" />,
        },
      ],
      onCreateClick: () => router.push("/entitlements/editions/create"),
      columns: [
        {
          key: "name",
          label: t("entitlements.editions.editionName"),
          sortable: true,
        },
        {
          key: "displayName",
          label: t("entitlements.editions.displayName"),
          render: (_val: unknown, edition: Edition) => edition.getDisplayName(language),
        },
        {
          key: "features",
          label: t("entitlements.editions.featureCount"),
          render: (_val: unknown, edition: Edition) => (
            <Badge variant="secondary">{edition.featureCount}</Badge>
          ),
        },
        {
          key: "category",
          label: t("entitlements.features.category"),
          render: (_val: unknown, edition: Edition) =>
            edition.category ? (
              <Badge variant="secondary">{edition.category}</Badge>
            ) : (
              <span className="text-nx-ink-3">—</span>
            ),
        },
        {
          key: "baseMonthlyPriceUsd",
          label: t("entitlements.pricing.price"),
          render: (_val: unknown, edition: Edition) => {
            const price = edition.baseMonthlyPriceUsd;
            if (price == null || price === 0) {
              return <span className="text-nx-ink-3">—</span>;
            }
            const formatted = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }).format(price);
            return (
              <span className="text-sm font-medium tabular-nums text-success">
                {formatted}
                <span className="text-xs text-nx-ink-3">/mo</span>
              </span>
            );
          },
        },
        {
          key: "isRetired",
          label: t("entitlements.editions.status"),
          render: (_val: unknown, edition: Edition) => (
            <Badge variant={edition.isRetired ? "destructive" : "success"}>
              {edition.isRetired ? t("entitlements.editions.retired") : t("common.active")}
            </Badge>
          ),
        },
        {
          key: "createdAt",
          label: t("common.createdAt"),
          render: (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "-"),
        },
      ],
      getItemDisplayName: (edition: Edition) => edition.getDisplayName(language),
      deleteService: (id: string) => vm.deleteItem(id),
      getActions: (
        vmInstance: ReturnType<typeof useEditionsViewModel>,
        tFn: (key: string) => string,
        handleDeleteFn: ((item: Edition) => void) | undefined
      ): CrudAction<Edition>[] => [
        {
          label: tFn("common.view"),
          onClick: (item: Edition) => router.push(`/entitlements/editions/${item.id}/overview`),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: tFn("common.edit"),
          onClick: (item: Edition) => router.push(`/entitlements/editions/${item.id}/edit`),
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
        },
        {
          label: tFn("entitlements.editions.manageFeatures"),
          onClick: (item: Edition) => vmInstance.navigateToFeatures(item.id),
          variant: "ghost" as const,
          icon: <Settings2 className="h-4 w-4" />,
        },
        {
          label: tFn("common.delete"),
          onClick: (item: Edition) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-destructive hover:text-destructive/80",
          icon: <Trash2 className="h-4 w-4" />,
          show: (item: Edition) => !item.isSystem,
        },
      ],
    }),
    [t, vm, language]
  );

  return (
    <>
      {vm.allEditionsError && (
        <div className="mb-4 flex items-center gap-2 rounded-nx-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{t("entitlements.editions.allEditionsLoadError")}</span>
        </div>
      )}
      <GenericCrudView viewModel={vm} config={config} />
    </>
  );
}
