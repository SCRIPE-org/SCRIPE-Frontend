/**
 * Documentation for [
 */
export const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * Documentation for WEEK_DAYS)[number]
 */
export type WeekDay = (typeof WEEK_DAYS)[number];

/**
 * Documentation for module export
 */
export interface AvailabilityWindow {
  id?: string;
  dayOfWeek: WeekDay;
  startLocal: string;
  endLocal: string;
  capacityOverride: number | null;
}

/**
 * Documentation for module export
 */
export interface AvailabilityCalendar {
  id: string;
  resourceId: string;
  timeZoneId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: "Draft" | "Active" | "Archived";
  windows: AvailabilityWindow[];
  version: number;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Documentation for module export
 */
export interface SaveAvailabilityCalendar {
  resourceId: string;
  timeZoneId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  windows: AvailabilityWindow[];
}

/**
 * Documentation for module export
 */
export interface AvailabilitySearchInput {
  resourceId: string;
  timeZoneId: string;
  startLocal: string;
  endLocal: string;
  quantity: number;
}

/**
 * Documentation for module export
 */
export interface AvailabilitySearchResult {
  resourceId: string;
  resourceName: string;
  timeZoneId: string;
  startUtc: string;
  endUtc: string;
  requestedQuantity: number;
  isAvailable: boolean;
  decidingLayer: "BaseCalendar" | "Exception" | "Blackout" | "Maintenance";
  reasonCode: string;
  reason?: string;
  maximumCapacity: number;
  consumedCapacity: number;
  remainingCapacity: number;
  asOfUtc: string;
}

/**
 * Documentation for "maintenance"
 */
export type ResourceBlockKind = "blackout" | "maintenance";

/**
 * Documentation for module export
 */
export interface ResourceBlock {
  id: string;
  resourceId: string;
  startUtc: string;
  endUtc: string;
  timeZoneId: string;
  hardBlock: boolean;
  reason: string;
  version: number;
  createdAt: string;
  modifiedAt?: string;
}

/**
 * Documentation for module export
 */
export interface SaveResourceBlock {
  resourceId: string;
  timeZoneId: string;
  startLocal: string;
  endLocal: string;
  hardBlock: boolean;
  reason: string;
}
