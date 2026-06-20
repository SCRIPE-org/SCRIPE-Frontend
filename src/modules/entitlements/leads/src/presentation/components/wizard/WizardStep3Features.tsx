"use client";

import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Switch } from "@core/ui/switch";
import { Settings2, Info, ChevronDown, ChevronUp, ToggleLeft } from "lucide-react";
import type { EditionForConversion, EditionFeatureGroup } from "../../../domain/interfaces/ILeadsRepository";

// ── Props ─────────────────────────────────────────────────────────────────────

interface WizardStep3Props {
  edition: EditionForConversion | null;
  groups: EditionFeatureGroup[];
  isLoading: boolean;
  overrides: Record<string, string>;
  expandedCategories: Set<string>;
  onToggleCategory: (cat: string) => void;
  onOverrideChange: (featureId: string, value: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WizardStep3Features({
  edition,
  groups,
  isLoading,
  overrides,
  expandedCategories,
  onToggleCategory,
  onOverrideChange,
}: WizardStep3Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Edition defaults are pre-loaded</p>
            <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
              Values for <strong>{edition?.displayNameEn}</strong>. Override individual features for this customer only.
              Unchanged values stay as edition default.
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      )}

      {!isLoading && groups.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Settings2 className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No configurable features for this edition.</p>
          <p className="text-xs text-muted-foreground">Click Next to continue.</p>
        </div>
      )}

      {!isLoading && groups.map((group) => {
        const isExpanded = expandedCategories.has(group.category);
        return (
          <div key={group.category} className="overflow-hidden rounded-xl border border-border">
            <button
              type="button"
              onClick={() => onToggleCategory(group.category)}
              className="flex w-full items-center justify-between bg-muted/40 px-4 py-3 text-left hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{group.category}</span>
                <Badge variant="outline" className="h-4 px-1.5 text-[10px]">{group.features.length}</Badge>
              </div>
              {isExpanded
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {isExpanded && (
              <div className="divide-y divide-border/60 px-4">
                {group.features.map((feature) => {
                  const currentValue = overrides[feature.featureId] ?? feature.editionValue;
                  const isChanged = currentValue !== feature.editionValue;

                  return (
                    <div key={feature.featureId} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{feature.displayNameEn}</span>
                          {isChanged && (
                            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] text-amber-600">Override</Badge>
                          )}
                        </div>
                        {feature.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{feature.description}</p>
                        )}
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Edition default: <span className="font-mono font-medium">{feature.editionValue}</span>
                        </p>
                      </div>
                      <div className="w-36 shrink-0">
                        {feature.valueType === "Boolean" ? (
                          <div className="flex items-center gap-2 justify-end">
                            <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                            <Switch
                              checked={currentValue === "true"}
                              onCheckedChange={(v) => onOverrideChange(feature.featureId, String(v))}
                            />
                          </div>
                        ) : feature.valueType === "Numeric" ? (
                          <Input
                            type="number"
                            value={currentValue}
                            onChange={(e) => onOverrideChange(feature.featureId, e.target.value)}
                            className="h-8 text-right text-sm"
                            min="-1"
                            placeholder="-1 = unlimited"
                          />
                        ) : (
                          <Input
                            value={currentValue}
                            onChange={(e) => onOverrideChange(feature.featureId, e.target.value)}
                            className="h-8 text-sm"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
