import type { INotificationSenderRepository } from "../../domain/interfaces/INotificationSenderRepository";
import type { NotificationTarget, SendNotificationRequest } from "../../domain/entities/Notification";
import type { INotificationSenderService } from "../services/NotificationSenderService";

export class NotificationSenderRepository implements INotificationSenderRepository {
      constructor(private readonly service: INotificationSenderService) { }

      async searchTargets(query: string): Promise<NotificationTarget[]> {
            return this.service.searchTargets(query);
      }

      async send(data: SendNotificationRequest): Promise<void> {
            await this.service.send(data as unknown as Record<string, unknown>);
      }
}
