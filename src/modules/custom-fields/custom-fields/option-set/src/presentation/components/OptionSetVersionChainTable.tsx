"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { formatDateTime } from "@core/common/utils";
import { OptionSetStatusBadge } from "./OptionSetStatusBadge";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";

/**
 * Documentation for module export
 */
export interface OptionSetVersionChainTableProps {
  versions: readonly OptionSetVersion[];
  openVersionId: string | null;
  onOpenVersion: (versionId: string) => void;
  chainHeadingId: string;
}

/**
 * Documentation for OptionSetVersionChainTable
 */
export function OptionSetVersionChainTable({
  versions,
  openVersionId,
  onOpenVersion,
  chainHeadingId,
}: OptionSetVersionChainTableProps) {
  const { t } = useI18n();

  return (
    <div className="overflow-x-auto rounded-nx-md border border-nx-line">
      <Table aria-labelledby={chainHeadingId}>
        <TableHeader>
          <TableRow>
            <TableHead>{t("optionSet.columns.versions")}</TableHead>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead>{t("optionSet.versions.publishedAt")}</TableHead>
            <TableHead>{t("optionSet.items.title")}</TableHead>
            <TableHead className="text-end">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((version) => (
            <TableRow key={version.id}>
              <TableCell className="font-medium tabular-nums">
                {t("optionSet.versions.versionLabel", { number: version.versionNumber })}
              </TableCell>
              <TableCell>
                <OptionSetStatusBadge kind="version" status={version.status} />
              </TableCell>
              <TableCell className="text-sm text-nx-ink-2">
                {version.publishedAtUtc ? (
                  <span dir="ltr">{formatDateTime(version.publishedAtUtc)}</span>
                ) : (
                  t("optionSet.versions.notPublished")
                )}
              </TableCell>
              <TableCell className="text-sm text-nx-ink-2">
                {t("optionSet.versions.itemCount", { count: version.itemCount })}
              </TableCell>
              <TableCell className="text-end">
                <Button
                  type="button"
                  size="sm"
                  variant={openVersionId === version.id ? "secondary" : "ghost"}
                  onClick={() => onOpenVersion(version.id)}
                  aria-label={t("optionSet.versions.openVersion", {
                    number: version.versionNumber,
                  })}
                >
                  {t("common.open")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
