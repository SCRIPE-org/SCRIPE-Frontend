"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { DiagramNode } from "../../../domain/entities/DocSection";

interface DiagramNodeItemProps {
  node: DiagramNode;
  isActive: boolean;
  onClick: () => void;
}

/**
 * DiagramNodeItem — one selectable node in the flow diagram. A real button so
 * the diagram is walkable by keyboard; `aria-pressed` marks which node's
 * detail is currently shown below the flow.
 */
export function DiagramNodeItem({ node, isActive, onClick }: DiagramNodeItemProps) {
  const { t } = useDocsI18n();
  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={`docs-diagram-node-item docs-node-${node.type} ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {t(node.labelKey)}
    </button>
  );
}
