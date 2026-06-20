"use client";

import { Skeleton } from "@core/ui/skeleton";
import { Badge } from "@core/ui/badge";
import { AlertCircle, Star } from "lucide-react";
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

// ── Component ─────────────────────────────────────────────────────────────────

export function WizardStep1Edition({ lead, editions, isLoading, selected, onSelect }: WizardStep1Props) {
  return (
    <div className="space-y-4">
      {lead && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium text-foreground">{lead.companyName}</p>
          <p className="text-xs text-muted-foreground">{lead.contactName} · {lead.email}</p>
          {lead.editionKey && (
            <p className="mt-1 text-xs text-muted-foreground">
              Requested:{" "}
              <span className="font-medium text-foreground">{lead.editionKey}</span>
            </p>
          )}
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Select Edition</p>
        <p className="mb-4 text-xs text-muted-foreground">
          Choose the edition this customer will be onboarded on. You can customize feature quotas in the next step.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      )}

      {!isLoading && editions && editions.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No editions available.</p>
        </div>
      )}

      {!isLoading && editions && editions.length > 0 && (
        <div className="space-y-2.5">
          {editions.map((edition) => {
            const isSelected = selected?.id === edition.id;
            return (
              <button
                key={edition.id}
                type="button"
                onClick={() => onSelect(edition)}
                className={[
                  "group w-full rounded-xl border px-4 py-3.5 text-left transition-all duration-150",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{edition.displayNameEn}</span>
                      {edition.isFeatured && (
                        <Badge variant="secondary" className="h-4 gap-0.5 px-1.5 text-[10px]">
                          <Star className="h-2.5 w-2.5" />Featured
                        </Badge>
                      )}
                      {edition.isContactSalesOnly && (
                        <Badge variant="outline" className="h-4 px-1.5 text-[10px] text-amber-600">Contact Sales</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      {edition.featureCount > 0 && <span>{edition.featureCount} configurable features</span>}
                      {edition.categoryKey && <span className="rounded bg-muted px-1.5 py-0.5">{edition.categoryKey}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {edition.isContactSalesOnly ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs font-semibold text-amber-600">Custom Pricing</span>
                        <span className="text-[10px] text-muted-foreground">Negotiation required</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-0.5">
                        {edition.monthlyPrice != null ? (
                          <span className="text-sm font-semibold text-foreground">
                            ${edition.monthlyPrice.toLocaleString()}
                            <span className="text-xs font-normal text-muted-foreground">/mo</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Free</span>
                        )}
                        {edition.yearlyPrice != null && (
                          <span className="text-[10px] text-muted-foreground">
                            ${edition.yearlyPrice.toLocaleString()}/yr
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
      )}
    </div>
  );
}
