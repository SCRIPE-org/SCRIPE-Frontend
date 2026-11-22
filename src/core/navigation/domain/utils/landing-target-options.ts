import { normalizeRoutePath } from "@core/config/app-route-manifest";
import type {
  LandingTargetCatalog,
  LandingTargetContextScope,
  LandingTargetScopeMode,
} from "../entities/LandingTargetCatalog";
import type { MenuItem } from "../entities/MenuItem";
import type { NavigationData } from "../entities/NavigationData";
import type { WorkspaceGroup } from "../entities/WorkspaceGroup";

export interface StructuredLandingOption {
  value: string;
  label: string;
  groupKey: string;
  groupLabel: string;
  displayPrefix?: string;
  pathSegments?: string[];
  kind: "default" | "overview" | "hub" | "workspace" | "menu" | "unavailable";
  route?: string | null;
  isUnavailable?: boolean;
}

export interface LandingTargetOptionLabels {
  defaultLabel: string;
  overviewLabel: string;
  hubLabel: string;
  workspacePrefix: string;
  menuPrefix: string;
  unavailablePageLabel?: string;
  systemGroupLabel?: string;
}

export interface BuildLandingTargetOptionsInput {
  language: string;
  workspaceGroups: WorkspaceGroup[];
  cachedWorkspaces?: Map<string, NavigationData>;
  /** Lazy catalog of unlocked workspaces and authorized leaf menu targets. */
  catalog?: LandingTargetCatalog | null;
  /** Role-mode filters incompatible platform/tenant targets; personal-mode uses active unlocked targets. */
  scopeMode: LandingTargetScopeMode;
  currentTarget?: string | null;
  labels: LandingTargetOptionLabels;
  /** Include `menu:overview` leaf items inside workspace buckets (used by per-workspace pickers). */
  includeOverviewMenuItem?: boolean;
}

const DEFAULT_UNAVAILABLE_PAGE_LABEL = "Unavailable page";
const VALID_WORKSPACE_KEY = /^[a-z0-9][a-z0-9-]{0,63}$/;
const VALID_MENU_SLUG = /^[a-z0-9][a-z0-9-_]{0,99}$/;
const GATE_ROUTES = new Set([
  "/",
  "/login",
  "/change-password",
  "/activate-workspace",
  "/not-authorized",
  "/api",
]);

function isValidLeafHref(href?: string | null): boolean {
  if (!href || href === "#") return false;
  const trimmed = href.trim();
  if (
    trimmed.includes("://") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\")
  ) {
    return false;
  }
  const normalized = normalizeRoutePath(trimmed);
  if (!normalized.startsWith("/") || normalized.includes("[")) return false;
  if (GATE_ROUTES.has(normalized)) return false;
  return !normalized.startsWith("/login/") && !normalized.startsWith("/api/");
}

function isScopeCompatible(
  contextScope: LandingTargetContextScope | undefined,
  workspaceType: "Admin" | "Module" | undefined,
  scopeMode: LandingTargetScopeMode
): boolean {
  if (scopeMode === "platform_role") {
    return contextScope !== "TenantOnly" && workspaceType !== "Module";
  }
  if (scopeMode === "tenant_role") {
    return contextScope !== "PlatformOnly";
  }
  return true;
}

function isItemScopeCompatible(
  contextScope: LandingTargetContextScope | undefined,
  scopeMode: LandingTargetScopeMode
): boolean {
  if (scopeMode === "platform_role") {
    return contextScope !== "TenantOnly";
  }
  if (scopeMode === "tenant_role") {
    return contextScope !== "PlatformOnly";
  }
  return true;
}

function isWorkspaceCompatible(ws: WorkspaceGroup, scopeMode: LandingTargetScopeMode): boolean {
  if (ws.isLocked) return false;
  return isScopeCompatible(ws.contextScope, ws.workspaceType, scopeMode);
}

/**
 * Returns `true` only when a landing target represents a specific destination
 * (`overview`, `workspace:<key>`, or `menu:<slug>`) eligible for policy enforcement.
 */
export function canEnforceLandingTarget(rawTarget?: unknown): boolean {
  if (typeof rawTarget !== "string") return false;
  const normalized = rawTarget.trim().toLowerCase();
  if (!normalized || normalized === "default" || normalized === "hub") {
    return false;
  }
  return true;
}

interface NormalizedWorkspaceEntry {
  workspaceKey: string;
  name: string;
  sortOrder: number;
  effectiveHomeRoute: string | null;
  group?: WorkspaceGroup;
}

