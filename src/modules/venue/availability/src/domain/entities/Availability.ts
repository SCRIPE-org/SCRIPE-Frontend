export const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export interface AvailabilityWindow {
  id?: string;
  dayOfWeek: WeekDay;
  startLocal: string;
  endLocal: string;
  capacityOverride: number | null;
}

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

export interface SaveAvailabilityCalendar {
  resourceId: string;
  timeZoneId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  windows: AvailabilityWindow[];
}

export interface AvailabilitySearchInput {
  resourceId: string;
  timeZoneId: string;
  startLocal: string;
  endLocal: string;
  quantity: number;
}

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
