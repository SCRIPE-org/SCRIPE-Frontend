/**
 * Nexus Layout Dimension Constants & Shared Submenu Resolution
 *
 * Single source of truth for the layout widths and submenu presence used across:
 *  - nexus-layout.tsx   (CSS custom property & collapse coordination)
 *  - nexus-secondary-rail.tsx (outer + inner container widths & submenu tree)
 *  - nexus-topbar.tsx   (panel toggle visibility & aria state)
 *
 * Change the value here and it propagates everywhere.
 */

import type { MenuItem } from "@core/navigation";

/** Width of the secondary rail (panel) in pixels. */
export const NEXUS_PANEL_W = 240;

/** Width of the primary icon rail in pixels. */
export const NEXUS_PRIMARY_RAIL_W = 64;

/** Height of the topbar in pixels. */
export const NEXUS_TOPBAR_H = 56;

/**
 * Resolves the active navigation tree shown in the secondary rail panel.
 * Unified across NexusLayout, NexusSecondaryRail, and NexusTopbar so toggle
 * visibility, collapsed state, and mobile drawer openability never diverge.
 */
export function getSecondaryMenuItems(
  workspaceKey: string | null | undefined,
  activeRootItem: Pick<MenuItem, "children"> | null | undefined,
  rootMenuItems: MenuItem[] = []
): MenuItem[] {
  if (activeRootItem?.children && activeRootItem.children.length > 0) {
    return activeRootItem.children;
  }
  if (workspaceKey === "venue" || !activeRootItem) {
    return rootMenuItems.length > 0 ? rootMenuItems : [];
  }
  return [];
}

/**
 * Unified submenu predicate shared by layout, secondary rail, and topbar.
 */
export function hasSecondarySubmenu(
  workspaceKey: string | null | undefined,
  activeRootItem: Pick<MenuItem, "children"> | null | undefined,
  rootMenuItems: MenuItem[] = []
): boolean {
  return getSecondaryMenuItems(workspaceKey, activeRootItem, rootMenuItems).length > 0;
}
