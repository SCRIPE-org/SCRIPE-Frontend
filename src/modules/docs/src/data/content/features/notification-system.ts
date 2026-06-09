import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/notification-system",
  titleKey: "features.notificationSystem.title",
  category: "features",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.notificationSystem.section_0_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.notificationSystem.section_1_title",
    "id": "sec_1"
  },
  {
    "type": "paragraph",
    "contentKey": "features.notificationSystem.section_2_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    backend[\"Backend Service\"]\n    svc([\"NotificationService\"])\n    db([\"Database\"])\n    hub([\"NotificationHub\"])\n    client{{\"Browser (SignalR)\"}}\n    backend -->|\"SendNotification(userId, message)\"| svc\n    svc -->|\"Save Notification entity\"| db\n    svc -->|\"SendAsync()\"| hub\n    hub -->|\"Real-time push to user_{userId} group\"| client",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.notificationSystem.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "features.notificationSystem.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.notificationSystem.section_6_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class NotificationHub : Hub<INotificationHubClient>\n{\n    public override async Task OnConnectedAsync()\n    {\n        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;\n        if (userId != null)\n        {\n            // Auto-join user-specific group\n            await Groups.AddToGroupAsync(Context.ConnectionId, $\"user_{userId}\");\n            \n            // Push initial unread count\n            var count = await _notificationService.GetUnreadCountAsync(Guid.Parse(userId));\n            await Clients.Caller.UnreadCountUpdated(count);\n        }\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "features.notificationSystem.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.notificationSystem.section_9_item_0",
      "features.notificationSystem.section_9_item_1",
      "features.notificationSystem.section_9_item_2"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.notificationSystem.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "features.notificationSystem.section_11_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public interface INotificationHubClient\n{\n    Task NotificationReceived(NotificationDto notification);\n    Task UnreadCountUpdated(int count);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.notificationSystem.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "table",
    "headers": [
      "features.notificationSystem.section_14_hdr_0",
      "features.notificationSystem.section_14_hdr_1"
    ],
    "rows": [
      [
        "features.notificationSystem.section_14_cell_0_0",
        "features.notificationSystem.section_14_cell_0_1"
      ],
      [
        "features.notificationSystem.section_14_cell_1_0",
        "features.notificationSystem.section_14_cell_1_1"
      ],
      [
        "features.notificationSystem.section_14_cell_2_0",
        "features.notificationSystem.section_14_cell_2_1"
      ],
      [
        "features.notificationSystem.section_14_cell_3_0",
        "features.notificationSystem.section_14_cell_3_1"
      ],
      [
        "features.notificationSystem.section_14_cell_4_0",
        "features.notificationSystem.section_14_cell_4_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.notificationSystem.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "table",
    "headers": [
      "features.notificationSystem.section_16_hdr_0",
      "features.notificationSystem.section_16_hdr_1",
      "features.notificationSystem.section_16_hdr_2",
      "features.notificationSystem.section_16_hdr_3",
      "features.notificationSystem.section_16_hdr_4"
    ],
    "rows": [
      [
        "features.notificationSystem.section_16_cell_0_0",
        "features.notificationSystem.section_16_cell_0_1",
        "features.notificationSystem.section_16_cell_0_2",
        "features.notificationSystem.section_16_cell_0_3",
        "features.notificationSystem.section_16_cell_0_4"
      ],
      [
        "features.notificationSystem.section_16_cell_1_0",
        "features.notificationSystem.section_16_cell_1_1",
        "features.notificationSystem.section_16_cell_1_2",
        "features.notificationSystem.section_16_cell_1_3",
        "features.notificationSystem.section_16_cell_1_4"
      ],
      [
        "features.notificationSystem.section_16_cell_2_0",
        "features.notificationSystem.section_16_cell_2_1",
        "features.notificationSystem.section_16_cell_2_2",
        "features.notificationSystem.section_16_cell_2_3",
        "features.notificationSystem.section_16_cell_2_4"
      ],
      [
        "features.notificationSystem.section_16_cell_3_0",
        "features.notificationSystem.section_16_cell_3_1",
        "features.notificationSystem.section_16_cell_3_2",
        "features.notificationSystem.section_16_cell_3_3",
        "features.notificationSystem.section_16_cell_3_4"
      ],
      [
        "features.notificationSystem.section_16_cell_4_0",
        "features.notificationSystem.section_16_cell_4_1",
        "features.notificationSystem.section_16_cell_4_2",
        "features.notificationSystem.section_16_cell_4_3",
        "features.notificationSystem.section_16_cell_4_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.notificationSystem.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.notificationSystem.section_18_item_0",
      "features.notificationSystem.section_18_item_1"
    ]
  }
],
  relatedSlugs: [
  "features/email-system",
  "features/webhook-system"
],
  lastUpdated: "2026-06-09",
});
