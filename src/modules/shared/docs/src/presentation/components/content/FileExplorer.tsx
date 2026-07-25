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
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
          {moduleName}
        </div>
        <div className="flex flex-col gap-0.5">
          {files.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("widgets.fileExplorer.emptyTree")}</p>
          ) : (
            files.map((file, idx) => (
              <FileTreeNode
                key={file.path}
                file={file}
                isActive={idx === activeIdx}
                onClick={() => setActiveIdx(idx)}
              />
            ))
          )}
        </div>
      </div>
      <div className="docs-explorer-panel">
        {activeIdx !== null ? (
          <div>
            <h3 className="mb-2 text-lg font-semibold leading-none tracking-tight text-nx-ink">
              {files[activeIdx].name}
            </h3>
            <p className="text-sm leading-relaxed text-pretty text-nx-ink-2">
              {t(files[activeIdx].descriptionKey)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-nx-ink-2">{t("widgets.fileExplorer.selectFilePrompt")}</p>
        )}
      </div>
    </div>
  );
}
