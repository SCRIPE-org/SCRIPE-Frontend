"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { SchemaColumn } from "../../../domain/entities/DocSection";
import { TableRow, TableCell } from "@core/ui/table";

interface SchemaColumnRowProps {
  column: SchemaColumn;
}

/**
 * Documentation for module export
 */
export function SchemaColumnRow({ column }: SchemaColumnRowProps) {
  const { t } = useDocsI18n();
  return (
    <TableRow>
      <TableCell className="font-mono text-nx-ink">
        <span className="inline-flex items-center gap-1">
          {column.isPrimaryKey && (
            <>
              <span aria-hidden="true">🔑</span>
              <span className="docs-sr-only">{t("schema.primaryKey")}</span>
            </>
          )}
          {column.isForeignKey && (
            <>
              <span aria-hidden="true">🔗</span>
              <span className="docs-sr-only">{t("schema.foreignKey")}</span>
            </>
          )}
          <span className={column.isPrimaryKey ? "font-bold" : "font-normal"}>{column.name}</span>
        </span>
      </TableCell>
      <TableCell className="font-mono text-xs text-nx-accent">{column.type}</TableCell>
      <TableCell className="text-xs text-nx-ink-2">
        {column.nullable ? "NULL" : "NOT NULL"}
      </TableCell>
      <TableCell className="text-nx-ink-2">{t(column.notesKey)}</TableCell>
    </TableRow>
  );
}
