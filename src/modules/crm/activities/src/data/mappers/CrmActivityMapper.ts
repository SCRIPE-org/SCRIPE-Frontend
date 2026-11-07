/**
 * CRM Sales Activity Data Mapper
 * Converts wire DTOs to Domain Entities.
 */

import type { CrmSalesActivityDto } from "../models/CrmActivityDto";
import {
  CrmActivityEntity,
  type CrmActivity,
  type SalesActivityKind,
} from "../../domain/entities/CrmActivityEntity";

export class CrmActivityMapper {
  static toEntity(dto: CrmSalesActivityDto): CrmActivityEntity {
    const model: CrmActivity = {
      activityId: dto.activityId,
      leadId: dto.leadId ?? null,
      accountId: dto.accountId ?? null,
      opportunityId: dto.opportunityId ?? null,
      partyId: dto.partyId ?? null,
      activityKind: dto.activityKind as SalesActivityKind,
      summary: dto.summary ?? "",
      bodyText: dto.bodyText ?? null,
      workItemRefId: dto.workItemRefId ?? null,
      workItemStatus: dto.workItemStatus ?? null,
      communicationRefId: dto.communicationRefId ?? null,
      communicationDeliveryStatus: dto.communicationDeliveryStatus ?? null,
      actorUserId: dto.actorUserId ?? null,
      actorDisplaySnapshot: dto.actorDisplaySnapshot ?? "",
      occurredAtUtc: dto.occurredAtUtc,
      maskedFieldKeys: dto.maskedFieldKeys ?? [],
    };

    return new CrmActivityEntity(model);
  }
}
