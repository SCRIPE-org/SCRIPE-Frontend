import { HubActivitySummary, HubRecentItem } from "../../domain/entities/HubActivity";
import type { HubActivitySummaryModel, HubRecentItemModel } from "../models/HubActivityModels";

export class HubActivityMapper {
  static toRecentItemEntity(model: HubRecentItemModel): HubRecentItem {
    return new HubRecentItem({
      eventType: model.eventType ?? "",
      entityType: model.entityType,
      moduleTag: model.moduleTag,
      username: model.username,
      timestamp: model.timestamp ?? "",
    });
  }

  static toSummaryEntity(model: HubActivitySummaryModel): HubActivitySummary {
    return new HubActivitySummary({
      todayActionCount: model.todayActionCount ?? 0,
      todayModuleCount: model.todayModuleCount ?? 0,
      yesterdayActionCount: model.yesterdayActionCount ?? 0,
      recentItems: (model.recentItems || []).map(
        (item) => HubActivityMapper.toRecentItemEntity(item).data
      ),
    });
  }
}
