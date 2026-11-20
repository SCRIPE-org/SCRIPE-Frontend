import type {
  RawPipelineDefinitionDto,
  RawReplaceStageResultDto,
} from "../../data/models/WorkflowModel";
import type { UpdateDefaultPipelineInput } from "../models/crm-workflow.types";

/** HTTP service contract for relational CRM pipelines & workflow studio persistence. */
export interface ICrmWorkflowService {
  getDefaultPipeline(): Promise<RawPipelineDefinitionDto>;
  updateDefaultPipeline(input: UpdateDefaultPipelineInput): Promise<RawPipelineDefinitionDto>;
  getPipelines(entityType?: string): Promise<RawPipelineDefinitionDto[]>;
  savePipeline(
    pipelineId: string,
    input: UpdateDefaultPipelineInput & { entityType?: string; isActive?: boolean }
  ): Promise<RawPipelineDefinitionDto>;
  activatePipeline(pipelineId: string): Promise<RawPipelineDefinitionDto>;
  deletePipeline(pipelineId: string): Promise<boolean>;
  replacePipelineStage(
    pipelineId: string,
    stageKeyToRemove: string,
    replacementStageKey: string
  ): Promise<RawReplaceStageResultDto>;
}
