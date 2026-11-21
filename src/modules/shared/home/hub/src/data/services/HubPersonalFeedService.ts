import type { IApiService } from "@core/interfaces/api.interface";
import type { IHubPersonalFeedService } from "../../domain/interfaces/IHubPersonalFeedService";
import type {
  HubAccountActivityModel,
  HubAccountNotificationsModel,
} from "../models/HubPersonalFeedModels";
import { HOME_FEED_ENDPOINTS } from "./home-feed.endpoints";

/** HTTP service reading and acknowledging `/hub` personal notification and sign-in feeds. */
export class HubPersonalFeedService implements IHubPersonalFeedService {
  constructor(private readonly api: IApiService) {}

  getNotifications(): Promise<HubAccountNotificationsModel> {
    return this.api.get<HubAccountNotificationsModel>(HOME_FEED_ENDPOINTS.NOTIFICATIONS, {
      params: { pageSize: 5 },
    });
  }

  markNotificationAsRead(id: string): Promise<void> {
    return this.api.patch<void>(HOME_FEED_ENDPOINTS.NOTIFICATION_MARK_READ(id), {});
  }

  markAllNotificationsAsRead(): Promise<void> {
    return this.api.patch<void>(HOME_FEED_ENDPOINTS.NOTIFICATION_READ_ALL, {});
  }

  getSignInActivity(pageSize = 5): Promise<HubAccountActivityModel> {
    return this.api.get<HubAccountActivityModel>(HOME_FEED_ENDPOINTS.ACTIVITY, {
      params: { pageSize },
    });
  }
}
