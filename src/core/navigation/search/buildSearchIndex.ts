import { normalizeRoutePath } from "@core/config/app-route-manifest";
import type { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import type { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import type { AuthorizedRouteDescriptor } from "@core/navigation/domain/interfaces/INavigationRepository";

/** Indexed navigation target produced by {@link buildSearchIndex} for palettes and launchpad search. */
export interface SearchableItem {
  /** Stable unique identifier (`ws:<key>`, `<wsKey>:<menuId>`, or `route:<wsKey>:<href>`). */
  id: string;
  /** Localized breadcrumb segments leading to the target page or workspace. */
  titleSegments: string[];
  /** Target internal route path. */
  href: string;
  /** Pre-flattened bilingual keywords + route metadata used for live filtering. */
  searchValue: string;
  /** Lucide icon name for rendering. */
  iconName: string;
  /** Owning workspace key. */
  workspaceKey: string;
  /** Root menu item ID in the primary rail, or null for unhydrated workspaces. */
  rootItemId: string | null;
  /** Localized owning workspace display name. */
  groupName: string;
  /** Distinguishes top-level workspace entry (`workspace`) from deep menu/route (`page`). */
  kind: "workspace" | "page";
}

/** Input state required to construct a complete authorized search index. */
export interface BuildSearchIndexInput {
  /** All workspace groups returned by bootstrap navigation. */
  workspaceGroups: WorkspaceGroup[];
  /** Cached JIT workspace navigation trees keyed by workspaceKey. */
  cachedWorkspaces: Map<string, NavigationData>;
  /** Server-authorized route descriptors keyed by normalized route path. */
  routeDescriptors: Map<string, AuthorizedRouteDescriptor>;
  /** Active UI language (`"en"` or `"ar"`). */
  language: string;
  /** Translation lookup helper from `useI18n`. */
  t: (key: string) => string;
}

const GENERIC_LEAF_SEGMENTS = new Set([
  "new",
  "create",
  "edit",
  "compare",
  "overview",
  "settings",
  "reports",
  "logs",
  "analytics",
  "events",
  "customize",
]);

function humanizeSegmentEn(segment: string): string {
  return segment
    .split("-")
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function resolveSegmentTitle(
  segment: string,
  t: (key: string) => string
): { localized: string; humanizedEn: string } {
  const humanizedEn = humanizeSegmentEn(segment);
  const routeSegKey = `nav.routeSegments.${segment}`;
  const translatedSeg = t(routeSegKey);
  if (translatedSeg && translatedSeg !== routeSegKey) {
    return { localized: translatedSeg, humanizedEn };
  }

  const navFallbackKey = `nav.${segment.replace(/-/g, "_")}`;
  const translatedNav = t(navFallbackKey);
  if (translatedNav && translatedNav !== navFallbackKey) {
    return { localized: translatedNav, humanizedEn };
  }

  return { localized: humanizedEn, humanizedEn };
}

function buildRouteDisplayInfo(
  route: string,
  t: (key: string) => string
): { titleSegments: string[]; searchKeywords: string[] } {
  const segments = normalizeRoutePath(route)
    .split("/")
    .filter((seg) => seg.length > 0 && !seg.startsWith("["));
  if (segments.length === 0) {
    return { titleSegments: [route], searchKeywords: [route] };
  }

  const tail = segments[segments.length - 1];
  const resolvedTail = resolveSegmentTitle(tail, t);

  if (segments.length >= 2 && GENERIC_LEAF_SEGMENTS.has(tail.toLowerCase())) {
    const parent = segments[segments.length - 2];
    const resolvedParent = resolveSegmentTitle(parent, t);
    return {
      titleSegments: [resolvedParent.localized, resolvedTail.localized],
      searchKeywords: [
        resolvedParent.localized,
        resolvedParent.humanizedEn,
        resolvedTail.localized,
        resolvedTail.humanizedEn,
      ],
    };
  }

  return {
    titleSegments: [resolvedTail.localized],
    searchKeywords: [resolvedTail.localized, resolvedTail.humanizedEn],
  };
}

function collectFirstMenuHref(items: MenuItem[]): string | null {
  for (const item of items) {
    if (item.href && item.href !== "#") {
      return item.href;
    }
    if (item.children.length > 0) {
      const nested = collectFirstMenuHref(item.children);
      if (nested) return nested;
    }
  }
  return null;
}

/**
 * Pure builder producing a deduplicated, localized navigation search index across unlocked
 * workspaces, hydrated/cached JIT `menuTree` items, and unhydrated authorized `routeDescriptors`.
 */
export function buildSearchIndex({
  workspaceGroups,
  cachedWorkspaces,
  routeDescriptors,
  language,
  t,
}: BuildSearchIndexInput): SearchableItem[] {
  const searchableItems: SearchableItem[] = [];
  const descriptorEntries = Array.from(routeDescriptors.values());

  for (const workspace of workspaceGroups) {
    if (workspace.isLocked) continue;

    const workspaceName = workspace.getLocalizedName(language);
    const cachedNav = cachedWorkspaces.get(workspace.workspaceKey);
    const menuTree =
      workspace.menuItems.length > 0 ? workspace.menuItems : (cachedNav?.menuItems ?? []);

    const workspaceDescriptors = descriptorEntries.filter(
      (d) => d.accessState === "authorized" && d.workspaceKey === workspace.workspaceKey
    );

    const workspaceHref =
      workspace.effectiveHomeRoute ||
      collectFirstMenuHref(menuTree) ||
      workspaceDescriptors[0]?.route ||
      "/overview";

    // Always index each unlocked workspace directly so unhydrated workspaces remain jumpable.
    searchableItems.push({
      id: `ws:${workspace.workspaceKey}`,
      titleSegments: [workspaceName],
      href: workspaceHref,
      searchValue: [
        workspace.workspaceNameEn,
        workspace.workspaceNameAr,
        workspace.workspaceKey,
        workspaceHref,
      ]
        .filter(Boolean)
        .join(" "),
      iconName: workspace.workspaceIcon || "Layers",
      workspaceKey: workspace.workspaceKey,
      rootItemId: menuTree[0]?.id ?? null,
      groupName: workspaceName,
      kind: "workspace",
    });

    const seenHrefs = new Set<string>([normalizeRoutePath(workspaceHref)]);

    const traverseMenu = (
      nodes: MenuItem[],
      rootId: string,
      localizedParents: string[],
      enParents: string[],
      arParents: string[]
    ) => {
      for (const node of nodes) {
        const nodeLabel = node.getLocalizedName(language);
        const nextLocalized = [...localizedParents, nodeLabel];
        const nextEn = [...enParents, node.nameEn || nodeLabel];
        const nextAr = [...arParents, node.nameAr || nodeLabel];

        if (node.href && node.href !== "#") {
          const normalized = normalizeRoutePath(node.href);
          if (!seenHrefs.has(normalized)) {
            seenHrefs.add(normalized);
            searchableItems.push({
              id: `${workspace.workspaceKey}:${node.id}`,
              titleSegments: nextLocalized,
              href: node.href,
              searchValue: [
                ...nextEn,
                ...nextAr,
                workspace.workspaceNameEn,
                workspace.workspaceNameAr,
                workspace.workspaceKey,
                node.href,
              ]
                .filter(Boolean)
                .join(" "),
              iconName: node.icon || "FileText",
              workspaceKey: workspace.workspaceKey,
              rootItemId: rootId,
              groupName: workspaceName,
              kind: "page",
            });
          }
        }

        if (node.children.length > 0) {
          traverseMenu(node.children, rootId, nextLocalized, nextEn, nextAr);
        }
      }
    };

    for (const rootItem of menuTree) {
      traverseMenu([rootItem], rootItem.id, [], [], []);
    }

    // Index authorized routes from unhydrated workspaces that do not duplicate the workspace tile or loaded menu items.
    for (const descriptor of workspaceDescriptors) {
      const normalizedRoute = normalizeRoutePath(descriptor.route);
      if (normalizedRoute.includes("[") || seenHrefs.has(normalizedRoute)) {
        continue;
      }
      seenHrefs.add(normalizedRoute);
      const routeDisplay = buildRouteDisplayInfo(normalizedRoute, t);
      searchableItems.push({
        id: `route:${workspace.workspaceKey}:${normalizedRoute}`,
        titleSegments: routeDisplay.titleSegments,
        href: normalizedRoute,
        searchValue: [
          ...routeDisplay.searchKeywords,
          workspace.workspaceNameEn,
          workspace.workspaceNameAr,
          workspace.workspaceKey,
          normalizedRoute,
        ]
          .filter(Boolean)
          .join(" "),
        iconName: workspace.workspaceIcon || "FileText",
        workspaceKey: workspace.workspaceKey,
        rootItemId: menuTree[0]?.id ?? null,
        groupName: workspaceName,
        kind: "page",
      });
    }
  }

  return searchableItems;
}

/**
 * Filters indexed items down to matching deep Quick Jump page results (excluding bare `ws:*`
 * workspace entries already represented as squircles) and caps to `limit`.
 */
export function filterQuickJumpItems(
  items: SearchableItem[],
  rawQuery: string,
  limit = 6
): SearchableItem[] {
  const tokens = rawQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return [];

  const results: SearchableItem[] = [];
  const seenHrefs = new Set<string>();

  for (const item of items) {
    if (item.kind === "workspace" || item.id.startsWith("ws:")) continue;
    const normalizedHref = normalizeRoutePath(item.href);
    if (seenHrefs.has(normalizedHref)) continue;

    const haystack = `${item.searchValue} ${item.titleSegments.join(" ")} ${item.groupName}`.toLowerCase();
    if (tokens.every((token) => haystack.includes(token))) {
      seenHrefs.add(normalizedHref);
      results.push(item);
      if (results.length >= limit) break;
    }
  }

  return results;
}
