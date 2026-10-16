// FILE-EXCEPTION: file length
/**
 * @file dashboard-hub.ts
 * @description Document page defining the tabbed dashboard hub features, data-segregated repositories, and SignalR real-time updates.
 * Contains page descriptions, diagrams, tables, and code snippets detailing system services.
 */

import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.dashboardHub.intro" },

  // ─── Hub-and-Spoke Architecture ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardHub.archTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.dashboardHub.archIntro" },
  {
    type: "flowchart",
    title: "Hub-and-Spoke Dashboard Architecture",
    direction: "horizontal",
    nodes: [
      { id: "hub", label: "DashboardView (Tabbed Hub)", type: "success" },
      { id: "overview", label: "Overview Tab", type: "default" },
      { id: "audit", label: "Audit Tab", type: "info" },
      { id: "security", label: "Security Tab", type: "warning" },
      { id: "analytics", label: "Analytics Tab", type: "info" },
    ],
    connections: [
      { from: "hub", to: "overview", label: "Inline" },
      { from: "hub", to: "audit", label: "Lazy-load" },
      { from: "hub", to: "security", label: "Lazy-load" },
      { from: "hub", to: "analytics", label: "Lazy-load" },
    ],
  },
  {
    type: "table",
    headers: ["Tab", "Module", "Load Strategy", "Permission Gate"],
    rows: [
      ["Overview", "dashboard", "Inline (always loaded)", "None (default tab)"],
      ["Audit", "audit", "React.lazy + Suspense", "audit_logs.view"],
      ["Security", "security", "React.lazy + Suspense", "security.view"],
      ["Analytics", "analytics", "React.lazy + Suspense", "None (visible to all)"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "features.dashboardHub.archTip",
  },

  // ─── Real-Time SignalR Cache Invalidation ─────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardHub.realtimeTitle",
    id: "realtime-signalr",
  },
  { type: "paragraph", contentKey: "features.dashboardHub.realtimeIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "useDashboardRealtime.ts",
    code: `"use client";
import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSignalR } from "@core/hooks/useSignalR";
import { HUB_EVENTS, HUB_METHODS } from "@core/common/constants/signalr";

/**
 * Documentation for module export
 */
export function useDashboardRealtime() {
  const queryClient = useQueryClient();
  const { connection, connectionState } = useSignalR();

  const handleAuditEvent = useCallback(() => {
    // Invalidate dashboard query cache to trigger automatic TanStack query refetching
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }, [queryClient]);

  useEffect(() => {
    if (!connection || connectionState !== "connected") return;

    // Listen for audit events broadcasted by the server
    connection.on(HUB_EVENTS.AUDIT_EVENT, handleAuditEvent);
    // Join tenant-scoped global notifications group
    connection.invoke(HUB_METHODS.JOIN_GLOBAL_GROUP).catch(() => {});

    return () => {
      connection.off(HUB_EVENTS.AUDIT_EVENT, handleAuditEvent);
      connection.invoke(HUB_METHODS.LEAVE_GLOBAL_GROUP).catch(() => {});
    };
  }, [connection, connectionState, handleAuditEvent]);

  return { connectionState };
}`,
  },

  // ─── Domain Segregation (ISP) ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardHub.domainTitle",
    id: "domain-segregation",
  },
  { type: "paragraph", contentKey: "features.dashboardHub.domainIntro" },
  {
    type: "flowchart",
    title: "Before vs After — Interface Segregation",
    direction: "vertical",
    nodes: [
      {
        id: "before",
        label: "Before: DashboardRepository (God Interface — 8 methods)",
        type: "warning",
      },
      {
        id: "after_dash",
        label: "After: DashboardRepository (4 overview methods)",
        type: "success",
      },
      { id: "after_audit", label: "After: AuditRepository (5 audit methods)", type: "success" },
      { id: "after_sec", label: "After: SecurityRepository (4 security methods)", type: "success" },
      {
        id: "after_analytics",
        label: "After: AnalyticsRepository (3 analytics methods)",
        type: "success",
      },
    ],
    connections: [
      { from: "before", to: "after_dash", label: "Slimmed" },
      { from: "before", to: "after_audit", label: "Extracted" },
      { from: "before", to: "after_sec", label: "Extracted" },
      { from: "before", to: "after_analytics", label: "Extracted" },
    ],
  },
  {
    type: "table",
    headers: ["Module", "Entities", "Interface", "Repository"],
    rows: [
      [
        "Audit",
        "AuditLogEntry, AuditLogDetail, AuditLogPage, AuditFilterParams, AuditAnalyticsSummary, TopAuditUser, ComplianceReport",
        "IAuditRepository",
        "AuditRepository",
      ],
      [
        "Security",
        "SecurityEvent, BlockedIP, LoginActivityPoint, SecurityChange",
        "ISecurityRepository",
        "SecurityRepository",
      ],
      [
        "Analytics",
        "AnalyticsSummary, DistributionData, ComparisonDataPoint",
        "IAnalyticsRepository",
        "AnalyticsRepository",
      ],
      [
        "Dashboard",
        "DashboardSummary, DashboardKPIs (overview only)",
        "IDashboardRepository",
        "DashboardRepository",
      ],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "features.dashboardHub.domainNote",
  },

  // ─── 6-Layer Clean Architecture ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardHub.layersTitle",
    id: "clean-architecture",
  },
  { type: "paragraph", contentKey: "features.dashboardHub.layersIntro" },
  {
    type: "code",
    language: "text",
    filename: "6-Layer Module Structure (per domain)",
    code: `modules/monitoring/{audit|security|analytics|dashboard}/
├── src/
│   ├── domain/
│   │   ├── entities/     # Rich domain entity classes (getters + computed)
│   │   └── interfaces/   # IService + IRepository contracts
│   ├── data/
│   │   ├── models/       # Raw DTO types (match backend responses)
│   │   ├── mappers/      # DTO ↔ Entity static converters
│   │   ├── services/     # HTTP API calls (via IApiService)
│   │   └── repositories/ # Wraps service → returns domain entities
│   └── presentation/
│       ├── viewmodels/   # React hooks (TanStack Query + repository)
│       ├── views/        # Full-page view components
│       └── components/   # Reusable UI components`,
  },
  {
    type: "table",
    headers: ["Layer", "Audit Module", "Security Module", "Analytics Module"],
    rows: [
      ["Models", "AuditModels.ts", "SecurityModels.ts", "AnalyticsModels.ts"],
      ["Entities", "AuditEntities.ts", "SecurityEntities.ts", "AnalyticsEntities.ts"],
      [
        "Interfaces",
        "IAuditRepository.ts, IAuditService.ts",
        "ISecurityRepository.ts, ISecurityService.ts",
        "IAnalyticsRepository.ts, IAnalyticsService.ts",
      ],
      ["Mapper", "AuditMapper.ts", "SecurityMapper.ts", "AnalyticsMapper.ts"],
      ["Service", "AuditService.ts", "SecurityService.ts", "AnalyticsService.ts"],
      ["Repository", "AuditRepository.ts", "SecurityRepository.ts", "AnalyticsRepository.ts"],
    ],
  },

  // ─── DI Container Wiring ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardHub.diTitle",
    id: "di-wiring",
  },
  { type: "paragraph", contentKey: "features.dashboardHub.diIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "modules/system/di.ts — SystemContainer Registration",
    code: `export interface SystemContainer {
  auditRepository: IAuditRepository;
  securityRepository: ISecurityRepository;
  analyticsRepository: IAnalyticsRepository;
}

function getSystemContainer(): SystemContainer {
  const apiService = getModuleApiService("IDENTITY");
  const auditService = new AuditService(apiService);
  const securityService = new SecurityService(apiService);
  const analyticsService = new AnalyticsService(apiService);

  return {
    auditRepository: new AuditRepository(auditService),
    securityRepository: new SecurityRepository(securityService),
    analyticsRepository: new AnalyticsRepository(analyticsService),
  };
}

/**
 * Documentation for module export
 */
export const systemContainer = {
  get auditRepository() { return getSystemContainer().auditRepository; },
  get securityRepository() { return getSystemContainer().securityRepository; },
  get analyticsRepository() { return getSystemContainer().analyticsRepository; },
};`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "features.dashboardHub.diTip",
  },

  // ─── ViewModel Decoupling ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardHub.viewmodelTitle",
    id: "viewmodel-decoupling",
  },
  { type: "paragraph", contentKey: "features.dashboardHub.viewmodelIntro" },
  {
    type: "table",
    headers: ["ViewModel", "Before (God Interface)", "After (Dedicated Repository)"],
    rows: [
      ["useAuditViewModel", "dashboardRepository.getAuditLogs()", "auditRepository.getLogs()"],
      [
        "useSecurityDashboardViewModel",
        "dashboardRepository.getSecurityEvents()",
        "securityRepository.getSecurityEvents()",
      ],
      [
        "useTenantAnalyticsViewModel",
        "dashboardRepository.getSummary()",
        "analyticsRepository.getSummary()",
      ],
      [
        "useDashboardViewModel",
        "8 methods (overview + audit + security)",
        "4 methods (overview only)",
      ],
    ],
  },
  {
    type: "code",
    language: "typescript",
    filename: "ViewModel Pattern — useAuditViewModel.ts",
    code:
      `"use client";\n` +
      `import { systemContainer } from "` +
      `@modules/system/di";\n` +
      `import { useQuery } from "@tanstack/react-query";\n\n` +
      `export function useAuditViewModel(tenantId: string) {\n` +
      `  const { auditRepository } = systemContainer;\n\n` +
      `  const logsQuery = useQuery({\n` +
      `    queryKey: ["audit-logs", tenantId, page, pageSize],\n` +
      `    queryFn: () => auditRepository.getLogs(tenantId, params),\n` +
      `  });\n\n` +
      `  // ... domain-specific audit logic\n` +
      `}`,
  },

  // ─── Tabbed Hub Implementation ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardHub.hubTitle",
    id: "tabbed-hub",
  },
  { type: "paragraph", contentKey: "features.dashboardHub.hubIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "DashboardView.tsx — Tabbed Hub with Lazy Loading",
    code: `const AuditView = lazy(() => import("../../audit/.../AuditView"));
const SecurityView = lazy(() => import("../../security/.../SecurityDashboardView"));
const AnalyticsView = lazy(() => import("../../analytics/.../TenantAnalyticsView"));

function DashboardView() {
  const [activeTab, setActiveTab] = useState("overview");
  const canViewAudit = usePermission("audit_logs.view");
  const canViewSecurity = usePermission("security.view");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">{t("dashboard.tabs.overview")}</TabsTrigger>
        {canViewAudit && <TabsTrigger value="audit">{t("dashboard.tabs.audit")}</TabsTrigger>}
        {canViewSecurity && <TabsTrigger value="security">{t("dashboard.tabs.security")}</TabsTrigger>}
        <TabsTrigger value="analytics">{t("dashboard.tabs.analytics")}</TabsTrigger>
      </TabsList>

      <TabsContent value="overview"><OverviewContent /></TabsContent>
      <TabsContent value="audit"><Suspense fallback={<Skeleton />}><AuditView /></Suspense></TabsContent>
      <TabsContent value="security"><Suspense fallback={<Skeleton />}><SecurityView /></Suspense></TabsContent>
      <TabsContent value="analytics"><Suspense fallback={<Skeleton />}><AnalyticsView /></Suspense></TabsContent>
    </Tabs>
  );
}`,
  },
  {
    type: "info",
    variant: "note",
    contentKey: "features.dashboardHub.hubNote",
  },

  // ─── Tenant-Aware Caching ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardHub.cachingTitle",
    id: "caching",
  },
  { type: "paragraph", contentKey: "features.dashboardHub.cachingIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "Tenant-Partitioned Query Keys",
    code: `// CORRECT — query keys include tenantId for cache isolation
queryKey: ["audit-logs", tenantId, page, pageSize, filters]
queryKey: ["security-events", tenantId, severity]
queryKey: ["analytics-summary", tenantId, dateRange]

// WRONG — missing tenantId causes cross-tenant cache pollution
queryKey: ["audit-logs", page, pageSize]`,
  },

  // ─── Backward Compatibility ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardHub.compatTitle",
    id: "backward-compatibility",
  },
  { type: "paragraph", contentKey: "features.dashboardHub.compatIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "DashboardEntities.ts — Deprecated Aliases",
    code: `// Backward-compatible aliases for legacy components
/** @deprecated Use AuditLogPage from audit/domain/entities */
export type AuditLogPage = import("../../audit/...").AuditLogPage;

/** @deprecated Use BlockedIP from security/domain/entities */
export type BlockedIPSummary = import("../../security/...").BlockedIP;

/** @deprecated Use ComparisonDataPoint from analytics/domain/entities */
export type LoginActivityPoint = import("../../analytics/...").ComparisonDataPoint;`,
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "features.dashboardHub.compatWarning",
  },

  // ─── Source File Reference ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardHub.sourceTitle",
    id: "source-files",
  },
  { type: "paragraph", contentKey: "features.dashboardHub.sourceIntro" },
  {
    type: "code",
    language: "text",
    filename: "Source File Map",
    code: `Hub:
  modules/monitoring/dashboard/src/presentation/views/DashboardView.tsx

Audit Module:
  modules/monitoring/audit/src/domain/entities/AuditEntities.ts
  modules/monitoring/audit/src/domain/interfaces/IAuditRepository.ts
  modules/monitoring/audit/src/data/services/AuditService.ts
  modules/monitoring/audit/src/data/repositories/AuditRepository.ts
  modules/monitoring/audit/src/data/mappers/AuditMapper.ts
  modules/monitoring/audit/src/data/models/AuditModels.ts

Security Module:
  modules/monitoring/security/src/domain/entities/SecurityEntities.ts
  modules/monitoring/security/src/domain/interfaces/ISecurityRepository.ts
  modules/monitoring/security/src/data/services/SecurityService.ts
  modules/monitoring/security/src/data/repositories/SecurityRepository.ts

Analytics Module:
  modules/monitoring/analytics/src/domain/entities/AnalyticsEntities.ts
  modules/monitoring/analytics/src/domain/interfaces/IAnalyticsRepository.ts
  modules/monitoring/analytics/src/data/services/AnalyticsService.ts
  modules/monitoring/analytics/src/data/repositories/AnalyticsRepository.ts

DI Container:
  modules/system/di.ts

Locales:
  modules/monitoring/dashboard/locales/dashboard.en.ts
  modules/monitoring/dashboard/locales/dashboard.ar.ts`,
  },
];

registerPage({
  slug: "features/dashboard-hub",
  titleKey: "features.dashboardHub.title",
  descriptionKey: "features.dashboardHub.description",
  category: "features",
  order: 20,
  sections,
  relatedSlugs: [
    "features/dashboard-builder",
    "features/audit-system",
    "infrastructure/audit-trail",
  ],
  lastUpdated: "2026-06-28",
});
