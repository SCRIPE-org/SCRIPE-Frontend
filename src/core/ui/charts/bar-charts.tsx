"use client";

import React, { useState } from "react";
import { GenericChart, GENERIC_COLORS } from "./generic-chart";
import { ResponsiveTabs } from "@core/ui/responsive-tabs";
import { useI18n } from "@core/providers/i18n-provider";
import {
  BarChart3,
  Layers,
  Activity,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  Zap,
  BarChart,
  ArrowUpDown,
} from "lucide-react";

const barChartVariants = [
  { id: "basic", label: "Basic", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "horizontal", label: "Horizontal", icon: <ArrowUpDown className="h-4 w-4" /> },
  { id: "stacked", label: "Stacked", icon: <Layers className="h-4 w-4" /> },
  { id: "grouped", label: "Grouped", icon: <BarChart className="h-4 w-4" /> },
  { id: "waterfall", label: "Waterfall", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "floating", label: "Floating", icon: <Activity className="h-4 w-4" /> },
  { id: "gradient", label: "Gradient", icon: <Sparkles className="h-4 w-4" /> },
  { id: "animated", label: "Animated", icon: <Zap className="h-4 w-4" /> },
  { id: "interactive", label: "Interactive", icon: <Target className="h-4 w-4" /> },
  { id: "multiAxis", label: "Multi-Axis", icon: <Clock className="h-4 w-4" /> },
];

