/**
 * Notification Sender Service Implementation
 *
 * Handles all notification API calls. Returns raw JSON types.
 * Repository uses Mapper to convert to domain entities.
 *
 * @module notification-sender/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { INotificationSenderService } from "../../domain/interfaces/INotificationSenderService";
import type { NotificationTargetJson, SendNotificationJson } from "../models/NotificationModel";

/**
 * Http API network service for notification sender.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class NotificationSenderService implements INotificationSenderService {
  constructor(private readonly api: IApiService) {}

  async searchTargets(query: string): Promise<NotificationTargetJson[]> {
    const url = buildUrl(API_ENDPOINTS.NOTIFICATIONS_SENDER.SEARCH_TARGETS, { search: query });
    return this.api.get<NotificationTargetJson[]>(url);
  }

  async send(data: SendNotificationJson): Promise<void> {
    await this.api.post(API_ENDPOINTS.NOTIFICATIONS_SENDER.SEND, data);
  }
}
