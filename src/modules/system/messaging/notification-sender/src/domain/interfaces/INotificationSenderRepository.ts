import type { NotificationTarget, SendNotificationRequest } from "../entities/Notification";

export interface INotificationSenderRepository {
      searchTargets(query: string): Promise<NotificationTarget[]>;
      send(data: SendNotificationRequest): Promise<void>;
}
