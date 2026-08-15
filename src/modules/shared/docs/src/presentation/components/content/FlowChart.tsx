"use client";

import { useId } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { FlowNode, FlowConnection } from "../../../domain/entities/DocSection";

interface FlowChartProps {
  nodes: FlowNode[];
  connections: FlowConnection[];
  direction?: "vertical" | "horizontal";
  title?: string;
}

/**
 * CSS-based flowchart — no external library needed.
 * Renders nodes connected by arrows in vertical or horizontal direction.
 */
export function FlowChart({ nodes, connections, direction = "vertical", title }: FlowChartProps) {
  const { t } = useDocsI18n();
  const captionId = useId();
  // Build ordered sequence from connections
  const orderedNodes = getOrderedNodes(nodes, connections);

  return (
    <figure
      className="docs-flowchart"
      aria-labelledby={title ? captionId : undefined}
      aria-label={title ? undefined : t("common.flowDiagram")}
    >
      {title && (
        <figcaption id={captionId} className="docs-flowchart-title">
          {t(title)}
        </figcaption>
      )}

      <div className={direction === "vertical" ? "docs-flow-vertical" : "docs-flow-horizontal"}>
        {orderedNodes.map((node, idx) => {
          // Find connection from this node to next
          const conn =
            idx < orderedNodes.length - 1
              ? connections.find((c) => c.from === node.id && c.to === orderedNodes[idx + 1]?.id)
              : undefined;
          const description = node.descriptionKey ? t(node.descriptionKey) : node.description;

          return (
            <div key={node.id} style={{ display: "contents" }}>
              {/* The description rides in an assistive-only span rather than a
                  title attribute: title is a mouse tooltip, not a name a
                  keyboard or screen-reader user ever reaches. */}
              <div className="docs-flow-node" data-type={node.type || "default"}>
                {t(node.labelKey || node.label || node.id)}
                {description && <span className="docs-sr-only"> — {description}</span>}
              </div>

              {conn &&
                idx < orderedNodes.length - 1 &&
                (direction === "vertical" ? (
                  <div className="docs-flow-connector docs-flow-connector-vertical">
                    <div className="docs-flow-connector-line" aria-hidden="true" />
                    {(conn.labelKey || conn.label) && (
                      <span className="docs-flow-connector-label">
                        {t(conn.labelKey || conn.label || "")}
                      </span>
                    )}
                    <div className="docs-flow-connector-arrow" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="docs-flow-connector docs-flow-connector-horizontal">
                    <div className="docs-flow-connector-h-line" aria-hidden="true" />
                    {(conn.labelKey || conn.label) && (
                      <span className="docs-flow-connector-label">
                        {t(conn.labelKey || conn.label || "")}
                      </span>
                    )}
                    <div className="docs-flow-connector-h-arrow" aria-hidden="true" />
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </figure>
  );
}

/** Extract ordered sequence from connections graph via topological sort (handles branching). */
function getOrderedNodes(nodes: FlowNode[], connections: FlowConnection[]): FlowNode[] {
  if (connections.length === 0) return nodes;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Build adjacency and in-degree maps
  const outEdges = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    outEdges.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const conn of connections) {
    outEdges.get(conn.from)?.push(conn.to);
    inDegree.set(conn.to, (inDegree.get(conn.to) ?? 0) + 1);
  }

  // Kahn's algorithm — start from nodes with no incoming edges
  const queue: string[] = [];
  for (const [id, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(id);
  }

  const ordered: FlowNode[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const node = nodeMap.get(current);
    if (node) ordered.push(node);

    for (const neighbor of outEdges.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  // Append any unvisited nodes (disconnected or in a cycle)
  for (const node of nodes) {
    if (!visited.has(node.id)) ordered.push(node);
  }

  return ordered;
}
