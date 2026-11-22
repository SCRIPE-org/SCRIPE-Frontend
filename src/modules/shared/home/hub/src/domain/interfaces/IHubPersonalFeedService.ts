import type {
  HubAccountActivityModel,
  HubAccountNotificationsModel,
} from "../../data/models/HubPersonalFeedModels";

/** Service contract communicating with personal `/account/*` endpoints for `/hub`. */
export interface IHubPersonalFeedService {
  getNotifications(): Promise<HubAccountNotificationsModel>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(): Promise<void>;
  getSignInActivity(pageSize?: number): Promise<HubAccountActivityModel>;
}
