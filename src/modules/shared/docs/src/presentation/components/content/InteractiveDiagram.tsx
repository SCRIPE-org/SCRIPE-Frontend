"use client";

import { useState } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DiagramNode, DiagramConnection } from "../../../domain/entities/DocSection";
import { DiagramNodeItem } from "../ui/DiagramNodeItem";

interface InteractiveDiagramProps {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  titleKey?: string;
}

export function InteractiveDiagram({ nodes, connections, titleKey }: InteractiveDiagramProps) {
  const { t } = useDocsI18n();
  const [activeNode, setActiveNode] = useState<DiagramNode | null>(nodes[0] || null);

  return (
    <div className="mb-8">
      {titleKey && (
        <div className="mb-3 text-lg font-semibold leading-none tracking-tight text-nx-ink">
          {t(titleKey)}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {nodes.map((node) => {
          const conn = connections.find((c) => c.from === node.id);
          return (
            <div key={node.id} className="contents">
              <DiagramNodeItem
                node={node}
                isActive={activeNode?.id === node.id}
                onClick={() => setActiveNode(node)}
              />
              {conn && (
                <div className="flex flex-col items-center px-2">
                  <span className="text-lg font-bold text-nx-ink-3" aria-hidden="true">
                    →
                  </span>
                  {conn.labelKey && (
                    <span className="text-[11px] text-nx-ink-2">{t(conn.labelKey)}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {activeNode && (
        <div
          role="region"
          aria-label={t("widgets.interactiveDiagram.nodeDetailLabel")}
          className="mt-4 rounded-nx-md bg-nx-raised p-4"
        >
          <p className="text-sm leading-relaxed text-pretty text-nx-ink-2">
            {t(activeNode.descriptionKey)}
          </p>
        </div>
      )}
    </div>
  );
}
