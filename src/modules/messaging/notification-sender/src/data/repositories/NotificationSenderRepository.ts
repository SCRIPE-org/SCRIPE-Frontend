/**
 * Notification Sender Repository Implementation
 *
 * Uses NotificationSenderService + NotificationMapper.
 *
 * @module notification-sender/data
 */
import type { INotificationSenderRepository } from "../../domain/interfaces/INotificationSenderRepository";
import type { INotificationSenderService } from "../../domain/interfaces/INotificationSenderService";
import type { NotificationTarget } from "../../domain/entities/Notification";
import type { SendNotificationPayload } from "../../domain/entities/NotificationRequests";
import { NotificationMapper } from "../mappers/NotificationMapper";

export class NotificationSenderRepository implements INotificationSenderRepository {
  constructor(private readonly service: INotificationSenderService) {}

  async searchTargets(query: string): Promise<NotificationTarget[]> {
    const jsonList = await this.service.searchTargets(query);
    return jsonList.map((json) => NotificationMapper.toTargetEntity(json));
  }

  async send(data: SendNotificationPayload): Promise<void> {
    await this.service.send(data);
  }
}
