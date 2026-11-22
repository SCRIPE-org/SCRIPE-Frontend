"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { buildSearchIndex, type SearchableItem } from "@core/navigation/search";
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
import { useRailStartPageToggle } from "./use-rail-start-page-toggle";

interface NexusSearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Global Command Palette (`Cmd/Ctrl + K`) indexing unlocked workspaces, hydrated & cached
 * JIT menu trees, unhydrated authorized route descriptors, and contextual start-page actions.
 */
export function NexusSearchPalette({ open, onOpenChange }: NexusSearchPaletteProps) {
  const { t, language, direction } = useI18n();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const {
    workspaceGroups,
    activeWorkspace = null,
    activeRootItem = null,
    rootMenuItems = [],
    setActiveWorkspace,
    setActiveRootItemId,
  } = useWorkspace();
  const cachedWorkspaces = useNavigationStore((s) => s.workspaces);
  const routeDescriptors = useNavigationStore((s) => s.routeDescriptors);
  const navContextKey = useNavigationStore((s) => s.contextKey);
  const recordRecentWorkspace = useNavigationStore((s) => s.recordRecentWorkspace);

  const startPageAction = useRailStartPageToggle({
    activeWorkspace,
    activeRootItem,
    rootMenuItems,
    pathname,
    language,
    t,
  });

  const searchableItems = buildSearchIndex({
    workspaceGroups,
    cachedWorkspaces,
    routeDescriptors,
    language,
    t,
  });

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

        {startPageAction.kind !== "hidden" && (
          <CommandGroup heading={<bdi>{t("chrome.paletteActionsGroup")}</bdi>}>
            {startPageAction.kind === "settable" && (
              <CommandItem
                value={`action:set-start-page:${startPageAction.workspaceName}:${startPageAction.currentPageName}`}
                disabled={startPageAction.isPending}
                onSelect={() => {
                  void startPageAction.onSetAsStartPage();
                  onOpenChange(false);
                }}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <LucideIcons.Home className="h-4 w-4 shrink-0 text-nx-ink-2" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-start">
                  <bdi>
                    {t("chrome.setAsStartPage", {
                      workspace: startPageAction.workspaceName,
                    })}
                  </bdi>
                </span>
              </CommandItem>
            )}
            {startPageAction.kind === "current_custom" && (
              <CommandItem
                value={`action:reset-start-page:${startPageAction.workspaceName}`}
                disabled={startPageAction.isPending}
                onSelect={() => {
                  void startPageAction.onResetStartPage();
                  onOpenChange(false);
                }}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <LucideIcons.RotateCcw className="h-4 w-4 shrink-0 text-nx-ink-2" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-start">
                  <bdi>{t("chrome.resetStartPage")}</bdi>
                </span>
              </CommandItem>
            )}
            <CommandItem
              value={`action:manage-start-pages:${startPageAction.workspaceName}`}
              onSelect={() => {
                startRoutingProgress();
                router.push("/account/preferences");
                onOpenChange(false);
              }}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <LucideIcons.SlidersHorizontal
                className="h-4 w-4 shrink-0 text-nx-ink-2"
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-start">
                <bdi>{t("chrome.manageStartPages")}</bdi>
              </span>
            </CommandItem>
          </CommandGroup>
        )}

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
