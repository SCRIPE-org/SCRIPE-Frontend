import type { PipelineDefinition, PipelineStageConfig } from "../models/crm-workflow.types";

/** Re-exported relational workflow pipeline and stage configuration types. */
export type {
  PipelineDefinition,
  PipelineStageConfig,
  UpdateDefaultPipelineInput,
  UpdatePipelineStageItem,
} from "../models/crm-workflow.types";

/**
 * Rich domain entity wrapping a normalized relational `PipelineDefinition`.
 */
export class CrmWorkflowEntity implements PipelineDefinition {
  constructor(private readonly data: PipelineDefinition) {}

  /** Workflow identifier alias, if provided by the API. */
  get id(): string | undefined {
    return this.data.id;
  }

  /** Canonical relational pipeline identifier. */
  get pipelineId(): string | undefined {
    return this.data.pipelineId;
  }

  /** Owning tenant identifier. */
  get tenantId(): string | undefined {
    return this.data.tenantId;
  }

  /** Stable workflow lookup key. */
  get key(): string | undefined {
    return this.data.key;
  }

  /** Stable pipeline code slug. */
  get code(): string | undefined {
    return this.data.code;
  }

  /** Target CRM entity type (`deal` or `lead`). */
  get entityType(): string | undefined {
    return this.data.entityType;
  }

  /** Fallback display name of the pipeline. */
  get name(): string | undefined {
    return this.data.name;
  }

  /** English display name of the pipeline. */
  get nameEn(): string | undefined {
    return this.data.nameEn;
  }

  /** Arabic display name of the pipeline, if configured. */
  get nameAr(): string | null | undefined {
    return this.data.nameAr;
  }

  /** Monotonic schema version of the pipeline definition. */
  get version(): number {
    return this.data.version;
  }

  /** Whether this pipeline is the tenant default for its entity type. */
  get isDefault(): boolean | undefined {
    return this.data.isDefault;
  }

  /** Whether this pipeline is currently active for execution. */
  get isActive(): boolean | undefined {
    return this.data.isActive;
  }

  /** Serialized pipeline-level governance metadata JSON. */
  get propertiesJson(): string | null | undefined {
    return this.data.propertiesJson;
  }

  /** Ordered list of pipeline stage configurations. */
  get stages(): PipelineStageConfig[] {
    return this.data.stages;
  }

  /** Serialized workflow transition rules and canvas edges JSON. */
  get transitionsJson(): string | null | undefined {
    return this.data.transitionsJson;
  }

  /** Optimistic concurrency token for pipeline updates. */
  get rowVersion(): string {
    return this.data.rowVersion;
  }

  /** Returns a new `CrmWorkflowEntity` with the provided fields merged. */
  copyWith(partial: Partial<PipelineDefinition>): CrmWorkflowEntity {
    return new CrmWorkflowEntity({ ...this.data, ...partial });
  }

  /** Serializes back to a plain `PipelineDefinition` object. */
  toDto(): PipelineDefinition {
    return this.data;
  }
}
