"use client";

import React from "react";
import { DataExchangeStudioOverlay } from "@core/data-exchange";
import type { DataExchangeEntitySummaryDto } from "@core/data-exchange/domain/types";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";
import { CreatePresetEntityDialog } from "./CreatePresetEntityDialog";
import { DeletePresetDialog } from "./DeletePresetDialog";

export interface PresetsWorkspaceDialogsProps {
  presetToDelete: DataExchangePreset | null;
  resolveEntityName: (entityKey: string) => string;
  isDeleteDialogOpen: boolean;
  closeDeleteDialog: () => void;
  confirmDeletePreset: () => Promise<void>;
  isDeleting: boolean;
  isCreatePickerOpen: boolean;
  setIsCreatePickerOpen: (open: boolean) => void;
  importableEntities: DataExchangeEntitySummaryDto[];
  isCatalogLoading: boolean;
  entityFilter: string;
  launchCreateStudio: (entityKey: string) => void;
  activeStudioPreset: DataExchangePreset | null;
  setActiveStudioPreset: (preset: DataExchangePreset | null) => void;
  createStudioEntityKey: string | null;
  setCreateStudioEntityKey: (entityKey: string | null) => void;
  onRefresh: () => Promise<unknown>;
}

/**
 * Encapsulates preset delete confirmation, Studio entity picker, and Studio overlays.
 */
export function PresetsWorkspaceDialogs({
  presetToDelete,
  resolveEntityName,
  isDeleteDialogOpen,
  closeDeleteDialog,
  confirmDeletePreset,
  isDeleting,
  isCreatePickerOpen,
  setIsCreatePickerOpen,
  importableEntities,
  isCatalogLoading,
  entityFilter,
  launchCreateStudio,
  activeStudioPreset,
  setActiveStudioPreset,
  createStudioEntityKey,
  setCreateStudioEntityKey,
  onRefresh,
}: PresetsWorkspaceDialogsProps): React.ReactElement {
  return (
    <>
      <DeletePresetDialog
        preset={presetToDelete}
        entityDisplayName={
          presetToDelete ? resolveEntityName(presetToDelete.entityKey) : undefined
        }
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeletePreset}
        isDeleting={isDeleting}
      />
      <CreatePresetEntityDialog
        open={isCreatePickerOpen}
        onOpenChange={setIsCreatePickerOpen}
        entities={importableEntities}
        isLoading={isCatalogLoading}
        activeEntityFilter={entityFilter}
        onConfirm={launchCreateStudio}
      />
      {activeStudioPreset && (
        <DataExchangeStudioOverlay
          entityKey={activeStudioPreset.entityKey}
          initialPresetId={activeStudioPreset.id}
          open={Boolean(activeStudioPreset)}
          onOpenChange={(open) => {
            if (!open) {
              setActiveStudioPreset(null);
              void onRefresh();
            }
          }}
          onImportComplete={() => onRefresh()}
        />
      )}
      {createStudioEntityKey && (
        <DataExchangeStudioOverlay
          entityKey={createStudioEntityKey}
          open={Boolean(createStudioEntityKey)}
          onOpenChange={(open) => {
            if (!open) {
              setCreateStudioEntityKey(null);
              void onRefresh();
            }
          }}
          onImportComplete={() => onRefresh()}
        />
      )}
    </>
  );
}
