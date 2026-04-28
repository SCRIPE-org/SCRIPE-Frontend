"use client";

import React, { useState } from "react";
import { GenericChart, GENERIC_COLORS } from "./generic-chart";
import { ResponsiveTabs } from "@core/ui/responsive-tabs";
import { useI18n } from "@core/providers/i18n-provider";
import {
  TrendingUp,
  Layers,
  Activity,
  BarChart3,
  Clock,
  Target,
  Sparkles,
  Zap,
  PieChart,
  BarChart,
} from "lucide-react";

const areaChartVariants = [
  { id: "basic", label: "Basic", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "stacked", label: "Stacked", icon: <Layers className="h-4 w-4" /> },
  { id: "gradient", label: "Gradient", icon: <Sparkles className="h-4 w-4" /> },
  { id: "smooth", label: "Smooth", icon: <Activity className="h-4 w-4" /> },
  { id: "range", label: "Range", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "layered", label: "Layered", icon: <Layers className="h-4 w-4" /> },
  { id: "spline", label: "Spline", icon: <Zap className="h-4 w-4" /> },
  { id: "realtime", label: "Real-time", icon: <Clock className="h-4 w-4" /> },
  { id: "interactive", label: "Interactive", icon: <Target className="h-4 w-4" /> },
  { id: "filled", label: "Filled", icon: <PieChart className="h-4 w-4" /> },
  { id: "polar", label: "Polar", icon: <BarChart className="h-4 w-4" /> },
];

