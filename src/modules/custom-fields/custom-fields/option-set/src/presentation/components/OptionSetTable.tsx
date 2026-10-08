"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import type { OptionSet } from "../../domain/entities/OptionSet";

/**
 * Documentation for module export
 */
export interface OptionSetTableProps {
  sets: readonly OptionSet[];
  selectedSetId: string | null;
  onSelectSet: (id: string) => void;
  canUpdateSet: (set: OptionSet) => boolean;
  canDeleteSet: (set: OptionSet) => boolean;
  onEditSet: (id: string) => void;
  onDeleteSet: (set: OptionSet) => void;
  language: string;
}

/**
 * Documentation for OptionSetTable
 */
export function OptionSetTable({
  sets,
  selectedSetId,
  onSelectSet,
  canUpdateSet,
  canDeleteSet,
  onEditSet,
  onDeleteSet,
  language,
}: OptionSetTableProps) {
  const { t } = useI18n();

  return (
    <div className="overflow-x-auto rounded-nx-md border border-nx-line">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("optionSet.columns.label")}</TableHead>
            <TableHead>{t("optionSet.columns.stableKey")}</TableHead>
            <TableHead>{t("optionSet.columns.description")}</TableHead>
            <TableHead>{t("optionSet.columns.scope")}</TableHead>
            <TableHead>{t("optionSet.columns.versions")}</TableHead>
            <TableHead>{t("optionSet.columns.publishedVersion")}</TableHead>
            <TableHead className="text-end">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sets.map((set) => {
            const label = set.displayLabel(language);
            const secondaryLabel =
              language === "ar"
                ? set.labelEn !== label
                  ? set.labelEn
                  : null
                : set.labelAr && set.labelAr !== label
                  ? set.labelAr
                  : null;
            const canUpdate = canUpdateSet(set);
            const canDelete = canDeleteSet(set);
            const isSelected = selectedSetId === set.id;

            return (
              <TableRow key={set.id} data-state={isSelected ? "selected" : undefined}>
                <TableCell className="align-top">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-start font-medium"
                    onClick={() => onSelectSet(set.id)}
                    aria-pressed={isSelected}
                  >
                    {label}
                  </Button>
                  {secondaryLabel ? (
                    <p className="text-xs text-nx-ink-3">{secondaryLabel}</p>
                  ) : null}
                </TableCell>

                <TableCell className="align-top">
                  <span className="font-mono text-xs text-nx-ink-2" dir="ltr">
                    {set.stableKey}
                  </span>
                </TableCell>

                <TableCell className="align-top text-sm text-nx-ink-2">
                  {set.description ?? <span className="text-nx-ink-3">{t("common.none")}</span>}
                </TableCell>

                <TableCell className="align-top">
                  <div className="flex flex-wrap gap-1">
                    {set.isSystemManaged ? (
                      <Badge variant="warning">{t("optionSet.badge.systemManaged")}</Badge>
                    ) : null}
                    {set.isPlatformOwned ? (
                      <Badge variant="info">{t("optionSet.badge.platformOwned")}</Badge>
                    ) : null}
                  </div>
                </TableCell>

                <TableCell className="align-top text-sm tabular-nums text-nx-ink-2">
                  {t("optionSet.values.versionCount", { count: set.versionCount })}
                </TableCell>

                <TableCell className="align-top text-sm">
                  {set.publishedVersionNumber !== null ? (
                    <Badge variant="success">
                      {t("optionSet.values.publishedVersionNumber", {
                        number: set.publishedVersionNumber,
                      })}
                    </Badge>
                  ) : (
                    <span className="text-nx-ink-3">
                      {t("optionSet.values.noPublishedVersion")}
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-end align-top">
                  <div className="flex items-center justify-end gap-1">
                    {canUpdate ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSet(set.id)}
                        aria-label={`${t("common.edit")} ${label}`}
                      >
                        {t("common.edit")}
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => onDeleteSet(set)}
                        aria-label={`${t("common.delete")} ${label}`}
                      >
                        {t("common.delete")}
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
