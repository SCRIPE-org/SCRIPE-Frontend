import type { NotificationTarget } from "../entities/Notification";
import type { SendNotificationPayload } from "../entities/NotificationRequests";

export interface INotificationSenderRepository {
      searchTargets(query: string): Promise<NotificationTarget[]>;
      send(data: SendNotificationPayload): Promise<void>;
}
