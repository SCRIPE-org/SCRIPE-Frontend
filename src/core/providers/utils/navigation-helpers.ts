import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";

type WithMenuItems = { menuItems?: Array<{ href?: string | null; children?: Array<{ href?: string | null }> }> };

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

export function getAccentColor(ws: WorkspaceGroup | null): string | null {
  if (!ws || ws.colorHue === null || ws.colorHue === undefined) return null;
  const chroma = ws.colorChroma ?? 0.18;
  return `oklch(0.6 ${chroma} ${ws.colorHue})`;
}
