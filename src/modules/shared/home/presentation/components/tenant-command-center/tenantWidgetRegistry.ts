import type {
  TenantWidgetDefinition,
  TenantWidgetId,
  TenantOverviewLayout,
  TenantWidgetColSpan,
} from "./tenantCustomizationTypes";

/**
 * 12-Column Responsive Tailwind grid classes.
 * Static literal mapping ensures Tailwind does not purge classes.
 */
export const COL_SPAN_CLASSES: Record<TenantWidgetColSpan, string> = {
  3: "col-span-1 md:col-span-1 lg:col-span-3",
  4: "col-span-1 md:col-span-1 lg:col-span-4",
  6: "col-span-1 md:col-span-1 lg:col-span-6",
  8: "col-span-1 md:col-span-2 lg:col-span-8",
  12: "col-span-1 md:col-span-2 lg:col-span-12",
};

/**
 * Registry of all available widgets in the Tenant Command Center.
 * Every widget here connects directly to verified live tenant data sources.
 */
export const TENANT_WIDGET_REGISTRY: TenantWidgetDefinition[] = [
  {
    id: "heroBanner",
    titleKey: "tenantCommandCenter.widgets.heroBannerTitle",
    descriptionKey: "tenantCommandCenter.widgets.heroBannerDesc",
    category: "overview",
    iconName: "Sparkles",
    defaultColSpan: 12,
    minColSpan: 4,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
  },
  {
    id: "kpiCards",
    titleKey: "tenantCommandCenter.widgets.kpiCardsTitle",
    descriptionKey: "tenantCommandCenter.widgets.kpiCardsDesc",
    category: "overview",
    iconName: "TrendingUp",
    defaultColSpan: 12,
    minColSpan: 4,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
  },
  {
    id: "getStarted",
    titleKey: "tenantCommandCenter.widgets.getStartedTitle",
    descriptionKey: "tenantCommandCenter.widgets.getStartedDesc",
    category: "operations",
    iconName: "Compass",
    defaultColSpan: 8,
    minColSpan: 4,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
  },
  {
    id: "needsAttention",
    titleKey: "tenantCommandCenter.widgets.needsAttentionTitle",
    descriptionKey: "tenantCommandCenter.widgets.needsAttentionDesc",
    category: "operations",
    iconName: "AlertTriangle",
    defaultColSpan: 4,
    minColSpan: 3,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
  },
  {
    id: "products",
    titleKey: "tenantCommandCenter.widgets.productsTitle",
    descriptionKey: "tenantCommandCenter.widgets.productsDesc",
    category: "operations",
    iconName: "Layers",
    defaultColSpan: 8,
    minColSpan: 4,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
  },
  {
    id: "quickActions",
    titleKey: "tenantCommandCenter.widgets.quickActionsTitle",
    descriptionKey: "tenantCommandCenter.widgets.quickActionsDesc",
    category: "productivity",
    iconName: "Zap",
    defaultColSpan: 4,
    minColSpan: 3,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
  },
  {
    id: "usageGrid",
    titleKey: "tenantCommandCenter.widgets.usageGridTitle",
    descriptionKey: "tenantCommandCenter.widgets.usageGridDesc",
    category: "analytics",
    iconName: "PieChart",
    defaultColSpan: 8,
    minColSpan: 4,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
  },
  {
    id: "recentActivity",
    titleKey: "tenantCommandCenter.widgets.recentActivityTitle",
    descriptionKey: "tenantCommandCenter.widgets.recentActivityDesc",
    category: "operations",
    iconName: "History",
    defaultColSpan: 4,
    minColSpan: 3,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
  },
  {
    id: "activityCharts",
    titleKey: "tenantCommandCenter.widgets.activityChartsTitle",
    descriptionKey: "tenantCommandCenter.widgets.activityChartsDesc",
    category: "analytics",
    iconName: "BarChart3",
    defaultColSpan: 8,
    minColSpan: 4,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
    supportsChartType: true,
  },
  {
    id: "systemNotices",
    titleKey: "tenantCommandCenter.widgets.systemNoticesTitle",
    descriptionKey: "tenantCommandCenter.widgets.systemNoticesDesc",
    category: "overview",
    iconName: "Bell",
    defaultColSpan: 4,
    minColSpan: 3,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
  },
  {
    id: "successPartner",
    titleKey: "tenantCommandCenter.widgets.successPartnerTitle",
    descriptionKey: "tenantCommandCenter.widgets.successPartnerDesc",
    category: "people",
    iconName: "Headphones",
    defaultColSpan: 4,
    minColSpan: 3,
    maxColSpan: 12,
    singleton: true,
    supportsCustomTitle: true,
  },
];

