"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { MatrixCell } from "../../../domain/entities/DocSection";
import { MatrixCellBadge } from "../ui/MatrixCellBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@core/ui/table";

interface CompatibilityMatrixProps {
  headers: string[];
  rows: { nameKey: string; cells: MatrixCell[] }[];
}

export function CompatibilityMatrix({ headers, rows }: CompatibilityMatrixProps) {
  const { t, direction } = useDocsI18n();
  return (
    <div className="mb-8 overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface">
      <Table dir={direction}>
        <TableHeader className="bg-nx-raised">
          <TableRow>
            <TableHead />
            {headers.map((h, i) => (
              <TableHead key={i}>{t(h)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, ri) => (
            <TableRow key={ri}>
              <TableCell className="font-semibold text-nx-ink">{t(row.nameKey)}</TableCell>
              {row.cells.map((cell, ci) => (
                <TableCell key={ci}>
                  <MatrixCellBadge cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
