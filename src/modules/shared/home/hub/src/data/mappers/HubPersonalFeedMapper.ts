import type {
  HubNotificationsFeed,
  HubNotificationItem,
  HubSignInActivityEntry,
  HubSignInActivityFeed,
} from "../../domain/entities/HubPersonalFeed";
import type {
  HubAccountActivityModel,
  HubAccountNotificationsModel,
  HubActivityEntryModel,
  HubNotificationItemModel,
} from "../models/HubPersonalFeedModels";

const MAX_HUB_FEED_ITEMS = 5;

/** Sanitizes notification `actionUrl` to prevent unsafe protocol or external redirects. */
function normalizeSafeActionUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return null;
  }
  return trimmed;
}

/** Pure mapper converting raw account feed DTOs into `/hub` domain entities. */
export class HubPersonalFeedMapper {
  static toNotificationItem(model: HubNotificationItemModel): HubNotificationItem {
    return {
      id: model.id,
      title: (model.title ?? "").trim(),
      body: (model.body ?? model.message ?? "").trim(),
      category: model.category ?? model.type ?? "System",
      isRead: Boolean(model.isRead),
      actionUrl: normalizeSafeActionUrl(model.actionUrl),
      createdAt: model.createdAt ?? "",
    };
  }

  static toNotificationsFeed(model?: HubAccountNotificationsModel | null): HubNotificationsFeed {
    const rawItems = Array.isArray(model?.recentNotifications) ? model.recentNotifications : [];
    const mapped = rawItems.map(HubPersonalFeedMapper.toNotificationItem);
    const unreadFirst = [
      ...mapped.filter((item) => !item.isRead),
      ...mapped.filter((item) => item.isRead),
    ];
    return {
      unreadCount: Number(model?.unreadNotificationsCount ?? 0),
      items: unreadFirst.slice(0, MAX_HUB_FEED_ITEMS),
    };
  }

  static toActivityEntry(model: HubActivityEntryModel): HubSignInActivityEntry {
    return {
      id: model.id,
      eventType: model.eventType ?? "Access",
      category: model.category ?? "Access",
      outcome: model.outcome ?? "Success",
      endpoint: model.endpoint ?? null,
      ipAddress: model.ipAddress ?? null,
      timestampUtc: model.timestampUtc ?? "",
    };
  }

  static toSignInActivityFeed(model?: HubAccountActivityModel | null): HubSignInActivityFeed {
    const rawEntries = Array.isArray(model?.entries) ? model.entries : [];
    return {
      totalCount: Number(model?.totalCount ?? model?.totalEntries ?? rawEntries.length),
      entries: rawEntries.slice(0, MAX_HUB_FEED_ITEMS).map(HubPersonalFeedMapper.toActivityEntry),
    };
  }
}
