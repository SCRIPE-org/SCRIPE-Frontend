"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { SchemaColumn } from "../../../domain/entities/DocSection";

interface SchemaColumnRowProps {
  column: SchemaColumn;
}

export function SchemaColumnRow({ column }: SchemaColumnRowProps) {
  const { t } = useDocsI18n();
  return (
    <tr className="docs-schema-row">
      <td className="docs-schema-cell-name">
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
          {column.isPrimaryKey && <span title="Primary Key">🔑</span>}
          {column.isForeignKey && <span title="Foreign Key">🔗</span>}
          <span style={{ fontWeight: column.isPrimaryKey ? "bold" : "normal" }}>{column.name}</span>
        </span>
      </td>
      <td className="docs-schema-cell-type">{column.type}</td>
      <td className="docs-schema-cell-nullable">
        {column.nullable ? "NULL" : "NOT NULL"}
      </td>
      <td className="docs-schema-cell-notes">{t(column.notesKey)}</td>
    </tr>
  );
}
