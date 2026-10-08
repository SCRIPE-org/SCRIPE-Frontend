"use client";

import * as React from "react";
import { AlertTriangle, ArrowRightLeft, Link2, Unlink } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import type { OptionSet } from "../../../../option-set/src/domain/entities/OptionSet";

/**
 * Documentation for module export
 */
export interface OptionSetBindingActionsProps {
  boundSet: OptionSet | null;
  selectedSet: OptionSet | null;
  canBind: boolean;
  isSelectingCurrentSet: boolean;
  isBusy: boolean;
  isAttaching: boolean;
  isDetaching: boolean;
  onAttach: () => void;
  onDetach: () => void;
}

/**
 * Action controls for attaching, switching, or detaching an option set from a field.
 */
export function OptionSetBindingActions({
  boundSet,
  selectedSet,
  canBind,
  isSelectingCurrentSet,
  isBusy,
  isAttaching,
  isDetaching,
  onAttach,
  onDetach,
}: OptionSetBindingActionsProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <>
      <div className="space-y-3 rounded-lg border border-nx-line bg-nx-surface p-4 shadow-sm">
        <div className="flex items-start gap-2.5">
          {boundSet ? (
            <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-nx-accent" aria-hidden="true" />
          ) : (
            <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-nx-accent" aria-hidden="true" />
          )}
          <div>
            <p className="text-sm font-semibold text-nx-ink">
              {boundSet
                ? t("customField.optionSetBinding.switch.title")
                : t("customField.optionSetBinding.attach.title")}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-nx-ink-3">
              {boundSet
                ? t("customField.optionSetBinding.switch.description")
                : t("customField.optionSetBinding.attach.description")}
            </p>
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="sm"
            onClick={onAttach}
            disabled={!canBind || !selectedSet || isSelectingCurrentSet || isBusy}
            loading={isAttaching}
            className="gap-1.5"
          >
            {!isAttaching &&
              (boundSet ? (
                <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              ))}
            {boundSet
              ? t("customField.optionSetBinding.switch.action")
              : t("customField.optionSetBinding.attach.action")}
          </Button>
        </div>
      </div>

      {boundSet && (
        <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-destructive">
                {t("customField.optionSetBinding.detach.title")}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-nx-ink-3">
                {t("customField.optionSetBinding.detach.description")}
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDetach}
              disabled={!canBind || isBusy}
              loading={isDetaching}
              className="gap-1.5"
            >
              {!isDetaching && <Unlink className="h-3.5 w-3.5" aria-hidden="true" />}
              {t("customField.optionSetBinding.detach.action")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
