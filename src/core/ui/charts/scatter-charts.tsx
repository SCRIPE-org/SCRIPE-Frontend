"use client";

import React from "react";
import { GenericChart } from "./generic-chart";
import { useI18n } from "@core/providers/i18n-provider";

export function ProfessionalScatterCharts() {
  const { t } = useI18n();

  // Sample Data
  const basicScatterData = {
    datasets: [
      {
        label: t("charts.common.salesVsMarketing"),
        data: [
          { x: 10, y: 20 },
          { x: 15, y: 25 },
          { x: 20, y: 30 },
          { x: 25, y: 35 },
          { x: 30, y: 40 },
          { x: 35, y: 45 },
          { x: 40, y: 50 },
          { x: 45, y: 55 },
          { x: 50, y: 60 },
          { x: 55, y: 65 },
        ],
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const multiSeriesScatterData = {
    datasets: [
      {
        label: t("charts.common.productA"),
        data: [
          { x: 10, y: 20 },
          { x: 15, y: 25 },
          { x: 20, y: 30 },
          { x: 25, y: 35 },
          { x: 30, y: 40 },
        ],
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: t("charts.common.productB"),
        data: [
          { x: 12, y: 18 },
          { x: 18, y: 22 },
          { x: 22, y: 28 },
          { x: 28, y: 32 },
          { x: 32, y: 38 },
        ],
        backgroundColor: "#82ca9d",
        borderColor: "#82ca9d",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: t("charts.common.productC"),
        data: [
          { x: 8, y: 25 },
          { x: 14, y: 30 },
          { x: 19, y: 35 },
          { x: 24, y: 40 },
          { x: 29, y: 45 },
        ],
        backgroundColor: "#ffc658",
        borderColor: "#ffc658",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const bubbleData = {
    datasets: [
      {
        label: t("charts.common.companySize"),
        data: [
          { x: 20, y: 30, r: 15 },
          { x: 25, y: 35, r: 20 },
          { x: 30, y: 40, r: 25 },
          { x: 35, y: 45, r: 30 },
          { x: 40, y: 50, r: 35 },
          { x: 45, y: 55, r: 40 },
          { x: 50, y: 60, r: 45 },
        ],
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        hoverBackgroundColor: "#82ca9d",
        hoverBorderColor: "#82ca9d",
      },
    ],
  };

  const correlationData = {
    datasets: [
      {
        label: t("charts.common.priceVsDemand"),
        data: [
          { x: 100, y: 80 },
          { x: 120, y: 70 },
          { x: 140, y: 60 },
          { x: 160, y: 50 },
          { x: 180, y: 40 },
          { x: 200, y: 30 },
          { x: 220, y: 20 },
          { x: 240, y: 15 },
          { x: 260, y: 10 },
          { x: 280, y: 5 },
        ],
        backgroundColor: "#ff7300",
        borderColor: "#ff7300",
        pointRadius: 7,
        pointHoverRadius: 9,
      },
    ],
  };

  const performanceData = {
    datasets: [
      {
        label: t("charts.common.performanceVsCost"),
        data: [
          { x: 50, y: 60 },
          { x: 60, y: 65 },
          { x: 70, y: 70 },
          { x: 80, y: 75 },
          { x: 90, y: 80 },
          { x: 100, y: 85 },
          { x: 110, y: 90 },
          { x: 120, y: 95 },
        ],
        backgroundColor: "#00C49F",
        borderColor: "#00C49F",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const timeSeriesScatterData = {
    datasets: [
      {
        label: t("charts.common.timeVsValue"),
        data: [
          { x: 1, y: 10 },
          { x: 2, y: 15 },
          { x: 3, y: 12 },
          { x: 4, y: 18 },
          { x: 5, y: 20 },
          { x: 6, y: 16 },
          { x: 7, y: 22 },
          { x: 8, y: 25 },
          { x: 9, y: 19 },
          { x: 10, y: 28 },
        ],
        backgroundColor: "#AF19FF",
        borderColor: "#AF19FF",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const clusterData = {
    datasets: [
      {
        label: t("charts.common.cluster1"),
        data: [
          { x: 10, y: 20 },
          { x: 12, y: 22 },
          { x: 14, y: 24 },
          { x: 16, y: 26 },
        ],
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: t("charts.common.cluster2"),
        data: [
          { x: 30, y: 40 },
          { x: 32, y: 42 },
          { x: 34, y: 44 },
          { x: 36, y: 46 },
        ],
        backgroundColor: "#82ca9d",
        borderColor: "#82ca9d",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: t("charts.common.cluster3"),
        data: [
          { x: 50, y: 60 },
          { x: 52, y: 62 },
          { x: 54, y: 64 },
          { x: 56, y: 66 },
        ],
        backgroundColor: "#ffc658",
        borderColor: "#ffc658",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const outlierData = {
    datasets: [
      {
        label: t("charts.common.normalData"),
        data: [
          { x: 20, y: 30 },
          { x: 25, y: 35 },
          { x: 30, y: 40 },
          { x: 35, y: 45 },
          { x: 40, y: 50 },
          { x: 45, y: 55 },
          { x: 50, y: 60 },
          { x: 55, y: 65 },
          { x: 60, y: 70 },
          { x: 65, y: 75 },
        ],
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: t("charts.common.outliers"),
        data: [
          { x: 15, y: 80 },
          { x: 80, y: 25 },
          { x: 25, y: 85 },
          { x: 85, y: 30 },
        ],
        backgroundColor: "#FF1919",
        borderColor: "#FF1919",
        pointRadius: 8,
        pointHoverRadius: 10,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <GenericChart
        title={t("charts.scatter.basic.title")}
        description={t("charts.scatter.basic.description")}
        data={basicScatterData}
        type="scatter"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.scatter.multiSeries.title")}
        description={t("charts.scatter.multiSeries.description")}
        data={multiSeriesScatterData}
        type="scatter"
        filterable={true}
      />
      
      <GenericChart
        title={t("charts.scatter.bubble.title")}
        description={t("charts.scatter.bubble.description")}
        data={bubbleData}
        type="bubble"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.scatter.correlation.title")}
        description={t("charts.scatter.correlation.description")}
        data={correlationData}
        type="scatter"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.scatter.performance.title")}
        description={t("charts.scatter.performance.description")}
        data={performanceData}
        type="scatter"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.scatter.timeSeries.title")}
        description={t("charts.scatter.timeSeries.description")}
        data={timeSeriesScatterData}
        type="scatter"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.scatter.cluster.title")}
        description={t("charts.scatter.cluster.description")}
        data={clusterData}
        type="scatter"
        filterable={true}
      />
      
      <GenericChart
        title={t("charts.scatter.outlier.title")}
        description={t("charts.scatter.outlier.description")}
        data={outlierData}
        type="scatter"
        filterable={true}
      />
    </div>
  );
}
