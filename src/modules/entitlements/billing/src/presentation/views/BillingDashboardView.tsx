"use client";

import { useMemo, useCallback } from "react";
import { useBillingDashboardViewModel } from "../viewmodels/useBillingDashboardViewModel";
import { StripeTestModeBanner } from "../components/StripeTestModeBanner";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Button } from "@core/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@core/ui/tooltip";
import { Separator } from "@core/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@core/ui/chart";
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

/** KPI stat card using Card from @core/ui */
interface StatCardProps {
  title: string;
  tooltip?: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  suffix?: string;
}

const VARIANT_CARD_STYLES: Record<string, string> = {
  default: "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
  success: "from-emerald-500/10 to-green-500/10 border-emerald-500/20",
  warning: "from-amber-500/10 to-yellow-500/10 border-amber-500/20",
  danger: "from-red-500/10 to-rose-500/10 border-red-500/20",
};

const VARIANT_ICON_STYLES: Record<string, string> = {
  default: "text-blue-600 dark:text-blue-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
};

function StatCard({
  title,
  tooltip,
  value,
  icon,
  variant = "default",
  suffix,
}: StatCardProps) {
  const card = (
    <Card
      className={`bg-gradient-to-br ${VARIANT_CARD_STYLES[variant]} border transition-all hover:shadow-md`}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`rounded-xl bg-background/80 p-3 shadow-sm ${VARIANT_ICON_STYLES[variant]}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            {title}
          </CardDescription>
          <CardTitle className="text-2xl font-bold tracking-tight mt-1">
            {value}
            {suffix && (
              <span className="text-sm font-normal text-muted-foreground ms-1">
                {suffix}
              </span>
            )}
          </CardTitle>
        </div>
      </CardContent>
    </Card>
  );

  if (!tooltip) return card;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Loading skeleton uses Skeleton from @core/ui */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl" />
        ))}
      </div>
      <Separator />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <TrendingUp className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCurrency(v)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.05}
                  />
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
          <BarChart3 className="h-5 w-5 text-purple-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="editionName"
                className="text-xs"
                tickLine={false}
                axisLine={false}
              />
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
                <TableCell className="font-medium">
                  {edition.editionName}
                </TableCell>
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

export function BillingDashboardView() {
  useModuleLocales(() => import("../../../../locales"), "billing");
  const { t } = useI18n();
  const { dashboard, isLoading, isError, refetch } =
    useBillingDashboardViewModel();

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
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="text-lg text-muted-foreground">
            {t("billing.dashboard.noData")}
          </CardTitle>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 me-2" />
            {t("common.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const churnVariant =
    dashboard.churnRate > 5
      ? "danger"
      : dashboard.churnRate > 2
        ? "warning"
        : "success";

  return (
    <div className="space-y-6">
      {/* ── Stripe Test Mode Indicator ── */}
      <StripeTestModeBanner />

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("billing.dashboard.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("billing.dashboard.description")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 me-2" />
          {t("common.refresh")}
        </Button>
      </div>

      {/* ── Financial KPIs ── */}
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

      {/* ── Operational KPIs ── */}
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
          value={
            dashboard.churnRate <= 2
              ? t("billing.dashboard.healthy")
              : t("billing.dashboard.atRisk")
          }
          icon={<BarChart3 className="h-5 w-5" />}
          variant={churnVariant}
        />
      </div>

      <Separator />

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
