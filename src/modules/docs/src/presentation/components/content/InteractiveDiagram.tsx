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
    <div className="docs-diagram-container" style={{ marginBottom: "2rem" }}>
      {titleKey && <div className="docs-diagram-title">{t(titleKey)}</div>}
      <div className="docs-diagram-flow" style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        {nodes.map((node, idx) => {
          const conn = connections.find((c) => c.from === node.id);
          return (
            <div key={node.id} style={{ display: "contents" }}>
              <DiagramNodeItem
                node={node}
                isActive={activeNode?.id === node.id}
                onClick={() => setActiveNode(node)}
              />
              {conn && (
                <div className="docs-diagram-arrow-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span className="arrow" style={{ color: "var(--docs-purple-primary)" }}>→</span>
                  {conn.labelKey && (
                    <span className="arrow-lbl" style={{ fontSize: "0.65rem", color: "hsl(var(--muted-foreground))" }}>
                      {t(conn.labelKey)}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {activeNode && (
        <div className="docs-diagram-detail" style={{ marginTop: "1rem", padding: "1rem", background: "var(--bg-primary)", borderRadius: "8px" }}>
          <p style={{ fontSize: "0.85rem", lineHeight: "1.6" }}>{t(activeNode.descriptionKey)}</p>
        </div>
      )}
    </div>
  );
}