export function ProfessionalBarCharts() {
  const { t } = useI18n();
  const [activeVariant, setActiveVariant] = useState("basic");

  const getChartData = (variant: string) => {
    const baseLabels = ["Desktop", "Mobile", "Tablet", "TV", "Watch"];

    switch (variant) {
      case "basic":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "2023",
              data: [65, 59, 80, 81, 56],
              backgroundColor: GENERIC_COLORS.primary[0] + "80",
              borderColor: GENERIC_COLORS.primary[0],
              borderWidth: 2,
            },
            {
              label: "2024",
              data: [28, 48, 40, 19, 86],
              backgroundColor: GENERIC_COLORS.primary[1] + "80",
              borderColor: GENERIC_COLORS.primary[1],
              borderWidth: 2,
            },
          ],
        };

      case "horizontal":
        return {
          labels: ["Marketing", "Sales", "Development", "Support", "Design"],
          datasets: [
            {
              label: "Team Size",
              data: [12, 19, 3, 5, 2],
              backgroundColor: GENERIC_COLORS.primary[2] + "80",
              borderColor: GENERIC_COLORS.primary[2],
              borderWidth: 2,
            },
          ],
        };

      case "stacked":
        return {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            {
              label: "Direct Sales",
              data: [12, 19, 3, 5, 2],
              backgroundColor: GENERIC_COLORS.primary[0] + "80",
              borderColor: GENERIC_COLORS.primary[0],
              borderWidth: 2,
            },
            {
              label: "Online Sales",
              data: [2, 3, 20, 5, 1],
              backgroundColor: GENERIC_COLORS.primary[1] + "80",
              borderColor: GENERIC_COLORS.primary[1],
              borderWidth: 2,
            },
            {
              label: "Retail Sales",
              data: [3, 10, 13, 15, 22],
              backgroundColor: GENERIC_COLORS.primary[2] + "80",
              borderColor: GENERIC_COLORS.primary[2],
              borderWidth: 2,
            },
          ],
        };

      case "grouped":
        return {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [
            {
              label: "Product A",
              data: [100, 120, 110, 130],
              backgroundColor: GENERIC_COLORS.primary[3] + "80",
              borderColor: GENERIC_COLORS.primary[3],
              borderWidth: 2,
            },
            {
              label: "Product B",
              data: [80, 90, 95, 105],
              backgroundColor: GENERIC_COLORS.primary[4] + "80",
              borderColor: GENERIC_COLORS.primary[4],
              borderWidth: 2,
            },
            {
              label: "Product C",
              data: [60, 70, 75, 85],
              backgroundColor: GENERIC_COLORS.primary[5] + "80",
              borderColor: GENERIC_COLORS.primary[5],
              borderWidth: 2,
            },
          ],
        };

      case "waterfall":
        return {
          labels: ["Start", "Sales", "Costs", "Marketing", "End"],
          datasets: [
            {
              label: "Waterfall",
              data: [100, 150, -50, -20, 180],
              backgroundColor: [
                GENERIC_COLORS.primary[0] + "80",
                GENERIC_COLORS.primary[1] + "80",
                GENERIC_COLORS.primary[2] + "80",
                GENERIC_COLORS.primary[3] + "80",
                GENERIC_COLORS.primary[4] + "80",
              ],
              borderColor: [
                GENERIC_COLORS.primary[0],
                GENERIC_COLORS.primary[1],
                GENERIC_COLORS.primary[2],
                GENERIC_COLORS.primary[3],
                GENERIC_COLORS.primary[4],
              ],
              borderWidth: 2,
            },
          ],
        };

      case "floating":
        return {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            {
              label: "Min Range",
              data: [20, 30, 25, 35, 30],
              backgroundColor: GENERIC_COLORS.primary[6] + "40",
              borderColor: GENERIC_COLORS.primary[6],
              borderWidth: 2,
            },
            {
              label: "Max Range",
              data: [80, 90, 85, 95, 90],
              backgroundColor: GENERIC_COLORS.primary[7] + "40",
              borderColor: GENERIC_COLORS.primary[7],
              borderWidth: 2,
            },
          ],
        };

      case "gradient":
        return {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Gradient Data",
              data: [40, 50, 45, 60],
              backgroundColor: GENERIC_COLORS.primary[0] + "80",
              borderColor: GENERIC_COLORS.primary[0],
              borderWidth: 2,
            },
          ],
        };

      case "animated":
        return {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [
            {
              label: "Animated Data",
              data: [25, 35, 30, 45, 40],
              backgroundColor: GENERIC_COLORS.primary[1] + "80",
              borderColor: GENERIC_COLORS.primary[1],
              borderWidth: 2,
            },
          ],
        };

      case "interactive":
        return {
          labels: ["Q1", "Q2", "Q3", "Q4"],
          datasets: [
            {
              label: "Interactive Data",
              data: [60, 70, 65, 75],
              backgroundColor: GENERIC_COLORS.primary[2] + "80",
              borderColor: GENERIC_COLORS.primary[2],
              borderWidth: 2,
            },
          ],
        };

      case "multiAxis":
        return {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            {
              label: "Revenue ($)",
              data: [10000, 15000, 12000, 18000, 20000],
              backgroundColor: GENERIC_COLORS.primary[3] + "80",
              borderColor: GENERIC_COLORS.primary[3],
              borderWidth: 2,
              yAxisID: "y",
            },
            {
              label: "Units Sold",
              data: [100, 150, 120, 180, 200],
              backgroundColor: GENERIC_COLORS.primary[4] + "80",
              borderColor: GENERIC_COLORS.primary[4],
              borderWidth: 2,
              yAxisID: "y1",
            },
          ],
        };

      default:
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Default",
              data: [10, 20, 15, 25, 20],
              backgroundColor: GENERIC_COLORS.primary[0] + "80",
              borderColor: GENERIC_COLORS.primary[0],
              borderWidth: 2,
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
        variant === "horizontal"
          ? {
              x: {
                beginAtZero: true,
                display: true,
                title: {
                  display: true,
                  text: "Value",
                },
              },
              y: {
                beginAtZero: true,
                display: true,
                title: {
                  display: true,
                  text: "Category",
                },
              },
            }
          : variant === "multiAxis"
            ? {
                x: {
                  display: true,
                  title: {
                    display: true,
                    text: "Month",
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
                    text: "Category",
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
    };

    return baseOptions;
  };

  const getVariantInfo = (variant: string) => {
    const variants = {
      basic: {
        title: "Basic Bar Chart",
        description: "Simple bar chart for category comparison with professional styling.",
      },
      horizontal: {
        title: "Horizontal Bar Chart",
        description: "Horizontal bars for better label readability and space efficiency.",
      },
      stacked: {
        title: "Stacked Bar Chart",
        description: "Stacked bars showing multiple data series with proper stacking.",
      },
      grouped: {
        title: "Grouped Bar Chart",
        description: "Grouped bars for side-by-side comparison of multiple categories.",
      },
      waterfall: {
        title: "Waterfall Bar Chart",
        description: "Show cumulative effect of sequential values with positive/negative bars.",
      },
      floating: {
        title: "Floating Bar Chart",
        description: "Bars floating between min and max values for range visualization.",
      },
      gradient: {
        title: "Gradient Bar Chart",
        description: "Bars with beautiful gradient fills for enhanced visual appeal.",
      },
      animated: {
        title: "Animated Bar Chart",
        description: "Smooth animations for bar transitions and engaging visualization.",
      },
      interactive: {
        title: "Interactive Bar Chart",
        description: "Interactive bars with hover effects and user engagement.",
      },
      multiAxis: {
        title: "Multi-Axis Bar Chart",
        description: "Multiple Y-axes for different data scales and comprehensive analysis.",
      },
    };
    return variants[variant as keyof typeof variants] || variants.basic;
  };

  const variantInfo = getVariantInfo(activeVariant);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Professional Bar Charts</h2>
        <p className="text-muted-foreground">Compare categories with horizontal or vertical bars</p>
      </div>

      <ResponsiveTabs
        tabs={barChartVariants}
        activeTab={activeVariant}
        onTabChange={setActiveVariant}
        className="mb-6"
      />

      <GenericChart
        title={variantInfo.title}
        description={variantInfo.description}
        data={getChartData(activeVariant)}
        options={getChartOptions(activeVariant)}
        type="bar"
        className="mb-6"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {barChartVariants.slice(0, 9).map((variant) => (
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
