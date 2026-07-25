// UI-EXCEPTION: compact studio layout
"use client";

import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Switch } from "@core/ui/switch";
import { EmptyState } from "@core/ui/empty-state";
import { Settings2, Info, ChevronDown, ChevronUp, ToggleLeft } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type {
  EditionForConversion,
  EditionFeatureGroup,
} from "../../../domain/interfaces/ILeadsRepository";

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

/**
 * Presentation UI component rendering the wizard step3 features.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WizardStep3Features({
  edition,
  groups,
  isLoading,
  overrides,
  expandedCategories,
  onToggleCategory,
  onOverrideChange,
}: WizardStep3Props) {
  const { t, language } = useI18n();

  return (
    <div className="space-y-4">
      <div className="rounded-nx-md border border-info/30 bg-info/10 px-4 py-3">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-info">
              {t("leads.convertWizard.defaultsPreloaded")}
            </p>
            <p className="mt-0.5 text-xs text-info">
              {t("leads.convertWizard.defaultsPreloadedDesc", {
                edition:
                  (language === "ar" && edition?.displayNameAr
                    ? edition.displayNameAr
                    : edition?.displayNameEn) || "",
              })}
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} shape="block" className="h-16 w-full rounded-nx-lg" />
          ))}
        </div>
      )}

      {!isLoading && groups.length === 0 && (
        <EmptyState
          size="sm"
          bare
          icon={Settings2}
          title={t("leads.convertWizard.noFeatureGroups")}
          description={t("leads.convertWizard.clickNextToContinue")}
        />
      )}

      {!isLoading &&
        groups.map((group) => {
          const isExpanded = expandedCategories.has(group.category);
          return (
            <div
              key={group.category}
              className="overflow-hidden rounded-nx-lg border border-nx-line"
            >
              <button
                type="button"
                onClick={() => onToggleCategory(group.category)}
                aria-expanded={isExpanded}
                className={cn(
                  "flex w-full items-center justify-between bg-nx-raised px-4 py-3 text-start",
                  "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  "hover:bg-nx-hover focus-visible:outline-none focus-visible:shadow-nx-focus"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-nx-ink">
                    {t(`leads.convertWizard.categories.${group.category.toLowerCase()}`, {
                      defaultValue: group.category,
                    })}
                  </span>
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                    {group.features.length}
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
                )}
              </button>

              {isExpanded && (
                <div className="divide-y divide-nx-line px-4">
                  {group.features.map((feature) => {
                    const currentValue = overrides[feature.featureId] ?? feature.editionValue;
                    const isChanged = currentValue !== feature.editionValue;

                    return (
                      <div key={feature.featureId} className="flex items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-nx-ink">
                              {language === "ar" && feature.displayNameAr
                                ? feature.displayNameAr
                                : feature.displayNameEn}
                            </span>
                            {isChanged && (
                              <Badge variant="warning" className="h-4 px-1.5 text-[10px]">
                                {t("leads.convertWizard.override")}
                              </Badge>
                            )}
                          </div>
                          {feature.description && (
                            <p className="mt-0.5 text-xs text-nx-ink-2">{feature.description}</p>
                          )}
                          <p className="mt-0.5 text-[10px] text-nx-ink-3">
                            {t("leads.convertWizard.confirmStep.noOverrides", {
                              defaultValue: "Edition default",
                            })}
                            :{" "}
                            <span className="font-mono font-medium text-nx-ink-2">
                              {feature.editionValue}
                            </span>
                          </p>
                        </div>
                        <div className="w-36 shrink-0">
                          {feature.valueType === "Boolean" ? (
                            <div className="flex items-center justify-end gap-2">
                              <ToggleLeft className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                              <Switch
                                checked={currentValue === "true"}
                                onCheckedChange={(v) =>
                                  onOverrideChange(feature.featureId, String(v))
                                }
                              />
                            </div>
                          ) : feature.valueType === "Numeric" ? (
                            <Input
                              type="number"
                              value={currentValue}
                              onChange={(e) => onOverrideChange(feature.featureId, e.target.value)}
                              className="h-8 text-end text-sm"
                              min="-1"
                              placeholder={t("leads.convertWizard.unlimitedHint")}
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
