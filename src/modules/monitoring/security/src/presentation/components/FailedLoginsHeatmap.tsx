"use client";

/**
 * Failed Logins Heatmap
 *
 * Bar chart showing daily failed login attempts.
 * Uses core ChartContainer for theme-aware dark/light mode rendering.
 * Uses SectionState for consistent loading/error/empty UX.
 */
import { useMemo, memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { SectionState } from "@core/ui/section-state";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@core/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ShieldAlert } from "lucide-react";

interface HeatmapPoint {
  date: string;
  failed: number;
  total: number;
}

interface Props {
  data: HeatmapPoint[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  cardClasses?: string;
}

const chartConfig: ChartConfig = {
  failed: {
    label: "Failed Logins",
    color: "hsl(var(--destructive))",
  },
};

export const FailedLoginsHeatmap = memo(function FailedLoginsHeatmap({
  data,
  isLoading,
  error,
  onRetry,
  cardClasses,
}: Props) {
  const { t } = useI18n();

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        failed: d.failed,
      })),
    [data]
  );

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" aria-hidden="true" />
          <CardTitle className="text-base">{t("security.failedLogins.title")}</CardTitle>
        </div>
        <CardDescription>{t("security.failedLogins.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          isEmpty={chartData.length === 0}
          emptyMessage={t("security.noEvents")}
          height={250}
        >
          <ChartContainer config={chartConfig} className="h-[250px]">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="failed" fill="var(--color-failed)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </SectionState>
      </CardContent>
    </Card>
  );
});
