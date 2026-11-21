"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { normalizeRoutePath } from "@core/config/app-route-manifest";
import type { MenuItem } from "@core/navigation";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useI18n } from "@core/providers/i18n-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@core/ui/command";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";

interface NexusSearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchableItem {
  id: string;
  titleSegments: string[];
  href: string;
  searchValue: string;
  iconName: string;
  workspaceKey: string;
  rootItemId: string | null;
  groupName: string;
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
 * Global Command Palette (`Cmd/Ctrl + K`) indexing unlocked workspaces, hydrated & cached
 * JIT menu trees, and unhydrated authorized route descriptors with `<bdi>` RTL/LTR isolation.
 */
export function NexusSearchPalette({ open, onOpenChange }: NexusSearchPaletteProps) {
  const { t, language, direction } = useI18n();
  const router = useRouter();
  const { workspaceGroups, setActiveWorkspace, setActiveRootItemId } = useWorkspace();
  const cachedWorkspaces = useNavigationStore((s) => s.workspaces);
  const routeDescriptors = useNavigationStore((s) => s.routeDescriptors);
  const navContextKey = useNavigationStore((s) => s.contextKey);
  const recordRecentWorkspace = useNavigationStore((s) => s.recordRecentWorkspace);

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
          });
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
      });
    }
  }

  const groupedItems = new Map<string, SearchableItem[]>();
  for (const item of searchableItems) {
    const existing = groupedItems.get(item.groupName);
    if (existing) {
      existing.push(item);
    } else {
      groupedItems.set(item.groupName, [item]);
    }
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (item: SearchableItem) => {
    setActiveWorkspace(item.workspaceKey);
    if (item.rootItemId) {
      setActiveRootItemId(item.rootItemId);
    }
    if (navContextKey) {
      recordRecentWorkspace(navContextKey, item.workspaceKey);
    }
    startRoutingProgress();
    router.push(item.href);
    onOpenChange(false);
  };

  const iconRegistry = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  >;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} label={t("nav.search")}>
      <CommandInput placeholder={t("nav.search")} />
      <CommandList dir={direction}>
        <CommandEmpty>{t("common.noResultsFound")}</CommandEmpty>

        {Array.from(groupedItems.entries()).map(([groupName, items]) => (
          <CommandGroup key={groupName} heading={<bdi>{groupName}</bdi>}>
            {items.map((item) => {
              const IconComponent = iconRegistry[item.iconName] || LucideIcons.FileText;

              return (
                <CommandItem
                  key={item.id}
                  value={item.searchValue}
                  onSelect={() => handleSelect(item)}
                  className="flex cursor-pointer items-center gap-2.5"
                >
                  <IconComponent className="h-4 w-4 shrink-0 text-nx-ink-2" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-start">
                    {item.titleSegments.map((segment, index) => (
                      <React.Fragment key={`${item.id}-seg-${index}`}>
                        {index > 0 && (
                          <span className="mx-1 text-nx-ink-3" aria-hidden="true">
                            /
                          </span>
                        )}
                        <bdi>{segment}</bdi>
                      </React.Fragment>
                    ))}
                  </span>
                  <span className="hidden max-w-[160px] shrink-0 truncate font-mono text-[11px] text-nx-ink-3 sm:inline">
                    <bdi dir="ltr">{item.href}</bdi>
                  </span>
                  <LucideIcons.ChevronRight
                    className="ms-auto h-3.5 w-3.5 shrink-0 text-nx-ink-3 rtl:rotate-180"
                    aria-hidden="true"
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
