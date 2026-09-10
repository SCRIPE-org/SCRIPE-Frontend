import type { TreeNode } from "@core/hooks/use-tree-view-model";
import type { SchedulableResource } from "../../domain/entities/SchedulableResource";

/**
 * Flat-list-to-tree adapter. The backend exposes only a flat, paginated list
 * (GetSchedulableResourcesQuery) — there is no dedicated "get tree" endpoint yet — so the
 * composition hierarchy is built client-side from each resource's parentSchedulableResourceId.
 * Fine at Slice A scale (a handful of resources per tenant); a server-side tree endpoint is a
 * reasonable fast-follow once tenants have hundreds of schedulable resources.
 */
export interface SchedulableResourceTreeNode extends TreeNode {
  resource: SchedulableResource;
  children?: SchedulableResourceTreeNode[];
}

export function buildResourceTree(items: SchedulableResource[]): SchedulableResourceTreeNode[] {
  const nodesById = new Map<string, SchedulableResourceTreeNode>();
  for (const item of items) {
    nodesById.set(item.id, { id: item.id, resource: item, children: [] });
  }

  const roots: SchedulableResourceTreeNode[] = [];
  for (const item of items) {
    const node = nodesById.get(item.id)!;
    const parentId = item.parentSchedulableResourceId;
    const parentNode = parentId ? nodesById.get(parentId) : undefined;
    if (parentNode) {
      parentNode.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
