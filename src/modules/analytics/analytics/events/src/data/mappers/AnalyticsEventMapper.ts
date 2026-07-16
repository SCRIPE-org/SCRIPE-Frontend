/**
 * AnalyticsEvent Mapper — converts AnalyticsEventModel (DTO) <-> AnalyticsEvent (Entity).
 */
import { AnalyticsEvent, type AnalyticsEventData } from "../../domain/entities/AnalyticsEvent";
import { AnalyticsEventModel } from "../models/AnalyticsEventModel";

export class AnalyticsEventMapper {
  static toEntity(model: AnalyticsEventModel): AnalyticsEvent {
    const data: AnalyticsEventData = {
      id: model.id,
      eventName: model.eventName,
      sourceModule: model.sourceModule,
      occurredAt: model.occurredAt,
      subjectEntityTypeKey: model.subjectEntityTypeKey,
      subjectEntityId: model.subjectEntityId,
      associatedNumericValue: model.associatedNumericValue,
      tenantId: model.tenantId,
    };
    return new AnalyticsEvent(data);
  }
}
