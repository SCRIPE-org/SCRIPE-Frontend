/**
 * Documentation for =
 */
export type VenueAttentionKind =
  | "PublishedResourceWithoutUsableBaseCalendar"
  | "HardBlackoutOverlapsLiveAllocation"
  | "HardMaintenanceBlockOverlapsLiveAllocation";

/**
 * Documentation for "High"
 */
export type VenueAttentionSeverity = "Warning" | "High";

/**
 * Documentation for module export
 */
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

/**
 * Documentation for module export
 */
export interface VenueAttentionPage {
  items: VenueAttentionSignal[];
  totalCount: number;
  page: number;
  pageSize: number;
  asOfUtc: string;
}
