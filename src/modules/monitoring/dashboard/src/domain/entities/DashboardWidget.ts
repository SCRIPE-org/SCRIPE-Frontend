/**
 * DashboardWidget — Domain entity for the Dashboard Builder canvas (M11)
 *
 * Each widget placed on the dashboard builder canvas is a positioned block
 * on a 12-column CSS Grid. The builder serializes these into the
 * DashboardThemeJson alongside existing theme tokens.
 *
 * @module dashboard/domain
 */

// ── Widget Types ──────────────────────────────────────────
export type DashboardWidgetType =
  | "statsCard"
  | "chart"
  | "dataTable"
  | "quickActions"
  | "activityFeed"
  | "calendar"
  | "notifications"
  | "announcement"
  | "customWidget";

// ── Grid Alignment ────────────────────────────────────────
export type WidgetAlignment = "start" | "center" | "end" | "stretch";

// ── Dashboard Widget ──────────────────────────────────────
export interface DashboardWidget {
  /** Unique identifier */
  id: string;
  /** Widget type — determines which React component renders */
  type: DashboardWidgetType;
  /** CSS grid-column placement, e.g. "1 / 7" (columns 1-6 of 12) */
  gridColumn: string;
  /** CSS grid-row placement, e.g. "1 / 3" */
  gridRow: string;
  /** Horizontal alignment within grid cell */
  alignment: WidgetAlignment;
  /** Widget-specific configuration props */
  props: Record<string, unknown>;
  /** Z-index for layering */
  zIndex: number;
  /** Show/hide without deleting */
  visible: boolean;
}

// ── Builder Canvas Config ─────────────────────────────────
export interface DashboardBuilderCanvas {
  enabled: boolean;
  widgets: DashboardWidget[];
  gridRows: number;
}

// ── Widget Catalog Entry ──────────────────────────────────
export interface WidgetCatalogEntry {
  type: DashboardWidgetType;
  labelKey: string;
  icon: string;
  descriptionKey: string;
  defaultProps: Record<string, unknown>;
  defaultGridColumn: string;
  defaultGridRow: string;
  /** Whether this widget can only appear once */
  singleton: boolean;
  /** Minimum edition required (null = all editions) */
  requiredEdition: string | null;
}

// ── Widget Catalog ────────────────────────────────────────
export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  {
    type: "statsCard",
    labelKey: "dashboard.builder.widget.statsCard",
    icon: "TrendingUp",
    descriptionKey: "dashboard.builder.widget.statsCardDesc",
    defaultProps: {
      title: "Total Users",
      value: "2,450",
      trend: "+12.5%",
      trendDirection: "up",
      icon: "Users",
    },
    defaultGridColumn: "1 / 4",
    defaultGridRow: "auto",
    singleton: false,
    requiredEdition: null,
  },
  {
    type: "chart",
    labelKey: "dashboard.builder.widget.chart",
    icon: "BarChart3",
    descriptionKey: "dashboard.builder.widget.chartDesc",
    defaultProps: {
      chartType: "line",
      title: "Activity",
      showLegend: true,
      showGrid: true,
    },
    defaultGridColumn: "1 / 9",
    defaultGridRow: "auto",
    singleton: false,
    requiredEdition: null,
  },
  {
    type: "dataTable",
    labelKey: "dashboard.builder.widget.dataTable",
    icon: "Table2",
    descriptionKey: "dashboard.builder.widget.dataTableDesc",
    defaultProps: {
      title: "Recent Records",
      maxRows: 5,
      showSearch: false,
    },
    defaultGridColumn: "1 / 7",
    defaultGridRow: "auto",
    singleton: false,
    requiredEdition: null,
  },
  {
    type: "quickActions",
    labelKey: "dashboard.builder.widget.quickActions",
    icon: "Zap",
    descriptionKey: "dashboard.builder.widget.quickActionsDesc",
    defaultProps: {
      columns: 2,
      actions: ["Add User", "View Reports", "Settings", "Export"],
    },
    defaultGridColumn: "1 / 5",
    defaultGridRow: "auto",
    singleton: true,
    requiredEdition: null,
  },
  {
    type: "activityFeed",
    labelKey: "dashboard.builder.widget.activityFeed",
    icon: "Activity",
    descriptionKey: "dashboard.builder.widget.activityFeedDesc",
    defaultProps: {
      maxItems: 8,
      showTimestamps: true,
      title: "Recent Activity",
    },
    defaultGridColumn: "1 / 7",
    defaultGridRow: "auto",
    singleton: true,
    requiredEdition: null,
  },
  {
    type: "calendar",
    labelKey: "dashboard.builder.widget.calendar",
    icon: "CalendarDays",
    descriptionKey: "dashboard.builder.widget.calendarDesc",
    defaultProps: {
      showUpcoming: true,
      maxEvents: 5,
    },
    defaultGridColumn: "1 / 5",
    defaultGridRow: "auto",
    singleton: true,
    requiredEdition: null,
  },
  {
    type: "notifications",
    labelKey: "dashboard.builder.widget.notifications",
    icon: "Bell",
    descriptionKey: "dashboard.builder.widget.notificationsDesc",
    defaultProps: {
      maxItems: 5,
      showUnreadOnly: false,
    },
    defaultGridColumn: "1 / 5",
    defaultGridRow: "auto",
    singleton: true,
    requiredEdition: null,
  },
  {
    type: "announcement",
    labelKey: "dashboard.builder.widget.announcement",
    icon: "Megaphone",
    descriptionKey: "dashboard.builder.widget.announcementDesc",
    defaultProps: {
      title: "Announcement",
      message: "",
      variant: "info",
      dismissible: true,
    },
    defaultGridColumn: "1 / 13",
    defaultGridRow: "auto",
    singleton: false,
    requiredEdition: null,
  },
  {
    type: "customWidget",
    labelKey: "dashboard.builder.widget.customWidget",
    icon: "Code",
    descriptionKey: "dashboard.builder.widget.customWidgetDesc",
    defaultProps: {
      url: "",
      title: "Custom Widget",
      height: 300,
    },
    defaultGridColumn: "1 / 7",
    defaultGridRow: "auto",
    singleton: false,
    requiredEdition: "enterprise",
  },
];

