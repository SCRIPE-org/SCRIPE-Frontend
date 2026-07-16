"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { MatrixCell } from "../../../domain/entities/DocSection";
import { MatrixCellBadge } from "../ui/MatrixCellBadge";

interface CompatibilityMatrixProps {
  headers: string[];
  rows: { nameKey: string; cells: MatrixCell[] }[];
}

export function CompatibilityMatrix({ headers, rows }: CompatibilityMatrixProps) {
  const { t } = useDocsI18n();
  return (
    <div
      className="docs-matrix-table-container"
      style={{ overflowX: "auto", marginBottom: "2rem" }}
    >
      <table className="docs-matrix-table">
        <thead>
          <tr>
            <th></th>
            {headers.map((h, i) => (
              <th key={i}>{t(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <td>
                <strong>{t(row.nameKey)}</strong>
              </td>
              {row.cells.map((cell, ci) => (
                <td key={ci}>
                  <MatrixCellBadge cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
