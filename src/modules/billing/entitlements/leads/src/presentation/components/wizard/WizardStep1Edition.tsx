// UI-EXCEPTION: compact studio layout
"use client";

import { useState, useMemo } from "react";
import { Skeleton } from "@core/ui/skeleton";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import { Star, Search, FolderOpen, PackageSearch } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { EditionForConversion } from "../../../domain/interfaces/ILeadsRepository";
import type { PlatformLead } from "../../../domain/entities/PlatformLead";

// ── Props ─────────────────────────────────────────────────────────────────────

interface WizardStep1Props {
  lead: PlatformLead | null;
  editions?: EditionForConversion[];
  isLoading: boolean;
  selected: EditionForConversion | null;
  onSelect: (e: EditionForConversion) => void;
}

// Categories the platform actually ships are localized; anything the backend
// adds later (a category key with no translation yet) still reads as a real
// label instead of the raw "leads.convertWizard.categories.<key>" string.
const KNOWN_CATEGORY_KEYS = ["general", "erp", "healthcare", "compliance"] as const;

function categoryLabel(t: (key: string) => string, cat: string): string {
  if ((KNOWN_CATEGORY_KEYS as readonly string[]).includes(cat)) {
    return t(`leads.convertWizard.categories.${cat}`);
  }
  return cat.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Presentation UI component rendering the wizard step1 edition.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WizardStep1Edition({
  lead,
  editions = [],
  isLoading,
  selected,
  onSelect,
}: WizardStep1Props) {
  const { t, language } = useI18n();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get unique categories present in the editions list
  const categories = useMemo(() => {
    const keys = new Set<string>();
    editions.forEach((e) => {
      if (e.categoryKey) {
        keys.add(e.categoryKey.toLowerCase());
      }
    });
    return Array.from(keys);
  }, [editions]);

  // Filter and group editions
  const groupedEditions = useMemo(() => {
    const filtered = editions.filter((e) => {
      const term = search.toLowerCase();
      const matchesSearch =
        e.displayNameEn.toLowerCase().includes(term) ||
        (e.displayNameAr && e.displayNameAr.toLowerCase().includes(term)) ||
        e.name.toLowerCase().includes(term);

      const cat = e.categoryKey?.toLowerCase() || "general";
      const matchesCategory = selectedCategory === "all" || cat === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Group by categoryKey
    const groups: Record<string, EditionForConversion[]> = {};
    filtered.forEach((e) => {
      const cat = e.categoryKey?.toLowerCase() || "general";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(e);
    });

    return groups;
  }, [editions, search, selectedCategory]);

  return (
    <div className="space-y-4">
      {lead && (
        <div className="rounded-nx-md border border-nx-line bg-nx-raised px-4 py-3">
          <p className="text-sm font-semibold text-nx-ink">{lead.companyName}</p>
          <p className="text-xs text-nx-ink-2">
            {lead.contactName} · {lead.email}
          </p>
          {lead.editionKey && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-nx-ink-2">
              <span>{t("leads.convertWizard.requestedPlan")}</span>
              <Badge variant="info">{lead.editionKey}</Badge>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-nx-ink">{t("leads.convertWizard.selectPlan")}</p>
        <p className="text-xs text-nx-ink-2">{t("leads.convertWizard.selectPlanDesc")}</p>
      </div>

      {/* Search & Categories */}
      {!isLoading && editions.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder={t("leads.convertWizard.searchEditionsPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 ps-9"
            />
          </div>

          {/* Category Selector Tabs */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-b border-nx-line pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "rounded-nx-control px-3 py-1.5 text-xs font-semibold",
                  "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  "focus-visible:shadow-nx-focus focus-visible:outline-none",
                  selectedCategory === "all"
                    ? "bg-info text-info-foreground"
                    : "border border-nx-line bg-nx-raised text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
                )}
              >
                {t("leads.convertWizard.allPlans")}
              </button>
              {categories.map((cat) => {
                const label = categoryLabel(t, cat);
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "rounded-nx-control px-3 py-1.5 text-xs font-semibold",
                      "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                      "focus-visible:shadow-nx-focus focus-visible:outline-none",
                      isSelected
                        ? "bg-info text-info-foreground"
                        : "border border-nx-line bg-nx-raised text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} shape="block" className="h-20 w-full rounded-nx-lg" />
          ))}
        </div>
      )}

      {!isLoading && editions.length === 0 && (
        <EmptyState
          size="sm"
          bare
          icon={PackageSearch}
          title={t("leads.convertWizard.noEditions")}
        />
      )}

      {!isLoading && editions.length > 0 && Object.keys(groupedEditions).length === 0 && (
        <EmptyState
          size="sm"
          bare
          icon={PackageSearch}
          title={t("leads.convertWizard.noSearchMatches")}
        />
      )}

      {!isLoading && editions.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedEditions).map(([catKey, items]) => {
            const groupTitle = categoryLabel(t, catKey);
            return (
              <div key={catKey} className="space-y-2.5">
                <div className="flex items-center gap-2 border-b border-nx-line pb-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                    {groupTitle}
                  </span>
                </div>
                <div className="grid gap-2">
                  {items.map((edition) => {
                    const isSelected = selected?.id === edition.id;
                    return (
                      <button
                        key={edition.id}
                        type="button"
                        onClick={() => onSelect(edition)}
                        className={cn(
                          "group w-full rounded-nx-lg border px-4 py-3 text-start",
                          "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                          "focus-visible:shadow-nx-focus focus-visible:outline-none",
                          isSelected
                            ? "border-info bg-info/5"
                            : "border-nx-line bg-nx-surface hover:border-info/40 hover:bg-nx-raised"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-nx-ink transition-colors duration-nx-micro ease-nx-enter group-hover:text-info motion-reduce:transition-none">
                                {language === "ar" && edition.displayNameAr
                                  ? edition.displayNameAr
                                  : edition.displayNameEn}
                              </span>
                              {edition.isFeatured && (
                                <Badge variant="warning" className="h-4 gap-0.5 px-1.5 text-[9px]">
                                  <Star className="h-2 w-2 fill-warning" aria-hidden="true" />
                                  {t("leads.convertWizard.featuredBadge")}
                                </Badge>
                              )}
                              {edition.isContactSalesOnly && (
                                <Badge
                                  variant="outline"
                                  className="h-4 px-1.5 text-[9px] font-semibold text-warning"
                                >
                                  {t("leads.convertWizard.contactSalesBadge")}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-nx-ink-3">
                              <span>
                                {t("leads.convertWizard.featureCount", {
                                  count: edition.featureCount,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-end">
                            {edition.isContactSalesOnly ? (
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-semibold text-warning">
                                  {t("leads.convertWizard.customDeal")}
                                </span>
                                <span className="text-[10px] text-nx-ink-3">
                                  {t("leads.convertWizard.negotiationRequired")}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                {edition.monthlyPrice != null ? (
                                  <span className="text-sm font-semibold text-nx-ink">
                                    ${edition.monthlyPrice.toLocaleString()}
                                    <span className="text-xs font-normal text-nx-ink-3">/mo</span>
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-success">
                                    {t("leads.convertWizard.editionFree", { defaultValue: "Free" })}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
