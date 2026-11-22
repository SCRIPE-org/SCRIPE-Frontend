"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import type { PatScopeOption } from "../../viewmodels/useIntegrationsFederationViewModel";
import {
  buildPatQuickPresets,
  classifyPatScopeAccess,
} from "../../utils/patScopeTaxonomy";
import { PatPermissionRow } from "./PatPermissionRow";
import { PatScopeToolbarSection, type PatScopeTierFilter } from "./PatScopeToolbarSection";
import { Code2, KeyRound } from "lucide-react";

/** Props for PatPermissionStudioCard. */
export interface PatPermissionStudioCardProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  scopeCatalog: PatScopeOption[];
  selectedScopes: string[];
  onChangeSelectedScopes: (next: string[]) => void;
}

/**
 * Full-canvas bilingual Fine-Grained Permission Studio featuring dynamic least-privilege
 * quick templates, EN/AR search, access-tier tabs, module filters, and a technical key toggle.
 */
export function PatPermissionStudioCard({
  t,
  language,
  scopeCatalog,
  selectedScopes,
  onChangeSelectedScopes,
}: PatPermissionStudioCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModule, setActiveModule] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<PatScopeTierFilter>("all");
  const [showTechnicalKeys, setShowTechnicalKeys] = useState(false);

  const selectedSet = new Set(selectedScopes);
  const presets = buildPatQuickPresets(scopeCatalog);

  const moduleCounts = new Map<string, { total: number; selected: number }>();
  for (const s of scopeCatalog) {
    const entry = moduleCounts.get(s.moduleKey) ?? { total: 0, selected: 0 };
    entry.total += 1;
    if (selectedSet.has(s.code)) entry.selected += 1;
    moduleCounts.set(s.moduleKey, entry);
  }
  const modules = Array.from(moduleCounts.entries()).sort(([a], [b]) => a.localeCompare(b));

  const queryLower = searchQuery.trim().toLowerCase();
  const filteredScopes = scopeCatalog.filter((s) => {
    if (activeModule !== "all" && s.moduleKey !== activeModule) return false;
    const tier = classifyPatScopeAccess(s.action || s.code);
    if (tierFilter === "read" && tier !== "read") return false;
    if (tierFilter === "write" && tier === "read") return false;
    if (tierFilter === "selected" && !selectedSet.has(s.code)) return false;
    if (!queryLower) return true;
    return (
      s.code.toLowerCase().includes(queryLower) ||
      s.nameEn.toLowerCase().includes(queryLower) ||
      s.nameAr.toLowerCase().includes(queryLower) ||
      s.descriptionEn.toLowerCase().includes(queryLower) ||
      s.descriptionAr.toLowerCase().includes(queryLower) ||
      s.category.toLowerCase().includes(queryLower) ||
      s.moduleKey.toLowerCase().includes(queryLower)
    );
  });

  const groupedByCategory = new Map<string, PatScopeOption[]>();
  for (const s of filteredScopes) {
    const key = `${s.moduleKey} • ${s.category || s.moduleKey}`;
    const list = groupedByCategory.get(key) ?? [];
    list.push(s);
    groupedByCategory.set(key, list);
  }

  const toggleScope = (code: string) => {
    onChangeSelectedScopes(
      selectedSet.has(code)
        ? selectedScopes.filter((item) => item !== code)
        : [...selectedScopes, code]
    );
  };

  const selectAllVisible = () => {
    const next = new Set(selectedScopes);
    for (const s of filteredScopes) next.add(s.code);
    onChangeSelectedScopes(Array.from(next));
  };

  const clearVisible = () => {
    const visibleSet = new Set(filteredScopes.map((s) => s.code));
    onChangeSelectedScopes(selectedScopes.filter((code) => !visibleSet.has(code)));
  };

  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-nx-accent shrink-0" aria-hidden="true" />
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("profile.integrations.availableScopesLabel")} ({selectedScopes.length})
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3 mt-1">
            {t("profile.integrations.scopeStudioSubtitle")}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-nx-line bg-nx-ground px-3 py-1.5 shrink-0">
          <Code2 className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
          <Label htmlFor="pat-show-keys-switch" className="text-xs text-nx-ink-2 cursor-pointer">
            {t("profile.integrations.showTechnicalKeysLabel")}
          </Label>
          <Switch
            id="pat-show-keys-switch"
            data-testid="pat-toggle-technical-keys"
            checked={showTechnicalKeys}
            onCheckedChange={setShowTechnicalKeys}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <PatScopeToolbarSection
          t={t}
          presets={presets}
          hasCatalog={scopeCatalog.length > 0}
          searchQuery={searchQuery}
          tierFilter={tierFilter}
          activeModule={activeModule}
          modules={modules}
          totalCount={scopeCatalog.length}
          selectedCount={selectedScopes.length}
          matchingCount={filteredScopes.length}
          onApplyPreset={onChangeSelectedScopes}
          onSearchChange={setSearchQuery}
          onTierFilterChange={setTierFilter}
          onModuleChange={setActiveModule}
          onSelectAllVisible={selectAllVisible}
          onClearVisible={clearVisible}
        />

        <div className="max-h-[480px] overflow-y-auto space-y-4 pe-1">
          {filteredScopes.length === 0 ? (
            <div className="rounded-xl border border-nx-line bg-nx-ground p-6 text-center space-y-1">
              <p className="text-xs font-semibold text-nx-ink">
                {scopeCatalog.length === 0
                  ? t("profile.integrations.noScopesAvailable")
                  : t("profile.integrations.noMatchingScopesTitle")}
              </p>
              {scopeCatalog.length > 0 && (
                <p className="text-xs text-nx-ink-3">
                  {t("profile.integrations.noMatchingScopesDesc")}
                </p>
              )}
            </div>
          ) : (
            Array.from(groupedByCategory.entries()).map(([groupLabel, scopes]) => (
              <div key={groupLabel} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold text-nx-ink-2">{groupLabel}</span>
                  <span className="text-[11px] font-mono tabular-nums text-nx-ink-3">
                    {scopes.filter((s) => selectedSet.has(s.code)).length} / {scopes.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {scopes.map((scope) => (
                    <PatPermissionRow
                      key={scope.code}
                      t={t}
                      language={language}
                      scope={scope}
                      selected={selectedSet.has(scope.code)}
                      showTechnicalKeys={showTechnicalKeys}
                      onToggle={() => toggleScope(scope.code)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
