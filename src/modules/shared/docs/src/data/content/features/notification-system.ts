import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ── Architecture Section ──
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
    title: "Notification Dispatch & Delivery Flow",
    nodes: [
      { id: "event", label: "Domain Event Trigger", type: "default" },
      { id: "svc", label: "NotificationService.SendAsync()", type: "primary" },
      { id: "db", label: "Save to UserNotifications Table", type: "info" },
      { id: "encrypt", label: "AES-Encrypt Notification ID", type: "warning" },
      { id: "hub", label: "SignalR NotificationHub", type: "success" },
      { id: "group", label: "user_{userId} Group", type: "primary" },
      { id: "client", label: "Browser (ReceiveNotification)", type: "warning" },
      { id: "count_calc", label: "Recalculate Unread Count", type: "info" },
      { id: "count_push", label: "Push count (UnreadCountUpdated)", type: "success" },
    ],
    connections: [
      { from: "event", to: "svc", label: "Invoke SendAsync" },
      { from: "svc", to: "db", label: "Persist notification" },
      { from: "db", to: "encrypt", label: "Encrypt Guid ID" },
      { from: "encrypt", to: "hub", label: "Send ReceiveNotification" },
      { from: "hub", to: "group" },
      { from: "group", to: "client" },
      { from: "db", to: "count_calc", label: "Read unread state" },
      { from: "count_calc", to: "hub", label: "Send UnreadCountUpdated" },
      { from: "hub", to: "group" },
    ],
  },

  // ── Hub Details Section ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.notificationSystem.hubTitle",
    id: "hub",
  },
  { type: "paragraph", contentKey: "features.notificationSystem.hubIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "NotificationHub.cs",
    code: `public sealed class NotificationHub : Hub<INotificationHubClient>
{
    private readonly ILogger<NotificationHub> _logger;
    private readonly INotificationService _notificationService;

    public NotificationHub(
        ILogger<NotificationHub> logger,
        INotificationService notificationService)
    {
        _logger = logger;
        _notificationService = notificationService;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        if (userId.HasValue)
        {
            // Auto-join user-specific group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId.Value}");
            _logger.LogDebug("NotificationHub: {ConnectionId} joined user group {UserId}", Context.ConnectionId, userId.Value);

            // Push current unread count immediately
            var count = await _notificationService.GetUnreadCountAsync(userId.Value);
            await Clients.Caller.UnreadCountUpdated(count);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        if (userId.HasValue)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId.Value}");
            _logger.LogDebug("NotificationHub: {ConnectionId} left user group {UserId}", Context.ConnectionId, userId.Value);
        }
        await base.OnDisconnectedAsync(exception);
    }

    private Guid? GetUserId()
    {
        var claim = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}`,
  },

  // ── Connection Pattern & Auto-Join ──
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
      "Zero Client Group Management: Client apps do not subscribe to or request group additions; the hub maps them on authorization.",
      "Connection-Independent Grouping: Users can have multiple concurrent connections (browser tabs/sessions), and all receive notifications via the user_{userId} group.",
      "Claim Types Mapping: The hub extracts User IDs from Context.User using the full URI identifier: ClaimTypes.NameIdentifier.",
      "Unread State Hydration: Pushes initial unread count to Clients.Caller immediately upon connection initialization.",
    ],
  },

  // ── Hub Client Interface ──
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
    // Real-time notification payload delivery (ID is AES-encrypted)
    Task ReceiveNotification(NotificationPushDto notification);
    
    // Pushes unread count updates when status changes
    Task UnreadCountUpdated(int count);
}`,
  },

  // ── NotificationService Details ──
  {
    type: "heading",
    level: 2,
    titleKey: "features.notificationSystem.serviceTitle",
    id: "service",
  },
  {
    type: "table",
    headers: ["Method / Operation", "Scope Mapping", "Push Mechanism"],
    rows: [
      [
        "SendAsync(..., NotificationTarget.User, ...)",
        "Resolves target User ID",
        "Persists UserNotification entity, AES encrypts ID, pushes payload to user_{userId} and triggers UnreadCountUpdated",
      ],
      [
        "SendAsync(..., NotificationTarget.Role, ...)",
        "Resolves User IDs by RoleId",
        "Iterates through matching users, persisting and pushing notifications individually",
      ],
      [
        "SendAsync(..., NotificationTarget.Tenant, ...)",
        "Resolves User IDs by TenantId",
        "Iterates through matching users in the tenant, persisting and pushing notifications individually",
      ],
      [
        "SendAsync(..., NotificationTarget.Broadcast, ...)",
        "Resolves all active User IDs",
        "Broadcasts to all users globally by iterating through the entire system user list",
      ],
      [
        "GetUnreadCountAsync(userId, ...)",
        "Queries unread notifications in Db",
        "Called by the hub on connection to retrieve initial unread count",
      ],
    ],
  },

  // ── Controller Endpoints ──
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
        path: "/api/v1/notifications",
        descriptionKey: "List user notifications (paginated, returning decrypted records)",
        auth: "JWT",
      },
      {
        method: "GET",
        path: "/api/v1/notifications/unread-count",
        descriptionKey: "Get current unread count from the database",
        auth: "JWT",
      },
      {
        method: "PUT",
        path: "/api/v1/notifications/{id}/read",
        descriptionKey: "Mark a single notification as read (using encrypted ID)",
        auth: "JWT",
      },
      {
        method: "PUT",
        path: "/api/v1/notifications/read-all",
        descriptionKey: "Mark all notifications for the authenticated user as read",
        auth: "JWT",
      },
      {
        method: "DELETE",
        path: "/api/v1/notifications/{id}",
        descriptionKey: "Soft-delete a notification (using encrypted ID)",
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
  lastUpdated: "2026-06-28",
});
