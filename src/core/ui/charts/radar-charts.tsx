"use client";

import React from "react";
import { GenericChart } from "./generic-chart";
import { useI18n } from "@core/providers/i18n-provider";

export function ProfessionalRadarCharts() {
  const { t } = useI18n();

  // Sample Data
  const basicRadarData = {
    labels: [
      t("charts.common.speed"),
      t("charts.common.reliability"),
      t("charts.common.comfort"),
      t("charts.common.safety"),
      t("charts.common.efficiency"),
      t("charts.common.price"),
    ],
    datasets: [
      {
        label: t("charts.common.productA"),
        data: [65, 59, 90, 81, 56, 55],
        backgroundColor: "rgba(136, 132, 216, 0.2)",
        borderColor: "#8884d8",
        borderWidth: 2,
        pointBackgroundColor: "#8884d8",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const multiSeriesRadarData = {
    labels: [
      t("charts.common.performance"),
      t("charts.common.usability"),
      t("charts.common.design"),
      t("charts.common.features"),
      t("charts.common.support"),
      t("charts.common.value"),
    ],
    datasets: [
      {
        label: t("charts.common.productA"),
        data: [80, 70, 90, 85, 75, 60],
        backgroundColor: "rgba(136, 132, 216, 0.2)",
        borderColor: "#8884d8",
        borderWidth: 2,
        pointBackgroundColor: "#8884d8",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: t("charts.common.productB"),
        data: [70, 85, 75, 80, 90, 85],
        backgroundColor: "rgba(130, 202, 157, 0.2)",
        borderColor: "#82ca9d",
        borderWidth: 2,
        pointBackgroundColor: "#82ca9d",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: t("charts.common.productC"),
        data: [60, 75, 80, 70, 85, 90],
        backgroundColor: "rgba(255, 198, 88, 0.2)",
        borderColor: "#ffc658",
        borderWidth: 2,
        pointBackgroundColor: "#ffc658",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const skillAssessmentData = {
    labels: [
      t("charts.common.frontend"),
      t("charts.common.backend"),
      t("charts.common.database"),
      t("charts.common.devops"),
      t("charts.common.testing"),
      t("charts.common.softSkills"),
    ],
    datasets: [
      {
        label: t("charts.common.developerA"),
        data: [90, 70, 60, 50, 80, 75],
        backgroundColor: "rgba(0, 136, 254, 0.2)",
        borderColor: "#0088FE",
        borderWidth: 3,
        pointBackgroundColor: "#0088FE",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const marketAnalysisData = {
    labels: [
      t("charts.common.marketShare"),
      t("charts.common.growth"),
      t("charts.common.profitability"),
      t("charts.common.innovation"),
      t("charts.common.customerSatisfaction"),
      t("charts.common.brandStrength"),
    ],
    datasets: [
      {
        label: t("charts.common.companyA"),
        data: [85, 70, 90, 80, 75, 85],
        backgroundColor: "rgba(175, 25, 255, 0.2)",
        borderColor: "#AF19FF",
        borderWidth: 2,
        pointBackgroundColor: "#AF19FF",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: t("charts.common.companyB"),
        data: [70, 85, 75, 90, 80, 70],
        backgroundColor: "rgba(255, 25, 25, 0.2)",
        borderColor: "#FF1919",
        borderWidth: 2,
        pointBackgroundColor: "#FF1919",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const teamPerformanceData = {
    labels: [
      t("charts.common.communication"),
      t("charts.common.collaboration"),
      t("charts.common.leadership"),
      t("charts.common.problemSolving"),
      t("charts.common.creativity"),
      t("charts.common.timeManagement"),
    ],
    datasets: [
      {
        label: t("charts.common.teamMember1"),
        data: [80, 85, 70, 90, 75, 80],
        backgroundColor: "rgba(0, 196, 159, 0.2)",
        borderColor: "#00C49F",
        borderWidth: 2,
        pointBackgroundColor: "#00C49F",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: t("charts.common.teamMember2"),
        data: [75, 80, 85, 80, 85, 75],
        backgroundColor: "rgba(255, 187, 40, 0.2)",
        borderColor: "#FFBB28",
        borderWidth: 2,
        pointBackgroundColor: "#FFBB28",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: t("charts.common.teamMember3"),
        data: [85, 75, 80, 85, 80, 85],
        backgroundColor: "rgba(255, 128, 66, 0.2)",
        borderColor: "#FF8042",
        borderWidth: 2,
        pointBackgroundColor: "#FF8042",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const projectMetricsData = {
    labels: [
      t("charts.common.quality"),
      t("charts.common.speed"),
      t("charts.common.cost"),
      t("charts.common.scope"),
      t("charts.common.risk"),
      t("charts.common.resources"),
    ],
    datasets: [
      {
        label: t("charts.common.projectA"),
        data: [90, 70, 60, 80, 50, 75],
        backgroundColor: "rgba(136, 132, 216, 0.3)",
        borderColor: "#8884d8",
        borderWidth: 3,
        pointBackgroundColor: "#8884d8",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const customerSatisfactionData = {
    labels: [
      t("charts.common.productQuality"),
      t("charts.common.customerService"),
      t("charts.common.pricing"),
      t("charts.common.delivery"),
      t("charts.common.support"),
      t("charts.common.innovation"),
    ],
    datasets: [
      {
        label: t("charts.common.satisfactionScore"),
        data: [85, 90, 70, 80, 85, 75],
        backgroundColor: "rgba(130, 202, 157, 0.3)",
        borderColor: "#82ca9d",
        borderWidth: 3,
        pointBackgroundColor: "#82ca9d",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const competitiveAnalysisData = {
    labels: [
      t("charts.common.features"),
      t("charts.common.price"),
      t("charts.common.performance"),
      t("charts.common.support"),
      t("charts.common.reliability"),
      t("charts.common.easeOfUse"),
    ],
    datasets: [
      {
        label: t("charts.common.ourProduct"),
        data: [90, 80, 85, 90, 85, 80],
        backgroundColor: "rgba(0, 136, 254, 0.2)",
        borderColor: "#0088FE",
        borderWidth: 3,
        pointBackgroundColor: "#0088FE",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: t("charts.common.competitor1"),
        data: [75, 90, 70, 75, 80, 85],
        backgroundColor: "rgba(255, 198, 88, 0.2)",
        borderColor: "#ffc658",
        borderWidth: 2,
        pointBackgroundColor: "#ffc658",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: t("charts.common.competitor2"),
        data: [80, 70, 90, 80, 75, 70],
        backgroundColor: "rgba(255, 115, 0, 0.2)",
        borderColor: "#ff7300",
        borderWidth: 2,
        pointBackgroundColor: "#ff7300",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <GenericChart
        title={t("charts.radar.basic.title")}
        description={t("charts.radar.basic.description")}
        data={basicRadarData}
        type="radar"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.radar.multiSeries.title")}
        description={t("charts.radar.multiSeries.description")}
        data={multiSeriesRadarData}
        type="radar"
        filterable={true}
      />
      
      <GenericChart
        title={t("charts.radar.skillAssessment.title")}
        description={t("charts.radar.skillAssessment.description")}
        data={skillAssessmentData}
        type="radar"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.radar.marketAnalysis.title")}
        description={t("charts.radar.marketAnalysis.description")}
        data={marketAnalysisData}
        type="radar"
        filterable={true}
      />
      
      <GenericChart
        title={t("charts.radar.teamPerformance.title")}
        description={t("charts.radar.teamPerformance.description")}
        data={teamPerformanceData}
        type="radar"
        filterable={true}
      />
      
      <GenericChart
        title={t("charts.radar.projectMetrics.title")}
        description={t("charts.radar.projectMetrics.description")}
        data={projectMetricsData}
        type="radar"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.radar.customerSatisfaction.title")}
        description={t("charts.radar.customerSatisfaction.description")}
        data={customerSatisfactionData}
        type="radar"
        filterable={false}
      />
      
      <GenericChart
        title={t("charts.radar.competitiveAnalysis.title")}
        description={t("charts.radar.competitiveAnalysis.description")}
        data={competitiveAnalysisData}
        type="radar"
        filterable={true}
      />
    </div>
  );
}
