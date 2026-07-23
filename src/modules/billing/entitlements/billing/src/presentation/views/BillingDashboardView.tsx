// FILE-EXCEPTION: file length
/**
 * @file BillingDashboardView.tsx
 * @description View component for the billing dashboard. Displays key financial KPIs,
 * operational statistics, MRR trends, and subscription status. Uses recharts and the core
 * ui chart wrappers.
 */

"use client";

import { useMemo, useCallback } from "react";
import { useBillingDashboardViewModel } from "../viewmodels/useBillingDashboardViewModel";
import { StripeTestModeBanner } from "../components/StripeTestModeBanner";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Button } from "@core/ui/button";
import { Separator } from "@core/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { StatCard } from "@core/ui/stat-card";
import { EmptyState } from "@core/ui/empty-state";
import * as ChartPrimitives from "@core/ui/chart";

const { ChartContainer, ChartTooltip, ChartTooltipContent } = ChartPrimitives;

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  RefreshCw,
  Layers,
  Activity,
  BarChart3,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Sub-Components (all use @core/ui/* exclusively)
// ─────────────────────────────────────────────────────────────

/** Loading skeleton uses Skeleton from @core/ui */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl" />
        ))}
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[350px] rounded-xl" />
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
    </div>
  );
}

/** Revenue Trend area chart card */
interface RevenueTrendCardProps {
  data: { month: string; revenue: number }[];
  chartConfig: Record<string, { label: string; color: string }>;
  formatCurrency: (val: number) => string;
  noDataLabel: string;
  title: string;
  description: string;
}

function RevenueTrendCard({
  data,
  chartConfig,
  formatCurrency,
  noDataLabel,
  title,
  description,
}: RevenueTrendCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-info" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" tickLine={false} axisLine={false} />
              <YAxis
                className="text-xs"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCurrency(v)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-muted-foreground">
            {noDataLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Edition breakdown bar chart card */
interface EditionBreakdownChartProps {
  data: { editionId: string; editionName: string; activeCount: number; revenue: number }[];
  chartConfig: Record<string, { label: string; color: string }>;
  formatCurrency: (val: number) => string;
  noDataLabel: string;
  title: string;
}

function EditionBreakdownChart({
  data,
  chartConfig,
  formatCurrency,
  noDataLabel,
  title,
}: EditionBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="editionName" className="text-xs" tickLine={false} axisLine={false} />
              <YAxis
                className="text-xs"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCurrency(v)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[280px] items-center justify-center text-muted-foreground">
            {noDataLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Edition breakdown table */
interface EditionBreakdownTableProps {
  data: { editionId: string; editionName: string; activeCount: number; revenue: number }[];
  formatCurrency: (val: number) => string;
  labels: { title: string; editionName: string; activeCount: string; revenue: string };
}

function EditionBreakdownTable({ data, formatCurrency, labels }: EditionBreakdownTableProps) {
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{labels.editionName}</TableHead>
              <TableHead>{labels.activeCount}</TableHead>
              <TableHead>{labels.revenue}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((edition) => (
              <TableRow key={edition.editionId}>
                <TableCell className="font-medium">{edition.editionName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{edition.activeCount}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatCurrency(edition.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Main View
// ─────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the billing dashboard view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BillingDashboardView() {
  useModuleLocales(() => import("../../../../core/locales"), "billing");
  const { t } = useI18n();
  const { dashboard, isLoading, isError, refetch } = useBillingDashboardViewModel();

  const chartConfig = useMemo(
    () => ({
      revenue: {
        label: t("billing.dashboard.revenue"),
        color: "hsl(var(--chart-1))",
      },
      newSubscriptions: {
        label: t("billing.dashboard.newSubs"),
        color: "hsl(var(--chart-2))",
      },
    }),
    [t]
  );

  const formatCurrency = useCallback(
    (val: number) => {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: dashboard?.currency?.toUpperCase() ?? "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      } catch {
        return `$${val.toLocaleString()}`;
      }
    },
    [dashboard?.currency]
  );

  // ── Loading state ──
  if (isLoading) return <DashboardSkeleton />;

  // ── Error / empty state ──
  if (isError || !dashboard) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title={t("billing.dashboard.noData")}
        action={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="me-2 h-4 w-4" />
            {t("common.retry")}
          </Button>
        }
      />
    );
  }

  const churnVariant =
    dashboard.churnRate > 5 ? "danger" : dashboard.churnRate > 2 ? "warning" : "success";

  return (
    <div className="space-y-6">
      {/* ── Stripe Test Mode Indicator ── */}
      <StripeTestModeBanner />

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("billing.dashboard.title")}</h2>
          <p className="text-muted-foreground">{t("billing.dashboard.description")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="me-2 h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </div>

      {/* ── Financial KPIs ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("billing.dashboard.mrr")}
          tooltip={t("billing.dashboard.mrrFull")}
          value={formatCurrency(dashboard.mrr)}
          icon={DollarSign}
          tone="success"
          suffix={t("billing.dashboard.perMonth")}
        />
        <StatCard
          label={t("billing.dashboard.arr")}
          tooltip={t("billing.dashboard.arrFull")}
          value={formatCurrency(dashboard.arr)}
          icon={TrendingUp}
          tone="info"
        />
        <StatCard
          label={t("billing.dashboard.totalRevenue")}
          value={formatCurrency(dashboard.totalRevenue)}
          icon={Layers}
          tone="info"
        />
        <StatCard
          label={t("billing.dashboard.churnRate")}
          value={`${dashboard.churnRate.toFixed(1)}%`}
          icon={AlertTriangle}
          tone={churnVariant}
        />
      </div>

      {/* ── Operational KPIs ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("billing.dashboard.activeSubscriptions")}
          value={dashboard.activeSubscriptions}
          icon={Users}
          tone="success"
        />
        <StatCard
          label={t("billing.dashboard.trialSubscriptions")}
          value={dashboard.trialSubscriptions}
          icon={Activity}
          tone="warning"
        />
        <StatCard
          label={t("billing.dashboard.cancelledLast30Days")}
          value={dashboard.cancelledLast30Days}
          icon={AlertTriangle}
          tone={dashboard.cancelledLast30Days > 0 ? "danger" : "success"}
        />
        <StatCard
          label={t("billing.dashboard.churnRate")}
          value={
            dashboard.churnRate <= 2
              ? t("billing.dashboard.healthy")
              : t("billing.dashboard.atRisk")
          }
          icon={BarChart3}
          tone={churnVariant}
        />
      </div>

      <Separator />

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueTrendCard
          data={dashboard.revenueTrend}
          chartConfig={chartConfig}
          formatCurrency={formatCurrency}
          noDataLabel={t("billing.dashboard.noData")}
          title={t("billing.dashboard.revenueTrend")}
          description={t("billing.dashboard.description")}
        />
        <EditionBreakdownChart
          data={dashboard.editionBreakdown}
          chartConfig={chartConfig}
          formatCurrency={formatCurrency}
          noDataLabel={t("billing.dashboard.noData")}
          title={t("billing.dashboard.editionBreakdown")}
        />
      </div>

      {/* ── Edition Table ── */}
      <EditionBreakdownTable
        data={dashboard.editionBreakdown}
        formatCurrency={formatCurrency}
        labels={{
          title: t("billing.dashboard.editionBreakdown"),
          editionName: t("billing.dashboard.editionName"),
          activeCount: t("billing.dashboard.activeCount"),
          revenue: t("billing.dashboard.revenue"),
        }}
      />
    </div>
  );
}
