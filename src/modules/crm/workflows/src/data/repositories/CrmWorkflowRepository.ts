import type { CrmWorkflowEntity } from "../../domain/entities/CrmWorkflowEntity";
import type { ICrmWorkflowRepository } from "../../domain/interfaces/ICrmWorkflowRepository";
import type { ICrmWorkflowService } from "../../domain/interfaces/ICrmWorkflowService";
import type { UpdateDefaultPipelineInput } from "../../domain/models/crm-workflow.types";
import { CrmWorkflowMapper } from "../mappers/CrmWorkflowMapper";

/** Concrete repository mapping raw relational pipeline DTOs into `CrmWorkflowEntity`. */
export class CrmWorkflowRepository implements ICrmWorkflowRepository {
  constructor(private readonly service: ICrmWorkflowService) {}

  /** Retrieves the tenant's default CRM workflow pipeline mapped to `CrmWorkflowEntity`. */
  async getDefaultPipeline(): Promise<CrmWorkflowEntity> {
    const dto = await this.service.getDefaultPipeline();
    return CrmWorkflowMapper.toEntity(dto);
  }

  /** Updates the tenant's default CRM pipeline configuration and returns the refreshed entity. */
  async updateDefaultPipeline(input: UpdateDefaultPipelineInput): Promise<CrmWorkflowEntity> {
    const dto = await this.service.updateDefaultPipeline(input);
    return CrmWorkflowMapper.toEntity(dto);
  }

  /** Lists all CRM workflow pipelines optionally filtered by entity type (`deal` or `lead`). */
  async getPipelines(entityType?: string): Promise<CrmWorkflowEntity[]> {
    const rows = await this.service.getPipelines(entityType);
    return rows.map((dto) => CrmWorkflowMapper.toEntity(dto));
  }

  /** Saves or creates a CRM workflow pipeline definition and returns the mapped entity. */
  async savePipeline(
    pipelineId: string,
    input: UpdateDefaultPipelineInput & { entityType?: string; isActive?: boolean }
  ): Promise<CrmWorkflowEntity> {
    const dto = await this.service.savePipeline(pipelineId, input);
    return CrmWorkflowMapper.toEntity(dto);
  }

  /** Marks a CRM workflow pipeline as active and returns the updated entity. */
  async activatePipeline(pipelineId: string): Promise<CrmWorkflowEntity> {
    const dto = await this.service.activatePipeline(pipelineId);
    return CrmWorkflowMapper.toEntity(dto);
  }

  /** Deletes an inactive CRM workflow pipeline by ID. */
  async deletePipeline(pipelineId: string): Promise<boolean> {
    return this.service.deletePipeline(pipelineId);
  }

  /** Migrates records off a deprecated stage key onto a replacement stage key. */
  async replacePipelineStage(
    pipelineId: string,
    stageKeyToRemove: string,
    replacementStageKey: string
  ): Promise<{ migratedRecordCount: number }> {
    return this.service.replacePipelineStage(pipelineId, stageKeyToRemove, replacementStageKey);
  }
}
