// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
/**
 * Permissions Picker Component
 *
 * Multi-select permissions picker grouped by category.
 * Fetches creator's permissions via PermissionRepository.
 * Used in tenant creation form.
 *
 * Clean Architecture: Component → Repository (via DI)
 *
 * @module tenants
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { usePermissionsPickerViewModel } from "../viewmodels/usePermissionsPickerViewModel";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { ScrollArea } from "@core/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@core/ui/collapsible";
import { ChevronDown, ChevronRight, Search, Shield, Check } from "lucide-react";
import { cn } from "@core/common/utils";
import type { Permission } from "@modules/identity/core";

interface PermissionsPickerProps {
  /** Selected permission IDs */
  value: string[];
  /** Callback when selection changes */
  onChange: (ids: string[]) => void;
  /** Optional className for the container */
  className?: string;
  /** Whether to show in compact mode */
  compact?: boolean;
}

/**
 * Presentation UI component rendering the permissions picker.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PermissionsPicker({
  value,
  onChange,
  className,
  compact = false,
}: PermissionsPickerProps) {
  const { t, language, permissions, isLoading } = usePermissionsPickerViewModel();
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    if (!permissions) return {};

    const filtered = permissions.filter((p) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        p.code.toLowerCase().includes(searchLower) ||
        p.getLocalizedDescription(language).toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    });

    return filtered.reduce(
      (acc, permission) => {
        const category = permission.category || "other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  }, [permissions, search, language]);

  // Get sorted categories
  const categories = useMemo(() => {
    return Object.keys(groupedPermissions).sort();
  }, [groupedPermissions]);

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  // Toggle single permission WITH AUTO-GRANT LOGIC
  // When selecting any action permission (except 'view'),
  // automatically select the corresponding {resource}.view permission
  const togglePermission = useCallback(
    (id: string) => {
      if (value.includes(id)) {
        // Deselecting - just remove
        onChange(value.filter((v) => v !== id));
        return;
      }

      // Selecting - auto-grant view permission for the same resource
      const selectedPermission = permissions?.find((p) => p.id === id);
      if (!selectedPermission) {
        onChange([...value, id]);
        return;
      }

      // If selecting a non-view action, auto-add the view permission
      if (selectedPermission.action !== "view") {
        const viewPermission = permissions?.find(
          (p) => p.resource === selectedPermission.resource && p.action === "view"
        );
        if (viewPermission && !value.includes(viewPermission.id)) {
          // Auto-grant: add both the selected permission AND view permission
          onChange([...value, id, viewPermission.id]);
          return;
        }
      }

      onChange([...value, id]);
    },
    [value, onChange, permissions]
  );

  // Toggle all in category
  const toggleCategory_ = useCallback(
    (category: string, select: boolean) => {
      const categoryIds = groupedPermissions[category]?.map((p) => p.id) || [];
      if (select) {
        const newValue = [...new Set([...value, ...categoryIds])];
        onChange(newValue);
      } else {
        onChange(value.filter((v) => !categoryIds.includes(v)));
      }
    },
    [groupedPermissions, value, onChange]
  );

  // Select all / Deselect all
  const selectAll = useCallback(() => {
    if (permissions) {
      onChange(permissions.map((p) => p.id));
    }
  }, [permissions, onChange]);

  const deselectAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  // Check if all in category are selected
  const isCategorySelected = useCallback(
    (category: string) => {
      const categoryIds = groupedPermissions[category]?.map((p) => p.id) || [];
      return categoryIds.every((id) => value.includes(id));
    },
    [groupedPermissions, value]
  );

  // Check if some in category are selected
  const isCategoryPartial = useCallback(
    (category: string) => {
      const categoryIds = groupedPermissions[category]?.map((p) => p.id) || [];
      const selectedCount = categoryIds.filter((id) => value.includes(id)).length;
      return selectedCount > 0 && selectedCount < categoryIds.length;
    },
    [groupedPermissions, value]
  );

  // Check if a view permission is auto-granted (required because other actions in same resource are selected)
  const isAutoGranted = useCallback(
    (permission: Permission) => {
      // Only applies to view permissions
      if (permission.action !== "view") return false;

      // Check if any non-view permission in the same resource is selected
      const hasOtherActionSelected = permissions?.some(
        (p) => p.resource === permission.resource && p.action !== "view" && value.includes(p.id)
      );

      return hasOtherActionSelected && value.includes(permission.id);
    },
    [permissions, value]
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-nx-ink-2">
          <Shield className="mx-auto mb-2 h-8 w-8 opacity-50" aria-hidden="true" />
          <p>{t("tenant.noPermissionsAvailable")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-nx-line", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" aria-hidden="true" />
            {t("tenant.selectPermissions")}
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            <span className="tabular-nums">
              {value.length} / {permissions.length}
            </span>
          </Badge>
        </div>
        <p className="text-sm text-nx-ink-2">{t("tenant.selectPermissionsDesc")}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Actions */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-2"
              aria-hidden="true"
            />
            <Input
              placeholder={t("permission.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>
          <button
            type="button"
            onClick={selectAll}
            className="px-2 text-xs text-nx-accent hover:underline"
          >
            {t("common.selectAll")}
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="px-2 text-xs text-nx-ink-2 hover:underline"
          >
            {t("common.deselectAll")}
          </button>
        </div>

        {/* Categories List */}
        <ScrollArea className={compact ? "h-48" : "h-64"}>
          <div className="space-y-1 pe-4">
            {categories.map((category) => {
              const isExpanded = expandedCategories.has(category);
              const categoryPermissions = groupedPermissions[category];
              const isSelected = isCategorySelected(category);
              const isPartial = isCategoryPartial(category);

              return (
                <Collapsible
                  key={category}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-2 rounded-nx-md px-2 py-1.5 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none">
                    <Checkbox
                      checked={isSelected}
                      // @ts-expect-error - indeterminate is valid but not typed
                      indeterminate={isPartial}
                      onCheckedChange={(checked) => toggleCategory_(category, !!checked)}
                      className="shrink-0"
                    />
                    <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-sm font-medium capitalize">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      )}
                      {category}
                      <Badge variant="outline" className="ms-auto text-xs tabular-nums">
                        {categoryPermissions.filter((p) => value.includes(p.id)).length}/
                        {categoryPermissions.length}
                      </Badge>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent>
                    <div className="space-y-0.5 py-1 ps-8">
                      {categoryPermissions
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((permission) => (
                          <label
                            key={permission.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-nx-sm px-2 py-1.5",
                              "transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none",
                              value.includes(permission.id) && "bg-nx-accent-wash"
                            )}
                          >
                            <Checkbox
                              checked={value.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                              className="shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 truncate text-sm font-medium">
                                {permission.getLocalizedName(language)}
                                {isAutoGranted(permission) && (
                                  <Badge
                                    variant="outline"
                                    className="border-[color:color-mix(in_srgb,var(--nx-accent)_50%,transparent)] px-1.5 py-0 text-xs text-nx-accent"
                                  >
                                    {t("permission.autoGranted")}
                                  </Badge>
                                )}
                              </div>
                              {permission.getLocalizedDescription(language) && (
                                <div className="truncate text-xs text-nx-ink-2">
                                  {permission.getLocalizedDescription(language)}
                                </div>
                              )}
                            </div>
                            <code className="shrink-0 rounded-nx-sm bg-nx-raised px-1.5 py-0.5 text-xs text-nx-ink-2">
                              {permission.code}
                            </code>
                          </label>
                        ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>

        {/* Selected summary */}
        {value.length > 0 && (
          <div className="flex items-center gap-2 border-t border-nx-line pt-2 text-sm">
            <Check className="h-4 w-4 text-success" aria-hidden="true" />
            <span className="tabular-nums text-nx-ink-2">
              {t("tenant.permissionsSelected", { count: value.length })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PermissionsPicker;
