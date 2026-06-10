import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  //  Architecture 
  {
    type: "heading",
    level: 2,
    titleKey: "features.notificationSystem.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.notificationSystem.architectureIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Notification Flow",
    nodes: [
      { id: "backend", label: "Backend Service", type: "default" },
      { id: "svc", label: "NotificationService", type: "primary" },
      { id: "db", label: "Database", type: "info" },
      { id: "hub", label: "NotificationHub", type: "success" },
      { id: "client", label: "Browser (SignalR)", type: "warning" },
    ],
    connections: [
      { from: "backend", to: "svc", label: "SendNotification(userId, message)" },
      { from: "svc", to: "db", label: "Save Notification entity" },
      { from: "svc", to: "hub", label: "SendAsync()" },
      { from: "hub", to: "client", label: "Real-time push to user_{userId} group" },
    ],
  },

  //  NotificationHub
  { type: "heading", level: 2, titleKey: "features.notificationSystem.hubTitle", id: "hub" },
  { type: "paragraph", contentKey: "features.notificationSystem.hubIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "NotificationHub.cs",
    code: `public class NotificationHub : Hub<INotificationHubClient>
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
        {
            // Auto-join user-specific group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            
            // Push initial unread count
            var count = await _notificationService.GetUnreadCountAsync(Guid.Parse(userId));
            await Clients.Caller.UnreadCountUpdated(count);
        }
    }
}`,
  },

  //  Auto-Join Pattern
  {
    type: "heading",
    level: 3,
    titleKey: "features.notificationSystem.autoJoinTitle",
    id: "auto-join",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "No client-side group management needed",
      "Notifications are targeted to specific users",
      "User can have multiple connections (tabs)  all receive the notification",
    ],
  },

  //  Hub Client Interface 
  {
    type: "heading",
    level: 2,
    titleKey: "features.notificationSystem.clientInterfaceTitle",
    id: "client-interface",
  },
  {
    type: "code",
    language: "csharp",
    filename: "INotificationHubClient.cs",
    code: `public interface INotificationHubClient
{
    Task NotificationReceived(NotificationDto notification);
    Task UnreadCountUpdated(int count);
}`,
  },

  //  NotificationService Methods
  {
    type: "heading",
    level: 2,
    titleKey: "features.notificationSystem.serviceTitle",
    id: "service",
  },
  {
    type: "table",
    headers: ["Method", "Purpose"],
    rows: [
      ["SendAsync(userId, title, message)", "Create + persist + push via SignalR"],
      ["GetUnreadCountAsync(userId)", "Count unread notifications"],
      ["MarkAsReadAsync(notificationId)", "Mark single notification as read"],
      ["MarkAllAsReadAsync(userId)", "Mark all notifications as read"],
      ["GetPagedAsync(userId, page, size)", "Paginated notification list"],
    ],
  },

  //  Controller Endpoints 
  {
    type: "heading",
    level: 2,
    titleKey: "features.notificationSystem.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/notifications",
        descriptionKey: "List notifications (paginated)",
        auth: "JWT",
      },
      {
        method: "GET",
        path: "/api/notifications/unread-count",
        descriptionKey: "Get unread count",
        auth: "JWT",
      },
      {
        method: "PUT",
        path: "/api/notifications/{id}/read",
        descriptionKey: "Mark as read",
        auth: "JWT",
      },
      {
        method: "PUT",
        path: "/api/notifications/read-all",
        descriptionKey: "Mark all as read",
        auth: "JWT",
      },
      {
        method: "DELETE",
        path: "/api/notifications/{id}",
        descriptionKey: "Delete notification",
        auth: "JWT",
      },
    ],
  },
];

registerPage({
  slug: "features/notification-system",
  titleKey: "features.notificationSystem.title",
  descriptionKey: "features.notificationSystem.description",
  category: "features",
  order: 5,
  sections,
  relatedSlugs: ["features/email-system", "features/webhook-system"],
  lastUpdated: "2026-02-20",
});
