import type { Booking360Status } from "@modules/venue/booking-360/src/domain/entities/Booking360";

export interface VenueOverviewKpiData {
  todayReservationsCount: number;
  todayReservationsConfirmedCount: number;
  todayReservationsCheckedInCount: number;
  activeHoldsCount: number;
  nearestHoldExpiryUtc: string | null;
  checkedInNowCount: number;
  activeResourcesCount: number;
}

export interface VenueOverviewHourlyLoadBucket {
  hour: number; // 0..23
  label: string; // "00:00", "01:00", etc.
  held: number;
  confirmed: number;
  checkedIn: number;
  completed: number;
  other: number;
  total: number;
}

export interface VenueOverviewAtAGlanceItem {
  status: Booking360Status;
  count: number;
}

export interface VenueOverviewUpNextItem {
  reservationId: string;
  reservationNumber: string;
  resourceId: string;
  resourceName: string;
  customerPartyId: string | null;
  customerDisplayName: string | null;
  status: Booking360Status;
  startUtc: string;
  endUtc: string;
  startLocal: string;
  endLocal: string;
}

export interface VenueOverviewResourceActivityItem {
  resourceId: string;
  resourceName: string;
  facilityId: string;
  statusLabel: "checkedIn" | "nextBooking" | "noActiveBooking";
  currentOrNextEndUtc: string | null;
  currentOrNextStartUtc: string | null;
  activeReservationId: string | null;
}

export interface VenueOverviewState {
  stage: "loading" | "ready" | "empty" | "failed";
  facilityId: string;
  facilityName: string;
  timeZoneId: string;
  asOfUtc: string;
  localDate: string;
  kpis: VenueOverviewKpiData;
  hourlyLoad: VenueOverviewHourlyLoadBucket[];
  atAGlance: VenueOverviewAtAGlanceItem[];
  upNext: VenueOverviewUpNextItem[];
  resourceActivity: VenueOverviewResourceActivityItem[];
  recentActivityDeferred: true;
  error: boolean;
}
