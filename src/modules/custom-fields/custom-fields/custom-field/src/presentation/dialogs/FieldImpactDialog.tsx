"use client";

import React from "react";
import { AlertTriangle, Building2, Database, EyeOff, ListOrdered } from "lucide-react";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Skeleton } from "@core/ui/skeleton";
import { useI18n } from "@core/providers/i18n-provider";
import type { FieldUsage } from "../../domain/entities/FieldInsight";

/**
 * Shows what a custom field is carrying, and what deleting it would cost — Wave 6 row 6.3.
 *
 * ONE COMPONENT, TWO ENTRY POINTS
 * -------------------------------
 * Opened either from the row action ("Usage & impact") or as the delete confirmation. Building it
 * twice is how the dialog and the server's refusal drift apart: the confirmation would eventually
 * describe different numbers from the ones the server refused on.
 *
 * TWO RULES THAT ARE NOT STYLE CHOICES
 * ------------------------------------
 * 1. **Counts are labelled from `isPlatformWideScope`, never assumed.** For a platform-owned field
 *    the caller-scoped and platform-wide totals differ by orders of magnitude, and nothing about the
 *    number itself says which one arrived. Labelling it wrong tells an admin their organisation has
 *    40,000 values when 300 are theirs, or the reverse.
 * 2. **The destructive warning is gated on `wouldDestroyDataOnDelete`, never re-derived from the
 *    counts.** That flag and the server's 409 are decided by one expression, so reading it makes
 *    them unable to disagree — and it is true in cases the visible counts do not show, such as a
 *    definition whose rows live only in the legacy table.
 */
export interface FieldImpactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The field's display label, for the title. */
  fieldLabel: string;
  usage: FieldUsage | null;
  isLoading: boolean;
  isError: boolean;
  /**
   * Present only in confirm mode. Absent means the dialog is informational and shows a single
   * dismiss button — the same component, without a destructive action attached.
   */
  onConfirmDelete?: () => void;
  isDeleting?: boolean;
}

/**
 * Documentation for FieldImpactDialog
 */
export function FieldImpactDialog({
  open,
  onOpenChange,
  fieldLabel,
  usage,
  isLoading,
  isError,
  onConfirmDelete,
  isDeleting = false,
}: FieldImpactDialogProps) {
  const { t } = useI18n();
  const isConfirmMode = typeof onConfirmDelete === "function";

  // Read off the flag, never derived from totalValueCount -- see the component doc.
  const wouldDestroy = usage?.wouldDestroyDataOnDelete === true;

  const scopeLabel = usage?.isPlatformWideScope
    ? t("customField.impact.scopeAllOrganisations")
    : t("customField.impact.scopeYourOrganisation");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isConfirmMode
              ? t("customField.impact.confirmTitle", { field: fieldLabel })
              : t("customField.impact.title", { field: fieldLabel })}
          </DialogTitle>
          <DialogDescription>
            {/* The scope sentence is part of the description, not a footnote: it changes what every
                number below means. */}
            {scopeLabel}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-2" data-testid="impact-loading">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive" role="alert">
            {t("customField.impact.loadFailed")}
          </p>
        )}

        {usage && !isLoading && !isError && (
          <div className="space-y-4 text-sm">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Database className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>
                  {t("customField.impact.storedValues", { count: usage.totalValueCount })}
                </span>
              </li>

              {/* Rendered only when non-zero. A permanent "0 legacy values" line trains people to
                  ignore the row, and this table is the one an admin is least likely to expect. */}
              {usage.legacyValueCount > 0 && (
                <li className="flex items-center gap-2">
                  <Database className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>
                    {t("customField.impact.legacyValues", { count: usage.legacyValueCount })}
                  </span>
                </li>
              )}

              {usage.optionCount > 0 && (
                <li className="flex items-center gap-2">
                  <ListOrdered
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{t("customField.impact.options", { count: usage.optionCount })}</span>
                </li>
              )}

              {usage.fieldsDependingOnThisField > 0 && (
                <li className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {/* The consequence nobody anticipates, so it is spelled out rather than left as a
                      bare count: deactivating this field hides the fields that depend on it. */}
                  <span>
                    {t("customField.impact.dependentFields", {
                      count: usage.fieldsDependingOnThisField,
                    })}
                  </span>
                </li>
              )}

              {usage.rulesHidingThisField > 0 && (
                <li className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>
                    {t("customField.impact.rulesHiding", { count: usage.rulesHidingThisField })}
                  </span>
                </li>
              )}

              {/* Only meaningful when the counts are platform-wide; the server sends it only then. */}
              {usage.isPlatformWideScope && typeof usage.affectedTenantCount === "number" && (
                <li className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span>
                    {t("customField.impact.affectedTenants", {
                      count: usage.affectedTenantCount,
                    })}
                  </span>
                </li>
              )}
            </ul>

            {usage.byEntityType.length > 0 && (
              <div>
                <p className="mb-1 font-medium">{t("customField.impact.byRecordType")}</p>
                <ul className="space-y-1 text-muted-foreground">
                  {usage.byEntityType.map((row) => (
                    <li key={row.entityTypeKey} className="flex justify-between gap-4">
                      <span dir="ltr">{row.entityTypeKey}</span>
                      <span>{row.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {wouldDestroy && (
              <p
                className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-destructive"
                role="alert"
                data-testid="impact-destructive-warning"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {/* Says "will be destroyed", not "is in use". The delete is soft, but the retention
                    job purges the values by cascade once the window passes -- so the honest
                    statement is that the data goes, just not today. */}
                <span>{t("customField.impact.destructiveWarning")}</span>
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {isConfirmMode ? t("common.cancel") : t("common.close")}
          </Button>

          {isConfirmMode && (
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              // Disabled until the counts have loaded: the whole point is that the decision is made
              // against real numbers, so confirming over a skeleton would defeat the dialog. An
              // errored load also blocks it -- better to retry than to force blind.
              disabled={isDeleting || isLoading || isError}
            >
              {wouldDestroy
                ? t("customField.impact.deleteAnyway")
                : t("customField.impact.deleteConfirm")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
