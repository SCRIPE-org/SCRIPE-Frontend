"use client";

import React, { useState } from "react";
import { Layers, Sparkles } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { EmptyState } from "@core/ui/empty-state";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { getEntityDisplayName } from "@core/data-exchange";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataExchangeEntitySummaryView } from "../../../../entities/src/domain/entities/DataExchangeEntity";

/** Props for CreatePresetEntityDialog component. */
export interface CreatePresetEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entities: DataExchangeEntitySummaryView[];
  isLoading: boolean;
  activeEntityFilter?: string;
  onConfirm: (entityKey: string) => void;
}

/**
 * Dynamic @core/ui/dialog + @core/ui/select entity selector for creating a new mapping preset
 * inside Data Exchange Studio without hardcoded entity keys.
 */
export function CreatePresetEntityDialog({
  open,
  onOpenChange,
  entities,
  isLoading,
  activeEntityFilter,
  onConfirm,
}: CreatePresetEntityDialogProps): React.ReactElement {
  const { direction, t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={direction}
        className="max-w-md"
        data-testid="presets-studio-entity-picker-dialog"
      >
        <DialogHeader>
          <DialogTitle>{t("adminDataTransferPresets.studioPicker.title")}</DialogTitle>
          <DialogDescription>
            {t("adminDataTransferPresets.studioPicker.description")}
          </DialogDescription>
        </DialogHeader>

        <CreatePresetEntityBody
          key={open ? "open" : "closed"}
          entities={entities}
          isLoading={isLoading}
          activeEntityFilter={activeEntityFilter}
          onClose={() => onOpenChange(false)}
          onConfirm={onConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}

interface CreatePresetEntityBodyProps {
  entities: DataExchangeEntitySummaryView[];
  isLoading: boolean;
  activeEntityFilter?: string;
  onClose: () => void;
  onConfirm: (entityKey: string) => void;
}

function CreatePresetEntityBody({
  entities,
  isLoading,
  activeEntityFilter,
  onClose,
  onConfirm,
}: CreatePresetEntityBodyProps): React.ReactElement {
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const [selectedKey, setSelectedKey] = useState<string>("");

  const filteredDefault =
    activeEntityFilter && activeEntityFilter !== "all"
      ? entities.find((e) => e.entityKey.toLowerCase() === activeEntityFilter.toLowerCase())?.entityKey
      : undefined;

  const effectiveEntityKey =
    (selectedKey && entities.some((e) => e.entityKey === selectedKey) ? selectedKey : "") ||
    filteredDefault ||
    entities[0]?.entityKey ||
    "";

  const handleConfirm = () => {
    if (!effectiveEntityKey) return;
    onConfirm(effectiveEntityKey);
    onClose();
  };

  return (
    <>
      {isLoading ? (
        <div className="py-6 flex flex-col items-center justify-center gap-2">
          <LoadingSpinner showText={false} />
          <p className="text-xs text-nx-ink-3">
            {t("adminDataTransferPresets.studioPicker.loadingCatalog")}
          </p>
        </div>
      ) : entities.length === 0 ? (
        <EmptyState
          bare
          icon={Layers}
          title={t("adminDataTransferPresets.studioPicker.emptyTitle")}
          description={t("adminDataTransferPresets.studioPicker.emptyDescription")}
        />
      ) : (
        <div className="space-y-2 py-2">
          <Label htmlFor="presets-studio-entity-select">
            {t("adminDataTransferPresets.studioPicker.entityLabel")}
          </Label>
          <Select value={effectiveEntityKey} onValueChange={setSelectedKey}>
            <SelectTrigger
              id="presets-studio-entity-select"
              data-testid="presets-studio-entity-select"
            >
              <SelectValue
                placeholder={t("adminDataTransferPresets.studioPicker.entityPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {entities.map((entity) => {
                const displayName = getEntityDisplayName(entity.entityKey, t, isAr, entity);
                return (
                  <SelectItem key={entity.entityKey} value={entity.entityKey}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-nx-ink">{displayName}</span>
                      <Badge
                        dir="ltr"
                        variant="outline"
                        className="text-[10px] font-mono py-0 px-1.5"
                      >
                        {entity.entityKey}
                      </Badge>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          data-testid="presets-studio-picker-cancel"
        >
          {t("common.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={isLoading || !effectiveEntityKey}
          onClick={handleConfirm}
          data-testid="presets-studio-picker-confirm"
        >
          <Sparkles className="h-4 w-4 me-1.5" aria-hidden="true" />
          {t("adminDataTransferPresets.studioPicker.confirm")}
        </Button>
      </DialogFooter>
    </>
  );
}
