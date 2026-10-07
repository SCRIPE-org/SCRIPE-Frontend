"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { useI18n } from "@core/providers/i18n-provider";
import { AlertTriangle, Globe2 } from "lucide-react";
import {
  OptionSetReadOnlyDialog,
  type OptionSetEditorReadOnlyReason,
} from "./OptionSetReadOnlyDialog";
import {
  OptionSetFormFields,
  OPTION_SET_STABLE_KEY_MAX_LENGTH,
  OPTION_SET_LABEL_MAX_LENGTH,
  OPTION_SET_DESCRIPTION_MAX_LENGTH,
} from "./OptionSetFormFields";
import type { OptionSet } from "../../domain/entities/OptionSet";

export {
  OPTION_SET_STABLE_KEY_MAX_LENGTH,
  OPTION_SET_LABEL_MAX_LENGTH,
  OPTION_SET_DESCRIPTION_MAX_LENGTH,
};
export type { OptionSetEditorReadOnlyReason };

export type OptionSetEditorSubmission =
  | {
      mode: "create";
      stableKey: string;
      labelEn: string;
      labelAr: string;
      description: string;
      isGlobal: boolean;
    }
  | {
      mode: "edit";
      labelEn: string;
      labelAr: string;
      description: string;
    };

export interface OptionSetEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  optionSet: OptionSet | null;
  readOnlyReason?: OptionSetEditorReadOnlyReason | null;
  canChooseScope: boolean;
  isPlatformContext: boolean;
  isSaving: boolean;
  errorMessage?: string | null;
  onSubmit: (submission: OptionSetEditorSubmission) => void;
}

export function OptionSetEditorDialog({
  open,
  onOpenChange,
  optionSet,
  readOnlyReason,
  canChooseScope,
  isPlatformContext,
  isSaving,
  errorMessage,
  onSubmit,
}: OptionSetEditorDialogProps) {
  const { t } = useI18n();
  const fieldId = useId();
  const isEdit = optionSet !== null;

  const [stableKey, setStableKey] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [labelAr, setLabelAr] = useState("");
  const [description, setDescription] = useState("");
  const [isGlobal, setIsGlobal] = useState(isPlatformContext);

  const optionSetId = optionSet?.id;
  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setStableKey(optionSet?.stableKey ?? "");
      setLabelEn(optionSet?.labelEn ?? "");
      setLabelAr(optionSet?.labelAr ?? "");
      setDescription(optionSet?.description ?? "");
      setIsGlobal(optionSet?.isPlatformOwned ?? isPlatformContext);
    });
  }, [open, optionSetId, isPlatformContext]);

  const effectiveReadOnlyReason: OptionSetEditorReadOnlyReason | null =
    optionSet?.isPlatformMaintained ? "systemManaged" : (readOnlyReason ?? null);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (isSaving) return;

      if (isEdit) {
        onSubmit({
          mode: "edit",
          labelEn: labelEn.trim(),
          labelAr: labelAr.trim(),
          description: description.trim(),
        });
        return;
      }

      onSubmit({
        mode: "create",
        stableKey: stableKey.trim(),
        labelEn: labelEn.trim(),
        labelAr: labelAr.trim(),
        description: description.trim(),
        isGlobal,
      });
    },
    [description, isEdit, isGlobal, isSaving, labelAr, labelEn, onSubmit, stableKey]
  );

  if (effectiveReadOnlyReason !== null) {
    return (
      <OptionSetReadOnlyDialog
        open={open}
        onOpenChange={onOpenChange}
        optionSet={optionSet}
        reason={effectiveReadOnlyReason}
        isEdit={isEdit}
      />
    );
  }

  const canSave = !isSaving && labelEn.trim().length > 0 && (isEdit || stableKey.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("optionSet.editTitle") : t("optionSet.addNew")}</DialogTitle>
          <DialogDescription>{t("optionSet.description")}</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {!isEdit && isPlatformContext && (
            <Alert>
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>{t("optionSet.platformContext.title")}</AlertTitle>
              <AlertDescription>{t("optionSet.platformContext.description")}</AlertDescription>
            </Alert>
          )}

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription role="alert">{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <OptionSetFormFields
            fieldId={fieldId}
            optionSet={optionSet}
            stableKey={stableKey}
            setStableKey={setStableKey}
            labelEn={labelEn}
            setLabelEn={setLabelEn}
            labelAr={labelAr}
            setLabelAr={setLabelAr}
            description={description}
            setDescription={setDescription}
            isGlobal={isGlobal}
            setIsGlobal={setIsGlobal}
            canChooseScope={canChooseScope}
            isPlatformContext={isPlatformContext}
            isSaving={isSaving}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!canSave} loading={isSaving}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
