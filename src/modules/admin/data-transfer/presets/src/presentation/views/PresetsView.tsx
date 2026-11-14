"use client";

import React, { useMemo } from "react";
import type { CrudColumn, CrudConfig, CrudAction } from "@core/crud";
import { GenericCrudView } from "@core/crud";
import { Badge } from "@core/ui/badge";
import { Trash2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { getEntityDisplayName } from "@core/data-exchange";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";
import { usePresetsViewModel } from "../viewmodels/usePresetsViewModel";
import { PresetsKpiHeader } from "../components/PresetsKpiHeader";
import { DeletePresetDialog } from "../components/DeletePresetDialog";
import { MappingPresetCard } from "../components/MappingPresetCard";

/**
 * Primary admin view for inspecting and managing saved column mapping presets.
 */
export function PresetsView(): React.ReactElement {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const vm = usePresetsViewModel();

  const columns = useMemo<CrudColumn<DataExchangePreset>[]>(
    () => [
      {
        key: "name",
        label: t("adminDataTransferPresets.columns.name"),
        sortable: true,
        render: (_value: unknown, preset: DataExchangePreset) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-nx-ink">{preset.name}</span>
            {preset.isDefault && (
              <Badge variant="success" className="text-[10px] px-1.5 py-0.5">
                {t("adminDataTransferPresets.status.isDefaultBadge")}
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: "entityKey",
        label: t("adminDataTransferPresets.columns.entityKey"),
        sortable: true,
        render: (_value: unknown, preset: DataExchangePreset) => {
          const displayName = getEntityDisplayName(preset.entityKey, t, isAr);
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-xs text-nx-ink">{displayName}</span>
              <span className="font-mono text-[11px] text-nx-ink-3">{preset.entityKey}</span>
            </div>
          );
        },
      },
      {
        key: "importMode",
        label: t("adminDataTransferPresets.columns.importMode"),
        sortable: true,
        render: (_value: unknown, preset: DataExchangePreset) => (
          <Badge variant="outline" className="text-xs font-medium">
            {t(`adminDataTransferPresets.modes.${preset.importMode}`, {
              defaultValue: preset.importMode,
            })}
          </Badge>
        ),
      },
      {
        key: "mappingsCount",
        label: t("adminDataTransferPresets.columns.mappingsCount"),
        render: (_value: unknown, preset: DataExchangePreset) => (
          <Badge variant="secondary" className="font-mono text-xs">
            {preset.mappingCount}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: t("adminDataTransferPresets.columns.createdAt"),
        render: (value: unknown) => {
          if (!value) return null;
          const date = new Date(String(value));
          return (
            <span className="text-xs text-nx-ink-3 whitespace-nowrap">
              {date.toLocaleDateString(isAr ? "ar-EG" : "en-US")} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          );
        },
      },
    ],
    [t, isAr]
  );

  const kpiHeader = useMemo(
    () => <PresetsKpiHeader kpis={vm.kpis} />,
    [vm.kpis]
  );

  const config = useMemo<CrudConfig<DataExchangePreset>>(
    () => ({
      titleKey: "adminDataTransferPresets.title",
      subtitleKey: "adminDataTransferPresets.subtitle",
      columns,
      viewModes: ["Table", "CardGrid", "SplitPane"],
      defaultView: "Table",
      stickyActions: true,
      hideAddButton: true,
      customHeaderContent: kpiHeader,
      getActions: (_v, tFn): CrudAction<DataExchangePreset>[] => [
        {
          label: tFn("adminDataTransferPresets.actions.delete") || "Delete Preset",
          icon: <Trash2 className="h-4 w-4 text-nx-destructive" />,
          variant: "destructive" as const,
          disabled: () => vm.isDeleting,
          onClick: (preset: DataExchangePreset) => vm.promptDeletePreset(preset),
        },
      ],
      renderCardGridItem: (preset: DataExchangePreset) => (
        <MappingPresetCard
          preset={preset}
          onDeletePreset={vm.promptDeletePreset}
          isDeleting={vm.isDeleting}
        />
      ),
    }),
    [columns, kpiHeader, vm]
  );

  const crudViewModel = useMemo(
    () => ({
      items: vm.presets,
      loading: vm.isLoading,
      error: vm.isError ? t("adminDataTransferPresets.title") : null,
      refreshItems: vm.refetch,
      refetch: vm.refetch,
    }),
    [vm.presets, vm.isLoading, vm.isError, vm.refetch, t]
  );

  return (
    <>
      <GenericCrudView<DataExchangePreset>
        config={config}
        viewModel={crudViewModel}
        search={{
          value: vm.search,
          onChange: vm.setSearch,
        }}
      />
      <DeletePresetDialog
        preset={vm.presetToDelete}
        open={vm.isDeleteDialogOpen}
        onClose={vm.closeDeleteDialog}
        onConfirm={vm.confirmDeletePreset}
        isDeleting={vm.isDeleting}
      />
    </>
  );
}
