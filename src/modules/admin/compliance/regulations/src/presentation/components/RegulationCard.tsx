"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { DetailRow } from "@core/ui/detail-row";
import { EmptyState } from "@core/ui/empty-state";
import { Shield, ExternalLink, Scale, Pencil } from "lucide-react";

import type { ConsentPurposeData, Regulation } from "../../domain/entities/Regulation";

/**
 * Interface defining property specifications, keys types, and structural contract rules for regulation card props.
 */
export interface RegulationCardProps {
  regulation: Regulation;
  onEdit?: (regulation: Regulation) => void;
}

/**
 * Presentation UI component rendering the regulation card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function RegulationCard({ regulation, onEdit }: RegulationCardProps) {
  const { t } = useI18n();
  const purposes = regulation.purposes;

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-nx-md border border-info/30 bg-info/10 text-info"
              aria-hidden="true"
            >
              <Scale className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate">{regulation.name}</CardTitle>
              <CardDescription className="font-mono text-xs font-semibold">
                {regulation.code}
              </CardDescription>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {/* Status is the only thing that says "inactive" — the card used to
                also drop to opacity-60, which takes its ink off the measured
                contrast ladder. */}
            <Badge variant={regulation.isActive ? "active" : "inactive"}>
              {regulation.isActive
                ? t("compliance.regulations.active")
                : t("compliance.regulations.inactive")}
            </Badge>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t("compliance.regulations.editRegulationFor", {
                  code: regulation.code,
                })}
                onClick={() => onEdit(regulation)}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-4 rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <DetailRow
            layout="stacked"
            label={t("compliance.regulations.jurisdiction")}
            value={regulation.jurisdiction || t("compliance.regulations.globalJurisdiction")}
          />
          <DetailRow
            layout="stacked"
            label={t("compliance.regulations.dsrDeadlineDays")}
            value={`${regulation.dsrDeadlineDays} ${t("compliance.regulations.days")}`}
          />
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-nx-ink">
            {t("compliance.regulations.purposes")}
          </h4>
          {purposes.length === 0 ? (
            <EmptyState bare size="sm" title={t("compliance.regulations.noPurposes")} />
          ) : (
            <ul className="space-y-2">
              {purposes.map((purpose: ConsentPurposeData) => (
                <li key={purpose.id} className="flex items-start gap-2 text-sm">
                  <Shield
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      purpose.isRequired ? "text-destructive" : "text-success"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-nx-ink">{purpose.name}</p>
                      {purpose.isRequired && (
                        <Badge variant="destructive">{t("compliance.regulations.required")}</Badge>
                      )}
                    </div>
                    {purpose.description && (
                      <p className="text-xs leading-relaxed text-nx-ink-2">{purpose.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      {regulation.referenceUrl && (
        <div className="border-t border-nx-line px-6 py-3 text-end">
          <a
            href={regulation.referenceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-nx-sm text-xs font-medium text-nx-accent transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            {t("compliance.regulations.viewOfficialDocs")}
            <ExternalLink className="ms-1 h-3 w-3 shrink-0" aria-hidden="true" />
          </a>
        </div>
      )}
    </Card>
  );
}
