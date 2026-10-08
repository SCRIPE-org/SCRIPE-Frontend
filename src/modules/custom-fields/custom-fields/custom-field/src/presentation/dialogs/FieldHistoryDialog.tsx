"use client";

import React from "react";
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
import { Skeleton } from "@core/ui/skeleton";
import { useI18n } from "@core/providers/i18n-provider";
import type { FieldHistoryPage } from "../../domain/entities/FieldInsight";

/**
 * Badge variant per change kind — Wave 6 row 6.6.
 *
 * `Deleted` and `Purged` MUST NOT look the same. One is recoverable within the retention window and
 * one is gone; rendering them identically makes a retention question unanswerable from the page that
 * exists to answer it. `Deleted` is destructive-toned, `Purged` is stronger still.
 *
 * An unrecognised kind falls back to a neutral badge rather than being dropped. A history that
 * quietly omits rows is worse than one showing an unfamiliar label — the server deliberately reports
 * unknown event types rather than discarding them, and the UI must not undo that.
 */
const CHANGE_KIND_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Created: "default",
  Updated: "secondary",
  Deactivated: "outline",
  Reactivated: "secondary",
  Deleted: "destructive",
  Restored: "default",
  Purged: "destructive",
};

/** Derived from the variant map so a kind can never have a colour but no label, or the reverse. */
const KNOWN_KINDS = new Set(Object.keys(CHANGE_KIND_VARIANT));

/** Kinds rendered with extra emphasis, so a purge cannot be mistaken for an ordinary delete. */
const EMPHASISED_KINDS = new Set(["Purged"]);

/**
 * Parts the server can report. Kept alongside the kind map for the same reason: `t()` has no
 * default-value option -- it returns the raw KEY on a miss and warns loudly in development -- so an
 * unrecognised value must be detected here and rendered as itself, rather than passed to `t()` and
 * rendered as "customField.history.part.Whatever".
 */
const KNOWN_PARTS = new Set(["Field", "Definition", "Version", "Option", "VisibilityRule"]);

/** Translates a known value, or returns an unknown one verbatim. Never emits a translation key. */
function labelFor(
  known: ReadonlySet<string>,
  prefix: string,
  value: string,
  t: (key: string) => string
): string {
  return known.has(value) ? t(`${prefix}.${value}`) : value;
}

/**
 * Documentation for module export
 */
export interface FieldHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldLabel: string;
  history: FieldHistoryPage | null;
  isLoading: boolean;
  isError: boolean;
  /** Server error message, shown verbatim when present — it names the deployment fix. */
  errorMessage?: string | null;
  page: number;
  onPageChange: (page: number) => void;
}

/**
 * Documentation for FieldHistoryDialog
 */
export function FieldHistoryDialog({
  open,
  onOpenChange,
  fieldLabel,
  history,
  isLoading,
  isError,
  errorMessage,
  page,
  onPageChange,
}: FieldHistoryDialogProps) {
  const { t, language } = useI18n();

  const pageSize = history?.pageSize ?? 25;
  const totalPages = history ? Math.max(1, Math.ceil(history.totalCount / pageSize)) : 1;

  const formatTimestamp = (iso: string) => {
    const parsed = new Date(iso);
    // Guard rather than render "Invalid Date": a history row with an unparseable timestamp should
    // still show what changed and who changed it.
    return Number.isNaN(parsed.getTime()) ? iso : parsed.toLocaleString(language);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("customField.history.title", { field: fieldLabel })}</DialogTitle>
          <DialogDescription>{t("customField.history.description")}</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-2" data-testid="history-loading">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-5/6" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive" role="alert">
            {/* Shown verbatim when the server sent one. For the split-deployment case the server's
                message names the configuration fix, which is strictly more useful than a generic
                "couldn't load" -- and that endpoint FAILS rather than returning an empty page
                precisely so this is distinguishable from "nothing ever changed". */}
            {errorMessage || t("customField.history.loadFailed")}
          </p>
        )}

        {history && !isLoading && !isError && (
          <>
            {history.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("customField.history.empty")}</p>
            ) : (
              <ul className="max-h-[50vh] space-y-3 overflow-y-auto">
                {history.items.map((entry) => {
                  const emphasised = EMPHASISED_KINDS.has(entry.changeKind);
                  return (
                    <li
                      key={entry.id}
                      className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={CHANGE_KIND_VARIANT[entry.changeKind] ?? "outline"}>
                          {/* Unrecognised kinds render as themselves -- see labelFor. */}
                          {labelFor(
                            KNOWN_KINDS,
                            "customField.history.kind",
                            entry.changeKind,
                            t
                          )}
                        </Badge>
                        <Badge variant="outline">
                          {labelFor(KNOWN_PARTS, "customField.history.part", entry.part, t)}
                        </Badge>
                        {emphasised && (
                          <span className="text-xs font-medium text-destructive">
                            {t("customField.history.purgedNote")}
                          </span>
                        )}
                        <span className="ms-auto text-xs text-muted-foreground" dir="ltr">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {t("customField.history.performedBy", {
                          // "System" rather than an empty gap: a null actor means the change had no
                          // authenticated user, which is information, not an absence.
                          user: entry.performedBy || t("customField.history.systemActor"),
                        })}
                      </p>

                      {entry.changedProperties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.changedProperties.map((prop) => (
                            <Badge key={prop} variant="secondary" className="text-xs font-normal">
                              {prop}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        <DialogFooter className="items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">
            {history
              ? t("customField.history.pageOf", { page, totalPages, total: history.totalCount })
              : ""}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={isLoading || page <= 1}
            >
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={isLoading || page >= totalPages}
            >
              {t("common.next")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              {t("common.close")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
