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

export function WizardStep1Edition({ lead, editions = [], isLoading, selected, onSelect }: WizardStep1Props) {
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
      const matchesSearch = (
        e.displayNameEn.toLowerCase().includes(term) ||
        (e.displayNameAr && e.displayNameAr.toLowerCase().includes(term)) ||
        e.name.toLowerCase().includes(term)
      );

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
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 px-4 py-3">
          <p className="text-sm font-semibold text-white">{lead.companyName}</p>
          <p className="text-xs text-zinc-400">{lead.contactName} · {lead.email}</p>
          {lead.editionKey && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
              <span>{t("leads.convertWizard.requestedPlan", { defaultValue: "Requested plan:" })}</span>
              <Badge variant="secondary" className="px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                {lead.editionKey}
              </Badge>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{t("leads.convertWizard.selectPlan")}</p>
        <p className="text-xs text-muted-foreground">
          {t("leads.convertWizard.selectPlanDesc")}
        </p>
      </div>

      {/* Search & Categories */}
      {!isLoading && editions.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              type="text"
              placeholder={t("leads.convertWizard.searchEditionsPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-zinc-800 bg-zinc-950 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />
          </div>

          {/* Category Selector Tabs */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-b border-zinc-800/40 pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                  selectedCategory === "all"
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                    : "bg-zinc-900/40 text-zinc-400 border border-zinc-800/80 hover:bg-zinc-800/40 hover:text-zinc-200"
                ].join(" ")}
              >
                {t("leads.convertWizard.allPlans")}
              </button>
              {categories.map((cat) => {
                const label = t(`leads.convertWizard.categories.${cat}`, {
                  defaultValue: CATEGORY_LABELS[cat] ?? cat.replace(/\b\w/g, (c) => c.toUpperCase())
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
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                        : "bg-zinc-900/40 text-zinc-400 border border-zinc-800/80 hover:bg-zinc-800/40 hover:text-zinc-200"
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
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
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
          <p className="text-sm text-muted-foreground">{t("leads.convertWizard.noSearchMatches")}</p>
        </div>
      )}

      {!isLoading && editions.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedEditions).map(([catKey, items]) => {
            const groupTitle = t(`leads.convertWizard.categories.${catKey}`, {
              defaultValue: CATEGORY_LABELS[catKey] ?? catKey.replace(/\b\w/g, (c) => c.toUpperCase())
            });
            return (
              <div key={catKey} className="space-y-2.5">
                <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
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
                            ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500"
                            : "border-zinc-800 bg-zinc-950/40 hover:border-indigo-500/40 hover:bg-zinc-900/40",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                {language === "ar" && edition.displayNameAr ? edition.displayNameAr : edition.displayNameEn}
                              </span>
                              {edition.isFeatured && (
                                <Badge variant="secondary" className="h-4 gap-0.5 px-1.5 text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                                  <Star className="h-2 w-2 fill-amber-400 text-amber-400" />{t("leads.convertWizard.featuredBadge")}
                                </Badge>
                              )}
                              {edition.isContactSalesOnly && (
                                <Badge variant="outline" className="h-4 px-1.5 text-[9px] border-amber-500/30 text-amber-400 bg-amber-500/5 font-semibold">
                                  {t("leads.convertWizard.contactSalesBadge")}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-400">
                              <span>{t("leads.convertWizard.featureCount", { count: edition.featureCount })}</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            {edition.isContactSalesOnly ? (
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-semibold text-amber-400">{t("leads.convertWizard.customDeal")}</span>
                                <span className="text-[10px] text-zinc-500">{t("leads.convertWizard.negotiationRequired")}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                {edition.monthlyPrice != null ? (
                                  <span className="text-sm font-semibold text-white">
                                    ${edition.monthlyPrice.toLocaleString()}
                                    <span className="text-xs font-normal text-zinc-500">/mo</span>
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-emerald-400">Free</span>
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
