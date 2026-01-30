"use client";

import React, { useState } from "react";
import { ResponsiveTabs } from "@core/ui/responsive-tabs";
import { useI18n } from "@core/providers/i18n-provider";
import {
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Dot, 
  Radar, 
  Activity,
  Layers,
  Target,
  Zap,
  Sparkles,
  Clock,
  BarChart
} from "lucide-react";

// Import chart components
import { ProfessionalLineCharts } from "@core/ui/charts/line-charts";
import { ProfessionalAreaCharts } from "@core/ui/charts/area-charts";
import { ProfessionalBarCharts } from "@core/ui/charts/bar-charts";
import { ProfessionalPieCharts } from "@core/ui/charts/pie-charts";
import { ProfessionalScatterCharts } from "@core/ui/charts/scatter-charts";
import { ProfessionalRadarCharts } from "@core/ui/charts/radar-charts";
import { ProfessionalMixedCharts } from "@core/ui/charts/mixed-charts";
import { ProfessionalHeatmapCharts } from "@core/ui/charts/heatmap-charts";
import { ProfessionalTreemapCharts } from "@core/ui/charts/treemap-charts";
import { ProfessionalTimelineCharts } from "@core/ui/charts/timeline-charts";
import { ProfessionalFunnelCharts } from "@core/ui/charts/funnel-charts";
import { ProfessionalGaugeCharts } from "@core/ui/charts/gauge-charts";

const chartTypes = [
  { id: "line", label: "Line Charts", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "area", label: "Area Charts", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "bar", label: "Bar Charts", icon: <BarChart className="h-4 w-4" /> },
  { id: "pie", label: "Pie Charts", icon: <PieChart className="h-4 w-4" /> },
  { id: "scatter", label: "Scatter Charts", icon: <Dot className="h-4 w-4" /> },
  { id: "radar", label: "Radar Charts", icon: <Radar className="h-4 w-4" /> },
  { id: "mixed", label: "Mixed Charts", icon: <Layers className="h-4 w-4" /> },
  { id: "heatmap", label: "Heatmap Charts", icon: <Activity className="h-4 w-4" /> },
  { id: "treemap", label: "Treemap Charts", icon: <Target className="h-4 w-4" /> },
  { id: "timeline", label: "Timeline Charts", icon: <Clock className="h-4 w-4" /> },
  { id: "funnel", label: "Funnel Charts", icon: <Zap className="h-4 w-4" /> },
  { id: "gauge", label: "Gauge Charts", icon: <Sparkles className="h-4 w-4" /> },
];

export function ProfessionalChartsTab() {
  const { t } = useI18n();
  const [activeChartType, setActiveChartType] = useState("line");

  const renderChartComponent = () => {
    switch (activeChartType) {
      case "line":
        return <ProfessionalLineCharts />;
      case "area":
        return <ProfessionalAreaCharts />;
      case "bar":
        return <ProfessionalBarCharts />;
      case "pie":
        return <ProfessionalPieCharts />;
      case "scatter":
        return <ProfessionalScatterCharts />;
      case "radar":
        return <ProfessionalRadarCharts />;
      case "mixed":
        return <ProfessionalMixedCharts />;
      case "heatmap":
        return <ProfessionalHeatmapCharts />;
      case "treemap":
        return <ProfessionalTreemapCharts />;
      case "timeline":
        return <ProfessionalTimelineCharts />;
      case "funnel":
        return <ProfessionalFunnelCharts />;
      case "gauge":
        return <ProfessionalGaugeCharts />;
      default:
        return <ProfessionalLineCharts />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Professional Charts Collection
        </h1>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
          Enterprise-grade chart components with professional styling, smooth animations, and comprehensive interactivity
        </p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            {chartTypes.length} Chart Types
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            100+ Chart Variants
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Interactive & Responsive
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Professional Grade
          </span>
        </div>
      </div>

      <ResponsiveTabs
        tabs={chartTypes}
        activeTab={activeChartType}
        onTabChange={setActiveChartType}
        className="mb-8"
      />

      <div className="min-h-[600px]">
        {renderChartComponent()}
      </div>

      <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold">Chart Capabilities</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Our professional chart collection provides enterprise-grade visualization capabilities 
            perfect for complex business data analysis, reporting, and decision-making.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{chartTypes.length}</div>
              <div className="text-sm text-muted-foreground">Chart Types</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">100+</div>
              <div className="text-sm text-muted-foreground">Chart Variants</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-muted-foreground">Export Formats</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">∞</div>
              <div className="text-sm text-muted-foreground">Customizable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
