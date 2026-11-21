import { normalizeRoutePath } from "@core/config/app-route-manifest";
import type { MenuItem } from "../entities/MenuItem";
import type { NavigationData } from "../entities/NavigationData";
import type { WorkspaceGroup } from "../entities/WorkspaceGroup";

export interface StructuredLandingOption {
  value: string;
  label: string;
}

export interface LandingTargetOptionLabels {
  defaultLabel: string;
  overviewLabel: string;
  hubLabel: string;
  workspacePrefix: string;
  menuPrefix: string;
}

export interface BuildLandingTargetOptionsInput {
  language: string;
  workspaceGroups: WorkspaceGroup[];
  cachedWorkspaces?: Map<string, NavigationData>;
  /** Role-mode filters incompatible platform/tenant targets; personal-mode uses active unlocked targets. */
  scopeMode: "platform_role" | "tenant_role" | "current_context";
  currentTarget?: string | null;
  labels: LandingTargetOptionLabels;
}

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

function isWorkspaceCompatible(
  ws: WorkspaceGroup,
  scopeMode: BuildLandingTargetOptionsInput["scopeMode"]
): boolean {
  if (ws.isLocked) return false;
  if (scopeMode === "platform_role") {
    return ws.contextScope !== "TenantOnly" && !ws.isModuleWorkspace;
  }
  if (scopeMode === "tenant_role") {
    return ws.contextScope !== "PlatformOnly";
  }
  return true;
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

/**
 * Builds structured landing target `<Select>` options strictly constrained to valid
 * structured tokens (`default`, `overview`, `hub`, `workspace:<key>`, `menu:<slug>`).
 */
export function buildStructuredLandingTargetOptions({
  language,
  workspaceGroups,
  cachedWorkspaces,
  scopeMode,
  currentTarget,
  labels,
}: BuildLandingTargetOptionsInput): StructuredLandingOption[] {
  const options: StructuredLandingOption[] = [
    { value: "default", label: labels.defaultLabel },
    { value: "overview", label: labels.overviewLabel },
    { value: "hub", label: labels.hubLabel },
  ];
  const seenValues = new Set<string>(options.map((opt) => opt.value));

  for (const ws of workspaceGroups) {
    if (!isWorkspaceCompatible(ws, scopeMode)) continue;
    const normalizedKey = ws.workspaceKey.trim().toLowerCase();
    if (!VALID_WORKSPACE_KEY.test(normalizedKey)) continue;

    const wsToken = `workspace:${normalizedKey}`;
    const wsName = ws.getLocalizedName(language);
    if (!seenValues.has(wsToken)) {
      seenValues.add(wsToken);
      options.push({
        value: wsToken,
        label: `${labels.workspacePrefix} ${wsName}`,
      });
    }

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
          normalizedSlug !== "overview"
        ) {
          const menuToken = `menu:${normalizedSlug}`;
          if (!seenValues.has(menuToken)) {
            seenValues.add(menuToken);
            options.push({
              value: menuToken,
              label: `${labels.menuPrefix} ${wsName} / ${pathNames.join(" / ")}`,
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

  // Preserve an already-persisted target if its menu belongs to an unhydrated workspace.
  const trimmedCurrent = typeof currentTarget === "string" ? currentTarget.trim().toLowerCase() : "";
  if (trimmedCurrent && trimmedCurrent !== "default" && !seenValues.has(trimmedCurrent)) {
    options.push({
      value: trimmedCurrent,
      label: trimmedCurrent,
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
  labels,
}: {
  target?: string | null;
  language: string;
  workspaceGroups: WorkspaceGroup[];
  cachedWorkspaces?: Map<string, NavigationData>;
  labels: LandingTargetOptionLabels;
}): string {
  const normalized = typeof target === "string" ? target.trim().toLowerCase() : "";
  if (!normalized || normalized === "default") return labels.defaultLabel;
  if (normalized === "overview") return labels.overviewLabel;
  if (normalized === "hub") return labels.hubLabel;

  if (normalized.startsWith("workspace:")) {
    const wsKey = normalized.slice("workspace:".length);
    const ws = workspaceGroups.find((g) => g.workspaceKey.trim().toLowerCase() === wsKey);
    const wsLabel = ws ? ws.getLocalizedName(language) : humanizeTargetSlug(wsKey);
    return `${labels.workspacePrefix} ${wsLabel}`;
  }

  if (normalized.startsWith("menu:")) {
    const slugLower = normalized.slice("menu:".length);
    for (const ws of workspaceGroups) {
      const cached = cachedWorkspaces?.get(ws.workspaceKey);
      const menuItems = ws.menuItems.length > 0 ? ws.menuItems : (cached?.menuItems ?? []);
      const pathNames = findMenuPathBySlug(menuItems, slugLower, language, []);
      if (pathNames) {
        return `${labels.menuPrefix} ${ws.getLocalizedName(language)} / ${pathNames.join(" / ")}`;
      }
    }
    return `${labels.menuPrefix} ${humanizeTargetSlug(slugLower)}`;
  }

  return target!.trim();
}
