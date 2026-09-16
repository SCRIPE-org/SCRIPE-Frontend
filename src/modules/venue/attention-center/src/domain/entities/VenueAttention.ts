export type VenueAttentionKind =
  | "PublishedResourceWithoutUsableBaseCalendar"
  | "HardBlackoutOverlapsLiveAllocation"
  | "HardMaintenanceBlockOverlapsLiveAllocation";

export type VenueAttentionSeverity = "Warning" | "High";

export interface VenueAttentionSignal {
  kind: VenueAttentionKind;
  severity: VenueAttentionSeverity;
  resourceId: string;
  resourceName: string;
  reservationId: string | null;
  blockId: string | null;
  startUtc: string | null;
  endUtc: string | null;
  occurredAtUtc: string;
}

export interface VenueAttentionPage {
  items: VenueAttentionSignal[];
  totalCount: number;
  page: number;
  pageSize: number;
  asOfUtc: string;
}
