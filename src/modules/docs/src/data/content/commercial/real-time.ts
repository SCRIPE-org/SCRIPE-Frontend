import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.realTime.intro" },
      { type: "heading", level: 2, titleKey: "commercial.realTime.hubsTitle", id: "signalr-hubs" },
      { type: "heading", level: 3, titleKey: "commercial.realTime.notificationHubTitle", id: "notification-hub" },
      {
            type: "table", headers: ["Event", "Trigger", "Payload"], rows: [
                  ["NewNotification", "Any notification created", "Title, body, type, action URL"],
                  ["NotificationRead", "Notification marked as read", "Notification ID"],
                  ["UnreadCountChanged", "Read/new notification", "Updated count"],
                  ["BulkNotification", "System-wide announcement", "Message, severity"],
            ],
      },
      { type: "heading", level: 3, titleKey: "commercial.realTime.auditHubTitle", id: "audit-hub" },
      {
            type: "table", headers: ["Event", "Trigger", "Payload"], rows: [
                  ["AuditEntry", "Any API request logged", "Full audit log entry"],
                  ["SecurityAlert", "CSRF/replay violation", "Alert type, IP, timestamp"],
                  ["EntityChanged", "Domain entity modified", "Entity type, before/after diff"],
            ],
      },
      { type: "heading", level: 3, titleKey: "commercial.realTime.dashboardHubTitle", id: "dashboard-hub" },
      {
            type: "table", headers: ["Event", "Trigger", "Payload"], rows: [
                  ["StatsUpdated", "Entity count changed", "Updated KPI values"],
                  ["ChartDataUpdated", "Periodic refresh", "Chart data points"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.realTime.isolationTitle", id: "tenant-isolation" },
      { type: "paragraph", contentKey: "commercial.realTime.isolationIntro" },
      {
            type: "code", language: "csharp", filename: "Tenant-Scoped WebSocket Groups",
            code: `// When admin connects, joined to tenant-specific group
await Groups.AddToGroupAsync(connectionId, $"tenant:{tenantId}");

// When broadcasting, sent only to tenant group
await Clients.Group($"tenant:{tenantId}").SendAsync("NewNotification", payload);`,
      },
      { type: "heading", level: 2, titleKey: "commercial.realTime.connectionTitle", id: "connection-management" },
      {
            type: "table", headers: ["Feature", "Implementation"], rows: [
                  ["Authentication", "JWT token validated on WebSocket handshake"],
                  ["Reconnection", "Automatic with exponential backoff (client-side)"],
                  ["Heartbeat", "15-second keep-alive pings"],
                  ["Fallback", "Long polling if WebSocket unavailable"],
                  ["Compression", "WebSocket per-message compression enabled"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.realTime.integrationTitle", id: "frontend-integration" },
      {
            type: "code", language: "typescript", filename: "Next.js SignalR Client Integration",
            code: `const connection = new signalR.HubConnectionBuilder()
  .withUrl("/hubs/notifications", {
    accessTokenFactory: () => getAccessToken()
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
  .build();

connection.on("NewNotification", (notification) => {
  toast.info(notification.title);
  setUnreadCount(prev => prev + 1);
});`,
      },
];

registerPage({
      slug: "commercial/real-time",
      titleKey: "commercial.realTime.title",
      descriptionKey: "commercial.realTime.description",
      category: "commercial-enterprise",
      order: 3,
      sections,
      relatedSlugs: ["commercial/audit-compliance", "commercial/dashboard-analytics"],
      lastUpdated: "2026-02-19",
});
