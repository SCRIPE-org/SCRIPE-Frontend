"use client";

/**
 * Attach, switch, or detach a shared option set on one Select or MultiSelect field's active version --
 * P-4's missing consumer.
 *
 * STATE-AWARE, NOT THREE BLIND BUTTONS. `FieldVersionSummary.boundOptionSetVersionId` (added
 * alongside this rewrite) means the dialog now knows, before the admin picks anything, whether the
 * field is bound and to what -- so it shows that fact plainly and offers exactly the one action that
 * applies: "Attach" when unbound, "Change option set" when bound to something else, nothing extra
 * when the picked set is already the bound one. `onAttach` picks bind vs rebind itself
 * (`useOptionSetBindingViewModel.attach`); this component never has to guess.
 *
 * SAME "ONE DIALOG, REAL CONTENT, NO NESTED CONFIRM" SHAPE `FieldImpactDialog` USES. Detach's
 * consequence is printed above its own button rather than behind a second "are you sure?" popup --
 * this module's own Wave 5 row 5.6 spent a commit removing nested-modal focus traps, and two
 * confirmations for one action is worse than one that says the truth.
 */
import * as React from "react";
import { AlertTriangle, CheckCircle2, Layers } from "lucide-react";
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

  /** The set the field is bound to right now, or null when unbound. Drives which action shows. */
  boundSet: OptionSet | null;

  /** Picks bind or rebind on its own -- see this file's header. */
  onAttach: (optionSetVersionId: string) => Promise<boolean>;
  onDetach: () => Promise<boolean>;
  isAttaching: boolean;
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
  boundSet,
  onAttach,
  onDetach,
  isAttaching,
  isDetaching,
}: OptionSetBindingDialogProps): React.ReactElement {
  const { t, language } = useI18n();
  const pickerId = React.useId();

  // Local to the dialog and reset on every open -- a set highlighted for one field must not survive
  // into the next field's dialog, which would make "Attach" act on a choice the admin never made
  // for THIS field. Pre-selected to the current binding, if any, so the picker opens already showing
  // the truth instead of a blank control next to a field that IS bound to something.
  const [selectedSetId, setSelectedSetId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (open) setSelectedSetId(boundSet?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on open only, not on every boundSet change
  }, [open]);

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

        <div
          className="flex items-center gap-2 rounded-md border border-nx-line bg-nx-raised p-3 text-sm"
          data-testid="option-set-binding-current-state"
        >
          {boundSet ? (
            <>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              <span>
                {t("customField.optionSetBinding.currentlyBound", {
                  set: boundSet.displayLabel(language),
                })}
              </span>
            </>
          ) : (
            <>
              <Layers className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
              <span>{t("customField.optionSetBinding.currentlyUnbound")}</span>
            </>
          )}
        </div>

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
          // the action buttons below need `.bind`.
          disabled={isBusy}
        />

        <div className="space-y-3 rounded-md border border-nx-line p-3">
          <div>
            <p className="text-sm font-medium">
              {boundSet
                ? t("customField.optionSetBinding.switch.title")
                : t("customField.optionSetBinding.attach.title")}
            </p>
            <p className="text-xs text-nx-ink-3">
              {boundSet
                ? t("customField.optionSetBinding.switch.description")
                : t("customField.optionSetBinding.attach.description")}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAttach}
            disabled={!canBind || !selectedSet || isSelectingCurrentSet || isBusy}
          >
            {boundSet
              ? t("customField.optionSetBinding.switch.action")
              : t("customField.optionSetBinding.attach.action")}
          </Button>
        </div>

        {boundSet && (
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
        )}
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
