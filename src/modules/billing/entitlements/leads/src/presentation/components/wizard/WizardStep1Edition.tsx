// UI-EXCEPTION: compact studio layout
"use client";

import { useState, useMemo } from "react";
import { Skeleton } from "@core/ui/skeleton";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { AlertCircle, Star, Search, FolderOpen } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
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

const CATEGORY_LABELS: Record<string, string> = {
  general: "General Editions",
  erp: "ERP Suite Tiers",
  healthcare: "Healthcare Specialized Editions",
  compliance: "Compliance Tiers",
};

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
        <div className="rounded-xl border border-border/80 bg-card/20 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{lead.companyName}</p>
          <p className="text-xs text-muted-foreground">
            {lead.contactName} · {lead.email}
          </p>
          {lead.editionKey && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>
                {t("leads.convertWizard.requestedPlan", { defaultValue: "Requested plan:" })}
              </span>
              <Badge
                variant="secondary"
                className="border-info/20 bg-info/10 px-2 py-0.5 text-xs text-info"
              >
                {lead.editionKey}
              </Badge>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{t("leads.convertWizard.selectPlan")}</p>
        <p className="text-xs text-muted-foreground">{t("leads.convertWizard.selectPlanDesc")}</p>
      </div>

      {/* Search & Categories */}
      {!isLoading && editions.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("leads.convertWizard.searchEditionsPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-border bg-background pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-info"
            />
          </div>

          {/* Category Selector Tabs */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-b border-border/40 pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                  selectedCategory === "all"
                    ? "bg-info text-info-foreground shadow-sm shadow-info/20"
                    : "border border-border/80 bg-card/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                ].join(" ")}
              >
                {t("leads.convertWizard.allPlans")}
              </button>
              {categories.map((cat) => {
                const label = t(`leads.convertWizard.categories.${cat}`, {
                  defaultValue:
                    CATEGORY_LABELS[cat] ?? cat.replace(/\b\w/g, (c) => c.toUpperCase()),
                });
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={[
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                      isSelected
                        ? "bg-info text-info-foreground shadow-sm shadow-info/20"
                        : "border border-border/80 bg-card/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    ].join(" ")}
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
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && editions.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("leads.convertWizard.noEditions")}</p>
        </div>
      )}

      {!isLoading && editions.length > 0 && Object.keys(groupedEditions).length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {t("leads.convertWizard.noSearchMatches")}
          </p>
        </div>
      )}

      {!isLoading && editions.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedEditions).map(([catKey, items]) => {
            const groupTitle = t(`leads.convertWizard.categories.${catKey}`, {
              defaultValue:
                CATEGORY_LABELS[catKey] ?? catKey.replace(/\b\w/g, (c) => c.toUpperCase()),
            });
            return (
              <div key={catKey} className="space-y-2.5">
                <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                        className={[
                          "group w-full rounded-xl border px-4 py-3 text-left transition-all duration-150",
                          isSelected
                            ? "border-info bg-info/5 ring-1 ring-info"
                            : "border-border bg-background/40 hover:border-info/40 hover:bg-card/40",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-info">
                                {language === "ar" && edition.displayNameAr
                                  ? edition.displayNameAr
                                  : edition.displayNameEn}
                              </span>
                              {edition.isFeatured && (
                                <Badge
                                  variant="secondary"
                                  className="h-4 gap-0.5 border-warning/20 bg-warning/10 px-1.5 text-[9px] text-warning"
                                >
                                  <Star className="h-2 w-2 fill-warning text-warning" />
                                  {t("leads.convertWizard.featuredBadge")}
                                </Badge>
                              )}
                              {edition.isContactSalesOnly && (
                                <Badge
                                  variant="outline"
                                  className="h-4 border-warning/30 bg-warning/5 px-1.5 text-[9px] font-semibold text-warning"
                                >
                                  {t("leads.convertWizard.contactSalesBadge")}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span>
                                {t("leads.convertWizard.featureCount", {
                                  count: edition.featureCount,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            {edition.isContactSalesOnly ? (
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-semibold text-warning">
                                  {t("leads.convertWizard.customDeal")}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {t("leads.convertWizard.negotiationRequired")}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                {edition.monthlyPrice != null ? (
                                  <span className="text-sm font-semibold text-foreground">
                                    ${edition.monthlyPrice.toLocaleString()}
                                    <span className="text-xs font-normal text-muted-foreground">/mo</span>
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-success">
                                    Free
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
