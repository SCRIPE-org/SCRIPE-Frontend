"use client";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Checkbox } from "@core/ui/checkbox";

/**
 * Props for DelegationScopeChecklistField.
 */
export interface DelegationScopeChecklistFieldProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  selectedScopes: string[];
  availableScopeCodes: string[];
  filteredModalScopes: string[];
  scopeSearch: string;
  justification: string;
  onScopeSearchChange: (val: string) => void;
  onToggleScope: (code: string) => void;
  onSelectAllScopes: () => void;
  onClearScopes: () => void;
  onJustificationChange: (val: string) => void;
}

/**
 * Searchable permission scope checklist and mandatory justification input for delegation grants.
 */
export function DelegationScopeChecklistField({
  t,
  selectedScopes,
  availableScopeCodes,
  filteredModalScopes,
  scopeSearch,
  justification,
  onScopeSearchChange,
  onToggleScope,
  onSelectAllScopes,
  onClearScopes,
  onJustificationChange,
}: DelegationScopeChecklistFieldProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("profile.governance.grantedScopesLabel")} ({selectedScopes.length})
          </Label>
          {availableScopeCodes.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSelectAllScopes}
                className="h-6 px-2 text-[11px] text-nx-accent"
              >
                {t("profile.governance.selectAllScopes")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearScopes}
                className="h-6 px-2 text-[11px] text-nx-ink-3"
              >
                {t("profile.governance.clearScopes")}
              </Button>
            </div>
          )}
        </div>

        {availableScopeCodes.length > 6 && (
          <Input
            value={scopeSearch}
            onChange={(e) => onScopeSearchChange(e.target.value)}
            placeholder={t("profile.governance.filterScopesPlaceholder")}
            className="h-8 text-xs"
          />
        )}

        <div className="max-h-40 overflow-y-auto rounded-xl border border-nx-line bg-nx-ground p-2.5 space-y-1.5">
          {filteredModalScopes.length === 0 ? (
            <p className="text-xs text-nx-ink-3 p-2">
              {t("profile.governance.noEffectivePermissions")}
            </p>
          ) : (
            filteredModalScopes.map((code) => (
              <Label
                key={code}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-nx-surface cursor-pointer font-normal"
              >
                <Checkbox
                  checked={selectedScopes.includes(code)}
                  onCheckedChange={() => onToggleScope(code)}
                />
                <span className="text-xs font-mono text-nx-ink break-all">{code}</span>
              </Label>
            ))
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-nx-ink">
          {t("profile.governance.justificationLabel")}
        </Label>
        <Textarea
          data-testid="delegation-justification-input"
          value={justification}
          onChange={(e) => onJustificationChange(e.target.value)}
          placeholder={t("profile.governance.justificationPlaceholder")}
          className="text-xs min-h-[72px]"
        />
      </div>
    </>
  );
}
