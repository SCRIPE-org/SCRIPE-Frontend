/**
 * Notification Sender Service Implementation
 *
 * Handles all notification API calls. Returns raw JSON types.
 * Repository uses Mapper to convert to domain entities.
 *
 * @module notification-sender/data
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type { INotificationSenderService } from "../../domain/interfaces/INotificationSenderService";
import type { NotificationTargetJson, SendNotificationJson } from "../models/NotificationModel";
import { NOTIFICATION_SENDER_ENDPOINTS } from "./notification-sender.endpoints";

/**
 * Http API network service for notification sender.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class NotificationSenderService implements INotificationSenderService {
  constructor(private readonly api: IApiService) {}

  async searchTargets(query: string): Promise<NotificationTargetJson[]> {
    const url = buildUrl(NOTIFICATION_SENDER_ENDPOINTS.SEARCH_TARGETS, { search: query });
    return this.api.get<NotificationTargetJson[]>(url);
  }

  async send(data: SendNotificationJson): Promise<void> {
    await this.api.post(NOTIFICATION_SENDER_ENDPOINTS.SEND, data);
  }
}