export function ProfessionalAreaCharts() {
  const { t } = useI18n();
  const [activeVariant, setActiveVariant] = useState("basic");

  const getChartData = (variant: string) => {
    const baseLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

    switch (variant) {
      case "basic":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Revenue",
              data: [12000, 19000, 3000, 5000, 2000, 3000, 8000, 15000],
              borderColor: GENERIC_COLORS.primary[0],
              backgroundColor: GENERIC_COLORS.primary[0] + "40",
              fill: true,
              tension: 0.4,
            },
          ],
        };

      case "stacked":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "North Region",
              data: [100, 120, 110, 130, 125, 135, 130, 140],
              borderColor: GENERIC_COLORS.primary[0],
              backgroundColor: GENERIC_COLORS.primary[0] + "60",
              fill: true,
              tension: 0.4,
            },
            {
              label: "South Region",
              data: [80, 90, 95, 105, 100, 110, 105, 115],
              borderColor: GENERIC_COLORS.primary[1],
              backgroundColor: GENERIC_COLORS.primary[1] + "60",
              fill: true,
              tension: 0.4,
            },
            {
              label: "East Region",
              data: [60, 70, 75, 85, 80, 90, 85, 95],
              borderColor: GENERIC_COLORS.primary[2],
              backgroundColor: GENERIC_COLORS.primary[2] + "60",
              fill: true,
              tension: 0.4,
            },
            {
              label: "West Region",
              data: [40, 50, 55, 65, 60, 70, 65, 75],
              borderColor: GENERIC_COLORS.primary[3],
              backgroundColor: GENERIC_COLORS.primary[3] + "60",
              fill: true,
              tension: 0.4,
            },
          ],
        };

      case "gradient":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Website Traffic",
              data: [1200, 1900, 3000, 5000, 2000, 3000, 1500, 2500],
              borderColor: GENERIC_COLORS.primary[4],
              backgroundColor: GENERIC_COLORS.primary[4] + "50",
              fill: true,
              tension: 0.4,
            },
          ],
        };

      case "smooth":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Smooth Growth",
              data: [10, 20, 30, 25, 40, 50, 45, 60],
              borderColor: GENERIC_COLORS.primary[5],
              backgroundColor: GENERIC_COLORS.primary[5] + "40",
              fill: true,
              tension: 0.8,
            },
            {
              label: "Smooth Decline",
              data: [60, 50, 40, 35, 30, 25, 20, 15],
              borderColor: GENERIC_COLORS.primary[6],
              backgroundColor: GENERIC_COLORS.primary[6] + "40",
              fill: true,
              tension: 0.8,
            },
          ],
        };

      case "range":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Min Range",
              data: [50, 60, 55, 70, 65, 75, 70, 80],
              borderColor: GENERIC_COLORS.primary[0],
              backgroundColor: GENERIC_COLORS.primary[0] + "30",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Max Range",
              data: [80, 90, 85, 95, 90, 100, 95, 105],
              borderColor: GENERIC_COLORS.primary[1],
              backgroundColor: GENERIC_COLORS.primary[1] + "30",
              fill: true,
              tension: 0.4,
            },
          ],
        };

      case "layered":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Layer 1",
              data: [20, 30, 25, 35, 30, 40, 35, 45],
              borderColor: GENERIC_COLORS.primary[2],
              backgroundColor: GENERIC_COLORS.primary[2] + "40",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Layer 2",
              data: [15, 25, 20, 30, 25, 35, 30, 40],
              borderColor: GENERIC_COLORS.primary[3],
              backgroundColor: GENERIC_COLORS.primary[3] + "40",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Layer 3",
              data: [10, 20, 15, 25, 20, 30, 25, 35],
              borderColor: GENERIC_COLORS.primary[4],
              backgroundColor: GENERIC_COLORS.primary[4] + "40",
              fill: true,
              tension: 0.4,
            },
          ],
        };

      case "spline":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Spline Curve",
              data: [10, 25, 15, 35, 20, 40, 25, 45],
              borderColor: GENERIC_COLORS.primary[5],
              backgroundColor: GENERIC_COLORS.primary[5] + "40",
              fill: true,
              tension: 0.8,
            },
            {
              label: "Smooth Data",
              data: [20, 15, 30, 10, 25, 35, 20, 40],
              borderColor: GENERIC_COLORS.primary[6],
              backgroundColor: GENERIC_COLORS.primary[6] + "40",
              fill: true,
              tension: 0.8,
            },
          ],
        };

      case "realtime":
        return {
          labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
          datasets: [
            {
              label: "Live Users",
              data: [120, 80, 200, 350, 280, 180],
              borderColor: GENERIC_COLORS.primary[0],
              backgroundColor: GENERIC_COLORS.primary[0] + "40",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Active Sessions",
              data: [50, 30, 100, 150, 120, 80],
              borderColor: GENERIC_COLORS.primary[1],
              backgroundColor: GENERIC_COLORS.primary[1] + "40",
              fill: true,
              tension: 0.4,
            },
          ],
        };

      case "interactive":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Interactive Data",
              data: [25, 35, 30, 45, 40, 50, 45, 60],
              borderColor: GENERIC_COLORS.primary[2],
              backgroundColor: GENERIC_COLORS.primary[2] + "40",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Hover Data",
              data: [15, 25, 20, 35, 30, 40, 35, 50],
              borderColor: GENERIC_COLORS.primary[3],
              backgroundColor: GENERIC_COLORS.primary[3] + "40",
              fill: true,
              tension: 0.4,
            },
          ],
        };

      case "filled":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Filled Area",
              data: [40, 50, 45, 60, 55, 70, 65, 80],
              borderColor: GENERIC_COLORS.primary[4],
              backgroundColor: GENERIC_COLORS.primary[4] + "60",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Transparent Fill",
              data: [30, 40, 35, 50, 45, 60, 55, 70],
              borderColor: GENERIC_COLORS.primary[5],
              backgroundColor: GENERIC_COLORS.primary[5] + "30",
              fill: true,
              tension: 0.4,
            },
          ],
        };

      case "polar":
        return {
          labels: ["North", "South", "East", "West", "Center"],
          datasets: [
            {
              label: "Polar Data",
              data: [65, 59, 80, 81, 56],
              borderColor: GENERIC_COLORS.primary[6],
              backgroundColor: GENERIC_COLORS.primary[6] + "40",
              fill: true,
              tension: 0.4,
            },
          ],
        };

      default:
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Default",
              data: [10, 20, 15, 25, 20, 30, 25, 35],
              borderColor: GENERIC_COLORS.primary[0],
              backgroundColor: GENERIC_COLORS.primary[0] + "40",
              fill: true,
              tension: 0.4,
            },
          ],
        };
    }
  };

  const getChartOptions = (variant: string) => {
    const baseOptions = {
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
        filler: {
          propagate: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time Period",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Value",
          },
          beginAtZero: true,
          stacked: variant === "stacked",
        },
      },
      elements: {
        line: {
          tension: variant === "spline" ? 0.8 : 0.4,
        },
      },
    };

    return baseOptions;
  };

  const getVariantInfo = (variant: string) => {
    const variants = {
      basic: {
        title: "Basic Area Chart",
        description: "Simple area chart with gradient fill showing data trends over time.",
      },
      stacked: {
        title: "Stacked Area Chart",
        description: "Multiple data series stacked on top of each other with proper fills.",
      },
      gradient: {
        title: "Gradient Area Chart",
        description: "Beautiful gradient fills for enhanced visual impact and appeal.",
      },
      smooth: {
        title: "Smooth Area Chart",
        description: "Smooth curves with elegant area fills and natural flow.",
      },
      range: {
        title: "Range Area Chart",
        description: "Show data ranges with min/max boundaries and filled areas.",
      },
      layered: {
        title: "Layered Area Chart",
        description: "Multiple layers with transparency effects and depth.",
      },
      spline: {
        title: "Spline Area Chart",
        description: "Smooth spline curves with area fills for premium visualization.",
      },
      realtime: {
        title: "Real-time Area Chart",
        description: "Live updating area charts with smooth animations.",
      },
      interactive: {
        title: "Interactive Area Chart",
        description: "Interactive area charts with hover effects and engagement.",
      },
      filled: {
        title: "Filled Area Chart",
        description: "Completely filled area charts with transparency variations.",
      },
      polar: {
        title: "Polar Area Chart",
        description: "Polar coordinate area charts for unique data visualization.",
      },
    };
    return variants[variant as keyof typeof variants] || variants.basic;
  };

  const variantInfo = getVariantInfo(activeVariant);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Professional Area Charts</h2>
        <p className="text-muted-foreground">
          Emphasize magnitude of change with filled areas under lines
        </p>
      </div>

      <ResponsiveTabs
        tabs={areaChartVariants}
        activeTab={activeVariant}
        onTabChange={setActiveVariant}
        className="mb-6"
      />

      <GenericChart
        title={variantInfo.title}
        description={variantInfo.description}
        data={getChartData(activeVariant)}
        options={getChartOptions(activeVariant)}
        type="line"
        className="mb-6"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {areaChartVariants.slice(0, 9).map((variant) => (
          <div
            key={variant.id}
            className="cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md"
            onClick={() => setActiveVariant(variant.id)}
          >
            <div className="mb-2 flex items-center gap-2">
              {variant.icon}
              <span className="font-medium">{variant.label}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {getVariantInfo(variant.id).description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
