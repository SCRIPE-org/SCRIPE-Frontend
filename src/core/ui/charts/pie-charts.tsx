"use client";

import React from "react";
import { GenericChart } from "./generic-chart";
import { useI18n } from "@core/providers/i18n-provider";

export function ProfessionalPieCharts() {
  const { t } = useI18n();

  // Sample Data
  const basicPieData = {
    labels: [
      t("charts.common.desktop"),
      t("charts.common.mobile"),
      t("charts.common.tablet"),
      t("charts.common.other"),
    ],
    datasets: [
      {
        label: t("charts.common.deviceUsage"),
        data: [45, 30, 20, 5],
        backgroundColor: [
          "#8884d8",
          "#82ca9d", 
          "#ffc658",
          "#ff7300",
        ],
        borderColor: [
          "#8884d8",
          "#82ca9d",
          "#ffc658", 
          "#ff7300",
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutData = {
    labels: [
      t("charts.common.chrome"),
      t("charts.common.firefox"),
      t("charts.common.safari"),
      t("charts.common.edge"),
      t("charts.common.other"),
    ],
    datasets: [
      {
        label: t("charts.common.browserUsage"),
        data: [65, 15, 10, 7, 3],
        backgroundColor: [
          "#0088FE",
          "#00C49F",
          "#FFBB28",
          "#FF8042",
          "#8884d8",
        ],
        borderColor: "#ffffff",
        borderWidth: 3,
        cutout: "60%",
      },
    ],
  };

  const multiLevelData = {
    labels: [
      t("charts.common.q1"),
      t("charts.common.q2"),
      t("charts.common.q3"),
      t("charts.common.q4"),
    ],
    datasets: [
      {
        label: t("charts.common.quarterlySales"),
        data: [25, 35, 20, 20],
        backgroundColor: [
          "#8884d8",
          "#82ca9d",
          "#ffc658",
          "#ff7300",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const gradientPieData = {
    labels: [
      t("charts.common.marketing"),
      t("charts.common.sales"),
      t("charts.common.development"),
      t("charts.common.support"),
    ],
    datasets: [
      {
        label: t("charts.common.departmentBudget"),
        data: [40, 30, 20, 10],
        backgroundColor: [
          "#8884d8",
          "#82ca9d",
          "#ffc658",
          "#ff7300",
        ],
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 15,
      },
    ],
  };

  const interactivePieData = {
    labels: [
      t("charts.common.organic"),
      t("charts.common.paid"),
      t("charts.common.social"),
      t("charts.common.email"),
      t("charts.common.direct"),
    ],
    datasets: [
      {
        label: t("charts.common.trafficSources"),
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          "#0088FE",
          "#00C49F",
          "#FFBB28",
          "#FF8042",
          "#8884d8",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const animatedPieData = {
    labels: [
      t("charts.common.starter"),
      t("charts.common.professional"),
      t("charts.common.enterprise"),
    ],
    datasets: [
      {
        label: t("charts.common.subscriptionPlans"),
        data: [60, 30, 10],
        backgroundColor: [
          "#8884d8",
          "#82ca9d",
          "#ffc658",
        ],
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 12,
      },
    ],
  };

  const explodedPieData = {
    labels: [
      t("charts.common.north"),
      t("charts.common.south"),
      t("charts.common.east"),
      t("charts.common.west"),
    ],
    datasets: [
      {
        label: t("charts.common.regionalSales"),
        data: [30, 25, 20, 25],
        backgroundColor: [
          "#8884d8",
          "#82ca9d",
          "#ffc658",
          "#ff7300",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 20,
      },
    ],
  };

  const customPieData = {
    labels: [
      t("charts.common.productA"),
      t("charts.common.productB"),
      t("charts.common.productC"),
      t("charts.common.productD"),
    ],
    datasets: [
      {
        label: t("charts.common.productSales"),
        data: [50, 25, 15, 10],
        backgroundColor: [
          "#AF19FF",
          "#FF1919",
          "#00C49F",
          "#FFBB28",
        ],
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <GenericChart
        title={t("charts.pie.basic.title")}
        description={t("charts.pie.basic.description")}
        data={basicPieData}
        type="pie"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.pie.doughnut.title")}
        description={t("charts.pie.doughnut.description")}
        data={doughnutData}
        type="doughnut"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.pie.multiLevel.title")}
        description={t("charts.pie.multiLevel.description")}
        data={multiLevelData}
        type="pie"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.pie.gradient.title")}
        description={t("charts.pie.gradient.description")}
        data={gradientPieData}
        type="pie"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.pie.interactive.title")}
        description={t("charts.pie.interactive.description")}
        data={interactivePieData}
        type="pie"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.pie.animated.title")}
        description={t("charts.pie.animated.description")}
        data={animatedPieData}
        type="doughnut"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.pie.exploded.title")}
        description={t("charts.pie.exploded.description")}
        data={explodedPieData}
        type="pie"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.pie.custom.title")}
        description={t("charts.pie.custom.description")}
        data={customPieData}
        type="doughnut"
        filterable={false}
      />
    </div>
  );
}
