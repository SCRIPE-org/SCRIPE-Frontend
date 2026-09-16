import type { SchedulableResourceTreeNode } from "./resourceTree";

/**
 * Returns every node id at or below `rootId` (rootId included), or an empty set if not found.
 */
export function collectSubtreeIds(
  nodes: SchedulableResourceTreeNode[],
  rootId: string
): Set<string> {
  const ids = new Set<string>();
  const collectAll = (list: SchedulableResourceTreeNode[]) => {
    for (const node of list) {
      ids.add(node.id);
      if (node.children?.length) collectAll(node.children);
    }
  };
  const findAndCollect = (list: SchedulableResourceTreeNode[]): boolean => {
    for (const node of list) {
      if (node.id === rootId) {
        collectAll([node]);
        return true;
      }
      if (node.children?.length && findAndCollect(node.children)) return true;
    }
    return false;
  };
  findAndCollect(nodes);
  return ids;
}

/**
 * Flattens composite resource nodes for select options, excluding cycles from the given subtree.
 */
export function flattenComposites(
  nodes: SchedulableResourceTreeNode[],
  excludeId?: string
): { value: string; label: string }[] {
  const excludeIds = excludeId ? collectSubtreeIds(nodes, excludeId) : new Set<string>();
  const out: { value: string; label: string }[] = [];
  const walk = (list: SchedulableResourceTreeNode[]) => {
    for (const node of list) {
      if (node.resource.isComposite && !excludeIds.has(node.id)) {
        out.push({ value: node.id, label: node.resource.name });
      }
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return out;
}
