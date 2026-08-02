/**
 * The Chart.js legacy corner of the chart system. The PRIMARY foundation
 * for new chart work is the Recharts layer in `@core/ui/chart`
 * (ChartContainer + the chartColor/--chart-1..8 palette helpers) — see
 * that file's header. The Professional*Charts demo gallery that used to
 * live here shipped ~3,800 lines and 246 colour literals to every visitor
 * of the settings showcase, its only consumer, and was deleted with it.
 *
 * Both corners now obey the same chrome law: hairline axes and grids, quiet
 * ink for every label, the series as the only loud mark, and no motion at
 * rest. GenericChart renders a designed state for loading, error and empty
 * rather than handing back a blank canvas.
 */
export { GenericChart, ChartUtils, GENERIC_COLORS, type GenericChartProps } from "./generic-chart";

// Tooltip primitives shared by hand-rolled (non-Recharts) chart layouts.
export {
  CustomChartTooltip,
  ChartPoint,
  ChartTooltipWrapper,
  HeatmapTooltip,
  type ChartPointProps,
} from "./chart-tooltip";
