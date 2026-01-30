"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";

// Simple heatmap component using CSS Grid
const HeatmapChart = ({ data, xLabels, yLabels, colors, title, description }: any) => {
  const maxValue = Math.max(...data.flat());
  const minValue = Math.min(...data.flat());
  
  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-2xl hover:shadow-3xl transition-all duration-300">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <CardDescription className="text-slate-300 text-base">
          {description}
        </CardDescription>
        <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors[0] }}></div>
            <span>Min: {minValue}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors[colors.length - 1] }}></div>
            <span>Max: {maxValue}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-inner">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${xLabels.length + 1}, 1fr)` }}>
            {/* Empty corner */}
            <div></div>
            
            {/* X Labels */}
            {xLabels.map((label: string, index: number) => (
              <div key={index} className="text-center text-xs text-slate-300 font-medium py-2 hover:text-white transition-colors duration-200">
                {label}
              </div>
            ))}
            
            {/* Y Labels and Data */}
            {yLabels.map((yLabel: string, yIndex: number) => (
              <React.Fragment key={yIndex}>
                {/* Y Label */}
                <div className="text-right text-xs text-slate-300 font-medium pr-2 flex items-center justify-end hover:text-white transition-colors duration-200">
                  {yLabel}
                </div>
                
                {/* Data Cells */}
                {data[yIndex].map((value: number, xIndex: number) => {
                  const intensity = (value - minValue) / (maxValue - minValue);
                  const colorIndex = Math.floor(intensity * (colors.length - 1));
                  const backgroundColor = colors[colorIndex] || colors[colors.length - 1];
                  
                  return (
                    <div
                      key={`${yIndex}-${xIndex}`}
                      className="aspect-square flex items-center justify-center text-xs font-medium rounded-sm transition-all duration-300 hover:scale-110 hover:z-10 cursor-pointer group relative"
                      style={{
                        backgroundColor: backgroundColor,
                        color: intensity > 0.5 ? "#ffffff" : "#000000",
                        minHeight: "40px",
                        boxShadow: intensity > 0.7 ? "0 0 10px rgba(255, 255, 255, 0.3)" : "none"
                      }}
                      title={`${yLabel} - ${xLabels[xIndex]}: ${value}`}
                    >
                      <span className="group-hover:scale-110 transition-transform duration-200">
                        {value}
                      </span>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm flex items-center justify-center">
                        <div className="text-white text-center p-2 bg-black/50 rounded">
                          <div className="font-bold text-sm">{value}</div>
                          <div className="text-xs">{yLabel} - {xLabels[xIndex]}</div>
                          <div className="text-xs opacity-75">
                            {((intensity * 100).toFixed(1))}% intensity
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400">Intensity:</span>
            {colors.map((color: string, index: number) => (
              <div
                key={index}
                className="w-4 h-4 rounded-sm border border-slate-600"
                style={{ backgroundColor: color }}
                title={`${Math.round((index / (colors.length - 1)) * 100)}% intensity`}
              ></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function ProfessionalHeatmapCharts() {
  const { t } = useI18n();

  const colors = [
    "#1e293b", "#334155", "#475569", "#64748b", "#94a3b8", 
    "#cbd5e1", "#e2e8f0", "#f1f5f9", "#f8fafc", "#ffffff"
  ];

  // Sample data for heatmaps
  const basicHeatmapData = [
    [5, 1, 0, 0, 0, 0, 0],
    [2, 3, 4, 1, 0, 0, 0],
    [0, 1, 2, 3, 4, 2, 1],
    [0, 0, 1, 2, 3, 4, 3],
    [0, 0, 0, 1, 2, 3, 4],
  ];

  const intensityHeatmapData = [
    [10, 8, 6, 4, 2, 0],
    [8, 10, 8, 6, 4, 2],
    [6, 8, 10, 8, 6, 4],
    [4, 6, 8, 10, 8, 6],
    [2, 4, 6, 8, 10, 8],
  ];

  const calendarHeatmapData = [
    [3, 5, 2, 4, 1, 0, 2],
    [2, 4, 6, 3, 5, 2, 4],
    [1, 3, 5, 7, 4, 6, 3],
    [0, 2, 4, 6, 8, 5, 7],
    [1, 3, 5, 4, 6, 8, 5],
  ];

  const correlationHeatmapData = [
    [1.0, 0.8, 0.6, 0.4, 0.2],
    [0.8, 1.0, 0.7, 0.5, 0.3],
    [0.6, 0.7, 1.0, 0.6, 0.4],
    [0.4, 0.5, 0.6, 1.0, 0.7],
    [0.2, 0.3, 0.4, 0.7, 1.0],
  ];

  const performanceHeatmapData = [
    [85, 90, 75, 80, 88],
    [78, 85, 92, 88, 82],
    [90, 88, 85, 92, 87],
    [82, 90, 88, 85, 91],
    [88, 85, 90, 87, 89],
  ];

  const timeSeriesHeatmapData = [
    [20, 25, 40, 30, 35, 45, 50],
    [15, 20, 35, 25, 30, 40, 45],
    [25, 30, 45, 35, 40, 50, 55],
    [30, 35, 50, 40, 45, 55, 60],
    [35, 40, 55, 45, 50, 60, 65],
  ];

  const geographicHeatmapData = [
    [60, 70, 80, 75, 65],
    [65, 75, 85, 80, 70],
    [70, 80, 90, 85, 75],
    [75, 85, 95, 90, 80],
    [80, 90, 100, 95, 85],
  ];

  return (
    <div className="space-y-8">
      <HeatmapChart
        data={basicHeatmapData}
        xLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        yLabels={["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]}
        colors={colors}
        title={t("charts.heatmap.basic.title")}
        description={t("charts.heatmap.basic.description")}
      />

      <HeatmapChart
        data={intensityHeatmapData}
        xLabels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
        yLabels={["Team A", "Team B", "Team C", "Team D", "Team E"]}
        colors={colors}
        title={t("charts.heatmap.intensity.title")}
        description={t("charts.heatmap.intensity.description")}
      />

      <HeatmapChart
        data={calendarHeatmapData}
        xLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        yLabels={["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]}
        colors={colors}
        title={t("charts.heatmap.calendar.title")}
        description={t("charts.heatmap.calendar.description")}
      />

      <HeatmapChart
        data={correlationHeatmapData}
        xLabels={["Sales", "Marketing", "Support", "Development", "HR"]}
        yLabels={["Sales", "Marketing", "Support", "Development", "HR"]}
        colors={colors}
        title={t("charts.heatmap.correlation.title")}
        description={t("charts.heatmap.correlation.description")}
      />

      <HeatmapChart
        data={performanceHeatmapData}
        xLabels={["Team A", "Team B", "Team C", "Team D", "Team E"]}
        yLabels={["Q1", "Q2", "Q3", "Q4", "Q5"]}
        colors={colors}
        title={t("charts.heatmap.performance.title")}
        description={t("charts.heatmap.performance.description")}
      />

      <HeatmapChart
        data={timeSeriesHeatmapData}
        xLabels={["00:00", "06:00", "12:00", "18:00", "24:00", "30:00", "36:00"]}
        yLabels={["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"]}
        colors={colors}
        title={t("charts.heatmap.timeSeries.title")}
        description={t("charts.heatmap.timeSeries.description")}
      />

      <HeatmapChart
        data={geographicHeatmapData}
        xLabels={["North", "South", "East", "West", "Center"]}
        yLabels={["Region A", "Region B", "Region C", "Region D", "Region E"]}
        colors={colors}
        title={t("charts.heatmap.geographic.title")}
        description={t("charts.heatmap.geographic.description")}
      />
    </div>
  );
}
