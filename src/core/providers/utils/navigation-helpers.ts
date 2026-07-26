import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";

type WithMenuItems = {
  menuItems?: Array<{ href?: string | null; children?: Array<{ href?: string | null }> }>;
};

export function firstPageOf(ws: WithMenuItems): string | null {
  const findHref = (items: any[]): string | null => {
    for (const item of items) {
      if (item.href && !item.href.startsWith("#") && item.href !== "/") return item.href;
      if (item.children && item.children.length > 0) {
        const childHref = findHref(item.children);
        if (childHref) return childHref;
      }
    }
    return null;
  };
  return findHref(ws.menuItems ?? []);
}

/**
 * The workspace accent as a complete CSS colour.
 *
 * NOTE FOR CONSUMERS: this returns an `oklch(...)` **function string**, not a
 * hex value. Appending two hex digits to it for alpha — `` `${accent}80` `` —
 * produces `oklch(0.6 0.18 262)80`, which is invalid CSS, and the browser drops
 * the entire declaration without warning. That silently blanked the workspace
 * loader and the transition overlay for as long as they existed.
 *
 * To vary opacity use `color-mix(in oklch, ${accent} 50%, transparent)`, which
 * is agnostic to the colour's notation.
 */
export function getAccentColor(ws: WorkspaceGroup | null): string | null {
  if (!ws || ws.colorHue === null || ws.colorHue === undefined) return null;
  // Delegates to WorkspaceGroup.accentColor — single source for the
  // dark(L0.68)/light(L0.46) lightness split matching the --nx-accent ladder.
  return ws.accentColor;
}
