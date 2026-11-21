import type {
  HubNotificationsFeed,
  HubSignInActivityFeed,
} from "../entities/HubPersonalFeed";

/** Repository contract exposing personal notifications and sign-in activity for `/hub`. */
export interface IHubPersonalFeedRepository {
  getNotifications(): Promise<HubNotificationsFeed>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;
  getSignInActivity(pageSize?: number): Promise<HubSignInActivityFeed>;
}
