import type { NotificationTarget, SendNotificationPayload } from "../entities/Notification";

export interface INotificationSenderRepository {
      searchTargets(query: string): Promise<NotificationTarget[]>;
      send(data: SendNotificationPayload): Promise<void>;
}
