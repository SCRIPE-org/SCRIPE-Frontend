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
  priceEffectiveFromUtc?: string | null;
  hasCalendar?: boolean;
  isPublished: boolean;
  timeZoneId: string;
  readinessState?: CourtReadinessState;
  readiness?: {
    state: CourtReadinessState;
    missingActions: CourtMissingAction[];
    activatingUntilUtc?: string | null;
  };
}

export type CourtReadinessState =
  | "Ready"
  | "Pricing Activating"
  | "Setup Required"
  | "Unavailable"
  | "Active";

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
  priceEffectiveFromUtc?: string | null;
  hasCalendar?: boolean;
  isUnavailable?: boolean;
  unavailableReason?: string;
  asOfUtc?: string;
}): {
  state: CourtReadinessState;
  missingActions: CourtMissingAction[];
  activatingUntilUtc?: string | null;
} {
  if (court.isUnavailable) {
    return {
      state: "Unavailable",
      missingActions: [],
    };
  }

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

  if (missingActions.length > 0) {
    return {
      state: "Setup Required",
      missingActions,
    };
  }

  // All setup completed. Now verify authoritative pricing activation
  if (court.priceEffectiveFromUtc) {
    const effectiveMs = Date.parse(court.priceEffectiveFromUtc);
    const asOfMs = court.asOfUtc ? Date.parse(court.asOfUtc) : Date.now();

    if (effectiveMs > asOfMs) {
      return {
        state: "Pricing Activating",
        missingActions: [],
        activatingUntilUtc: court.priceEffectiveFromUtc,
      };
    }
  }

  return {
    state: "Ready",
    missingActions: [],
  };
}

export interface CourtCreationResult {
  name: string;
  resourceId?: string;
  success: boolean;
  error?: string;
  stepFailed?: "create" | "publish" | "calendar" | "pricing";
  isCalendarSaved?: boolean;
  isPublished?: boolean;
  isPriceConfigured?: boolean;
}

export interface CourtSetupItem {
  clientKey: string;
  name: string;
  resourceId?: string;
  isCalendarSaved?: boolean;
  isPublished?: boolean;
  isPriceConfigured?: boolean;
  error?: string;
  stepFailed?: "create" | "calendar" | "publish" | "pricing";
  success?: boolean;
}

export interface FirstTimeSetupInput {
  branchName: string;
  facilityId?: string;
  timeZoneId: string;
  sportType: string;
  courts: string[]; // names of courts e.g. ["Padel Court 1", "Padel Court 2"]
  courtItems?: CourtSetupItem[]; // Identity-safe court items with persistent resource IDs
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
  publishImmediately?: boolean;
  existingCourtResources?: Record<string, string>; // legacy fallback
}


