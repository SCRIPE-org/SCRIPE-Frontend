"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { SchemaTable } from "../../../domain/entities/DocSection";
import { SchemaColumnRow } from "../ui/SchemaColumnRow";

interface SchemaVisualizerProps {
  tables: SchemaTable[];
  titleKey: string;
}

export function SchemaVisualizer({ tables, titleKey }: SchemaVisualizerProps) {
  const { t } = useDocsI18n();
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
          <div className="docs-explorer-header">Database Entities</div>
          {tables.map((tbl, idx) => (
            <div
              key={idx}
              className={`docs-tree-node ${idx === activeTableIdx ? "active" : ""}`}
              onClick={() => setActiveTableIdx(idx)}
            >
              <span>📊</span>
              <span>{tbl.tableName}</span>
            </div>
          ))}
        </div>
        <div className="docs-explorer-panel" style={{ padding: "0.5rem" }}>
          <table className="docs-matrix-table" style={{ border: "none", width: "100%" }}>
            <thead>
              <tr style={{ background: "transparent" }}>
                <th>Column Name</th>
                <th>Type</th>
                <th>Nullable</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {tables[activeTableIdx].columns.map((col, cIdx) => (
                <SchemaColumnRow key={cIdx} column={col} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
