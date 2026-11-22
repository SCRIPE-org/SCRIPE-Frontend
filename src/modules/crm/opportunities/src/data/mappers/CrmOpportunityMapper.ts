/**
 * CRM Opportunity Data Mapper
 * Converts between raw DTO formats and domain entities.
 */

import type { CrmOpportunityDto } from "../models/OpportunityModel";
import {
  OpportunityEntity,
  type CrmOpportunity,
  type DealKind,
  type HqOutcomeKind,
  type OpportunityStatus,
} from "../../domain/entities/OpportunityEntity";

/**
 * Mapper for converting Opportunity DTOs to Domain Entities and types.
 */
export class CrmOpportunityMapper {
  /**
   * Convert DTO to Domain Entity
   */
  static toEntity(dto: CrmOpportunityDto): OpportunityEntity {
    const model: CrmOpportunity = {
      id: dto.id,
      title: dto.title ?? "",
      leadId: dto.leadId ?? null,
      accountId: dto.accountId ?? null,
      accountDisplayName: dto.accountDisplayName ?? null,
      partyId: dto.partyId ?? null,
      partyDisplayName: dto.partyDisplayName ?? null,
      contactId: dto.contactId ?? null,
      primaryContactName: dto.primaryContactName ?? null,
      pipelineId: dto.pipelineId,
      stageId: dto.stageId,
      stageKey: dto.stageKey,
      stageLabelEnSnapshot: dto.stageLabelEnSnapshot ?? "",
      stageLabelArSnapshot: dto.stageLabelArSnapshot ?? null,
      pipelineVersionSnapshot: dto.pipelineVersionSnapshot ?? 1,
      lastActiveStageKey: dto.lastActiveStageKey ?? null,
      ownerUserId: dto.ownerUserId ?? null,
      ownerDisplayName: dto.ownerDisplayName ?? null,
      ownerTeamId: dto.ownerTeamId ?? null,
      ownerTeamDisplayName: dto.ownerTeamDisplayName ?? null,
      dealKind: (dto.dealKind as DealKind) ?? "NewBusiness",
      hqOutcomeKind: (dto.hqOutcomeKind as HqOutcomeKind) ?? null,
      targetExistingTenantId: dto.targetExistingTenantId ?? null,
      estimatedAmount: dto.estimatedAmount != null ? Number(dto.estimatedAmount) : null,
      discountPercent: dto.discountPercent != null ? Number(dto.discountPercent) : null,
      nextStepSummary: dto.nextStepSummary ?? null,
      currencyCode: dto.currencyCode || "USD",
      targetCloseDate: dto.targetCloseDate ?? null,
      status: (dto.status as OpportunityStatus) ?? "Open",
      statusName: dto.statusName || (dto.status ?? "Open"),
      lossReasonCode: dto.lossReasonCode ?? null,
      competitorName: dto.competitorName ?? null,
      closeNotes: dto.closeNotes ?? null,
      approvalEvidenceRef: dto.approvalEvidenceRef ?? null,
      closedAtUtc: dto.closedAtUtc ?? null,
      closedByUserId: dto.closedByUserId ?? null,
      directCreateSource: dto.directCreateSource ?? null,
      directCreateRationale: dto.directCreateRationale ?? null,
      exitChecklistJson: dto.exitChecklistJson ?? null,
      primaryContactRole: dto.primaryContactRole ?? null,
      solutionFitConfirmed: Boolean(dto.solutionFitConfirmed),
      enteredStageAtUtc: dto.enteredStageAtUtc ?? null,
      createdAt: dto.createdAt,
      rowVersion: dto.rowVersion ?? "",
      maskedFieldKeys: dto.maskedFieldKeys ?? [],
      isReplay: dto.isReplay ?? false,
    };

    return new OpportunityEntity(model);
  }
}
