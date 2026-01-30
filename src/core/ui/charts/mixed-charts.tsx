"use client";

import React from "react";
import { GenericChart } from "./generic-chart";
import { useI18n } from "@core/providers/i18n-provider";

export function ProfessionalMixedCharts() {
  const { t } = useI18n();

  // Sample Data for Mixed Charts
  const lineBarData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: t("charts.common.sales"),
        data: [12, 19, 3, 5, 2, 3],
        type: "bar" as const,
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        yAxisID: "y",
      },
      {
        label: t("charts.common.revenue"),
        data: [20, 30, 25, 40, 35, 50],
        type: "line" as const,
        borderColor: "#82ca9d",
        backgroundColor: "transparent",
        yAxisID: "y1",
        tension: 0.4,
      },
    ],
  };

  const areaLineData = {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: t("charts.common.profit"),
        data: [30, 45, 40, 50],
        type: "line" as const,
        borderColor: "#ffc658",
        backgroundColor: "transparent",
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: t("charts.common.growth"),
        data: [20, 35, 30, 40],
        type: "line" as const,
        borderColor: "#ff7300",
        backgroundColor: "rgba(255, 115, 0, 0.2)",
        fill: true,
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const barAreaLineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: t("charts.common.unitsSold"),
        data: [100, 120, 110, 130],
        type: "bar" as const,
        backgroundColor: "#0088FE",
        borderColor: "#0088FE",
        yAxisID: "y",
      },
      {
        label: t("charts.common.performance"),
        data: [80, 90, 85, 95],
        type: "line" as const,
        borderColor: "#00C49F",
        backgroundColor: "transparent",
        tension: 0.4,
        yAxisID: "y1",
      },
      {
        label: t("charts.common.engagement"),
        data: [60, 70, 65, 75],
        type: "line" as const,
        borderColor: "#FFBB28",
        backgroundColor: "rgba(255, 187, 40, 0.2)",
        fill: true,
        tension: 0.4,
        yAxisID: "y2",
      },
    ],
  };

  const dualAxisData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: t("charts.common.sales"),
        data: [1000, 1200, 1100, 1300, 1250],
        type: "bar" as const,
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
        yAxisID: "y",
      },
      {
        label: t("charts.common.profit"),
        data: [10, 15, 12, 18, 16],
        type: "line" as const,
        borderColor: "#82ca9d",
        backgroundColor: "transparent",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const scatterLineData = {
    labels: ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
    datasets: [
      {
        label: t("charts.common.trend"),
        data: [
          { x: 10, y: 20 },
          { x: 15, y: 25 },
          { x: 20, y: 30 },
          { x: 25, y: 35 },
          { x: 30, y: 40 },
        ],
        type: "scatter" as const,
        backgroundColor: "#ffc658",
        borderColor: "#ffc658",
        yAxisID: "y",
      },
      {
        label: t("charts.common.prediction"),
        data: [20, 25, 30, 35, 40],
        type: "line" as const,
        borderColor: "#ff7300",
        backgroundColor: "transparent",
        tension: 0.4,
        yAxisID: "y",
      },
    ],
  };

  const bubbleLineData = {
    labels: ["A", "B", "C", "D", "E"],
    datasets: [
      {
        label: t("charts.common.companySize"),
        data: [
          { x: 20, y: 30, r: 15 },
          { x: 25, y: 35, r: 20 },
          { x: 30, y: 40, r: 25 },
          { x: 35, y: 45, r: 30 },
          { x: 40, y: 50, r: 35 },
        ],
        type: "bubble" as const,
        backgroundColor: "#AF19FF",
        borderColor: "#AF19FF",
        yAxisID: "y",
      },
      {
        label: t("charts.common.growth"),
        data: [30, 35, 40, 45, 50],
        type: "line" as const,
        borderColor: "#FF1919",
        backgroundColor: "transparent",
        tension: 0.4,
        yAxisID: "y",
      },
    ],
  };

  const radarLineData = {
    labels: [
      t("charts.common.performance"),
      t("charts.common.quality"),
      t("charts.common.speed"),
      t("charts.common.cost"),
      t("charts.common.innovation"),
    ],
    datasets: [
      {
        label: t("charts.common.current"),
        data: [80, 70, 90, 60, 85],
        type: "line" as const,
        borderColor: "#8884d8",
        backgroundColor: "rgba(136, 132, 216, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: t("charts.common.target"),
        data: [90, 80, 95, 70, 90],
        type: "line" as const,
        borderColor: "#82ca9d",
        backgroundColor: "rgba(130, 202, 157, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const pieBarData = {
    labels: ["Product A", "Product B", "Product C", "Product D"],
    datasets: [
      {
        label: t("charts.common.marketShare"),
        data: [40, 30, 20, 10],
        type: "bar" as const,
        backgroundColor: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"],
        borderColor: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"],
        yAxisID: "y",
      },
      {
        label: t("charts.common.revenue"),
        data: [50, 25, 15, 10],
        type: "line" as const,
        borderColor: "#0088FE",
        backgroundColor: "transparent",
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  return (
    <div className="space-y-8">
      <GenericChart
        title={t("charts.mixed.lineBar.title")}
        description={t("charts.mixed.lineBar.description")}
        data={lineBarData}
        type="line"
        filterable={true}
        options={{
          scales: {
            y: {
              type: "linear",
              position: "left",
              title: { display: true, text: t("charts.common.sales") },
            },
            y1: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: t("charts.common.revenue") },
            },
          },
        }}
      />
      
      <GenericChart
        title={t("charts.mixed.areaLine.title")}
        description={t("charts.mixed.areaLine.description")}
        data={areaLineData}
        type="line"
        filterable={true}
        options={{
          scales: {
            y: {
              type: "linear",
              position: "left",
              title: { display: true, text: t("charts.common.profit") },
            },
            y1: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: t("charts.common.growth") },
            },
          },
        }}
      />
      
      <GenericChart
        title={t("charts.mixed.barAreaLine.title")}
        description={t("charts.mixed.barAreaLine.description")}
        data={barAreaLineData}
        type="line"
        filterable={true}
        options={{
          scales: {
            y: {
              type: "linear",
              position: "left",
              title: { display: true, text: t("charts.common.unitsSold") },
            },
            y1: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: t("charts.common.performance") },
            },
            y2: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: t("charts.common.engagement") },
            },
          },
        }}
      />
      
      <GenericChart
        title={t("charts.mixed.dualAxis.title")}
        description={t("charts.mixed.dualAxis.description")}
        data={dualAxisData}
        type="line"
        filterable={true}
        options={{
          scales: {
            y: {
              type: "linear",
              position: "left",
              title: { display: true, text: t("charts.common.sales") },
            },
            y1: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: t("charts.common.profit") },
            },
          },
        }}
      />
      
      <GenericChart
        title={t("charts.mixed.scatterLine.title")}
        description={t("charts.mixed.scatterLine.description")}
        data={scatterLineData}
        type="scatter"
        filterable={true}
      />
      
      <GenericChart
        title={t("charts.mixed.bubbleLine.title")}
        description={t("charts.mixed.bubbleLine.description")}
        data={bubbleLineData}
        type="bubble"
        filterable={true}
      />
      
      <GenericChart
        title={t("charts.mixed.radarLine.title")}
        description={t("charts.mixed.radarLine.description")}
        data={radarLineData}
        type="line"
        filterable={true}
      />
      
      <GenericChart
        title={t("charts.mixed.pieBar.title")}
        description={t("charts.mixed.pieBar.description")}
        data={pieBarData}
        type="bar"
        filterable={true}
        options={{
          scales: {
            y: {
              type: "linear",
              position: "left",
              title: { display: true, text: t("charts.common.marketShare") },
            },
            y1: {
              type: "linear",
              position: "right",
              grid: { drawOnChartArea: false },
              title: { display: true, text: t("charts.common.revenue") },
            },
          },
        }}
      />
    </div>
  );
}
