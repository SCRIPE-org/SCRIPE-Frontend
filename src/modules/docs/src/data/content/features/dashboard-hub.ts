import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/dashboard-hub",
  titleKey: "features.dashboardHub.title",
  category: "features",
  order: 20,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardHub.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph LR\n    hub([\"DashboardView (Tabbed Hub)\"])\n    overview[\"Overview Tab\"]\n    audit([\"Audit Tab\"])\n    security{{\"Security Tab\"}}\n    analytics([\"Analytics Tab\"])\n    hub -->|\"Inline\"| overview\n    hub -->|\"Lazy-load\"| audit\n    hub -->|\"Lazy-load\"| security\n    hub -->|\"Lazy-load\"| analytics",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "features.dashboardHub.section_5_hdr_0",
      "features.dashboardHub.section_5_hdr_1",
      "features.dashboardHub.section_5_hdr_2",
      "features.dashboardHub.section_5_hdr_3"
    ],
    "rows": [
      [
        "features.dashboardHub.section_5_cell_0_0",
        "features.dashboardHub.section_5_cell_0_1",
        "features.dashboardHub.section_5_cell_0_2",
        "features.dashboardHub.section_5_cell_0_3"
      ],
      [
        "features.dashboardHub.section_5_cell_1_0",
        "features.dashboardHub.section_5_cell_1_1",
        "features.dashboardHub.section_5_cell_1_2",
        "features.dashboardHub.section_5_cell_1_3"
      ],
      [
        "features.dashboardHub.section_5_cell_2_0",
        "features.dashboardHub.section_5_cell_2_1",
        "features.dashboardHub.section_5_cell_2_2",
        "features.dashboardHub.section_5_cell_2_3"
      ],
      [
        "features.dashboardHub.section_5_cell_3_0",
        "features.dashboardHub.section_5_cell_3_1",
        "features.dashboardHub.section_5_cell_3_2",
        "features.dashboardHub.section_5_cell_3_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "features.dashboardHub.section_6_title",
    "contentKey": "features.dashboardHub.section_6_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardHub.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_8_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    before{{\"Before: DashboardRepository (God Interface — 8 methods)\"}}\n    after_dash([\"After: DashboardRepository (4 overview methods)\"])\n    after_audit([\"After: AuditRepository (5 audit methods)\"])\n    after_sec([\"After: SecurityRepository (4 security methods)\"])\n    after_analytics([\"After: AnalyticsRepository (3 analytics methods)\"])\n    before -->|\"Slimmed\"| after_dash\n    before -->|\"Extracted\"| after_audit\n    before -->|\"Extracted\"| after_sec\n    before -->|\"Extracted\"| after_analytics",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "features.dashboardHub.section_10_hdr_0",
      "features.dashboardHub.section_10_hdr_1",
      "features.dashboardHub.section_10_hdr_2",
      "features.dashboardHub.section_10_hdr_3"
    ],
    "rows": [
      [
        "features.dashboardHub.section_10_cell_0_0",
        "features.dashboardHub.section_10_cell_0_1",
        "features.dashboardHub.section_10_cell_0_2",
        "features.dashboardHub.section_10_cell_0_3"
      ],
      [
        "features.dashboardHub.section_10_cell_1_0",
        "features.dashboardHub.section_10_cell_1_1",
        "features.dashboardHub.section_10_cell_1_2",
        "features.dashboardHub.section_10_cell_1_3"
      ],
      [
        "features.dashboardHub.section_10_cell_2_0",
        "features.dashboardHub.section_10_cell_2_1",
        "features.dashboardHub.section_10_cell_2_2",
        "features.dashboardHub.section_10_cell_2_3"
      ],
      [
        "features.dashboardHub.section_10_cell_3_0",
        "features.dashboardHub.section_10_cell_3_1",
        "features.dashboardHub.section_10_cell_3_2",
        "features.dashboardHub.section_10_cell_3_3"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.dashboardHub.section_11_title",
    "contentKey": "features.dashboardHub.section_11_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardHub.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_13_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_14_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "modules/system/{audit|security|analytics}/\n├── src/\n│   ├── domain/\n│   │   ├── entities/     # Rich domain entity classes (getters + computed)\n│   │   └── interfaces/   # IService + IRepository contracts\n│   ├── data/\n│   │   ├── models/       # Raw DTO types (match backend responses)\n│   │   ├── mappers/      # DTO ↔ Entity static converters\n│   │   ├── services/     # HTTP API calls (via IApiService)\n│   │   └── repositories/ # Wraps service → returns domain entities\n│   └── presentation/\n│       ├── viewmodels/   # React hooks (TanStack Query + repository)\n│       ├── views/        # Full-page view components\n│       └── components/   # Reusable UI components",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "features.dashboardHub.section_16_hdr_0",
      "features.dashboardHub.section_16_hdr_1",
      "features.dashboardHub.section_16_hdr_2",
      "features.dashboardHub.section_16_hdr_3"
    ],
    "rows": [
      [
        "features.dashboardHub.section_16_cell_0_0",
        "features.dashboardHub.section_16_cell_0_1",
        "features.dashboardHub.section_16_cell_0_2",
        "features.dashboardHub.section_16_cell_0_3"
      ],
      [
        "features.dashboardHub.section_16_cell_1_0",
        "features.dashboardHub.section_16_cell_1_1",
        "features.dashboardHub.section_16_cell_1_2",
        "features.dashboardHub.section_16_cell_1_3"
      ],
      [
        "features.dashboardHub.section_16_cell_2_0",
        "features.dashboardHub.section_16_cell_2_1",
        "features.dashboardHub.section_16_cell_2_2",
        "features.dashboardHub.section_16_cell_2_3"
      ],
      [
        "features.dashboardHub.section_16_cell_3_0",
        "features.dashboardHub.section_16_cell_3_1",
        "features.dashboardHub.section_16_cell_3_2",
        "features.dashboardHub.section_16_cell_3_3"
      ],
      [
        "features.dashboardHub.section_16_cell_4_0",
        "features.dashboardHub.section_16_cell_4_1",
        "features.dashboardHub.section_16_cell_4_2",
        "features.dashboardHub.section_16_cell_4_3"
      ],
      [
        "features.dashboardHub.section_16_cell_5_0",
        "features.dashboardHub.section_16_cell_5_1",
        "features.dashboardHub.section_16_cell_5_2",
        "features.dashboardHub.section_16_cell_5_3"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardHub.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_18_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_19_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "export interface SystemContainer {\n  // ... existing repositories ...\n  auditRepository: IAuditRepository;\n  securityRepository: ISecurityRepository;\n  analyticsRepository: IAnalyticsRepository;\n}\n\nfunction getSystemContainer(): SystemContainer {\n  const apiService = getModuleApiService(\"IDENTITY\");\n  const auditService = new AuditService(apiService);\n  const securityService = new SecurityService(apiService);\n  const analyticsService = new AnalyticsService(apiService);\n\n  return {\n    auditRepository: new AuditRepository(auditService),\n    securityRepository: new SecurityRepository(securityService),\n    analyticsRepository: new AnalyticsRepository(analyticsService),\n  };\n}\n\n// Lazy getters\nexport const systemContainer = {\n  get auditRepository() { return getSystemContainer().auditRepository; },\n  get securityRepository() { return getSystemContainer().securityRepository; },\n  get analyticsRepository() { return getSystemContainer().analyticsRepository; },\n};",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "features.dashboardHub.section_21_title",
    "contentKey": "features.dashboardHub.section_21_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardHub.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_23_content"
  },
  {
    "type": "table",
    "headers": [
      "features.dashboardHub.section_24_hdr_0",
      "features.dashboardHub.section_24_hdr_1",
      "features.dashboardHub.section_24_hdr_2"
    ],
    "rows": [
      [
        "features.dashboardHub.section_24_cell_0_0",
        "features.dashboardHub.section_24_cell_0_1",
        "features.dashboardHub.section_24_cell_0_2"
      ],
      [
        "features.dashboardHub.section_24_cell_1_0",
        "features.dashboardHub.section_24_cell_1_1",
        "features.dashboardHub.section_24_cell_1_2"
      ],
      [
        "features.dashboardHub.section_24_cell_2_0",
        "features.dashboardHub.section_24_cell_2_1",
        "features.dashboardHub.section_24_cell_2_2"
      ],
      [
        "features.dashboardHub.section_24_cell_3_0",
        "features.dashboardHub.section_24_cell_3_1",
        "features.dashboardHub.section_24_cell_3_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_25_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "\"use client\";\nimport { systemContainer } from \"@modules/system/di\";\nimport { useQuery } from \"@tanstack/react-query\";\n\nexport function useAuditViewModel(tenantId: string) {\n  const { auditRepository } = systemContainer;\n\n  const logsQuery = useQuery({\n    queryKey: [\"audit-logs\", tenantId, page, pageSize],\n    queryFn: () => auditRepository.getLogs(tenantId, params),\n  });\n\n  // ... domain-specific audit logic\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardHub.section_27_title",
    "id": "sec_27"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_28_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_29_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "const AuditView = lazy(() => import(\"../../audit/.../AuditView\"));\nconst SecurityView = lazy(() => import(\"../../security/.../SecurityDashboardView\"));\nconst AnalyticsView = lazy(() => import(\"../../analytics/.../TenantAnalyticsView\"));\n\nfunction DashboardView() {\n  const [activeTab, setActiveTab] = useState(\"overview\");\n  const canViewAudit = usePermission(\"audit_logs.view\");\n  const canViewSecurity = usePermission(\"security.view\");\n\n  return (\n    <Tabs value={activeTab} onValueChange={setActiveTab}>\n      <TabsList>\n        <TabsTrigger value=\"overview\">{t(\"dashboard.tabs.overview\")}</TabsTrigger>\n        {canViewAudit && <TabsTrigger value=\"audit\">{t(\"dashboard.tabs.audit\")}</TabsTrigger>}\n        {canViewSecurity && <TabsTrigger value=\"security\">{t(\"dashboard.tabs.security\")}</TabsTrigger>}\n        <TabsTrigger value=\"analytics\">{t(\"dashboard.tabs.analytics\")}</TabsTrigger>\n      </TabsList>\n\n      <TabsContent value=\"overview\"><OverviewContent /></TabsContent>\n      <TabsContent value=\"audit\"><Suspense fallback={<Skeleton />}><AuditView /></Suspense></TabsContent>\n      <TabsContent value=\"security\"><Suspense fallback={<Skeleton />}><SecurityView /></Suspense></TabsContent>\n      <TabsContent value=\"analytics\"><Suspense fallback={<Skeleton />}><AnalyticsView /></Suspense></TabsContent>\n    </Tabs>\n  );\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "features.dashboardHub.section_31_title",
    "contentKey": "features.dashboardHub.section_31_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardHub.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_33_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_34_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// CORRECT — query keys include tenantId for cache isolation\nqueryKey: [\"audit-logs\", tenantId, page, pageSize, filters]\nqueryKey: [\"security-events\", tenantId, severity]\nqueryKey: [\"analytics-summary\", tenantId, dateRange]\n\n// WRONG — missing tenantId causes cross-tenant cache pollution\nqueryKey: [\"audit-logs\", page, pageSize]",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardHub.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_37_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_38_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// Backward-compatible aliases for legacy components\n/** @deprecated Use AuditLogPage from audit/domain/entities */\nexport type AuditLogPage = import(\"../../audit/...\").AuditLogPage;\n\n/** @deprecated Use BlockedIP from security/domain/entities */\nexport type BlockedIPSummary = import(\"../../security/...\").BlockedIP;\n\n/** @deprecated Use ComparisonDataPoint from analytics/domain/entities */\nexport type LoginActivityPoint = import(\"../../analytics/...\").ComparisonDataPoint;",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.dashboardHub.section_40_title",
    "contentKey": "features.dashboardHub.section_40_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardHub.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_42_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.dashboardHub.section_43_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "Hub:\n  modules/system/dashboard/src/presentation/views/DashboardView.tsx\n\nAudit Module:\n  modules/system/audit/src/domain/entities/AuditEntities.ts\n  modules/system/audit/src/domain/interfaces/IAuditRepository.ts\n  modules/system/audit/src/data/services/AuditService.ts\n  modules/system/audit/src/data/repositories/AuditRepository.ts\n  modules/system/audit/src/data/mappers/AuditMapper.ts\n  modules/system/audit/src/data/models/AuditModels.ts\n\nSecurity Module:\n  modules/system/security/src/domain/entities/SecurityEntities.ts\n  modules/system/security/src/domain/interfaces/ISecurityRepository.ts\n  modules/system/security/src/data/services/SecurityService.ts\n  modules/system/security/src/data/repositories/SecurityRepository.ts\n\nAnalytics Module:\n  modules/system/analytics/src/domain/entities/AnalyticsEntities.ts\n  modules/system/analytics/src/domain/interfaces/IAnalyticsRepository.ts\n  modules/system/analytics/src/data/services/AnalyticsService.ts\n  modules/system/analytics/src/data/repositories/AnalyticsRepository.ts\n\nDI Container:\n  modules/system/di.ts\n\nLocales:\n  modules/system/dashboard/locales/dashboard.en.ts\n  modules/system/dashboard/locales/dashboard.ar.ts",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.dashboardHub.section_45_title",
    "id": "sec_45"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.dashboardHub.section_46_item_0",
      "features.dashboardHub.section_46_item_1",
      "features.dashboardHub.section_46_item_2"
    ]
  }
],
  relatedSlugs: [
  "features/dashboard-builder",
  "features/audit-system",
  "infrastructure/audit-trail"
],
  lastUpdated: "2026-06-09",
});
