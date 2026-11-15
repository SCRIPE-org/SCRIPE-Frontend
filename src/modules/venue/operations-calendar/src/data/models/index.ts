/** Raw API response DTO for an operations calendar day query. */
export interface OperationsCalendarDayDto {
  dateLocal?: string | null;
  timeZoneId?: string | null;
  fromUtc?: string | null;
  toUtc?: string | null;
  asOfUtc?: string | null;
  isTruncated?: boolean | null;
  blocks?: OperationsCalendarBlockDto[] | null;
  closures?: OperationsCalendarClosureDto[] | null;
}

/** Raw API response DTO for an individual reservation block. */
export interface OperationsCalendarBlockDto {
  reservationId?: string | null;
  reservationNumber?: string | null;
  resourceId?: string | null;
  status?: string | null;
  startUtc?: string | null;
  endUtc?: string | null;
  quantity?: number | null;
  customerPartyId?: string | null;
  holdExpiresAtUtc?: string | null;
}

/** Raw API response DTO for a resource closure / maintenance window. */
export interface OperationsCalendarClosureDto {
  resourceId?: string | null;
  startUtc?: string | null;
  endUtc?: string | null;
  reason?: string | null;
  closureType?: string | null;
}

/** Raw API DTO for a schedulable calendar resource. */
export interface CalendarResourceDto {
  id?: string | null;
  name?: string | null;
  profileId?: string | null;
  profileName?: string | null;
  facilityId?: string | null;
  facilityName?: string | null;
  resourceKindCode?: string | null;
  timeZoneId?: string | null;
  slotPolicy?: {
    slotDurationMinutes?: number | null;
    startIncrementMinutes?: number | null;
    timeZoneId?: string | null;
    allowMultiSlot?: boolean | null;
  } | null;
  priceEffectiveFromUtc?: string | null;
}
