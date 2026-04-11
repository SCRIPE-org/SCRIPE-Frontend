"use client";

import { useMemo } from "react";
import { useBillingDashboardViewModel } from "../viewmodels/useBillingDashboardViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@core/ui/chart";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";

// ── Stat Card (KPI) ──

interface StatCardProps {
  title: string;
  tooltip?: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  suffix?: string;
}

function StatCard({ title, tooltip, value, icon, variant = "default", suffix }: StatCardProps) {
  const variantStyles = {
    default: "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
    success: "from-emerald-500/10 to-green-500/10 border-emerald-500/20",
    warning: "from-amber-500/10 to-yellow-500/10 border-amber-500/20",
    danger: "from-red-500/10 to-rose-500/10 border-red-500/20",
  };

  const iconStyles = {
    default: "text-blue-600 dark:text-blue-400",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
  };

  const card = (
    <Card className={`bg-gradient-to-br ${variantStyles[variant]} border transition-all hover:shadow-md`}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-xl bg-background/80 p-3 shadow-sm ${iconStyles[variant]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold tracking-tight mt-1">
            {value}
            {suffix && <span className="text-sm font-normal text-muted-foreground ms-1">{suffix}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{card}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return card;
}

// ── Loading Skeleton ──

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[350px] rounded-xl" />
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
    </div>
  );
}

// ── Main View ──

export function BillingDashboardView() {
  useModuleLocales(() => import("../../../../locales"), "billing");
  const { t } = useI18n();
  const { dashboard, isLoading, isError, refetch } = useBillingDashboardViewModel();

  const chartConfig = useMemo(() => ({
    revenue: { label: t("billing.dashboard.revenue"), color: "hsl(var(--chart-1))" },
    newSubscriptions: { label: t("billing.dashboard.newSubs"), color: "hsl(var(--chart-2))" },
  }), [t]);

  const formatCurrency = (val: number) => {
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
  };

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !dashboard) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">{t("billing.dashboard.noData")}</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 me-2" />
            {t("common.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const churnVariant = dashboard.churnRate > 5 ? "danger" : dashboard.churnRate > 2 ? "warning" : "success";

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("billing.dashboard.title")}</h2>
          <p className="text-muted-foreground">{t("billing.dashboard.description")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 me-2" />
          {t("common.refresh")}
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("billing.dashboard.mrr")}
          tooltip={t("billing.dashboard.mrrFull")}
          value={formatCurrency(dashboard.mrr)}
          icon={<DollarSign className="h-5 w-5" />}
          variant="success"
          suffix={t("billing.dashboard.perMonth")}
        />
        <StatCard
          title={t("billing.dashboard.arr")}
          tooltip={t("billing.dashboard.arrFull")}
          value={formatCurrency(dashboard.arr)}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="default"
        />
        <StatCard
          title={t("billing.dashboard.totalRevenue")}
          value={formatCurrency(dashboard.totalRevenue)}
          icon={<Layers className="h-5 w-5" />}
          variant="default"
        />
        <StatCard
          title={t("billing.dashboard.churnRate")}
          value={`${dashboard.churnRate.toFixed(1)}%`}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant={churnVariant}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("billing.dashboard.activeSubscriptions")}
          value={dashboard.activeSubscriptions}
          icon={<Users className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title={t("billing.dashboard.trialSubscriptions")}
          value={dashboard.trialSubscriptions}
          icon={<Activity className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title={t("billing.dashboard.cancelledLast30Days")}
          value={dashboard.cancelledLast30Days}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant={dashboard.cancelledLast30Days > 0 ? "danger" : "success"}
        />
        <StatCard
          title={t("billing.dashboard.churnRate")}
          value={dashboard.churnRate <= 2 ? t("billing.dashboard.healthy") : t("billing.dashboard.atRisk")}
          icon={<BarChart3 className="h-5 w-5" />}
          variant={churnVariant}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              {t("billing.dashboard.revenueTrend")}
            </CardTitle>
            <CardDescription>
              {t("billing.dashboard.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard.revenueTrend.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <AreaChart data={dashboard.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                {t("billing.dashboard.noData")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edition Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              {t("billing.dashboard.editionBreakdown")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.editionBreakdown.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart data={dashboard.editionBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="editionName" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis
                    className="text-xs"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => formatCurrency(v)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--chart-2))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                {t("billing.dashboard.noData")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Edition Table Breakdown ── */}
      {dashboard.editionBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("billing.dashboard.editionBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("billing.dashboard.editionName")}</TableHead>
                  <TableHead>{t("billing.dashboard.activeCount")}</TableHead>
                  <TableHead>{t("billing.dashboard.revenue")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.editionBreakdown.map((edition) => (
                  <TableRow key={edition.editionId}>
                    <TableCell className="font-medium">{edition.editionName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{edition.activeCount}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{formatCurrency(edition.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
