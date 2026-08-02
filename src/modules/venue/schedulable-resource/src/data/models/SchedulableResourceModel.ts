import type {
  CapacityPolicyData,
  PublicationStatus,
  ResourceAllocationMode,
} from "../../domain/entities/SchedulableResource";

export interface SchedulableResourceJson {
  id: string;
  facilityResourceProfileId: string;
  name: string;
  description?: string;
  parentSchedulableResourceId?: string;
  isComposite: boolean;
  namedUnitLabel?: string;
  unitCount: number;
  capacity?: {
    allocationMode: ResourceAllocationMode;
    maxConcurrentUsage: number;
    overbookingAllowed: boolean;
  };
  publicationStatus: PublicationStatus;
  publishedAtUtc?: string;
  archivedAtUtc?: string;
  commercialReadinessNote: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface SchedulableResourceListResponseJson {
  items: SchedulableResourceJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class SchedulableResourceModel {
  constructor(
    public readonly id: string,
    public readonly facilityResourceProfileId: string,
    public readonly name: string,
    public readonly isComposite: boolean,
    public readonly unitCount: number,
    public readonly publicationStatus: PublicationStatus,
    public readonly commercialReadinessNote: string,
    public readonly createdAt: string,
    public readonly description?: string,
    public readonly parentSchedulableResourceId?: string,
    public readonly namedUnitLabel?: string,
    public readonly capacity?: CapacityPolicyData,
    public readonly publishedAtUtc?: string,
    public readonly archivedAtUtc?: string,
    public readonly modifiedAt?: string
  ) {}

  static fromJson(json: SchedulableResourceJson): SchedulableResourceModel {
    return new SchedulableResourceModel(
      json.id,
      json.facilityResourceProfileId,
      json.name,
      json.isComposite,
      json.unitCount,
      json.publicationStatus,
      json.commercialReadinessNote,
      json.createdAt,
      json.description,
      json.parentSchedulableResourceId,
      json.namedUnitLabel,
      json.capacity,
      json.publishedAtUtc,
      json.archivedAtUtc,
      json.modifiedAt
    );
  }
}
