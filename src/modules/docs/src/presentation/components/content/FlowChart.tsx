'use client';

import type { FlowNode, FlowConnection } from '../../../domain/entities/DocSection';

interface FlowChartProps {
      nodes: FlowNode[];
      connections: FlowConnection[];
      direction?: 'vertical' | 'horizontal';
      title?: string;
}

/**
 * CSS-based flowchart — no external library needed.
 * Renders nodes connected by arrows in vertical or horizontal direction.
 */
export function FlowChart({ nodes, connections, direction = 'vertical', title }: FlowChartProps) {
      // Build ordered sequence from connections
      const orderedNodes = getOrderedNodes(nodes, connections);

      return (
            <div className="docs-flowchart">
                  {title && <div className="docs-flowchart-title">{title}</div>}

                  <div className={direction === 'vertical' ? 'docs-flow-vertical' : 'docs-flow-horizontal'}>
                        {orderedNodes.map((node, idx) => {
                              // Find connection from this node to next
                              const conn = idx < orderedNodes.length - 1
                                    ? connections.find((c) => c.from === node.id && c.to === orderedNodes[idx + 1]?.id)
                                    : undefined;

                              return (
                                    <div key={node.id} style={{ display: 'contents' }}>
                                          <div
                                                className="docs-flow-node"
                                                data-type={node.type || 'default'}
                                                title={node.description}
                                          >
                                                {node.label}
                                          </div>

                                          {conn && idx < orderedNodes.length - 1 && (
                                                direction === 'vertical' ? (
                                                      <div className="docs-flow-connector docs-flow-connector-vertical">
                                                            <div className="docs-flow-connector-line" />
                                                            {conn.label && <span className="docs-flow-connector-label">{conn.label}</span>}
                                                            <div className="docs-flow-connector-arrow" />
                                                      </div>
                                                ) : (
                                                      <div className="docs-flow-connector docs-flow-connector-horizontal">
                                                            <div className="docs-flow-connector-h-line" />
                                                            {conn.label && <span className="docs-flow-connector-label">{conn.label}</span>}
                                                            <div className="docs-flow-connector-h-arrow" />
                                                      </div>
                                                )
                                          )}
                                    </div>
                              );
                        })}
                  </div>
            </div>
      );
}

/** Extract ordered sequence from connections graph */
function getOrderedNodes(nodes: FlowNode[], connections: FlowConnection[]): FlowNode[] {
      if (connections.length === 0) return nodes;

      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      const incoming = new Set(connections.map((c) => c.to));

      // Find root (node not targeted by any connection)
      let rootId = connections[0]?.from;
      for (const node of nodes) {
            if (!incoming.has(node.id)) {
                  rootId = node.id;
                  break;
            }
      }

      // Walk the chain
      const ordered: FlowNode[] = [];
      const visited = new Set<string>();
      let current: string | undefined = rootId;

      while (current && !visited.has(current)) {
            visited.add(current);
            const node = nodeMap.get(current);
            if (node) ordered.push(node);

            const next = connections.find((c) => c.from === current);
            current = next?.to;
      }

      // Add any remaining unvisited nodes
      for (const node of nodes) {
            if (!visited.has(node.id)) {
                  ordered.push(node);
            }
      }

      return ordered;
}
