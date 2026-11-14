"use client";

import React, { useMemo } from "react";
import type { CrudColumn, CrudConfig } from "@core/crud";
import { GenericCrudView } from "@core/crud";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Trash2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";
import { usePresetsViewModel } from "../viewmodels/usePresetsViewModel";
import { PresetsKpiHeader } from "../components/PresetsKpiHeader";
import { DeletePresetDialog } from "../components/DeletePresetDialog";

/**
 * Primary admin view for inspecting and managing saved column mapping presets.
 */
export function PresetsView(): React.ReactElement {
  const { t } = useI18n();
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
        render: (value: unknown) => (
          <span className="font-mono text-xs text-nx-ink-2">{String(value ?? "")}</span>
        ),
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
              {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: t("adminDataTransferPresets.columns.actions"),
        render: (_value: unknown, preset: DataExchangePreset) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => vm.promptDeletePreset(preset)}
            className="h-7 px-2 text-xs text-nx-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
            {t("adminDataTransferPresets.actions.delete")}
          </Button>
        ),
      },
    ],
    [t, vm]
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
    }),
    [columns, kpiHeader]
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
        open={vm.isDeleteDialogOpen}
        preset={vm.presetToDelete}
        isDeleting={vm.isDeleting}
        onClose={vm.closeDeleteDialog}
        onConfirm={vm.confirmDeletePreset}
      />
    </>
  );
}
