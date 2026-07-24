// Shared Layout Infrastructure — Barrel Export
//
// The twelve-variant layout system was retired when nexus became the only
// shell, and its chrome (sidebar, header, footer, nav renderer, command
// palette, user card, style hook) went with it. What survives is the part
// nexus and the navigation config still consume: direction-aware panel
// glyphs, active-route resolution, and the impersonation banner.
//
// Switchers live in `../common` and are imported from there directly; this
// barrel does not alias them, so there is exactly one path to each of them.

export {
  PanelMenuIcon,
  PanelMenuIconRTL,
  PanelCollapseIcon,
  PanelCollapseIconRTL,
} from "./nav-icons";

export {
  isExactMatch,
  isMatchWithFallback,
  hasActiveChild,
  hasActiveChildWithFallback,
  isItemOrDescendantActive,
  findActiveAncestry,
  computeExpandedItems,
} from "./nav-utils";

export { TenantContextBanner } from "./tenant-context-banner";
