/**
 * Documentation for module export
 */
export interface UsageType {
  code: string;
  label: string;
}

/**
 * Documentation for module export
 */
export interface OperatingPolicy {
  timeZoneId: string;
  days: number;
  opensAt: string;
  closesAt: string;
  setupBufferMinutes: number;
  cleanupBufferMinutes: number;
}

/**
 * Documentation for module export
 */
export interface FacilityResourceProfile {
  id: string;
  facilityId: string;
  code: string;
  name: string;
  description?: string;
  resourceKindCode: string;
  operatingPolicy?: OperatingPolicy;
  usageTypes: UsageType[];
  createdAt?: string;
  modifiedAt?: string;
}

/**
 * Documentation for module export
 */
export interface FacilityResourceProfileWrite {
  facilityId: string;
  code: string;
  name: string;
  description?: string;
  resourceKindCode: string;
  timeZoneId: string;
  days: number;
  opensAt: string;
  closesAt: string;
  setupBufferMinutes: number;
  cleanupBufferMinutes: number;
  usageTypes: UsageType[];
}
