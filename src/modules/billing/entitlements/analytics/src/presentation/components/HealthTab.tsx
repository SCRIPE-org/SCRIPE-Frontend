"use client";
/**
 * HealthTab — Premium tenant health scores table with risk indicators and summary.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@core/ui/table";
import { ChevronLeft, ChevronRight, Heart, AlertTriangle, ShieldCheck } from "lucide-react";
import type {
  TenantHealthScoresResponse,
  TenantHealthScore,
} from "../../domain/entities/AnalyticsEntities";

interface HealthTabProps {
  healthData: TenantHealthScoresResponse;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function getRiskBadge(score: TenantHealthScore, t: (key: string) => string) {
  if (score.riskLevel === "Healthy") {
    return (
      <Badge className="gap-1 border-success/20 bg-success/10 text-[10px] font-semibold text-success">
        <ShieldCheck className="h-3 w-3" /> {t("entitlements.analytics.health.riskHealthy")}
      </Badge>
    );
  }
  if (score.riskLevel === "Moderate") {
    return (
      <Badge className="gap-1 border-warning/20 bg-warning/10 text-[10px] font-semibold text-warning">
        <AlertTriangle className="h-3 w-3" /> {t("entitlements.analytics.health.riskModerate")}
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 border-destructive/20 bg-destructive/10 text-[10px] font-semibold text-destructive">
      <Heart className="h-3 w-3" /> {t("entitlements.analytics.health.riskAtRisk")}
    </Badge>
  );
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return "bg-gradient-to-r from-success to-success/70";
  if (score >= 40) return "bg-gradient-to-r from-warning to-warning/70";
  return "bg-gradient-to-r from-destructive to-destructive/70";
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

/**
 * Presentation UI component rendering the health tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function HealthTab({ healthData, page, pageSize, onPageChange }: HealthTabProps) {
  const { t } = useI18n();
  const totalPages = Math.ceil(healthData.totalCount / pageSize);

  // Count by risk level
  const healthyCount = healthData.items.filter((i) => i.riskLevel === "Healthy").length;
  const moderateCount = healthData.items.filter((i) => i.riskLevel === "Moderate").length;
  const atRiskCount = healthData.items.filter((i) => i.riskLevel === "AtRisk").length;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t("entitlements.analytics.health.title")}</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-success/20 bg-success/[0.04] p-3 text-center">
          <ShieldCheck className="mx-auto mb-1 h-5 w-5 text-success" />
          <p className="text-xl font-bold text-success">{healthyCount}</p>
          <p className="text-[10px] font-semibold uppercase text-success/70">
            {t("entitlements.analytics.health.riskHealthy")}
          </p>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/[0.04] p-3 text-center">
          <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-warning" />
          <p className="text-xl font-bold text-warning">{moderateCount}</p>
          <p className="text-[10px] font-semibold uppercase text-warning/70">
            {t("entitlements.analytics.health.riskModerate")}
          </p>
        </div>
        <div className="rounded-xl border border-destructive/20 bg-destructive/[0.04] p-3 text-center">
          <Heart className="mx-auto mb-1 h-5 w-5 text-destructive" />
          <p className="text-xl font-bold text-destructive">{atRiskCount}</p>
          <p className="text-[10px] font-semibold uppercase text-destructive/70">
            {t("entitlements.analytics.health.riskAtRisk")}
          </p>
        </div>
      </div>

      {/* Health Table */}
      <Card className="overflow-hidden border border-border/30 shadow-sm">
        <CardHeader className="bg-muted/20 pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>{t("entitlements.analytics.health.tenantHealth")}</span>
            <span className="text-xs font-normal">
              {t("entitlements.analytics.periods.tenantCount", {
                count: String(healthData.totalCount),
              })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/30">
                <TableHead className="px-4 py-3 text-start text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("entitlements.analytics.health.tenant")}
                </TableHead>
                <TableHead className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("entitlements.analytics.health.score")}
                </TableHead>
                <TableHead className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("entitlements.analytics.health.change")}
                </TableHead>
                <TableHead className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("entitlements.analytics.health.risk")}
                </TableHead>
                <TableHead
                  variant="numeric"
                  className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {t("entitlements.analytics.health.mrr")}
                </TableHead>
                <TableHead className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("entitlements.analytics.health.engagement")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthData.items.map((tenant) => (
                <TableRow
                  key={tenant.tenantId}
                  className="border-b transition-colors last:border-0 hover:bg-muted/5"
                >
                  <TableCell className="px-4 py-3 text-sm font-semibold">
                    {tenant.tenantName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2.5 w-16 overflow-hidden rounded-full bg-muted/30">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(tenant.healthScore)}`}
                          style={{ width: `${tenant.healthScore}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${getScoreColor(tenant.healthScore)}`}>
                        {tenant.healthScore}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-semibold ${
                        tenant.scoreChange > 0
                          ? "bg-success/10 text-success"
                          : tenant.scoreChange < 0
                            ? "bg-destructive/10 text-destructive"
                            : "text-muted-foreground"
                      }`}
                    >
                      {tenant.scoreChange > 0 ? "+" : ""}
                      {tenant.scoreChange.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">{getRiskBadge(tenant, t)}</TableCell>
                  <TableCell
                    variant="numeric"
                    className="px-4 py-3 font-mono text-xs font-semibold"
                  >
                    {formatCurrency(tenant.mrrEnd)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <span className="text-xs">
                      {tenant.activeUserCount}/{tenant.totalUserCount}
                      <span className="ms-1 text-muted-foreground">({tenant.engagementRate}%)</span>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {healthData.items.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {t("entitlements.analytics.health.noData")}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t bg-muted/10 px-4 py-3">
              <span className="text-xs text-muted-foreground">
                {t("entitlements.analytics.periods.pageOf", {
                  page: String(page),
                  total: String(totalPages),
                })}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
