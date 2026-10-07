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
