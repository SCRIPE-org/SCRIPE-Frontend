export interface ChartData {
  name: string;
  [key: string]: string | number;
}

export interface BaseChartProps {
  className?: string;
  title?: string;
  description?: string;
  height?: number;
  showCard?: boolean;
}

// Generic props for components that accept single data prop
export interface GenericChartsProps extends BaseChartProps {
  data?: any[];
}

// Specific props for components with multiple data types
export interface AreaChartsProps extends BaseChartProps {
  basicData?: ChartData[];
  stackedData?: ChartData[];
}

export interface LineChartsProps extends BaseChartProps {
  basicData?: ChartData[];
  multiSeriesData?: ChartData[];
  curvedData?: ChartData[];
  steppedData?: ChartData[];
}

export interface ScatterBubbleChartsProps extends BaseChartProps {
  data?: Array<{ x: number; y: number; [key: string]: any }>;
  scatterData?: Array<{ x: number; y: number; [key: string]: any }>;
  bubbleData?: Array<{ x: number; y: number; z: number; [key: string]: any }>;
}

export interface MixedChartsProps extends BaseChartProps {
  data?: ChartData[];
  lineBarData?: ChartData[];
  dualAxisData?: Array<{ name: string; [key: string]: string | number }>;
  areaLineData?: ChartData[];
}

export interface HeatmapTreemapChartsProps extends BaseChartProps {
  data?: ChartData[];
  heatmapData1?: Array<{ x: number; y: number; value: number; label?: string }>;
  heatmapData2?: Array<{ x: number; y: number; value: number; label?: string }>;
  calendarData?: Array<{ date: string; value: number; count?: number; label?: string }>;
  hierarchicalData?: Array<{ name: string; size: number; children?: any[] }>;
  treemapData?: Array<{ name: string; size: number; fill?: string }>;
}

export interface TimelineFunnelChartsProps extends BaseChartProps {
  data?: ChartData[];
  conversionData?: Array<{ name: string; value: number; fill?: string }>;
  funnelData?: Array<{ name: string; value: number; fill?: string }>;
  salesData?: Array<{ name: string; value: number; fill?: string }>;
  salesFunnelData?: Array<{ name: string; value: number; fill?: string }>;
}

export interface PieChartProps extends BaseChartProps {
  data?: Array<{ name: string; value: number; fill?: string }>;
}

export interface BarChartsProps extends BaseChartProps {
  basicData?: ChartData[];
  stackedData?: ChartData[];
  multiColorData?: ChartData[];
  positiveNegativeData?: ChartData[];
}

export interface RadarGaugeChartsProps extends BaseChartProps {
  data?: any[];
}
