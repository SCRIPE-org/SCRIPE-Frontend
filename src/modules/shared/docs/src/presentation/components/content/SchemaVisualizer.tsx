"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { SchemaTable } from "../../../domain/entities/DocSection";
import { SchemaColumnRow } from "../ui/SchemaColumnRow";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@core/ui/table";

interface SchemaVisualizerProps {
  tables: SchemaTable[];
  titleKey: string;
}

export function SchemaVisualizer({ tables, titleKey }: SchemaVisualizerProps) {
  const { t, direction } = useDocsI18n();
  const [activeTableIdx, setActiveTableIdx] = useState<number>(0);

  if (!tables || tables.length === 0) return null;

  return (
    <div className="docs-schema-container" style={{ marginBottom: "2.5rem" }}>
      <div
        className="docs-schema-title"
        style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem" }}
      >
        {t(titleKey)}
      </div>
      <div className="docs-explorer-layout" style={{ height: "360px" }}>
        <div className="docs-explorer-sidebar">
          <div className="docs-explorer-header">{t("schema.entities")}</div>
          {tables.map((tbl, idx) => (
            <button
              key={idx}
              type="button"
              aria-pressed={idx === activeTableIdx}
              className={`docs-tree-node ${idx === activeTableIdx ? "active" : ""}`}
              onClick={() => setActiveTableIdx(idx)}
            >
              <span aria-hidden="true">📊</span>
              <span>{tbl.tableName}</span>
            </button>
          ))}
        </div>
        <div className="docs-explorer-panel" style={{ padding: "0.5rem" }}>
          <Table dir={direction}>
            <TableHeader>
              <TableRow>
                <TableHead>{t("schema.columnName")}</TableHead>
                <TableHead>{t("schema.type")}</TableHead>
                <TableHead>{t("schema.nullable")}</TableHead>
                <TableHead>{t("api.description")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables[activeTableIdx].columns.map((col, cIdx) => (
                <SchemaColumnRow key={cIdx} column={col} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