// ── Default Builder Canvas ────────────────────────────────
export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: "default-stats-1",
    type: "statsCard",
    gridColumn: "1 / 4",
    gridRow: "1 / 2",
    alignment: "stretch",
    props: {
      title: "Total Users",
      value: "2,450",
      trend: "+12.5%",
      trendDirection: "up",
      icon: "Users",
    },
    zIndex: 1,
    visible: true,
  },
  {
    id: "default-stats-2",
    type: "statsCard",
    gridColumn: "4 / 7",
    gridRow: "1 / 2",
    alignment: "stretch",
    props: {
      title: "Active Sessions",
      value: "342",
      trend: "+5.2%",
      trendDirection: "up",
      icon: "Activity",
    },
    zIndex: 1,
    visible: true,
  },
  {
    id: "default-stats-3",
    type: "statsCard",
    gridColumn: "7 / 10",
    gridRow: "1 / 2",
    alignment: "stretch",
    props: {
      title: "Total Roles",
      value: "18",
      trend: "0%",
      trendDirection: "neutral",
      icon: "Shield",
    },
    zIndex: 1,
    visible: true,
  },
  {
    id: "default-stats-4",
    type: "statsCard",
    gridColumn: "10 / 13",
    gridRow: "1 / 2",
    alignment: "stretch",
    props: { title: "Tenants", value: "7", trend: "+2", trendDirection: "up", icon: "Building2" },
    zIndex: 1,
    visible: true,
  },
  {
    id: "default-chart",
    type: "chart",
    gridColumn: "1 / 9",
    gridRow: "2 / 4",
    alignment: "stretch",
    props: { chartType: "line", title: "Login Activity", showLegend: true, showGrid: true },
    zIndex: 1,
    visible: true,
  },
  {
    id: "default-activity",
    type: "activityFeed",
    gridColumn: "9 / 13",
    gridRow: "2 / 4",
    alignment: "stretch",
    props: { maxItems: 8, showTimestamps: true, title: "Recent Activity" },
    zIndex: 1,
    visible: true,
  },
];

export const DEFAULT_BUILDER_GRID_ROWS = 6;

export const DEFAULT_BUILDER_CANVAS: DashboardBuilderCanvas = {
  enabled: false,
  widgets: DEFAULT_DASHBOARD_WIDGETS,
  gridRows: DEFAULT_BUILDER_GRID_ROWS,
};

// ── Helpers ───────────────────────────────────────────────

export function generateWidgetId(): string {
  return `wgt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function findNextAvailableRow(widgets: DashboardWidget[]): number {
  if (widgets.length === 0) return 1;
  let maxRow = 1;
  for (const w of widgets) {
    const match = w.gridRow.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      maxRow = Math.max(maxRow, parseInt(match[2], 10));
    }
  }
  return maxRow;
}

export function hasSingletonWidget(widgets: DashboardWidget[], type: DashboardWidgetType): boolean {
  return widgets.some((w) => w.type === type);
}

export function getWidgetCatalogEntry(type: DashboardWidgetType): WidgetCatalogEntry | undefined {
  return WIDGET_CATALOG.find((c) => c.type === type);
}
