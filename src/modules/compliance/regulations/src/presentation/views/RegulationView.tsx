"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useRegulationViewModel } from "../viewmodels/useRegulationViewModel";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  BookOpen,
  Scale
} from "lucide-react";

export function RegulationView() {
  useModuleLocales(() => import("../../../locales"), "compliance-regulations");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  const { regulations, isLoading, isError, refetch } = useRegulationViewModel();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push("/compliance")}>
            <BackIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-blue-500/10 p-2.5 shadow-sm">
              <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("regulations.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("regulations.description")}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[250px] rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
            <p className="font-semibold">{t("common.error")}</p>
          </CardContent>
        </Card>
      ) : regulations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-muted-foreground opacity-50" />
            <p className="font-semibold">{t("regulations.noRegulations")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {regulations.map((reg) => (
            <Card key={reg.id} className={`flex flex-col overflow-hidden transition-all hover:shadow-md ${!reg.isActive ? "opacity-60" : ""}`}>
              <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600">
                      <Scale className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{reg.name}</CardTitle>
                      <CardDescription className="font-mono text-xs font-semibold">{reg.code}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={reg.isActive ? "default" : "secondary"}>
                      {reg.isActive ? t("regulations.active") : t("regulations.inactive")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("regulations.jurisdiction")}</p>
                    <p className="text-sm font-medium">{reg.jurisdiction || "Global"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("regulations.dsrDeadlineDays")}</p>
                    <p className="text-sm font-medium">{reg.dsrDeadlineDays} {t("regulations.days")}</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold">{t("regulations.purposes")}</h4>
                  <div className="space-y-2">
                    {reg.purposes.map((p) => (
                      <div key={p.id} className="flex items-start gap-2 text-sm">
                        <Shield className={`mt-0.5 h-4 w-4 shrink-0 ${p.isRequired ? "text-red-500" : "text-emerald-500"}`} />
                        <div>
                          <p className="font-medium">
                            {p.name}
                            {p.isRequired && <span className="ms-2 text-[10px] uppercase text-red-500 tracking-wider">{t("regulations.required")}</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              {reg.referenceUrl && (
                <div className="border-t bg-muted/10 px-6 py-3 text-right">
                  <a href={reg.referenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-medium text-blue-600 hover:underline">
                    {t("regulations.viewOfficialDocs")}
                    <ExternalLink className="ms-1 h-3 w-3" />
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
