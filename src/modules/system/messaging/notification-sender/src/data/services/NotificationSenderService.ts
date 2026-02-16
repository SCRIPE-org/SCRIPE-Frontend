import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { NotificationTarget } from "../../domain/entities/Notification";

export interface INotificationSenderService {
      searchTargets(query: string): Promise<NotificationTarget[]>;
      send(data: Record<string, unknown>): Promise<void>;
}

export class NotificationSenderService implements INotificationSenderService {
      constructor(private readonly api: IApiService) { }

      async searchTargets(query: string): Promise<NotificationTarget[]> {
            const url = buildUrl(API_ENDPOINTS.NOTIFICATIONS_SENDER.SEARCH_TARGETS, { query });
            return this.api.get<NotificationTarget[]>(url);
      }

      async send(data: Record<string, unknown>): Promise<void> {
            await this.api.post(API_ENDPOINTS.NOTIFICATIONS_SENDER.SEND, data);
      }
}
