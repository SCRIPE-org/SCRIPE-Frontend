import React from "react";
import { ListFilter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Documentation for module export
 */
export interface DetailOptionsSectionProps {
  optionsList: Array<{ en: string; ar: string }>;
}

/**
 * Documentation for DetailOptionsSection
 */
export function DetailOptionsSection({
  optionsList,
}: DetailOptionsSectionProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
        {t("customField.details.sections.options", {
          count: optionsList.length,
        })}
      </h3>
      {optionsList.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          {t("customField.details.optionsTable.empty")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-12 text-center">
                  {t("customField.details.optionsTable.index")}
                </TableHead>
                <TableHead>{t("customField.details.optionsTable.labelEn")}</TableHead>
                <TableHead>{t("customField.details.optionsTable.labelAr")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optionsList.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{row.en || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {row.ar || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
