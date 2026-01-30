"use client";

import React from "react";
import { GenericChart } from "./generic-chart";
import { useI18n } from "@core/providers/i18n-provider";

export function ProfessionalGaugeCharts() {
  const { t } = useI18n();

  // Helper to create gauge-like doughnut chart config
  const createGaugeConfig = (
    value: number,
    maxValue: number,
    titleKey: string,
    descriptionKey: string,
    color: string,
    segments: Array<{from: number, to: number, color: string, label: string}> = []
  ) => {
    const percentage = (value / maxValue) * 100;
    const remaining = 100 - percentage;
    
    // Create gradient colors for segments
    const segmentColors = segments.length > 0 
      ? segments.map(seg => seg.color)
      : [color, "rgba(255, 255, 255, 0.1)"];
    
    return {
      title: t(titleKey),
      description: t(descriptionKey),
      data: {
        labels: ["Completed", "Remaining"],
        datasets: [
          {
            label: t("charts.common.value"),
            data: [percentage, remaining],
            backgroundColor: segmentColors,
            borderColor: segmentColors.map(c => c.replace('0.1', '0.3')),
            borderWidth: 2,
            cutout: "75%",
            hoverOffset: 10,
            hoverBorderWidth: 3,
          },
        ],
      },
      options: {
        rotation: 270, // Start at 12 o'clock
        circumference: 180, // Half circle
        responsive: true,
        maintainAspectRatio: false,
         animation: {
           animateRotate: true,
           animateScale: true,
           duration: 2000,
           easing: 'easeOutQuart' as const
         },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: color,
            borderWidth: 2,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: function(context: any) {
                return t(titleKey);
              },
              label: function(context: any) {
                const value = context.parsed;
                const label = context.dataset.label || '';
                return `${label}: ${value.toFixed(1)}% (${Math.round((value / 100) * maxValue)}/${maxValue})`;
              },
              afterLabel: function(context: any) {
                if (segments.length > 0) {
                  const currentSegment = segments.find(seg => 
                    percentage >= seg.from && percentage <= seg.to
                  );
                  return currentSegment ? `Status: ${currentSegment.label}` : '';
                }
                return '';
              }
            }
          }
        },
        elements: {
          arc: {
            borderWidth: 2,
            hoverBorderWidth: 4,
          },
        },
        interaction: {
          intersect: false,
          mode: 'index' as const
        }
      },
      type: "doughnut" as const,
    };
  };

  // Define segments for different gauge types
  const performanceSegments = [
    { from: 0, to: 25, color: "#ef4444", label: "Poor" },
    { from: 25, to: 50, color: "#f97316", label: "Fair" },
    { from: 50, to: 75, color: "#eab308", label: "Good" },
    { from: 75, to: 100, color: "#22c55e", label: "Excellent" }
  ];

  const kpiSegments = [
    { from: 0, to: 40, color: "#ef4444", label: "Below Target" },
    { from: 40, to: 70, color: "#f97316", label: "Near Target" },
    { from: 70, to: 90, color: "#eab308", label: "Good" },
    { from: 90, to: 100, color: "#22c55e", label: "Excellent" }
  ];

  const progressSegments = [
    { from: 0, to: 20, color: "#ef4444", label: "Not Started" },
    { from: 20, to: 50, color: "#f97316", label: "In Progress" },
    { from: 50, to: 80, color: "#eab308", label: "Almost Done" },
    { from: 80, to: 100, color: "#22c55e", label: "Complete" }
  ];

  const qualitySegments = [
    { from: 0, to: 30, color: "#ef4444", label: "Poor Quality" },
    { from: 30, to: 60, color: "#f97316", label: "Fair Quality" },
    { from: 60, to: 80, color: "#eab308", label: "Good Quality" },
    { from: 80, to: 100, color: "#22c55e", label: "Excellent Quality" }
  ];

  const healthSegments = [
    { from: 0, to: 25, color: "#ef4444", label: "Critical" },
    { from: 25, to: 50, color: "#f97316", label: "Warning" },
    { from: 50, to: 75, color: "#eab308", label: "Good" },
    { from: 75, to: 100, color: "#22c55e", label: "Healthy" }
  ];

  const scoreSegments = [
    { from: 0, to: 30, color: "#ef4444", label: "Failing" },
    { from: 30, to: 60, color: "#f97316", label: "Passing" },
    { from: 60, to: 80, color: "#eab308", label: "Good" },
    { from: 80, to: 100, color: "#22c55e", label: "Excellent" }
  ];

  const capacitySegments = [
    { from: 0, to: 30, color: "#ef4444", label: "Low Usage" },
    { from: 30, to: 60, color: "#f97316", label: "Medium Usage" },
    { from: 60, to: 80, color: "#eab308", label: "High Usage" },
    { from: 80, to: 100, color: "#22c55e", label: "Full Capacity" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <GenericChart
        {...createGaugeConfig(75, 100, "charts.gauge.basic.title", "charts.gauge.basic.description", "#3b82f6", performanceSegments)}
        filterable={false}
        height={350}
        exportable={true}
        resizable={true}
      />
      
      <GenericChart
        {...createGaugeConfig(65, 100, "charts.gauge.multi.title", "charts.gauge.multi.description", "#10b981", performanceSegments)}
        filterable={false}
        height={350}
        exportable={true}
        resizable={true}
      />
      
      <GenericChart
        {...createGaugeConfig(85, 100, "charts.gauge.kpi.title", "charts.gauge.kpi.description", "#8b5cf6", kpiSegments)}
        filterable={false}
        height={350}
        exportable={true}
        resizable={true}
      />
      
      <GenericChart
        {...createGaugeConfig(60, 100, "charts.gauge.progress.title", "charts.gauge.progress.description", "#f59e0b", progressSegments)}
        filterable={false}
        height={350}
        exportable={true}
        resizable={true}
      />
      
      <GenericChart
        {...createGaugeConfig(90, 100, "charts.gauge.quality.title", "charts.gauge.quality.description", "#06b6d4", qualitySegments)}
        filterable={false}
        height={350}
        exportable={true}
        resizable={true}
      />
      
      <GenericChart
        {...createGaugeConfig(95, 100, "charts.gauge.health.title", "charts.gauge.health.description", "#22c55e", healthSegments)}
        filterable={false}
        height={350}
        exportable={true}
        resizable={true}
      />
      
      <GenericChart
        {...createGaugeConfig(78, 100, "charts.gauge.score.title", "charts.gauge.score.description", "#ec4899", scoreSegments)}
        filterable={false}
        height={350}
        exportable={true}
        resizable={true}
      />
      
      <GenericChart
        {...createGaugeConfig(70, 100, "charts.gauge.capacity.title", "charts.gauge.capacity.description", "#f97316", capacitySegments)}
        filterable={false}
        height={350}
        exportable={true}
        resizable={true}
      />
    </div>
  );
}
