/**
 * Documentation for "PooledUnits"
 */
export type ResourceAllocationMode = "SingleUnit" | "PooledUnits";
/**
 * Documentation for "Published"
 */
export type PublicationStatus = "Draft" | "Published";

/**
 * Documentation for module export
 */
export interface CapacityPolicyData {
  allocationMode: ResourceAllocationMode;
  maxConcurrentUsage: number;
  overbookingAllowed: boolean;
}

/**
 * Documentation for module export
 */
export interface BookingSlotPolicyData {
  slotDurationMinutes: number;
  startIncrementMinutes: number;
  timeZoneId?: string | null;
  allowMultiSlot?: boolean;
}

/**
 * Documentation for module export
 */
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
  slotPolicy?: BookingSlotPolicyData | null;
  publicationStatus: PublicationStatus;
  publishedAtUtc?: string;
  archivedAtUtc?: string;
  commercialReadinessNote: string;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Documentation for module export
 */
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
  get slotPolicy(): BookingSlotPolicyData | undefined | null {
    return this.data.slotPolicy;
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

  /**
   * Creates an immutable copy of the entity with updated schedulable resource data.
   *
   * @param updates - Partial properties to merge into the entity.
   * @returns A new SchedulableResource instance with updated values.
   */
  copyWith(updates: Partial<SchedulableResourceData>): SchedulableResource {
    return new SchedulableResource({ ...this.data, ...updates });
  }
}

/**
 * Documentation for module export
 */
export interface PublicationBlocker {
  code: string;
  message: string;
}

/**
 * Documentation for module export
 */
export interface PublicationChecklistReport {
  canPublish: boolean;
  blockers: PublicationBlocker[];
}
