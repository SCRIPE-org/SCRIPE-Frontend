"use client";

import React, { useState } from "react";
import { GenericChart, GENERIC_COLORS } from "./generic-chart";
import { ResponsiveTabs } from "@core/ui/responsive-tabs";
import { useI18n } from "@core/providers/i18n-provider";
import {
  TrendingUp,
  Activity,
  Zap,
  BarChart3,
  Clock,
  Layers,
  Sparkles,
  Target,
} from "lucide-react";

const lineChartVariants = [
  { id: "basic", label: "Basic", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "multiSeries", label: "Multi-Series", icon: <Layers className="h-4 w-4" /> },
  { id: "curved", label: "Curved", icon: <Activity className="h-4 w-4" /> },
  { id: "stepped", label: "Stepped", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "realtime", label: "Real-time", icon: <Clock className="h-4 w-4" /> },
  { id: "multiAxis", label: "Multi-Axis", icon: <Target className="h-4 w-4" /> },
  { id: "gradient", label: "Gradient", icon: <Sparkles className="h-4 w-4" /> },
  { id: "animated", label: "Animated", icon: <Zap className="h-4 w-4" /> },
];

export function ProfessionalLineCharts() {
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
              backgroundColor: GENERIC_COLORS.primary[0] + "20",
              fill: false,
              tension: 0.4,
            },
          ],
        };

      case "multiSeries":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Desktop",
              data: [12000, 19000, 3000, 5000, 2000, 3000, 8000, 15000],
              borderColor: GENERIC_COLORS.primary[0],
              backgroundColor: GENERIC_COLORS.primary[0] + "20",
              fill: false,
              tension: 0.4,
            },
            {
              label: "Mobile",
              data: [8000, 12000, 2000, 3000, 1500, 2000, 6000, 10000],
              borderColor: GENERIC_COLORS.primary[1],
              backgroundColor: GENERIC_COLORS.primary[1] + "20",
              fill: false,
              tension: 0.4,
            },
            {
              label: "Tablet",
              data: [3000, 5000, 1000, 2000, 800, 1200, 2500, 4000],
              borderColor: GENERIC_COLORS.primary[2],
              backgroundColor: GENERIC_COLORS.primary[2] + "20",
              fill: false,
              tension: 0.4,
            },
          ],
        };

      case "curved":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Growth Rate",
              data: [65, 59, 80, 81, 56, 55, 40, 45],
              borderColor: GENERIC_COLORS.primary[3],
              backgroundColor: GENERIC_COLORS.primary[3] + "20",
              fill: false,
              tension: 0.8,
            },
          ],
        };

      case "stepped":
        return {
          labels: ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"],
          datasets: [
            {
              label: "Project Progress",
              data: [10, 20, 20, 30, 30, 40, 40, 50, 50, 60],
              borderColor: GENERIC_COLORS.primary[4],
              backgroundColor: GENERIC_COLORS.primary[4] + "20",
              fill: false,
              tension: 0,
              stepped: true,
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
              borderColor: GENERIC_COLORS.primary[5],
              backgroundColor: GENERIC_COLORS.primary[5] + "20",
              fill: false,
              tension: 0.4,
            },
            {
              label: "Active Sessions",
              data: [50, 30, 100, 150, 120, 80],
              borderColor: GENERIC_COLORS.primary[6],
              backgroundColor: GENERIC_COLORS.primary[6] + "20",
              fill: false,
              tension: 0.4,
            },
          ],
        };

      case "multiAxis":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Revenue ($)",
              data: [10000, 15000, 12000, 18000, 20000, 25000, 22000, 28000],
              borderColor: GENERIC_COLORS.primary[0],
              backgroundColor: GENERIC_COLORS.primary[0] + "20",
              fill: false,
              tension: 0.4,
              yAxisID: "y",
            },
            {
              label: "Units Sold",
              data: [100, 150, 120, 180, 200, 250, 220, 280],
              borderColor: GENERIC_COLORS.primary[1],
              backgroundColor: GENERIC_COLORS.primary[1] + "20",
              fill: false,
              tension: 0.4,
              yAxisID: "y1",
            },
          ],
        };

      case "gradient":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Premium Users",
              data: [25, 35, 30, 45, 40, 50, 45, 60],
              borderColor: GENERIC_COLORS.primary[2],
              backgroundColor: GENERIC_COLORS.primary[2] + "40",
              fill: true,
              tension: 0.4,
            },
          ],
        };

      case "animated":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Animated Data",
              data: [30, 40, 35, 50, 45, 60, 55, 70],
              borderColor: GENERIC_COLORS.primary[3],
              backgroundColor: GENERIC_COLORS.primary[3] + "20",
              fill: false,
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
              backgroundColor: GENERIC_COLORS.primary[0] + "20",
              fill: false,
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
      },
      scales:
        variant === "multiAxis"
          ? {
              x: {
                display: true,
                title: {
                  display: true,
                  text: "Time Period",
                },
              },
              y: {
                type: "linear" as const,
                display: true,
                position: "left" as const,
                title: {
                  display: true,
                  text: "Revenue ($)",
                },
              },
              y1: {
                type: "linear" as const,
                display: true,
                position: "right" as const,
                title: {
                  display: true,
                  text: "Units Sold",
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            }
          : {
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
              },
            },
    };

    return baseOptions;
  };

  const getVariantInfo = (variant: string) => {
    const variants = {
      basic: {
        title: "Basic Line Chart",
        description:
          "Simple line chart showing data trends over time with clean, professional styling.",
      },
      multiSeries: {
        title: "Multi-Series Line Chart",
        description:
          "Compare multiple data series on the same chart with distinct colors and styles.",
      },
      curved: {
        title: "Curved Line Chart",
        description: "Smooth curved lines with enhanced visual appeal and natural flow.",
      },
      stepped: {
        title: "Stepped Line Chart",
        description: "Step-like progression ideal for discrete data changes and milestones.",
      },
      realtime: {
        title: "Real-time Line Chart",
        description: "Live updating data visualization with smooth animations and transitions.",
      },
      multiAxis: {
        title: "Multi-Axis Line Chart",
        description: "Multiple Y-axes for different data scales and comprehensive analysis.",
      },
      gradient: {
        title: "Gradient Line Chart",
        description: "Beautiful gradient fills and enhanced visual impact for premium data.",
      },
      animated: {
        title: "Animated Line Chart",
        description: "Smooth animations and transitions for engaging data visualization.",
      },
    };
    return variants[variant as keyof typeof variants] || variants.basic;
  };

  const variantInfo = getVariantInfo(activeVariant);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Professional Line Charts</h2>
        <p className="text-muted-foreground">
          Display trends and changes over time with connected data points
        </p>
      </div>

      <ResponsiveTabs
        tabs={lineChartVariants}
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
        {lineChartVariants.slice(0, 6).map((variant) => (
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
