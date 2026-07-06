"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { ExplorerFile } from "../../../domain/entities/DocSection";
import { FileTreeNode } from "../ui/FileTreeNode";

interface FileExplorerProps {
  moduleName: string;
  files: ExplorerFile[];
}

export function FileExplorer({ moduleName, files }: FileExplorerProps) {
  const { t } = useDocsI18n();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="docs-explorer-layout">
      <div className="docs-explorer-sidebar">
        <div className="docs-explorer-header">{moduleName}</div>
        <div className="docs-explorer-tree">
          {files.map((file, idx) => (
            <FileTreeNode
              key={idx}
              file={file}
              isActive={idx === activeIdx}
              onClick={() => setActiveIdx(idx)}
            />
          ))}
        </div>
      </div>
      <div className="docs-explorer-panel">
        {activeIdx !== null ? (
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              {files[activeIdx].name}
            </h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "hsl(var(--muted-foreground))",
                lineHeight: "1.6",
              }}
            >
              {t(files[activeIdx].descriptionKey)}
            </p>
          </div>
        ) : (
          <p
            className="docs-explorer-empty"
            style={{ fontSize: "0.85rem", color: "hsl(var(--muted-foreground))" }}
          >
            Select a file to view guidelines...
          </p>
        )}
      </div>
    </div>
  );
}
