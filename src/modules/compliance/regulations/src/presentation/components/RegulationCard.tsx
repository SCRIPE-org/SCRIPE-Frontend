"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import {
  Shield,
  ExternalLink,
  Scale,
  Pencil
} from "lucide-react";

import type { Regulation } from "../../domain/entities/Regulation";

export interface RegulationCardProps {
  regulation: Regulation;
  onEdit?: (regulation: Regulation) => void;
}

export function RegulationCard({ regulation, onEdit }: RegulationCardProps) {
  const { t } = useI18n();

  return (
    <Card className={`flex flex-col overflow-hidden transition-all hover:shadow-md ${!regulation.isActive ? "opacity-60" : ""}`}>
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{regulation.name}</CardTitle>
              <CardDescription className="font-mono text-xs font-semibold">{regulation.code}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={regulation.isActive ? "default" : "secondary"}>
              {regulation.isActive ? t("compliance.regulations.active") : t("compliance.regulations.inactive")}
            </Badge>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(regulation)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-3">
          <div>
            <p className="text-xs text-muted-foreground">{t("compliance.regulations.jurisdiction")}</p>
            <p className="text-sm font-medium">{regulation.jurisdiction || t("compliance.regulations.globalJurisdiction")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("compliance.regulations.dsrDeadlineDays")}</p>
            <p className="text-sm font-medium">{regulation.dsrDeadlineDays} {t("compliance.regulations.days")}</p>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">{t("compliance.regulations.purposes")}</h4>
          <div className="space-y-2">
            {regulation.purposes.map((p: any) => (
              <div key={p.id} className="flex items-start gap-2 text-sm">
                <Shield className={`mt-0.5 h-4 w-4 shrink-0 ${p.isRequired ? "text-red-500" : "text-emerald-500"}`} />
                <div>
                  <p className="font-medium">
                    {p.name}
                    {p.isRequired && <span className="ms-2 text-[10px] uppercase text-red-500 tracking-wider">{t("compliance.regulations.required")}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      {regulation.referenceUrl && (
        <div className="border-t bg-muted/10 px-6 py-3 text-right">
          <a href={regulation.referenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-medium text-blue-600 hover:underline">
            {t("compliance.regulations.viewOfficialDocs")}
            <ExternalLink className="ms-1 h-3 w-3" />
          </a>
        </div>
      )}
    </Card>
  );
}
