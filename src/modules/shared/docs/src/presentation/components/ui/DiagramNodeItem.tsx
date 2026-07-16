"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DiagramNode } from "../../../domain/entities/DocSection";

interface DiagramNodeItemProps {
  node: DiagramNode;
  isActive: boolean;
  onClick: () => void;
}

export function DiagramNodeItem({ node, isActive, onClick }: DiagramNodeItemProps) {
  const { t } = useDocsI18n();
  return (
    <div
      className={`docs-diagram-node-item docs-node-${node.type} ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {t(node.labelKey)}
    </div>
  );
}
