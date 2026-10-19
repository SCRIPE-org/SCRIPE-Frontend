/**
 * Tenant Command Center Customization Types
 *
 * Strongly-typed domain contracts for configurable dashboard workspace (M11 + Overview Customization).
 * Supports responsive 12-column grid rearrangement, resizing, settings configuration, and persistence.
 */

export type TenantWidgetId =
  | "heroBanner"
  | "kpiCards"
  | "getStarted"
  | "products"
  | "usageGrid"
  | "activityCharts"
  | "needsAttention"
  | "quickActions"
  | "recentActivity"
  | "systemNotices"
  | "successPartner";

export type TenantWidgetCategory =
  | "overview"
  | "analytics"
  | "operations"
  | "productivity"
  | "people";

export type TenantWidgetColSpan = 3 | 4 | 6 | 8 | 12;

export interface TenantOverviewWidgetItem {
  /** Unique instance identifier, e.g. "hero-banner-1" */
  id: string;
  /** Canonical widget identifier from registry */
  widgetId: TenantWidgetId;
  /** Responsive 12-column grid span (3=1/4, 4=1/3, 6=1/2, 8=2/3, 12=Full) */
  colSpan: TenantWidgetColSpan;
  /** Optional custom title override set by admin */
  customTitle?: string;
  /** Optional widget-specific configuration properties */
  settings?: Record<string, unknown>;
  /** Whether the widget is visible on the canvas */
  visible: boolean;
}

export interface TenantOverviewLayout {
  /** Schema version for forward-compatibility */
  version: number;
  /** Ordered list of positioned widgets on the 12-column grid */
  widgets: TenantOverviewWidgetItem[];
}

export interface TenantWidgetDefinition {
  id: TenantWidgetId;
  titleKey: string;
  descriptionKey: string;
  category: TenantWidgetCategory;
  iconName: string;
  defaultColSpan: TenantWidgetColSpan;
  minColSpan: TenantWidgetColSpan;
  maxColSpan: TenantWidgetColSpan;
  /** Whether this widget can only be added once on the canvas */
  singleton: boolean;
  /** Optional permission required to view/add this widget */
  requiredPermission?: string;
  /** Optional module required (e.g. "venue", "academy") */
  requiredModule?: string;
  /** Supported settings capabilities */
  supportsCustomTitle?: boolean;
  supportsChartType?: boolean;
  supportsItemLimit?: boolean;
}
