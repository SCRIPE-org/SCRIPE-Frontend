import type { CrmWorkflowEntity } from "../entities/CrmWorkflowEntity";
import type { UpdateDefaultPipelineInput } from "../models/crm-workflow.types";

/** Repository contract mediating relational CRM pipeline domain entities. */
export interface ICrmWorkflowRepository {
  getDefaultPipeline(): Promise<CrmWorkflowEntity>;
  updateDefaultPipeline(input: UpdateDefaultPipelineInput): Promise<CrmWorkflowEntity>;
  getPipelines(entityType?: string): Promise<CrmWorkflowEntity[]>;
  savePipeline(
    pipelineId: string,
    input: UpdateDefaultPipelineInput & { entityType?: string; isActive?: boolean }
  ): Promise<CrmWorkflowEntity>;
  activatePipeline(pipelineId: string): Promise<CrmWorkflowEntity>;
  deletePipeline(pipelineId: string): Promise<boolean>;
  replacePipelineStage(
    pipelineId: string,
    stageKeyToRemove: string,
    replacementStageKey: string
  ): Promise<{ migratedRecordCount: number }>;
}
