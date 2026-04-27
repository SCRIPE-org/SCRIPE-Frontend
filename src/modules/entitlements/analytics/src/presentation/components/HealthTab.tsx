"use client";
/**
 * HealthTab — Tenant health scores table with risk indicators.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { ChevronLeft, ChevronRight, Heart, AlertTriangle, ShieldCheck } from "lucide-react";
import type { TenantHealthScoresResponse, TenantHealthScore } from "../../domain/entities/AnalyticsEntities";

interface HealthTabProps {
  healthData: TenantHealthScoresResponse;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function getRiskBadge(score: TenantHealthScore, t: (key: string) => string) {
  if (score.riskLevel === "Healthy") {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
        <ShieldCheck className="h-3 w-3" /> {t("entitlements.analytics.health.riskHealthy")}
      </Badge>
    );
  }
  if (score.riskLevel === "Moderate") {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
        <AlertTriangle className="h-3 w-3" /> {t("entitlements.analytics.health.riskModerate")}
      </Badge>
    );
  }
  return (
    <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 gap-1">
      <Heart className="h-3 w-3" /> {t("entitlements.analytics.health.riskAtRisk")}
    </Badge>
  );
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-rose-600";
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function HealthTab({ healthData, page, pageSize, onPageChange }: HealthTabProps) {
  const { t } = useI18n();
  const totalPages = Math.ceil(healthData.totalCount / pageSize);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t("entitlements.analytics.health.title")}</h2>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span>{t("entitlements.analytics.health.tenantHealth")}</span>
            <span className="text-xs">{t("entitlements.analytics.periods.tenantCount", { count: healthData.totalCount })}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {t("entitlements.analytics.health.tenant")}
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {t("entitlements.analytics.health.score")}
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {t("entitlements.analytics.health.change")}
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {t("entitlements.analytics.health.risk")}
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">MRR</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                    {t("entitlements.analytics.health.engagement")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {healthData.items.map((tenant) => (
                  <tr key={tenant.tenantId} className="border-b last:border-0 hover:bg-muted/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-sm">{tenant.tenantName}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getScoreBarColor(tenant.healthScore)}`}
                            style={{ width: `${tenant.healthScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${getScoreColor(tenant.healthScore)}`}>
                          {tenant.healthScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${
                        tenant.scoreChange > 0 ? "text-emerald-600" : tenant.scoreChange < 0 ? "text-rose-600" : "text-muted-foreground"
                      }`}>
                        {tenant.scoreChange > 0 ? "+" : ""}{tenant.scoreChange.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{getRiskBadge(tenant, t)}</td>
                    <td className="px-4 py-3 text-right text-xs font-mono">{formatCurrency(tenant.mrrEnd)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs">
                        {tenant.activeUserCount}/{tenant.totalUserCount}
                        <span className="text-muted-foreground ml-1">({tenant.engagementRate}%)</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {healthData.items.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              {t("entitlements.analytics.health.noData")}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-xs text-muted-foreground">
                {t("entitlements.analytics.periods.pageOf", { page, total: totalPages })}
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
