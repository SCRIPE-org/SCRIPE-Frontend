/**
 * Notification Sender Service Interface
 *
 * Defines the contract for notification API operations.
 * Service returns JSON/Model types, not domain entities.
 *
 * @module notification-sender/domain
 */
import type {
      NotificationTargetJson,
      SendNotificationJson,
} from "../types/NotificationTypes";

export interface INotificationSenderService {
      searchTargets(query: string): Promise<NotificationTargetJson[]>;
      send(data: SendNotificationJson): Promise<void>;
}
