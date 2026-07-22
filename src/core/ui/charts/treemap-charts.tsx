"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { ChartPoint } from "./chart-tooltip";

/**
 * Treemap on a CSS grid.
 *
 * Each tile is a `ChartPoint`, so its figures survive touch, keyboard and a
 * screen reader — the previous CSS-`:hover` overlay reached none of them.
 */
const TreemapChart = ({ data, colors, title, description }: any) => {
  const { t } = useI18n();
  const totalValue = data.reduce((sum: number, item: any) => sum + item.value, 0);
  const maxValue = Math.max(...data.map((item: any) => item.value));
  const minValue = Math.min(...data.map((item: any) => item.value));

  return (
    <Card className="hover:shadow-3xl w-full border-border bg-gradient-to-br from-card to-muted shadow-2xl transition-all duration-300">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
        <CardDescription className="text-base text-muted-foreground">{description}</CardDescription>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: colors[0] }}></div>
            <span>{t("charts.heatmap.min", { value: minValue })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: colors[colors.length - 1] }}
            ></div>
            <span>{t("charts.heatmap.max", { value: maxValue })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-muted"></div>
            <span>{t("charts.treemap.total", { value: totalValue })}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-xl bg-gradient-to-br from-muted to-card p-6 shadow-inner">
          <div className="grid h-80 grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((item: any, index: number) => {
              const percentage = (item.value / totalValue) * 100;
              const intensity = (item.value - minValue) / (maxValue - minValue);
              const gridSpan = Math.max(1, Math.ceil(percentage / 20)); // Minimum 1, scale by percentage
              const colorIndex = Math.floor(intensity * (colors.length - 1));
              const backgroundColor = colors[colorIndex] || colors[colors.length - 1];

              return (
                <ChartPoint
                  key={index}
                  label={`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}
                  content={
                    <span className="block text-center">
                      <span className="block text-xl font-bold tabular-nums">{item.value}</span>
                      <span className="block text-sm">{item.label}</span>
                      <span className="block text-xs opacity-75">
                        {t("charts.treemap.ofTotal", { percent: percentage.toFixed(1) })}
                      </span>
                      <span className="mt-1 block text-xs opacity-75">
                        {t("charts.treemap.rank", { rank: index + 1 })}
                      </span>
                    </span>
                  }
                  className="group relative w-full transition-transform duration-300 hover:z-10 hover:scale-105 focus-visible:z-10 focus-visible:scale-105"
                  style={{
                    gridColumn: `span ${gridSpan}`,
                    gridRow: `span ${gridSpan}`,
                    backgroundColor: backgroundColor,
                    borderRadius: "8px",
                    minHeight: "60px",
                  }}
                >
                  {/* The tile fill is caller-supplied, so the label contrasts
                      against the fill with literal white rather than a theme
                      token. The old yellow hover tints are gone: the tooltip
                      now carries the detail, so the tile does not need to
                      recolour itself to signal interactivity. */}
                  <span className="flex h-full w-full flex-col justify-between p-3 text-white">
                    <span className="block truncate text-sm font-semibold">{item.label}</span>
                    <span className="block text-lg font-bold tabular-nums">{item.value}</span>
                    <span className="block text-xs text-white/80 tabular-nums">
                      {percentage.toFixed(1)}%
                    </span>
                  </span>

                  {/* Corner indicator for large items */}
                  {percentage > 15 && (
                    <span
                      aria-hidden="true"
                      className="absolute end-1 top-1 h-2 w-2 rounded-full bg-white/30"
                    />
                  )}
                </ChartPoint>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">{t("charts.treemap.sizeLegend")}</span>
            {colors.slice(0, 5).map((color: string, index: number) => (
              <div
                key={index}
                className="h-4 w-4 rounded-sm border border-border"
                style={{ backgroundColor: color }}
                title={`${Math.round((index / 4) * 100)}% intensity`}
              ></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function ProfessionalTreemapCharts() {
  const { t } = useI18n();

  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
  ];

  const basicTreemapData = [
    { label: t("charts.common.categoryA"), value: 300 },
    { label: t("charts.common.categoryB"), value: 200 },
    { label: t("charts.common.categoryC"), value: 150 },
    { label: t("charts.common.categoryD"), value: 100 },
    { label: t("charts.common.categoryE"), value: 80 },
    { label: t("charts.common.categoryF"), value: 60 },
    { label: t("charts.common.categoryG"), value: 40 },
    { label: t("charts.common.categoryH"), value: 20 },
  ];

  const hierarchicalTreemapData = [
    { label: t("charts.common.parent1"), value: 500 },
    { label: t("charts.common.child1_1"), value: 200 },
    { label: t("charts.common.child1_2"), value: 300 },
    { label: t("charts.common.parent2"), value: 400 },
    { label: t("charts.common.child2_1"), value: 400 },
    { label: t("charts.common.parent3"), value: 300 },
    { label: t("charts.common.child3_1"), value: 150 },
    { label: t("charts.common.child3_2"), value: 150 },
  ];

  const categoryTreemapData = [
    { label: t("charts.common.electronics"), value: 400 },
    { label: t("charts.common.clothing"), value: 300 },
    { label: t("charts.common.homeGoods"), value: 250 },
    { label: t("charts.common.books"), value: 150 },
    { label: t("charts.common.sports"), value: 120 },
    { label: t("charts.common.beauty"), value: 100 },
    { label: t("charts.common.automotive"), value: 80 },
    { label: t("charts.common.jewelry"), value: 60 },
  ];

  const performanceTreemapData = [
    { label: t("charts.common.departmentSales"), value: 500 },
    { label: t("charts.common.departmentMarketing"), value: 300 },
    { label: t("charts.common.departmentHR"), value: 150 },
    { label: t("charts.common.departmentIT"), value: 200 },
    { label: t("charts.common.departmentFinance"), value: 180 },
    { label: t("charts.common.departmentOperations"), value: 220 },
    { label: t("charts.common.departmentLegal"), value: 100 },
    { label: t("charts.common.departmentR&D"), value: 250 },
  ];

  const budgetTreemapData = [
    { label: t("charts.common.budgetMarketing"), value: 250 },
    { label: t("charts.common.budgetDevelopment"), value: 400 },
    { label: t("charts.common.budgetOperations"), value: 300 },
    { label: t("charts.common.budgetR&D"), value: 150 },
    { label: t("charts.common.budgetHR"), value: 120 },
    { label: t("charts.common.budgetIT"), value: 180 },
    { label: t("charts.common.budgetLegal"), value: 80 },
    { label: t("charts.common.budgetFinance"), value: 100 },
  ];

  const geographicTreemapData = [
    { label: t("charts.common.countryUSA"), value: 700 },
    { label: t("charts.common.countryCanada"), value: 200 },
    { label: t("charts.common.countryMexico"), value: 100 },
    { label: t("charts.common.countryUK"), value: 150 },
    { label: t("charts.common.countryGermany"), value: 180 },
    { label: t("charts.common.countryFrance"), value: 120 },
    { label: t("charts.common.countryJapan"), value: 250 },
    { label: t("charts.common.countryChina"), value: 300 },
  ];

  const projectTreemapData = [
    { label: t("charts.common.projectAlpha"), value: 350 },
    { label: t("charts.common.projectBeta"), value: 280 },
    { label: t("charts.common.projectGamma"), value: 170 },
    { label: t("charts.common.projectDelta"), value: 120 },
    { label: t("charts.common.projectEpsilon"), value: 90 },
    { label: t("charts.common.projectZeta"), value: 70 },
    { label: t("charts.common.projectEta"), value: 50 },
    { label: t("charts.common.projectTheta"), value: 30 },
  ];

  return (
    <div className="space-y-8">
      <TreemapChart
        data={basicTreemapData}
        colors={colors}
        title={t("charts.treemap.basic.title")}
        description={t("charts.treemap.basic.description")}
      />

      <TreemapChart
        data={hierarchicalTreemapData}
        colors={colors}
        title={t("charts.treemap.hierarchical.title")}
        description={t("charts.treemap.hierarchical.description")}
      />

      <TreemapChart
        data={categoryTreemapData}
        colors={colors}
        title={t("charts.treemap.category.title")}
        description={t("charts.treemap.category.description")}
      />

      <TreemapChart
        data={performanceTreemapData}
        colors={colors}
        title={t("charts.treemap.performance.title")}
        description={t("charts.treemap.performance.description")}
      />

      <TreemapChart
        data={budgetTreemapData}
        colors={colors}
        title={t("charts.treemap.budget.title")}
        description={t("charts.treemap.budget.description")}
      />

      <TreemapChart
        data={geographicTreemapData}
        colors={colors}
        title={t("charts.treemap.geographic.title")}
        description={t("charts.treemap.geographic.description")}
      />

      <TreemapChart
        data={projectTreemapData}
        colors={colors}
        title={t("charts.treemap.project.title")}
        description={t("charts.treemap.project.description")}
      />
    </div>
  );
}
