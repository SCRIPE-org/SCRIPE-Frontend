import type { INotificationSenderRepository } from "../../domain/interfaces/INotificationSenderRepository";
import type { NotificationTarget, SendNotificationPayload } from "../../domain/entities/Notification";
import type { INotificationSenderService } from "../services/NotificationSenderService";

export class NotificationSenderRepository implements INotificationSenderRepository {
      constructor(private readonly service: INotificationSenderService) { }

      async searchTargets(query: string): Promise<NotificationTarget[]> {
            return this.service.searchTargets(query);
      }

      async send(data: SendNotificationPayload): Promise<void> {
            await this.service.send(data);
      }
}
