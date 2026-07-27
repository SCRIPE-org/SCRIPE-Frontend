export type ResourceAllocationMode = "SingleUnit" | "PooledUnits";
export type PublicationStatus = "Draft" | "Published";

export interface CapacityPolicyData {
  allocationMode: ResourceAllocationMode;
  maxConcurrentUsage: number;
  overbookingAllowed: boolean;
}

export interface SchedulableResourceData {
  id: string;
  facilityResourceProfileId: string;
  name: string;
  description?: string;
  parentSchedulableResourceId?: string;
  isComposite: boolean;
  namedUnitLabel?: string;
  unitCount: number;
  capacity?: CapacityPolicyData;
  publicationStatus: PublicationStatus;
  publishedAtUtc?: string;
  archivedAtUtc?: string;
  commercialReadinessNote: string;
  createdAt: string;
  modifiedAt?: string;
}

export class SchedulableResource {
  constructor(public readonly data: SchedulableResourceData) {}

  get id(): string {
    return this.data.id;
  }
  get facilityResourceProfileId(): string {
    return this.data.facilityResourceProfileId;
  }
  get name(): string {
    return this.data.name;
  }
  get description(): string | undefined {
    return this.data.description;
  }
  get parentSchedulableResourceId(): string | undefined {
    return this.data.parentSchedulableResourceId;
  }
  get isComposite(): boolean {
    return this.data.isComposite;
  }
  get namedUnitLabel(): string | undefined {
    return this.data.namedUnitLabel;
  }
  get unitCount(): number {
    return this.data.unitCount;
  }
  get capacity(): CapacityPolicyData | undefined {
    return this.data.capacity;
  }
  get publicationStatus(): PublicationStatus {
    return this.data.publicationStatus;
  }
  get isPublished(): boolean {
    return this.data.publicationStatus === "Published";
  }
  get commercialReadinessNote(): string {
    return this.data.commercialReadinessNote;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }
  get modifiedAt(): string | undefined {
    return this.data.modifiedAt;
  }
}

export interface PublicationBlocker {
  code: string;
  message: string;
}

export interface PublicationChecklistReport {
  canPublish: boolean;
  blockers: PublicationBlocker[];
}