function collectCompatibleWorkspaces(
  workspaceGroups: WorkspaceGroup[],
  catalog: LandingTargetCatalog | null | undefined,
  scopeMode: LandingTargetScopeMode,
  language: string
): NormalizedWorkspaceEntry[] {
  const lockedKeys = new Set<string>();
  const rejectedKeys = new Set<string>();
  const byKey = new Map<string, NormalizedWorkspaceEntry>();

  for (const ws of workspaceGroups) {
    const key = ws.workspaceKey.trim().toLowerCase();
    if (!key) continue;
    if (ws.isLocked) {
      lockedKeys.add(key);
      continue;
    }
    if (!isWorkspaceCompatible(ws, scopeMode)) {
      rejectedKeys.add(key);
      continue;
    }
    if (!VALID_WORKSPACE_KEY.test(key)) continue;

    byKey.set(key, {
      workspaceKey: key,
      name: ws.getLocalizedName(language),
      sortOrder: ws.workspaceSortOrder,
      effectiveHomeRoute: ws.effectiveHomeRoute ?? ws.platformHomeRoute ?? ws.homeRoute ?? null,
      group: ws,
    });
  }

  if (catalog) {
    for (const cWs of catalog.workspaces) {
      const key = cWs.workspaceKey.trim().toLowerCase();
      if (!key || lockedKeys.has(key) || rejectedKeys.has(key) || !VALID_WORKSPACE_KEY.test(key)) {
        continue;
      }
      if (!isScopeCompatible(cWs.contextScope, cWs.workspaceType, scopeMode)) {
        rejectedKeys.add(key);
        byKey.delete(key);
        continue;
      }

      const existing = byKey.get(key);
      if (existing) {
        if (!existing.effectiveHomeRoute && cWs.effectiveHomeRoute) {
          existing.effectiveHomeRoute = cWs.effectiveHomeRoute;
        }
        continue;
      }

      byKey.set(key, {
        workspaceKey: key,
        name: cWs.getLocalizedName(language),
        sortOrder: cWs.workspaceSortOrder,
        effectiveHomeRoute: cWs.effectiveHomeRoute,
      });
    }

    for (const item of catalog.items) {
      const key = item.workspaceKey.trim().toLowerCase();
      if (!key || lockedKeys.has(key) || rejectedKeys.has(key) || !VALID_WORKSPACE_KEY.test(key)) {
        continue;
      }
      if (!isItemScopeCompatible(item.contextScope, scopeMode)) continue;
      if (byKey.has(key)) continue;

      byKey.set(key, {
        workspaceKey: key,
        name: item.getLocalizedWorkspaceName(language),
        sortOrder: Number.MAX_SAFE_INTEGER,
        effectiveHomeRoute: null,
      });
    }
  }

  return Array.from(byKey.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Builds structured landing target options strictly constrained to valid
 * structured tokens (`default`, `overview`, `hub`, `workspace:<key>`, `menu:<slug>`).
 *
 * When a lazy `catalog` is provided, all unlocked workspaces' authorized leaf pages
 * are populated immediately in canonical sidebar tree `SortOrder`.
 */
export function buildStructuredLandingTargetOptions({
  language,
  workspaceGroups,
  cachedWorkspaces,
  catalog,
  scopeMode,
  currentTarget,
  labels,
  includeOverviewMenuItem = false,
}: BuildLandingTargetOptionsInput): StructuredLandingOption[] {
  const systemGroupLabel = labels.systemGroupLabel ?? labels.defaultLabel;
  const unavailableLabel = labels.unavailablePageLabel ?? DEFAULT_UNAVAILABLE_PAGE_LABEL;

  const options: StructuredLandingOption[] = [
    {
      value: "default",
      label: labels.defaultLabel,
      groupKey: "system",
      groupLabel: systemGroupLabel,
      kind: "default",
    },
  ];

  if (!catalog || catalog.overviewAuthorized) {
    options.push({
      value: "overview",
      label: labels.overviewLabel,
      groupKey: "system",
      groupLabel: systemGroupLabel,
      kind: "overview",
      route: "/overview",
    });
  }

  options.push({
    value: "hub",
    label: labels.hubLabel,
    groupKey: "system",
    groupLabel: systemGroupLabel,
    kind: "hub",
    route: "/hub",
  });

  const seenValues = new Set<string>(options.map((opt) => opt.value));
  const workspaces = collectCompatibleWorkspaces(workspaceGroups, catalog, scopeMode, language);

  for (const entry of workspaces) {
    const wsToken = `workspace:${entry.workspaceKey}`;
    if (!seenValues.has(wsToken)) {
      seenValues.add(wsToken);
      options.push({
        value: wsToken,
        label: `${labels.workspacePrefix} ${entry.name}`,
        groupKey: wsToken,
        groupLabel: entry.name,
        displayPrefix: labels.workspacePrefix,
        pathSegments: [entry.name],
        kind: "workspace",
        route: entry.effectiveHomeRoute,
      });
    }

    if (catalog) {
      for (const item of catalog.items) {
        if (item.workspaceKey.trim().toLowerCase() !== entry.workspaceKey) continue;
        if (!isItemScopeCompatible(item.contextScope, scopeMode)) continue;

        const normalizedSlug = item.slug.trim().toLowerCase();
        if (
          !isValidLeafHref(item.route) ||
          !VALID_MENU_SLUG.test(normalizedSlug) ||
          (!includeOverviewMenuItem && normalizedSlug === "overview")
        ) {
          continue;
        }

        const menuToken = `menu:${normalizedSlug}`;
        if (seenValues.has(menuToken)) continue;
        seenValues.add(menuToken);

        const segments = item.getBreadcrumbSegments(language);
        const pathSegments = [entry.name, ...segments];
        options.push({
          value: menuToken,
          label: `${labels.menuPrefix} ${pathSegments.join(" / ")}`,
          groupKey: wsToken,
          groupLabel: entry.name,
          displayPrefix: labels.menuPrefix,
          pathSegments,
          kind: "menu",
          route: normalizeRoutePath(item.route),
        });
      }
      continue;
    }

    const ws = entry.group;
    if (!ws) continue;
    const cached = cachedWorkspaces?.get(ws.workspaceKey);
    const menuItems = ws.menuItems.length > 0 ? ws.menuItems : (cached?.menuItems ?? []);

    const walk = (nodes: MenuItem[], parents: string[]) => {
      for (const node of nodes) {
        const nodeLabel = node.getLocalizedName(language);
        const pathNames = [...parents, nodeLabel];
        const normalizedSlug = node.slug?.trim().toLowerCase() ?? "";

        if (
          isValidLeafHref(node.href) &&
          VALID_MENU_SLUG.test(normalizedSlug) &&
          (includeOverviewMenuItem || normalizedSlug !== "overview")
        ) {
          const menuToken = `menu:${normalizedSlug}`;
          if (!seenValues.has(menuToken)) {
            seenValues.add(menuToken);
            const pathSegments = [entry.name, ...pathNames];
            options.push({
              value: menuToken,
              label: `${labels.menuPrefix} ${pathSegments.join(" / ")}`,
              groupKey: wsToken,
              groupLabel: entry.name,
              displayPrefix: labels.menuPrefix,
              pathSegments,
              kind: "menu",
              route: node.href ? normalizeRoutePath(node.href) : null,
            });
          }
        }

        if (node.children.length > 0) {
          walk(node.children, pathNames);
        }
      }
    };

    walk(menuItems, []);
  }

  // Preserve an already-persisted target if missing from catalog / unlocked menus,
  // surfacing a readable localized label instead of raw `menu:<slug>` tokens.
  const trimmedCurrent = typeof currentTarget === "string" ? currentTarget.trim().toLowerCase() : "";
  if (trimmedCurrent && trimmedCurrent !== "default" && !seenValues.has(trimmedCurrent)) {
    const fallbackLabel = trimmedCurrent.startsWith("menu:")
      ? unavailableLabel
      : formatLandingTargetLabel({
          target: trimmedCurrent,
          language,
          workspaceGroups,
          cachedWorkspaces,
          catalog,
          labels,
        });

    options.push({
      value: trimmedCurrent,
      label: fallbackLabel,
      groupKey: "unavailable",
      groupLabel: unavailableLabel,
      pathSegments: [fallbackLabel],
      kind: "unavailable",
      isUnavailable: true,
    });
  }

  return options;
}

function humanizeTargetSlug(raw: string): string {
  return raw
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function findMenuPathBySlug(
  nodes: MenuItem[],
  slugLower: string,
  language: string,
  parents: string[]
): string[] | null {
  for (const node of nodes) {
    const label = node.getLocalizedName(language);
    const nextPath = [...parents, label];
    if ((node.slug?.trim().toLowerCase() ?? "") === slugLower) {
      return nextPath;
    }
    if (node.children.length > 0) {
      const match = findMenuPathBySlug(node.children, slugLower, language, nextPath);
      if (match) return match;
    }
  }
  return null;
}

/**
 * Formats a persisted structured landing target token (`default`, `overview`, `hub`,
 * `workspace:<key>`, `menu:<slug>`) into a human-readable localized display label.
 */
export function formatLandingTargetLabel({
  target,
  language,
  workspaceGroups,
  cachedWorkspaces,
  catalog,
  labels,
}: {
  target?: string | null;
  language: string;
  workspaceGroups: WorkspaceGroup[];
  cachedWorkspaces?: Map<string, NavigationData>;
  catalog?: LandingTargetCatalog | null;
  labels: LandingTargetOptionLabels;
}): string {
  const normalized = typeof target === "string" ? target.trim().toLowerCase() : "";
  if (!normalized || normalized === "default") return labels.defaultLabel;
  if (normalized === "overview") return labels.overviewLabel;
  if (normalized === "hub") return labels.hubLabel;

  if (normalized.startsWith("workspace:")) {
    const wsKey = normalized.slice("workspace:".length);
    const ws = workspaceGroups.find((g) => g.workspaceKey.trim().toLowerCase() === wsKey);
    const catalogWs = catalog?.workspaces.find((g) => g.workspaceKey.trim().toLowerCase() === wsKey);
    const wsLabel = ws
      ? ws.getLocalizedName(language)
      : catalogWs
        ? catalogWs.getLocalizedName(language)
        : humanizeTargetSlug(wsKey);
    return `${labels.workspacePrefix} ${wsLabel}`;
  }

  if (normalized.startsWith("menu:")) {
    const slugLower = normalized.slice("menu:".length);

    if (catalog) {
      const match = catalog.items.find((item) => item.slug.trim().toLowerCase() === slugLower);
      if (match) {
        const wsKey = match.workspaceKey.trim().toLowerCase();
        const ws = workspaceGroups.find((g) => g.workspaceKey.trim().toLowerCase() === wsKey);
        const wsName = ws ? ws.getLocalizedName(language) : match.getLocalizedWorkspaceName(language);
        const segments = match.getBreadcrumbSegments(language);
        return `${labels.menuPrefix} ${[wsName, ...segments].join(" / ")}`;
      }
    }

    for (const ws of workspaceGroups) {
      const cached = cachedWorkspaces?.get(ws.workspaceKey);
      const menuItems = ws.menuItems.length > 0 ? ws.menuItems : (cached?.menuItems ?? []);
      const pathNames = findMenuPathBySlug(menuItems, slugLower, language, []);
      if (pathNames) {
        return `${labels.menuPrefix} ${ws.getLocalizedName(language)} / ${pathNames.join(" / ")}`;
      }
    }

    return labels.unavailablePageLabel ?? DEFAULT_UNAVAILABLE_PAGE_LABEL;
  }

  return target!.trim();
}

/**
 * Builds structured landing target options scoped strictly to valid `menu:<slug>` leaf pages
 * belonging to a single workspace (preserving any saved unavailable target cleanly).
 * Strips redundant `Page:` prefixes and the leading workspace segment because the surrounding
 * row/card already scopes the picker to that workspace.
 */
export function buildWorkspaceScopedMenuOptions({
  workspaceKey,
  language,
  workspaceGroups,
  cachedWorkspaces,
  catalog,
  scopeMode,
  currentTarget,
  labels,
}: BuildLandingTargetOptionsInput & { workspaceKey: string }): StructuredLandingOption[] {
  const normalizedWsKey = workspaceKey.trim().toLowerCase();
  if (!normalizedWsKey) return [];

  const targetGroupKey = `workspace:${normalizedWsKey}`;
  const allOptions = buildStructuredLandingTargetOptions({
    language,
    workspaceGroups,
    cachedWorkspaces,
    catalog,
    scopeMode,
    currentTarget,
    labels,
    includeOverviewMenuItem: true,
  });

  return allOptions
    .filter(
      (opt) =>
        (opt.kind === "menu" && opt.groupKey === targetGroupKey) ||
        Boolean(opt.isUnavailable && opt.value.toLowerCase().startsWith("menu:"))
    )
    .map((opt) => {
      if (opt.kind !== "menu") return opt;
      const scopedSegments =
        opt.pathSegments && opt.pathSegments.length > 1
          ? opt.pathSegments.slice(1)
          : opt.pathSegments;
      return {
        ...opt,
        displayPrefix: undefined,
        pathSegments: scopedSegments,
        label:
          scopedSegments && scopedSegments.length > 0 ? scopedSegments.join(" / ") : opt.label,
      };
    });
}
