import type {
  HubNotificationsFeed,
  HubSignInActivityFeed,
} from "../../domain/entities/HubPersonalFeed";
import type { IHubPersonalFeedRepository } from "../../domain/interfaces/IHubPersonalFeedRepository";
import type { IHubPersonalFeedService } from "../../domain/interfaces/IHubPersonalFeedService";
import { HubPersonalFeedMapper } from "../mappers/HubPersonalFeedMapper";

/** Repository converting personal `/account/*` DTO feeds into `/hub` domain models. */
export class HubPersonalFeedRepository implements IHubPersonalFeedRepository {
  constructor(private readonly service: IHubPersonalFeedService) {}

  async getNotifications(): Promise<HubNotificationsFeed> {
    const dto = await this.service.getNotifications();
    return HubPersonalFeedMapper.toNotificationsFeed(dto);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.service.markNotificationAsRead(id);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.service.markAllNotificationsAsRead();
  }

  async getSignInActivity(pageSize = 5): Promise<HubSignInActivityFeed> {
    const dto = await this.service.getSignInActivity(pageSize);
    return HubPersonalFeedMapper.toSignInActivityFeed(dto);
  }
}
