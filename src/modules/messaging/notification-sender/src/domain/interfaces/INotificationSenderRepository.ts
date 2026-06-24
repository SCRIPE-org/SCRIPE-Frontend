import type { NotificationTarget } from "../entities/Notification";
import type { SendNotificationPayload } from "../entities/NotificationRequests";

/**
 * Interface defining repository methods for managing NotificationSender data access.
 */
export interface INotificationSenderRepository {
  searchTargets(query: string): Promise<NotificationTarget[]>;
  send(data: SendNotificationPayload): Promise<void>;
}
