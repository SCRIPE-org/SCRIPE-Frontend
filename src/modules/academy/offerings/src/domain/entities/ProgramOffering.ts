export type OfferingStatus = "Draft" | "OpenForEnrollment" | "InProgress" | "Completed" | "Cancelled";

export interface ProgramOffering {
  id: string;
  programId: string;
  branchId: string;
  seasonId: string;
  externalLocationId?: string | null;
  nameEn: string;
  nameAr: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  minCapacity: number;
  enrolledCount: number;
  catalogPriceDefinitionId?: string | null;
  status: OfferingStatus;
}

export interface CreateOfferingPayload {
  programId: string;
  branchId: string;
  seasonId: string;
  externalLocationId?: string | null;
  nameEn: string;
  nameAr: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  minCapacity: number;
  catalogPriceDefinitionId?: string | null;
}
