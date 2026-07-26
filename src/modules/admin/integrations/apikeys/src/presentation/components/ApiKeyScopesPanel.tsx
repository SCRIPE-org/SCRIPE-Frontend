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
import { Skeleton } from "@core/ui/skeleton";
import { resolveBilingualLabel } from "@core/common/utils";

interface ApiKeyScopesPanelProps {
  detail: ApiKeyDetail;
  isUpdating: boolean;
  onUpdateScopes: (scopes: string) => void;
}

export function ApiKeyScopesPanel({ detail, isUpdating, onUpdateScopes }: ApiKeyScopesPanelProps) {
  const { t, language } = useI18n();
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

  const hasChanges = selectedScopes.sort().join(",") !== detail.scopesList.sort().join(",");

  const handleToggleScope = (code: string, checked: boolean) => {
    if (checked) {
      setSelectedScopes((prev) => [...prev, code]);
    } else {
      setSelectedScopes((prev) => prev.filter((c) => c !== code));
    }
  };

  const handleSelectAll = () => {
    setSelectedScopes(permissions.map((p) => p.code));
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
  const filteredPermissions = permissions.filter((p) => {
    const label = `${resolveBilingualLabel(
      p.nameEn || p.code,
      p.nameAr || p.nameEn || p.code,
      language
    )} (${p.code})`;
    return (
      label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
        <CardHeader className="border-b pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold">
              {t("apikeys.scopesPanel.title")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={!detail.isActive}
              >
                {t("apikeys.scopesPanel.selectAll")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={!detail.isActive}
              >
                {t("apikeys.scopesPanel.deselectAll")}
              </Button>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-nx-ink-3" />
            <Input
              type="search"
              placeholder={t("apikeys.scopesPanel.searchPlaceholder")}
              className="h-9 ps-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!detail.isActive}
            />
          </div>
        </CardHeader>
        <CardContent className="max-h-[540px] flex-1 space-y-6 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton shape="block" className="h-4 w-1/4" />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} shape="block" className="h-8" />
                ))}
              </div>
            </div>
          ) : Object.keys(groups).length === 0 ? (
            <div className="py-8 text-center text-sm text-nx-ink-2">
              {t("apikeys.scopesPanel.noPermissions")}
            </div>
          ) : (
            Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName} className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                  {groupName}
                </h3>
                <div className="grid grid-cols-1 gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3">
                  {items.map((p) => {
                    const isChecked = selectedScopes.includes(p.code);
                    const label = `${resolveBilingualLabel(
                      p.nameEn || p.code,
                      p.nameAr || p.nameEn || p.code,
                      language
                    )} (${p.code})`;

                    return (
                      <div
                        key={p.code}
                        className={`flex items-start gap-x-3.5 rounded-nx-sm border p-2 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none ${
                          isChecked
                            ? "border-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] bg-nx-accent-wash"
                            : "border-transparent"
                        }`}
                      >
                        <Checkbox
                          id={`scope-${p.code}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => handleToggleScope(p.code, !!checked)}
                          disabled={!detail.isActive}
                          className="mt-1"
                        />
                        <div
                          className="cursor-pointer select-none space-y-0.5"
                          onClick={() => handleToggleScope(p.code, !isChecked)}
                        >
                          <Label
                            htmlFor={`scope-${p.code}`}
                            className="cursor-pointer text-xs font-medium leading-none"
                          >
                            {label}
                          </Label>
                          {p.descriptionEn && (
                            <p className="text-[10px] leading-normal text-nx-ink-3">
                              {resolveBilingualLabel(
                                p.descriptionEn,
                                p.descriptionAr || p.descriptionEn,
                                language
                              )}
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
        <CardFooter className="justify-end border-t border-nx-line bg-nx-raised px-6 py-3">
          <Button type="submit" size="sm" disabled={!hasChanges || isUpdating || !detail.isActive}>
            {isUpdating ? t("common.saving") : t("common.saveChanges")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
