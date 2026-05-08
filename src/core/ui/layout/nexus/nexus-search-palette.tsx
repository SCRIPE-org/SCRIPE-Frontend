"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@core/ui/command";
import { useI18n } from "@core/providers/i18n-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import * as LucideIcons from "lucide-react";
import { MenuItem } from "@core/navigation";

interface NexusSearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchableItem {
  id: string;
  title: string;
  href: string;
  iconName: string;
  workspaceKey: string;
  rootItemId: string;
  groupName: string;
}

export function NexusSearchPalette({ open, onOpenChange }: NexusSearchPaletteProps) {
  const { t, language } = useI18n();
  const router = useRouter();
  const { workspaceGroups, setActiveWorkspace, setActiveRootItemId } = useWorkspace();

  // Build a flat list of all searchable items across all workspaces
  const searchableItems = useMemo(() => {
    const items: SearchableItem[] = [];

    workspaceGroups.forEach((workspace) => {
      const workspaceName = workspace.getLocalizedName(language);
      
      workspace.menuItems.forEach((rootItem) => {
        const rootName = rootItem.getLocalizedName(language);
        
        // Add root item if it has an href
        if (rootItem.href && rootItem.href !== "#") {
          items.push({
            id: rootItem.id,
            title: rootName,
            href: rootItem.href,
            iconName: rootItem.icon || "Folder",
            workspaceKey: workspace.workspaceKey,
            rootItemId: rootItem.id,
            groupName: workspaceName,
          });
        }

        // Recursively add children
        const traverse = (children: MenuItem[], parentNames: string[]) => {
          children.forEach((child) => {
            const childName = child.getLocalizedName(language);
            const fullPathNames = [...parentNames, childName];
            
            if (child.href && child.href !== "#") {
              items.push({
                id: child.id,
                title: fullPathNames.join(" / "),
                href: child.href,
                iconName: child.icon || "FileText",
                workspaceKey: workspace.workspaceKey,
                rootItemId: rootItem.id,
                groupName: workspaceName,
              });
            }
            
            traverse(child.children, fullPathNames);
          });
        };

        traverse(rootItem.children, [rootName]);
      });
    });

    return items;
  }, [workspaceGroups, language]);

  // Group items by workspace name for organized display
  const groupedItems = useMemo(() => {
    const groups: Record<string, SearchableItem[]> = {};
    searchableItems.forEach((item) => {
      if (!groups[item.groupName]) {
        groups[item.groupName] = [];
      }
      groups[item.groupName].push(item);
    });
    return groups;
  }, [searchableItems]);

  // Handle keyboard shortcut
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
    // 1. Switch to the correct workspace
    setActiveWorkspace(item.workspaceKey);
    // 2. Switch to the correct root item so the panel shows its children
    setActiveRootItemId(item.rootItemId);
    // 3. Navigate
    router.push(item.href);
    // 4. Close palette
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t("common.search") || "Search pages..."} />
      <CommandList>
        <CommandEmpty>{t("common.noResultsFound") || "No results found."}</CommandEmpty>
        
        {Object.entries(groupedItems).map(([groupName, items]) => (
          <CommandGroup key={groupName} heading={groupName}>
            {items.map((item) => {
              // Dynamically resolve icon from Lucide
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const IconComponent = (LucideIcons as any)[item.iconName] || LucideIcons.FileText;
              
              return (
                <CommandItem
                  key={item.id}
                  value={item.title + " " + item.href} // Index by title and href for better matching
                  onSelect={() => handleSelect(item)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <span>{item.title}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
