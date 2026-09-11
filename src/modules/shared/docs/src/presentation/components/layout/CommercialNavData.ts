/**
 * CommercialNavData
 *
 * Defines the navigation tree hierarchy, section identifiers, routing paths,
 * localization key builders, and keyboard focus helpers for the commercial portal header.
 */

/**
 * Single navigation item definition within a mega-menu category.
 */
export interface NavItem {
  /** Relative web route destination. */
  href: string;
  /** Translation sub-key under commercialMegaMenu.<sectionId>.items.<key>. */
  key: string;
}

/**
 * Top-level commercial navigation category section.
 */
export interface NavSection {
  /** Section identifier used for styling, icon resolution, and localization scoping. */
  id: string;
  /** Child links belonging to this category. */
  items: readonly NavItem[];
}

/** Navigation structure defining all commercial portal categories and routes. */
export const NAV_SECTIONS: readonly NavSection[] = [
  {
    id: "why",
    items: [
      { href: "/commercial/why-scripe-overview", key: "overview" },
      { href: "/commercial/competitive-advantages", key: "competitiveEdge" },
      { href: "/commercial/target-industries", key: "targetIndustries" },
      { href: "/commercial/success-metrics", key: "successMetrics" },
      { href: "/commercial/business-client-journeys", key: "clientJourneys" },
      { href: "/commercial/workspace-tours", key: "workspaceTours" },
    ],
  },
  {
    id: "platform",
    items: [
      { href: "/commercial/platform-architecture", key: "architecture" },
      { href: "/commercial/module-catalog", key: "moduleCatalog" },
      { href: "/commercial/technology-stack", key: "technologyStack" },
      { href: "/commercial/deployment-modes", key: "deploymentModes" },
      { href: "/commercial/system-requirements", key: "systemRequirements" },
    ],
  },
  {
    id: "enterprise",
    items: [
      { href: "/commercial/multi-tenancy", key: "multiTenancy" },
      { href: "/commercial/roles-permissions", key: "rolesPermissions" },
      { href: "/commercial/audit-compliance", key: "auditCompliance" },
      { href: "/commercial/localization-i18n", key: "localization" },
      { href: "/commercial/white-labeling", key: "whiteLabeling" },
    ],
  },
  {
    id: "commercial",
    items: [
      { href: "/commercial/pricing-showcase", key: "pricing" },
      { href: "/commercial/investor-overview", key: "investorOverview" },
      { href: "/commercial/partner-journey", key: "partnerJourney" },
      { href: "/commercial/entitlements-subscriptions", key: "subscriptionEngine" },
      { href: "/commercial/roi-analysis", key: "roiAnalysis" },
    ],
  },
] as const;

/** DOM identifier for the mega-menu dropdown panel. */
export const MEGA_PANEL_ID = "commercial-mega-panel";

/**
 * Builds the localization key for a navigation section label.
 *
 * @param sectionId - Identifier of the navigation section.
 * @returns Localization key string.
 */
export function sectionLabelKey(sectionId: string): string {
  return `commercialMegaMenu.${sectionId}.label`;
}

/**
 * Builds the localization key for a navigation item's title or description.
 *
 * @param sectionId - Identifier of the parent navigation section.
 * @param itemKey - Specific item key.
 * @param field - Field type ("title" or "desc").
 * @returns Localization key string.
 */
export function sectionItemKey(sectionId: string, itemKey: string, field: "title" | "desc"): string {
  return `commercialMegaMenu.${sectionId}.items.${itemKey}.${field}`;
}

/**
 * Retrieves all focusable links and enabled buttons within a panel element in DOM order.
 *
 * @param panel - Container HTML element to scan.
 * @returns Array of focusable HTML elements.
 */
export function getPanelFocusables(panel: HTMLElement | null): HTMLElement[] {
  if (!panel) return [];
  return Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
}
