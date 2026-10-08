"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import type { OptionSet } from "../../domain/entities/OptionSet";

/**
 * Documentation for "permission"
 */
export type OptionSetEditorReadOnlyReason = "systemManaged" | "platformOwned" | "permission";

/**
 * Documentation for module export
 */
export interface OptionSetReadOnlyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optionSet: OptionSet | null;
  reason: OptionSetEditorReadOnlyReason;
  isEdit: boolean;
}

/**
 * Documentation for OptionSetReadOnlyDialog
 */
export function OptionSetReadOnlyDialog({
  open,
  onOpenChange,
  optionSet,
  reason,
  isEdit,
}: OptionSetReadOnlyDialogProps) {
  const { t } = useI18n();

  const readOnlyCopy =
    reason === "systemManaged"
      ? {
          title: t("optionSet.readOnly.systemManaged.title"),
          description: t("optionSet.readOnly.systemManaged.description"),
        }
      : reason === "platformOwned"
        ? {
            title: t("optionSet.readOnly.platformOwned.title"),
            description: t("optionSet.readOnly.platformOwned.description"),
          }
        : {
            title: isEdit ? t("optionSet.editTitle") : t("optionSet.addNew"),
            description: isEdit
              ? t("optionSet.permissions.update")
              : t("optionSet.permissions.create"),
          };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{readOnlyCopy.title}</DialogTitle>
          <DialogDescription>{readOnlyCopy.description}</DialogDescription>
        </DialogHeader>

        {optionSet !== null && (
          <dl className="flex flex-col gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-nx-ink-2">
                {t("optionSet.fields.stableKey")}
              </dt>
              <dd className="font-mono text-nx-ink" dir="ltr">
                {optionSet.stableKey}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-nx-ink-2">{t("optionSet.fields.labelEn")}</dt>
              <dd className="text-nx-ink">{optionSet.labelEn}</dd>
            </div>
          </dl>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
