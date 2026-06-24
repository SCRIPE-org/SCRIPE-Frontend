import type { NotificationTarget } from "../entities/Notification";
import type { SendNotificationPayload } from "../entities/NotificationRequests";

/**
 * Repository layer implementing client request queries for i notification sender.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface INotificationSenderRepository {
  searchTargets(query: string): Promise<NotificationTarget[]>;
  send(data: SendNotificationPayload): Promise<void>;
}
