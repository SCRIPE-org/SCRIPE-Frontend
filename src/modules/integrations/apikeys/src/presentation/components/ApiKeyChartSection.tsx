"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

export function ApiKeyChartSection({ data, isLoading, onRangeChange }: ApiKeyChartSectionProps) {
  const { t } = useI18n();
  const [view, setView] = useState<ChartView>("volume");
  const [range, setRange] = useState<RangePreset>("24h");

  const handleRangeChange = (r: RangePreset) => {
    setRange(r);
    onRangeChange(r);
  };

  const formatted = data.map(d => ({
    ...d,
    label: d.period ? (range === "24h" ? formatTimeUtc(d.period) : formatDateUtc(d.period)) : "",
    errorRate: d.totalHits > 0 ? Math.round((d.failureHits / d.totalHits) * 100) : 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-sm font-semibold">
            {t("apikeys.chart.title") || "Request Activity"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border overflow-hidden text-xs">
              {(["volume", "errors", "response"] as ChartView[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    view === v
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(`apikeys.chart.view.${v}`) || v}
                </button>
              ))}
            </div>
            <div className="flex rounded-md border overflow-hidden text-xs">
              {(["24h", "7d", "30d"] as RangePreset[]).map(r => (
                <button
                  key={r}
                  onClick={() => handleRangeChange(r)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    range === r
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 animate-pulse bg-muted/30 rounded-lg" />
        ) : formatted.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            {t("apikeys.chart.noData") || "No data for this period"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            {view === "volume" ? (
              <AreaChart data={formatted} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="failureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="successHits" stroke="#10b981" fill="url(#successGrad)" strokeWidth={2} name="Success" />
                <Area type="monotone" dataKey="failureHits" stroke="#ef4444" fill="url(#failureGrad)" strokeWidth={2} name="Errors" />
              </AreaChart>
            ) : view === "errors" ? (
              <BarChart data={formatted} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="errorRate" fill="#f59e0b" name="Error Rate %" radius={[3, 3, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={formatted} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: any) => [v !== undefined ? `${Number(v).toFixed(1)} ms` : "—", "Avg Response"]} />
                <Area type="monotone" dataKey="avgResponseTimeMs" stroke="#8b5cf6" fill="url(#responseGrad)" strokeWidth={2} name="Avg Response (ms)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
