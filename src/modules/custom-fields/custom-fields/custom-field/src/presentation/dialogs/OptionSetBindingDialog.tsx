"use client";

import * as React from "react";
import { Layers } from "lucide-react";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { useI18n } from "@core/providers/i18n-provider";
import { OptionSetPicker } from "../controls/OptionSetBinding/OptionSetPicker";
import type { OptionSet } from "../../../../option-set/src/domain/entities/OptionSet";
import { OptionSetBindingCurrentStatus } from "./OptionSetBindingCurrentStatus";
import { OptionSetBindingActions } from "./OptionSetBindingActions";

/**
 * Documentation for module export
 */
export interface OptionSetBindingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldLabel: string;

  canBind: boolean;

  bindableSets: readonly OptionSet[];
  isSetsLoading: boolean;
  isSetsError: boolean;
  onRetrySets: () => void;

  isVersionLoading: boolean;
  isVersionError: boolean;
  onRetryVersion: () => void;
  hasActiveVersion: boolean;

  /** The set the field is bound to right now, or null when unbound. Drives which action shows. */
  boundSet: OptionSet | null;

  /** Attaches or rebinds an option set version to the active field version. */
  onAttach: (optionSetVersionId: string) => Promise<boolean>;
  onDetach: () => Promise<boolean>;
  isAttaching: boolean;
  isDetaching: boolean;
}

/**
 * Dialog for managing option set bindings on Select and MultiSelect custom fields.
 * Displays current binding state and provides actions to attach, switch, or detach option sets.
 */
export function OptionSetBindingDialog({
  open,
  onOpenChange,
  fieldLabel,
  canBind,
  bindableSets,
  isSetsLoading,
  isSetsError,
  onRetrySets,
  isVersionLoading,
  isVersionError,
  onRetryVersion,
  hasActiveVersion,
  boundSet,
  onAttach,
  onDetach,
  isAttaching,
  isDetaching,
}: OptionSetBindingDialogProps): React.ReactElement {
  const { t, language } = useI18n();
  const pickerId = React.useId();

  // Local selection state, reset when dialog opens or boundSet changes.
  const [selectedSetId, setSelectedSetId] = React.useState<string | null>(null);
  const boundSetId = boundSet?.id ?? null;
  React.useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setSelectedSetId(boundSetId);
      });
    }
  }, [open, boundSetId]);

  const selectedSet = bindableSets.find((set) => set.id === selectedSetId) ?? null;
  const isBusy = isAttaching || isDetaching;
  const isSelectingCurrentSet = selectedSet !== null && selectedSet.id === boundSet?.id;

  const handleAttach = async () => {
    if (!selectedSet) return;
    const ok = await onAttach(selectedSet.publishedVersionId as string);
    if (ok) onOpenChange(false);
  };

  const handleDetach = async () => {
    const ok = await onDetach();
    if (ok) onOpenChange(false);
  };

  const body = (() => {
    if (isVersionLoading) {
      return (
        <div className="space-y-2" data-testid="option-set-binding-loading">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (isVersionError) {
      return (
        <ErrorMessage
          size="sm"
          message={t("customField.optionSetBinding.versionLoadFailed")}
          onRetry={onRetryVersion}
        />
      );
    }

    if (!hasActiveVersion) {
      return (
        <EmptyState
          bare
          size="sm"
          icon={Layers}
          title={t("customField.optionSetBinding.noActiveVersion")}
        />
      );
    }

    return (
      <div className="space-y-5">
        {!canBind && (
          <p className="rounded-md border border-nx-line bg-nx-raised p-3 text-sm text-nx-ink-3">
            {t("customField.optionSetBinding.permissionNote")}
          </p>
        )}

        <OptionSetBindingCurrentStatus boundSet={boundSet} />

        <OptionSetPicker
          id={pickerId}
          label={t("customField.optionSetBinding.pickerLabel")}
          sets={bindableSets}
          isLoading={isSetsLoading}
          isError={isSetsError}
          onRetry={onRetrySets}
          language={language}
          selectedSetId={selectedSetId}
          onSelect={(set) => setSelectedSetId(set.id)}
          disabled={isBusy}
        />

        <OptionSetBindingActions
          boundSet={boundSet}
          selectedSet={selectedSet}
          canBind={canBind}
          isSelectingCurrentSet={isSelectingCurrentSet}
          isBusy={isBusy}
          isAttaching={isAttaching}
          isDetaching={isDetaching}
          onAttach={handleAttach}
          onDetach={handleDetach}
        />
      </div>
    );
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("customField.optionSetBinding.title", { field: fieldLabel })}</DialogTitle>
          <DialogDescription>{t("customField.optionSetBinding.description")}</DialogDescription>
        </DialogHeader>

        {body}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
