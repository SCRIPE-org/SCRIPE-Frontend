export interface ResourceWorkspaceItem {
  id: string;
  name: string;
  sportType: string;
  profileId: string;
  facilityId: string;
  facilityName: string;
  capacity: number;
  workingHoursSummary: string;
  isOpen247: boolean;
  slotDurationMinutes: number;
  startIncrementMinutes: number;
  pricePerSlot: number | null;
  currencyCode: string;
  isPublished: boolean;
  timeZoneId: string;
}

export type CourtReadinessState = "Active" | "Setup Required" | "Inactive";

export interface CourtMissingAction {
  id: string;
  label: string;
  tab: "general" | "workingHours" | "bookingRules" | "pricing";
}

export function evaluateCourtReadiness(court: {
  isPublished: boolean;
  profileId?: string;
  slotDurationMinutes?: number;
  pricePerSlot?: number | null;
  hasCalendar?: boolean;
}): {
  state: CourtReadinessState;
  missingActions: CourtMissingAction[];
} {
  const missingActions: CourtMissingAction[] = [];

  if (!court.profileId) {
    missingActions.push({
      id: "profile",
      label: "Link to Facility Profile",
      tab: "general",
    });
  }

  if (!court.slotDurationMinutes || court.slotDurationMinutes <= 0) {
    missingActions.push({
      id: "slotPolicy",
      label: "Set Booking Slot Duration",
      tab: "bookingRules",
    });
  }

  if (court.pricePerSlot == null || court.pricePerSlot <= 0) {
    missingActions.push({
      id: "pricing",
      label: "Configure Pricing",
      tab: "pricing",
    });
  }

  if (!court.isPublished) {
    missingActions.push({
      id: "publish",
      label: "Publish Court",
      tab: "general",
    });
  }

  if (court.hasCalendar === false) {
    missingActions.push({
      id: "calendar",
      label: "Set Operating Hours",
      tab: "workingHours",
    });
  }

  const state: CourtReadinessState =
    missingActions.length === 0 ? "Active" : "Setup Required";

  return { state, missingActions };
}

export interface FirstTimeSetupInput {
  branchName: string;
  timeZoneId: string;
  sportType: string;
  courts: string[]; // names of courts e.g. ["Padel Court 1", "Padel Court 2"]
  isOpen247: boolean;
  customWorkingHours?: {
    opensAt: string;
    closesAt: string;
    days: number[]; // 0=Sunday, 1=Monday...
  };
  slotDurationMinutes: number;
  startIncrementMinutes: number;
  pricePerSlot: number;
  currencyCode: string;
}
