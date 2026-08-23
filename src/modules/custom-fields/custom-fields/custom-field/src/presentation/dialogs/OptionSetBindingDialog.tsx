"use client";

/**
 * Attach, switch, or detach a shared option set on one Select or MultiSelect field's active version --
 * P-4's missing consumer. See `useOptionSetBindingViewModel`'s own header for why bind/rebind/unbind
 * are three separate actions here rather than one "save" button, and for why this dialog cannot know
 * ahead of time whether the field is already following a shared set.
 *
 * SAME "ONE DIALOG, REAL CONTENT, NO NESTED CONFIRM" SHAPE `FieldImpactDialog` USES. Each action's
 * consequence is printed above its own button rather than behind a second "are you sure?" popup --
 * this module's own Wave 5 row 5.6 spent a commit removing nested-modal focus traps, and two
 * confirmations for one action is worse than one that says the truth.
 */
import * as React from "react";
import { AlertTriangle, Layers } from "lucide-react";
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

  onAttach: (optionSetVersionId: string) => Promise<boolean>;
  onSwitch: (optionSetVersionId: string) => Promise<boolean>;
  onDetach: () => Promise<boolean>;
  isAttaching: boolean;
  isSwitching: boolean;
  isDetaching: boolean;
}

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
  onAttach,
  onSwitch,
  onDetach,
  isAttaching,
  isSwitching,
  isDetaching,
}: OptionSetBindingDialogProps): React.ReactElement {
  const { t, language } = useI18n();
  const pickerId = React.useId();

  // Local to the dialog and reset on every open -- a set highlighted for one field must not survive
  // into the next field's dialog, which would make "Attach" act on a choice the admin never made
  // for THIS field.
  const [selectedSetId, setSelectedSetId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (open) setSelectedSetId(null);
  }, [open]);

  const selectedSet = bindableSets.find((set) => set.id === selectedSetId) ?? null;
  const isBusy = isAttaching || isSwitching || isDetaching;

  const handleAttach = async () => {
    if (!selectedSet) return;
    const ok = await onAttach(selectedSet.publishedVersionId as string);
    if (ok) onOpenChange(false);
  };

  const handleSwitch = async () => {
    if (!selectedSet) return;
    const ok = await onSwitch(selectedSet.publishedVersionId as string);
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
          // NOT gated on `canBind` -- this is the `.view`-only half of the picker's contract
          // (see this file's header and `useOptionSetBindingViewModel`'s own doc comment). An
          // admin who can see option sets but cannot bind them can still browse this list; only
          // the three action buttons below need `.bind`.
          disabled={isBusy}
        />

        <div className="space-y-3 rounded-md border border-nx-line p-3">
          <div>
            <p className="text-sm font-medium">{t("customField.optionSetBinding.attach.title")}</p>
            <p className="text-xs text-nx-ink-3">
              {t("customField.optionSetBinding.attach.description")}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAttach}
            disabled={!canBind || !selectedSet || isBusy}
          >
            {t("customField.optionSetBinding.attach.action")}
          </Button>
        </div>

        <div className="space-y-3 rounded-md border border-nx-line p-3">
          <div>
            <p className="text-sm font-medium">{t("customField.optionSetBinding.switch.title")}</p>
            <p className="text-xs text-nx-ink-3">
              {t("customField.optionSetBinding.switch.description")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSwitch}
            disabled={!canBind || !selectedSet || isBusy}
          >
            {t("customField.optionSetBinding.switch.action")}
          </Button>
        </div>

        <div className="space-y-3 rounded-md border border-destructive/40 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium">{t("customField.optionSetBinding.detach.title")}</p>
              <p className="text-xs text-nx-ink-3">
                {t("customField.optionSetBinding.detach.description")}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDetach}
            disabled={!canBind || isBusy}
          >
            {t("customField.optionSetBinding.detach.action")}
          </Button>
        </div>
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