/**
 * Standard Production Default Layout
 * Faithfully mirrors the pre-customization Tenant Command Center arrangement.
 */
export const DEFAULT_TENANT_OVERVIEW_LAYOUT: TenantOverviewLayout = {
  version: 1,
  widgets: [
    { id: "widget-hero", widgetId: "heroBanner", colSpan: 12, visible: true },
    { id: "widget-kpis", widgetId: "kpiCards", colSpan: 12, visible: true },
    { id: "widget-steps", widgetId: "getStarted", colSpan: 8, visible: true },
    { id: "widget-attention", widgetId: "needsAttention", colSpan: 4, visible: true },
    { id: "widget-products", widgetId: "products", colSpan: 8, visible: true },
    { id: "widget-actions", widgetId: "quickActions", colSpan: 4, visible: true },
    { id: "widget-usage", widgetId: "usageGrid", colSpan: 8, visible: true },
    { id: "widget-activity", widgetId: "recentActivity", colSpan: 4, visible: true },
    { id: "widget-charts", widgetId: "activityCharts", colSpan: 8, visible: true },
    { id: "widget-notices", widgetId: "systemNotices", colSpan: 4, visible: true },
    { id: "widget-partner", widgetId: "successPartner", colSpan: 4, visible: true },
  ],
};

/**
 * Look up widget definition by ID.
 */
export function getWidgetDefinition(widgetId: TenantWidgetId): TenantWidgetDefinition | undefined {
  return TENANT_WIDGET_REGISTRY.find((w) => w.id === widgetId);
}

/**
 * Clamp a column span to legal bounds for the widget.
 */
export function clampColSpan(widgetId: TenantWidgetId, span: number): TenantWidgetColSpan {
  const def = getWidgetDefinition(widgetId);
  if (!def) return 12;

  const validSpans: TenantWidgetColSpan[] = [3, 4, 6, 8, 12];
  const matchingSpan = validSpans.find((s) => s === span) ?? def.defaultColSpan;

  if (matchingSpan < def.minColSpan) return def.minColSpan;
  if (matchingSpan > def.maxColSpan) return def.maxColSpan;
  return matchingSpan;
}

/**
 * Estimated row span based on widget type, colSpan, and edit mode.
 * Provides accurate initial layout to prevent any SSR or hydration shift.
 */
export function getEstimatedRowSpan(
  widgetId: TenantWidgetId,
  colSpan: TenantWidgetColSpan,
  isEditing = false
): number {
  const editOffset = isEditing ? 3 : 0;

  switch (widgetId) {
    case "heroBanner":
      return (colSpan >= 12 ? 11 : colSpan >= 8 ? 13 : 16) + editOffset;
    case "kpiCards":
      return (colSpan >= 12 ? 10 : colSpan >= 8 ? 16 : 24) + editOffset;
    case "getStarted":
      return (colSpan >= 12 ? 16 : colSpan >= 8 ? 20 : 25) + editOffset;
    case "needsAttention":
      return (colSpan >= 12 ? 11 : colSpan >= 8 ? 13 : 17) + editOffset;
    case "products":
      return (colSpan >= 12 ? 15 : colSpan >= 8 ? 18 : 23) + editOffset;
    case "quickActions":
      return (colSpan >= 12 ? 7 : colSpan >= 8 ? 8 : 9) + editOffset;
    case "usageGrid":
      return (colSpan >= 12 ? 16 : colSpan >= 8 ? 18 : 24) + editOffset;
    case "recentActivity":
      return (colSpan >= 12 ? 13 : colSpan >= 8 ? 15 : 18) + editOffset;
    case "activityCharts":
      return (colSpan >= 12 ? 16 : colSpan >= 8 ? 18 : 22) + editOffset;
    case "systemNotices":
      return (colSpan >= 12 ? 12 : colSpan >= 8 ? 14 : 16) + editOffset;
    case "successPartner":
      return (colSpan >= 12 ? 11 : colSpan >= 8 ? 13 : 16) + editOffset;
    default:
      return 16 + editOffset;
  }
}

