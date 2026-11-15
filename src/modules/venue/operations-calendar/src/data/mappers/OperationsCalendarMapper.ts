import type {
  CalendarBlockStatus,
  CalendarResource,
  OperationsCalendarBlock,
  OperationsCalendarDay,
} from "../../domain/entities/OperationsCalendar";
import type {
  CalendarResourceDto,
  OperationsCalendarBlockDto,
  OperationsCalendarClosureDto,
  OperationsCalendarDayDto,
} from "../models";

export type {
  CalendarResourceDto,
  OperationsCalendarBlockDto,
  OperationsCalendarClosureDto,
  OperationsCalendarDayDto,
} from "../models";

/**
 * Robust mapper for Operations Calendar responses with null-coalescing defaults.
 */
export class OperationsCalendarMapper {
  static toBlockEntity(dto: OperationsCalendarBlockDto): OperationsCalendarBlock {
    return {
      reservationId: dto.reservationId ?? "",
      reservationNumber: dto.reservationNumber ?? "",
      resourceId: dto.resourceId ?? "",
      status: (dto.status ?? "Confirmed") as CalendarBlockStatus,
      startUtc: dto.startUtc ?? "",
      endUtc: dto.endUtc ?? "",
      quantity: dto.quantity ?? 1,
      customerPartyId: dto.customerPartyId ?? "",
      holdExpiresAtUtc: dto.holdExpiresAtUtc ?? null,
    };
  }

  static toClosureBlock(closure: OperationsCalendarClosureDto): OperationsCalendarBlock {
    const resourceId = closure.resourceId ?? "";
    const startUtc = closure.startUtc ?? "";
    const isMaintenance = closure.closureType === "Maintenance";
    return {
      reservationId: `closure-${resourceId}-${startUtc}`,
      reservationNumber: closure.reason
        ? `⊘ ${closure.reason}`
        : `⊘ ${closure.closureType || "Closure"}`,
      resourceId,
      status: isMaintenance ? "Maintenance" : "Unavailable",
      startUtc,
      endUtc: closure.endUtc ?? "",
      quantity: 1,
      customerPartyId: "",
      holdExpiresAtUtc: null,
    };
  }

  static toResourceEntity(dto: CalendarResourceDto): CalendarResource {
    return {
      id: dto.id ?? "",
      name: dto.name ?? "",
      profileId: dto.profileId ?? "",
      profileName: dto.profileName ?? "",
      facilityId: dto.facilityId ?? "",
      facilityName: dto.facilityName ?? "",
      resourceKindCode: dto.resourceKindCode ?? "Court",
      timeZoneId: dto.timeZoneId ?? "UTC",
      slotPolicy: dto.slotPolicy
        ? {
            slotDurationMinutes: dto.slotPolicy.slotDurationMinutes ?? 60,
            startIncrementMinutes: dto.slotPolicy.startIncrementMinutes ?? 30,
            timeZoneId: dto.slotPolicy.timeZoneId ?? null,
            allowMultiSlot: dto.slotPolicy.allowMultiSlot ?? false,
          }
        : null,
      priceEffectiveFromUtc: dto.priceEffectiveFromUtc ?? null,
    };
  }

  static toDayEntity(dto: OperationsCalendarDayDto | null | undefined): OperationsCalendarDay {
    if (!dto) {
      return {
        dateLocal: "",
        timeZoneId: "UTC",
        fromUtc: "",
        toUtc: "",
        asOfUtc: "",
        isTruncated: false,
        blocks: [],
      };
    }

    const blocks: OperationsCalendarBlock[] = Array.isArray(dto.blocks)
      ? dto.blocks.map(OperationsCalendarMapper.toBlockEntity)
      : [];

    if (Array.isArray(dto.closures)) {
      for (const closure of dto.closures) {
        blocks.push(OperationsCalendarMapper.toClosureBlock(closure));
      }
    }

    return {
      dateLocal: dto.dateLocal ?? "",
      timeZoneId: dto.timeZoneId ?? "UTC",
      fromUtc: dto.fromUtc ?? "",
      toUtc: dto.toUtc ?? "",
      asOfUtc: dto.asOfUtc ?? "",
      isTruncated: dto.isTruncated ?? false,
      blocks,
    };
  }

  /** Backwards compatibility alias for toDayEntity */
  static toEntity(dto: unknown): OperationsCalendarDay {
    return OperationsCalendarMapper.toDayEntity(dto as OperationsCalendarDayDto);
  }
}
