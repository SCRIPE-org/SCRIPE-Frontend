"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import { useQuery } from "@tanstack/react-query";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import type { ApiKeyDetail } from "../../domain/entities/ApiKeyDetail";
import { Search } from "lucide-react";
import { Input } from "@core/ui/input";

interface ApiKeyScopesPanelProps {
  detail: ApiKeyDetail;
  isUpdating: boolean;
  onUpdateScopes: (scopes: string) => void;
}

export function ApiKeyScopesPanel({ detail, isUpdating, onUpdateScopes }: ApiKeyScopesPanelProps) {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const { permissionRepository } = identityContainer;

  const userTenantId = useAppStore((s) => s.user?.tenantId);
  const { currentTenant, isInTenantWorld } = useTenantContext();
  const isSystemCatalogMode = !userTenantId && !isInTenantWorld;
  const effectiveTenantId = isInTenantWorld ? currentTenant?.id : userTenantId;

  // Query permissions based on active tenant scope
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["permissions", "scopes-picker", effectiveTenantId],
    queryFn: () => {
      if (isSystemCatalogMode || !effectiveTenantId) {
        return permissionRepository.getAll();
      }
      return permissionRepository.getForTenant(effectiveTenantId);
    },
    staleTime: 10 * 60 * 1000,
  });

  const [selectedScopes, setSelectedScopes] = useState<string[]>(detail.scopesList);
  const [searchQuery, setSearchQuery] = useState("");

  const hasChanges =
    selectedScopes.sort().join(",") !== detail.scopesList.sort().join(",");

  const handleToggleScope = (code: string, checked: boolean) => {
    if (checked) {
      setSelectedScopes(prev => [...prev, code]);
    } else {
      setSelectedScopes(prev => prev.filter(c => c !== code));
    }
  };

  const handleSelectAll = () => {
    setSelectedScopes(permissions.map(p => p.code));
  };

  const handleDeselectAll = () => {
    setSelectedScopes([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.isActive) return;
    onUpdateScopes(selectedScopes.join(","));
  };

  // Group permissions by category/module for premium grouped display
  const filteredPermissions = permissions.filter(p => {
    const label = isAr
      ? `${p.nameAr || p.nameEn || p.code} (${p.code})`
      : `${p.nameEn || p.code} (${p.code})`;
    return label.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const groups = filteredPermissions.reduce<Record<string, typeof permissions>>((acc, p) => {
    const groupName = p.category || p.module || "General";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(p);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-semibold">
              {t("apikeys.scopesPanel.title") || "API Scopes / Permissions"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleSelectAll} disabled={!detail.isActive}>
                {t("apikeys.scopesPanel.selectAll") || "Select All"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll} disabled={!detail.isActive}>
                {t("apikeys.scopesPanel.deselectAll") || "Clear All"}
              </Button>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("apikeys.scopesPanel.searchPlaceholder") || "Search permissions..."}
              className="pl-9 h-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              disabled={!detail.isActive}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[540px]">
          {isLoading ? (
            <div className="space-y-4 py-4 motion-safe:animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded" />
                ))}
              </div>
            </div>
          ) : Object.keys(groups).length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("apikeys.scopesPanel.noPermissions") || "No permissions found"}
            </div>
          ) : (
            Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName} className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {groupName}
                </h3>
                <div className="grid grid-cols-1 gap-2 border rounded-lg p-3 bg-muted/10">
                  {items.map(p => {
                    const isChecked = selectedScopes.includes(p.code);
                    const label = isAr
                      ? `${p.nameAr || p.nameEn || p.code} (${p.code})`
                      : `${p.nameEn || p.code} (${p.code})`;

                    return (
                      <div
                        key={p.code}
                        className={`flex items-start gap-x-3.5 p-2 rounded-md hover:bg-muted/40 transition-colors border ${
                          isChecked
                            ? "border-primary/20 bg-primary/5 dark:bg-primary/10"
                            : "border-transparent"
                        }`}
                      >
                        <Checkbox
                          id={`scope-${p.code}`}
                          checked={isChecked}
                          onCheckedChange={checked => handleToggleScope(p.code, !!checked)}
                          disabled={!detail.isActive}
                          className="mt-1"
                        />
                        <div className="space-y-0.5 select-none cursor-pointer" onClick={() => handleToggleScope(p.code, !isChecked)}>
                          <Label
                            htmlFor={`scope-${p.code}`}
                            className="text-xs font-medium cursor-pointer leading-none"
                          >
                            {label}
                          </Label>
                          {p.descriptionEn && (
                            <p className="text-[10px] text-muted-foreground leading-normal">
                              {isAr ? p.descriptionAr || p.descriptionEn : p.descriptionEn}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="justify-end border-t px-6 py-3 bg-muted/20">
          <Button type="submit" size="sm" disabled={!hasChanges || isUpdating || !detail.isActive}>
            {isUpdating ? t("common.saving") || "Saving..." : t("common.saveChanges") || "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
