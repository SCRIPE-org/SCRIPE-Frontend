"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@core/ui/toggle-group";
import { SectionState } from "@core/ui/section-state";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
  chartColor,
  type ChartConfig,
} from "@core/ui/chart";
import type { ApiKeyChartDataPoint } from "../../domain/entities/ApiKeyChartData";
import { useI18n } from "@core/providers/i18n-provider";
import { formatTimeUtc, formatDateUtc } from "@core/common/utils";

type ChartView = "volume" | "errors" | "response";
type RangePreset = "24h" | "7d" | "30d";

interface ApiKeyChartSectionProps {
  data: ApiKeyChartDataPoint[];
  isLoading: boolean;
  onRangeChange: (preset: RangePreset) => void;
}

const VIEWS: ChartView[] = ["volume", "errors", "response"];
const RANGES: RangePreset[] = ["24h", "7d", "30d"];
const CHART_HEIGHT = 200;

export function ApiKeyChartSection({ data, isLoading, onRangeChange }: ApiKeyChartSectionProps) {
  const { t } = useI18n();
  const [view, setView] = useState<ChartView>("volume");
  const [range, setRange] = useState<RangePreset>("24h");

  const handleRangeChange = (r: string) => {
    if (!r) return;
    const preset = r as RangePreset;
    setRange(preset);
    onRangeChange(preset);
  };

  const formatted = data.map((d) => ({
    ...d,
    label: d.period ? (range === "24h" ? formatTimeUtc(d.period) : formatDateUtc(d.period)) : "",
    errorRate: d.totalHits > 0 ? Math.round((d.failureHits / d.totalHits) * 100) : 0,
  }));

  // Colour follows the ENTITY, never the view — success/failure keep the same
  // slots every time this app pairs them (LoginActivityChart uses the same
  // chart-2/chart-5 pairing for the same reason).
  const volumeConfig: ChartConfig = {
    successHits: { label: t("apikeys.chart.series.success"), color: chartColor(2) },
    failureHits: { label: t("apikeys.chart.series.failures"), color: chartColor(5) },
  };
  const errorsConfig: ChartConfig = {
    errorRate: { label: t("apikeys.chart.series.errorRate"), color: chartColor(3) },
  };
  const responseConfig: ChartConfig = {
    avgResponseTimeMs: { label: t("apikeys.chart.series.avgResponse"), color: chartColor(1) },
  };

  const activeConfig =
    view === "volume" ? volumeConfig : view === "errors" ? errorsConfig : responseConfig;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold">{t("apikeys.chart.title")}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              preset="segmented"
              size="sm"
              value={view}
              onValueChange={(v) => v && setView(v as ChartView)}
              aria-label={t("apikeys.chart.viewGroup")}
            >
              {VIEWS.map((v) => (
                <ToggleGroupItem key={v} value={v} className="text-xs">
                  {t(`apikeys.chart.view.${v}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              type="single"
              preset="segmented"
              size="sm"
              value={range}
              onValueChange={handleRangeChange}
              aria-label={t("apikeys.chart.rangeGroup")}
            >
              {RANGES.map((r) => (
                <ToggleGroupItem key={r} value={r} className="text-xs">
                  {t(`apikeys.chart.range.${r}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SectionState
          isLoading={isLoading}
          isEmpty={formatted.length === 0}
          emptyMessage={t("apikeys.chart.noData")}
          height={CHART_HEIGHT}
          skeletonType="chart"
        >
          <ChartContainer config={activeConfig} className="h-[200px] w-full">
            {view === "volume" ? (
              <AreaChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="apikeys-volume-success" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-successHits)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-successHits)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="apikeys-volume-failure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-failureHits)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-failureHits)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="successHits"
                  stroke="var(--color-successHits)"
                  fill="url(#apikeys-volume-success)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="failureHits"
                  stroke="var(--color-failureHits)"
                  fill="url(#apikeys-volume-failure)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : view === "errors" ? (
              <BarChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="errorRate" fill="var(--color-errorRate)" radius={[3, 3, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={formatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="apikeys-response" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-avgResponseTimeMs)"
                      stopOpacity={0.2}
                    />
                    <stop offset="95%" stopColor="var(--color-avgResponseTimeMs)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="avgResponseTimeMs"
                  stroke="var(--color-avgResponseTimeMs)"
                  fill="url(#apikeys-response)"
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ChartContainer>
        </SectionState>
      </CardContent>
    </Card>
  );
}
