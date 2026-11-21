import { describe, it, expect, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { HubPersonalFeedRepository } from "../HubPersonalFeedRepository";
import { HubPersonalFeedService } from "../../services/HubPersonalFeedService";
import { HOME_FEED_ENDPOINTS } from "../../services/home-feed.endpoints";

function createMockApi(overrides: Partial<IApiService> = {}): IApiService {
  return {
    get: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as IApiService;
}

describe("HubPersonalFeedRepository — /account/notifications & /account/activity feeds for /hub", () => {
  it("fetches top 5 notifications prioritizing unread items and sanitizes unsafe actionUrls", async () => {
    const api = createMockApi({
      get: vi.fn().mockResolvedValue({
        unreadNotificationsCount: 2,
        recentNotifications: [
          {
            id: "read-1",
            title: "Read Alert",
            body: "Already handled",
            category: "System",
            isRead: true,
            actionUrl: "/account/activity",
            createdAt: "2026-11-20T09:00:00Z",
          },
          {
            id: "unread-unsafe",
            title: "Phishing URL Guard",
            body: "Should strip external link",
            category: "Security",
            isRead: false,
            actionUrl: "https://evil.example.com",
            createdAt: "2026-11-20T10:00:00Z",
          },
          {
            id: "unread-safe",
            title: "Token Expiring",
            body: "Rotate PAT soon",
            category: "Security",
            isRead: false,
            actionUrl: "/account/integrations",
            createdAt: "2026-11-20T11:00:00Z",
          },
        ],
      }),
    });

    const repo = new HubPersonalFeedRepository(new HubPersonalFeedService(api));
    const feed = await repo.getNotifications();

    expect(api.get).toHaveBeenCalledWith(HOME_FEED_ENDPOINTS.NOTIFICATIONS, {
      params: { pageSize: 5 },
    });
    expect(feed.unreadCount).toBe(2);
    expect(feed.items.map((i) => i.id)).toEqual(["unread-unsafe", "unread-safe", "read-1"]);
    expect(feed.items[0].actionUrl).toBeNull();
    expect(feed.items[1].actionUrl).toBe("/account/integrations");
  });

  it("marks individual and all notifications as read and queries /account/activity with pageSize=5", async () => {
    const api = createMockApi({
      get: vi.fn().mockResolvedValue({
        totalCount: 12,
        entries: [
          {
            id: "act-1",
            eventType: "LoginSucceeded",
            category: "Security",
            outcome: "Success",
            endpoint: "/api/v1/auth/login",
            ipAddress: "127.0.0.1",
            timestampUtc: "2026-11-20T12:00:00Z",
          },
        ],
      }),
    });

    const repo = new HubPersonalFeedRepository(new HubPersonalFeedService(api));

    await repo.markNotificationAsRead("notif-42");
    expect(api.patch).toHaveBeenCalledWith(HOME_FEED_ENDPOINTS.NOTIFICATION_MARK_READ("notif-42"), {});

    await repo.markAllNotificationsAsRead();
    expect(api.patch).toHaveBeenCalledWith(HOME_FEED_ENDPOINTS.NOTIFICATION_READ_ALL, {});

    const act = await repo.getSignInActivity(5);
    expect(api.get).toHaveBeenCalledWith(HOME_FEED_ENDPOINTS.ACTIVITY, { params: { pageSize: 5 } });
    expect(act.totalCount).toBe(12);
    expect(act.entries[0].outcome).toBe("Success");
  });
});
