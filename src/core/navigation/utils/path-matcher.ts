import type { MenuItem } from "@core/navigation/domain/entities/MenuItem";

/**
 * Normalizes URLs by removing hashes, query strings, and trailing slashes.
 */
export function cleanPath(p: string | undefined | null): string {
  if (!p) return "";
  const c = p.split("?")[0].split("#")[0];
  return c.length > 1 && c.endsWith("/") ? c.slice(0, -1) : c;
}

/**
 * Recursively searches the navigation tree to find the most specific active item
 * based on the current route.
 */
export function findActiveMenuItem(items: MenuItem[], pathname: string): MenuItem | null {
  const cleanedPathname = cleanPath(pathname);
  let bestMatch: MenuItem | null = null;
  let maxLen = 0;

  const search = (nodes: MenuItem[]) => {
    for (const item of nodes) {
      if (item.href && !item.href.startsWith("#")) {
        const h = cleanPath(item.href);
        if (cleanedPathname === h || (h !== "/" && cleanedPathname.startsWith(h + "/"))) {
          if (h.length > maxLen) {
            maxLen = h.length;
            bestMatch = item;
          }
        }
      }
      if (item.children) {
        search(item.children);
      }
    }
  };

  search(items);
  return bestMatch;
}

/**
 * Finds the best matching root menu item for a given pathname.
 */
export function findBestRootMatch(rootMenuItems: MenuItem[], pathname: string): MenuItem | null {
  const cleanedPathname = cleanPath(pathname);

  let bestRoot: MenuItem | null = null;
  let bestLen = -1;

  const scoreRoot = (root: MenuItem) => {
    const check = (items: MenuItem[]): number => {
      let score = -1;
      for (const item of items) {
        if (item.href && !item.href.startsWith("#")) {
          const h = cleanPath(item.href);
          if (cleanedPathname === h) return h.length;
          if (h !== "/" && cleanedPathname.startsWith(h + "/")) {
            score = Math.max(score, h.length);
          }
        }
        if (item.children?.length) {
          const childScore = check(item.children);
          if (childScore > score) score = childScore;
        }
      }
      return score;
    };

    if (root.href && !root.href.startsWith("#")) {
      const h = cleanPath(root.href);
      if (cleanedPathname === h) return h.length;
      if (h !== "/" && cleanedPathname.startsWith(h + "/")) return h.length;
    }
    return check(root.children ?? []);
  };

  for (const root of rootMenuItems) {
    const score = scoreRoot(root);
    if (score > bestLen) {
      bestLen = score;
      bestRoot = root;
    }
  }

  return bestRoot;
}

/**
 * Checks if a given item or its children contains the current pathname.
 */
export function containsPath(item: MenuItem, pathname: string): boolean {
  const cleanedPathname = cleanPath(pathname);

  if (item.href && !item.href.startsWith("#")) {
    const h = cleanPath(item.href);
    if (cleanedPathname === h) return true;
    if (h !== "/" && cleanedPathname.startsWith(h + "/")) return true;
  }

  if (item.children?.length) {
    return item.children.some((child) => containsPath(child, pathname));
  }

  return false;
}

/**
 * Constructs an array of breadcrumb segments by traversing the tree to the active item.
 */
export function buildBreadcrumbs(root: MenuItem | null, pathname: string): MenuItem[] {
  if (!root) return [];

  const cleanedPathname = cleanPath(pathname);
  let bestPath: MenuItem[] = [];
  let maxLen = 0;

  const search = (node: MenuItem, currentPath: MenuItem[]) => {
    const newPath = [...currentPath, node];

    if (node.href && !node.href.startsWith("#")) {
      const h = cleanPath(node.href);
      if (cleanedPathname === h || (h !== "/" && cleanedPathname.startsWith(h + "/"))) {
        if (h.length > maxLen) {
          maxLen = h.length;
          bestPath = newPath;
        }
      }
    }

    if (node.children) {
      for (const child of node.children) {
        search(child, newPath);
      }
    }
  };

  search(root, []);

  return bestPath;
}
