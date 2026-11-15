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
import { getEntityDisplayName } from "@core/data-exchange/presentation/utils/entity-display-names";
import type { DataExchangeEntitySummaryDto } from "@core/data-exchange/domain/types";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Props for StudioEntityPickerDialog component.
 */
export interface StudioEntityPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entities: DataExchangeEntitySummaryDto[];
  isLoading: boolean;
  defaultEntityKey?: string;
  onConfirm: (entityKey: string) => void;
}

/**
 * Dynamic @core/ui/dialog + @core/ui/select entity selector for launching Data Exchange Studio
 * from Transfer Jobs without hardcoded default entity keys.
 */
export function StudioEntityPickerDialog({
  open,
  onOpenChange,
  entities,
  isLoading,
  defaultEntityKey,
  onConfirm,
}: StudioEntityPickerDialogProps): React.ReactElement {
  const { direction, t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={direction}
        className="max-w-md"
        data-testid="jobs-studio-entity-picker-dialog"
      >
        <DialogHeader>
          <DialogTitle>{t("adminDataTransferJobs.studioPicker.title")}</DialogTitle>
          <DialogDescription>
            {t("adminDataTransferJobs.studioPicker.description")}
          </DialogDescription>
        </DialogHeader>

        <StudioEntityPickerBody
          key={open ? "open" : "closed"}
          entities={entities}
          isLoading={isLoading}
          defaultEntityKey={defaultEntityKey}
          onClose={() => onOpenChange(false)}
          onConfirm={onConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}

interface StudioEntityPickerBodyProps {
  entities: DataExchangeEntitySummaryDto[];
  isLoading: boolean;
  defaultEntityKey?: string;
  onClose: () => void;
  onConfirm: (entityKey: string) => void;
}

function StudioEntityPickerBody({
  entities,
  isLoading,
  defaultEntityKey,
  onClose,
  onConfirm,
}: StudioEntityPickerBodyProps): React.ReactElement {
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const [selectedKey, setSelectedKey] = useState<string>("");

  const effectiveEntityKey =
    (selectedKey && entities.some((e) => e.entityKey === selectedKey) ? selectedKey : "") ||
    (defaultEntityKey &&
      entities.find((e) => e.entityKey.toLowerCase() === defaultEntityKey.toLowerCase())?.entityKey) ||
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
            {t("adminDataTransferJobs.studioPicker.loadingCatalog")}
          </p>
        </div>
      ) : entities.length === 0 ? (
        <EmptyState
          bare
          icon={Layers}
          title={t("adminDataTransferJobs.studioPicker.emptyTitle")}
          description={t("adminDataTransferJobs.studioPicker.emptyDescription")}
        />
      ) : (
        <div className="space-y-2 py-2">
          <Label htmlFor="jobs-studio-entity-select">
            {t("adminDataTransferJobs.studioPicker.entityLabel")}
          </Label>
          <Select value={effectiveEntityKey} onValueChange={setSelectedKey}>
            <SelectTrigger
              id="jobs-studio-entity-select"
              data-testid="jobs-studio-entity-select"
            >
              <SelectValue
                placeholder={t("adminDataTransferJobs.studioPicker.entityPlaceholder")}
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
          data-testid="jobs-studio-picker-cancel"
        >
          {t("common.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={isLoading || !effectiveEntityKey}
          onClick={handleConfirm}
          data-testid="jobs-studio-picker-confirm"
        >
          <Sparkles className="h-4 w-4 me-1.5" aria-hidden="true" />
          {t("adminDataTransferJobs.studioPicker.confirm")}
        </Button>
      </DialogFooter>
    </>
  );
}
