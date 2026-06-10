import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.realTimeCapabilities.intro" },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.realTimeCapabilities.signalrTitle",
    id: "signalr",
  },
  { type: "paragraph", contentKey: "commercial.realTimeCapabilities.signalrContent" },
  {
    type: "code",
    language: "text",
    filename: "SignalR Real-Time Architecture",
    code: `┌──────────────────────────────────────────────────────┐
│                  SignalR Hub Layer                    │
│                                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │Notification│ │   Audit    │ │  Dashboard │      │
│  │    Hub     │ │    Hub     │ │    Hub     │      │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘      │
│        │              │              │               │
│        └──────────────┼──────────────┘               │
│                       │                              │
│  ┌────────────────────▼──────────────────────┐      │
│  │       Tenant-Scoped Group Management      │      │
│  │  Users auto-join tenant group on connect  │      │
│  └───────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────┘
           │              │              │
     ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
     │  Browser  │ │  Mobile   │ │  Desktop  │
     │  Client   │ │  Client   │ │  Client   │
     └───────────┘ └───────────┘ └───────────┘`,
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.realTimeCapabilities.notificationsTitle",
    id: "notifications",
  },
  { type: "paragraph", contentKey: "commercial.realTimeCapabilities.notificationsContent" },
  {
    type: "table",
    headers: ["Feature", "Description"],
    rows: [
      ["Push notifications", "Instant delivery via WebSocket — no polling required"],
      ["Tenant isolation", "Users only receive notifications for their tenant"],
      ["Mark read/unread", "Individual or bulk mark operations"],
      ["Notification bell UI", "Real-time count badge with dropdown"],
      ["Offline queue", "Missed notifications delivered on reconnect"],
      ["Type-based channels", "Subscribe to specific notification categories"],
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.realTimeCapabilities.dashboardsTitle",
    id: "dashboards",
  },
  { type: "paragraph", contentKey: "commercial.realTimeCapabilities.dashboardsContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "bar-chart",
        titleKey: "commercial.realTimeCapabilities.liveCharts",
        descriptionKey: "commercial.realTimeCapabilities.liveChartsDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.realTimeCapabilities.liveAudit",
        descriptionKey: "commercial.realTimeCapabilities.liveAuditDesc",
      },
      {
        icon: "users",
        titleKey: "commercial.realTimeCapabilities.presenceTrack",
        descriptionKey: "commercial.realTimeCapabilities.presenceTrackDesc",
      },
      {
        icon: "shield",
        titleKey: "commercial.realTimeCapabilities.securityAlert",
        descriptionKey: "commercial.realTimeCapabilities.securityAlertDesc",
      },
    ],
  },

  {
    type: "heading",
    level: 2,
    titleKey: "commercial.realTimeCapabilities.scaleTitle",
    id: "scaling",
  },
  {
    type: "table",
    headers: ["Feature", "Single Server", "Redis Backplane", "Azure SignalR"],
    rows: [
      ["Concurrent connections", "~5,000", "~50,000+", "~100,000+"],
      ["Multi-server support", "No", "Yes", "Yes"],
      ["Sticky sessions needed", "No", "No", "No"],
      ["Infrastructure cost", "Included", "Redis server", "Pay-per-unit"],
      ["Best for", "Small teams", "Growing orgs", "Enterprise scale"],
    ],
  },
];

registerPage({
  slug: "commercial/real-time-capabilities",
  titleKey: "commercial.realTimeCapabilities.title",
  descriptionKey: "commercial.realTimeCapabilities.description",
  category: "commercial-enterprise",
  order: 4,
  sections,
  relatedSlugs: ["commercial/audit-compliance", "commercial/localization-i18n"],
  lastUpdated: "2026-02-20",
});
