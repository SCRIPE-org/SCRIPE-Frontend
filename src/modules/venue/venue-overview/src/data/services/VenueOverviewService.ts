import type { Booking360Status } from "@modules/venue/booking-360/src/domain/entities/Booking360";
import type { IOperationsCalendarRepository } from "@modules/venue/operations-calendar/src/domain/interfaces/IOperationsCalendarRepository";
import type { ISchedulableResourceRepository } from "@modules/venue/schedulable-resource/src/domain/interfaces/ISchedulableResourceRepository";
import type { IFacilityResourceProfileRepository } from "@modules/venue/facility-resource-profile/src/domain/interfaces/IFacilityResourceProfileRepository";
import type { IFacilityRepository } from "@modules/venue/facility/src/domain/interfaces/IFacilityRepository";
import type { IVenueOverviewService } from "../../domain/interfaces/IVenueOverviewService";
import type {
  VenueOverviewAtAGlanceItem,
  VenueOverviewHourlyLoadBucket,
  VenueOverviewKpiData,
  VenueOverviewResourceActivityItem,
  VenueOverviewState,
  VenueOverviewUpNextItem,
} from "../../domain/entities/VenueOverview";

export interface ICustomerPartyRepository {
  getById(id: string): Promise<{ id: string; displayName: string } | null>;
}

function toLocalDateTime(utc: string, timeZoneId: string): string {
  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZoneId,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(utc));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    values.find((value) => value.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:${part("second")}`;
}

// Mirrors the server-enforced Operations Calendar request bound. Larger facilities
// are fetched in complete batches; each request remains independently valid.
const MAX_OVERVIEW_RESOURCES = 50;
const MAX_PROFILE_FILTERS = 100;
const PAGE_SIZE = 100;

function chunks<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let offset = 0; offset < items.length; offset += size) result.push(items.slice(offset, offset + size));
  return result;
}

export class VenueOverviewService implements IVenueOverviewService {
  constructor(
    private readonly operationsCalendarRepo: IOperationsCalendarRepository,
    private readonly schedulableResourceRepo: ISchedulableResourceRepository,
    private readonly profileRepo: IFacilityResourceProfileRepository,
    private readonly facilityRepo: IFacilityRepository,
    private readonly customerRepo?: ICustomerPartyRepository
  ) {}

  async getOverview(
    facilityIdInput?: string,
    targetLocalDateInput?: string
  ): Promise<VenueOverviewState> {
    // 1. Resolve facility context
    let facilityId = facilityIdInput;
    let facilityName = "";
    if (facilityIdInput) {
      try {
        const facility = await this.facilityRepo.getById(facilityIdInput);
        facilityId = facility.id;
        facilityName = facility.name;
      } catch {
        // A caller-selected facility must never be silently replaced by another facility.
        throw new Error("Failed to resolve the selected facility for venue overview.");
      }
    } else {
      try {
        const facilityPage = await this.facilityRepo.getAll({ page: 1, pageSize: 50 });
        if (facilityPage.items.length > 0) {
          facilityId = facilityPage.items[0]!.id;
          facilityName = facilityPage.items[0]!.name;
        }
      } catch {
        // The no-selection path has no authoritative facility context to project.
      }
    }

    const localDate = targetLocalDateInput || new Date().toISOString().slice(0, 10);
    const nowUtc = new Date();
    const currentUtcIso = nowUtc.toISOString();

    // There is no authoritative facility context to project when this tenant has no
    // facilities. Do not substitute a fictional facility identifier or display name.
    if (!facilityId) {
      return {
        stage: "empty",
        facilityId: "",
        facilityName: "",
        timeZoneId: "UTC",
        asOfUtc: currentUtcIso,
        localDate,
        kpis: {
          todayReservationsCount: 0,
          todayReservationsConfirmedCount: 0,
          todayReservationsCheckedInCount: 0,
          activeHoldsCount: 0,
          nearestHoldExpiryUtc: null,
          checkedInNowCount: 0,
          activeResourcesCount: 0,
        },
        hourlyLoad: [],
        atAGlance: [],
        upNext: [],
        resourceActivity: [],
        recentActivityDeferred: true,
        error: false,
      };
    }

    // 2. Resolve facility resources and timezone before requesting the authoritative projection.
    // The calendar contract deliberately requires both; a facility-level wildcard would leak
    // occupancy outside the resources the overview is allowed to compose.
    const firstProfilePage = await this.profileRepo.getAll({
      page: 1,
      pageSize: PAGE_SIZE,
      facilityId,
    });
    const profiles = [...firstProfilePage.items];
    for (let page = 2; profiles.length < firstProfilePage.totalCount; page += 1) {
      const nextPage = await this.profileRepo.getAll({ page, pageSize: PAGE_SIZE, facilityId });
      profiles.push(...nextPage.items);
      if (nextPage.items.length === 0) break;
    }

    const facilityProfileIds = profiles.map((profile) => profile.id);
    const resourcePages = await Promise.all(
      chunks(facilityProfileIds, MAX_PROFILE_FILTERS).map(async (profileIds) => {
        const firstPage = await this.schedulableResourceRepo.getAll({
          page: 1,
          pageSize: PAGE_SIZE,
          facilityResourceProfileIds: profileIds,
        });
        const pages = [...firstPage.items];
        for (let page = 2; pages.length < firstPage.totalCount; page += 1) {
          const nextPage = await this.schedulableResourceRepo.getAll({
            page,
            pageSize: PAGE_SIZE,
            facilityResourceProfileIds: profileIds,
          });
          pages.push(...nextPage.items);
          if (nextPage.items.length === 0) break;
        }
        return pages;
      })
    );
    const resources = resourcePages.flat();
    const facilityResources = resources.filter((resource) => resource.isPublished && !resource.isComposite);
    const timeZoneId = profiles[0]
      ?.operatingPolicy?.timeZoneId ?? "UTC";

    let projections;
    try {
      projections = await Promise.all(
        chunks(facilityResources, MAX_OVERVIEW_RESOURCES).map((resourceBatch) =>
          this.operationsCalendarRepo.getDay({
            dateLocal: localDate,
            timeZoneId,
            resourceIds: resourceBatch.map((resource) => resource.id),
          })
        )
      );
    } catch {
      throw new Error("Failed to load operations calendar day projection for venue overview.");
    }

    // The calendar explicitly tells us when it cannot return a complete batch. Never
    // compose partial KPIs from that response; the UI must state the limit honestly.
    if (projections.some((projection) => projection.isTruncated)) {
      return {
        stage: "limited",
        facilityId,
        facilityName,
        timeZoneId,
        asOfUtc: currentUtcIso,
        localDate,
        kpis: { todayReservationsCount: 0, todayReservationsConfirmedCount: 0, todayReservationsCheckedInCount: 0, activeHoldsCount: 0, nearestHoldExpiryUtc: null, checkedInNowCount: 0, activeResourcesCount: 0 },
        hourlyLoad: [], atAGlance: [], upNext: [], resourceActivity: [], recentActivityDeferred: true, error: false,
      };
    }

    const blocks = projections.flatMap((projection) => projection.blocks ?? []);

    // Build resource ID to name lookup
    const resourceMap = new Map(resources.map((r) => [r.id, r.name]));

    // 3. Deduplicate and enrich Party Customer Display Names with failure isolation
    const partyIds = Array.from(
      new Set(blocks.map((b) => b.customerPartyId).filter((id): id is string => Boolean(id)))
    );
    const customerMap = new Map<string, string>();

    if (this.customerRepo && partyIds.length > 0) {
      await Promise.all(
        partyIds.map(async (partyId) => {
          try {
            const customer = await this.customerRepo!.getById(partyId);
            if (customer?.displayName) {
              customerMap.set(partyId, customer.displayName);
            }
          } catch {
            // Failure isolation: customer enrichment error must not fail overview
          }
        })
      );
    }

    // 4. Derive KPI 1: Today's Reservations
    const todayReservationsCount = blocks.length;
    const todayReservationsConfirmedCount = blocks.filter((b) => b.status === "Confirmed").length;
    const todayReservationsCheckedInCount = blocks.filter((b) => b.status === "CheckedIn").length;

    // 5. Derive KPI 2: Active Holds
    const heldBlocks = blocks.filter((b) => b.status === "Held");
    const activeHoldsCount = heldBlocks.length;
    let nearestHoldExpiryUtc: string | null = null;
    // Expiry subtext if available in projection blocks
    if (heldBlocks.length > 0) {
      const expiries = heldBlocks
        .map((block) => block.holdExpiresAtUtc)
        .filter((exp): exp is string => Boolean(exp))
        .sort();
      if (expiries.length > 0) nearestHoldExpiryUtc = expiries[0]!;
    }

    // 6. Derive KPI 3: Checked In Now
    const checkedInNowBlocks = blocks.filter((b) => {
      if (b.status !== "CheckedIn") return false;
      return b.startUtc <= currentUtcIso && b.endUtc >= currentUtcIso;
    });
    const checkedInNowCount = checkedInNowBlocks.length;

    // 7. Derive KPI 4: Active Resources Today
    const uniqueActiveResourceIds = new Set(blocks.map((b) => b.resourceId));
    const activeResourcesCount = uniqueActiveResourceIds.size;

    const kpis: VenueOverviewKpiData = {
      todayReservationsCount,
      todayReservationsConfirmedCount,
      todayReservationsCheckedInCount,
      activeHoldsCount,
      nearestHoldExpiryUtc,
      checkedInNowCount,
      activeResourcesCount,
    };

    // 8. Derive Main Visualization: Today's Operational Load (24 1-hour buckets)
    const hourlyBuckets: VenueOverviewHourlyLoadBucket[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      label: `${hour.toString().padStart(2, "0")}:00`,
      held: 0,
      confirmed: 0,
      checkedIn: 0,
      completed: 0,
      other: 0,
      total: 0,
    }));

    for (const b of blocks) {
      const localTimePart = toLocalDateTime(b.startUtc, timeZoneId).split("T")[1];
      const startHour = localTimePart ? parseInt(localTimePart.split(":")[0] ?? "0", 10) : 0;
      const validHour = isNaN(startHour) ? 0 : Math.min(Math.max(startHour, 0), 23);
      const bucket = hourlyBuckets[validHour]!;

      if (b.status === "Held") bucket.held += 1;
      else if (b.status === "Confirmed") bucket.confirmed += 1;
      else if (b.status === "CheckedIn") bucket.checkedIn += 1;
      else if (b.status === "Completed") bucket.completed += 1;
      else bucket.other += 1;

      bucket.total += 1;
    }

    // 9. Derive Panel: Today at a Glance
    const statusCountsMap = new Map<Booking360Status, number>();
    const trackedStatuses: Booking360Status[] = [
      "Confirmed",
      "Held",
      "CheckedIn",
      "Completed",
      "NoShow",
      "Cancelled",
    ];

    for (const st of trackedStatuses) {
      statusCountsMap.set(st, 0);
    }
    for (const b of blocks) {
      const current = statusCountsMap.get(b.status as Booking360Status) ?? 0;
      statusCountsMap.set(b.status as Booking360Status, current + 1);
    }

    const atAGlance: VenueOverviewAtAGlanceItem[] = trackedStatuses.map((st) => ({
      status: st,
      count: statusCountsMap.get(st) ?? 0,
    }));

    // 10. Derive Operational List: Up Next
    // Filter upcoming blocks (endUtc >= currentUtcIso), sorted by startUtc ascending
    const upcomingBlocks = blocks
      .filter((b) => b.endUtc >= currentUtcIso && b.status !== "Cancelled" && b.status !== "Expired")
      .sort((a, b) => a.startUtc.localeCompare(b.startUtc))
      .slice(0, 8);

    const upNext: VenueOverviewUpNextItem[] = upcomingBlocks.map((b) => {
      const rName = resourceMap.get(b.resourceId) || `Resource ${b.resourceId.slice(0, 6)}`;
      const cName = b.customerPartyId ? customerMap.get(b.customerPartyId) ?? null : null;

      return {
        reservationId: b.reservationId,
        reservationNumber: b.reservationNumber,
        resourceId: b.resourceId,
        resourceName: rName,
        customerPartyId: b.customerPartyId,
        customerDisplayName: cName,
        status: b.status as Booking360Status,
        startUtc: b.startUtc,
        endUtc: b.endUtc,
        startLocal: toLocalDateTime(b.startUtc, timeZoneId),
        endLocal: toLocalDateTime(b.endUtc, timeZoneId),
      };
    });

    // 11. Derive Operational List: Resource Activity.

    const resourceActivity: VenueOverviewResourceActivityItem[] = facilityResources.map((res) => {
      const resBlocks = blocks.filter((b) => b.resourceId === res.id);

      // Active now block (CheckedIn or active period)
      const activeNowBlock = resBlocks.find(
        (b) => b.startUtc <= currentUtcIso && b.endUtc >= currentUtcIso
      );

      if (activeNowBlock && activeNowBlock.status === "CheckedIn") {
        return {
          resourceId: res.id,
          resourceName: res.name,
          facilityId: facilityId!,
          statusLabel: "checkedIn",
          currentOrNextEndUtc: activeNowBlock.endUtc,
          currentOrNextStartUtc: activeNowBlock.startUtc,
          activeReservationId: activeNowBlock.reservationId,
        };
      }

      // Next upcoming block
      const nextBlock = resBlocks
        .filter((b) => b.startUtc > currentUtcIso && b.status !== "Cancelled")
        .sort((a, b) => a.startUtc.localeCompare(b.startUtc))[0];

      if (nextBlock) {
        return {
          resourceId: res.id,
          resourceName: res.name,
          facilityId: facilityId!,
          statusLabel: "nextBooking",
          currentOrNextEndUtc: nextBlock.endUtc,
          currentOrNextStartUtc: nextBlock.startUtc,
          activeReservationId: nextBlock.reservationId,
        };
      }

      // CRITICAL RULE: "noActiveBooking" is used. NEVER label as "Available" from booking absence.
      return {
        resourceId: res.id,
        resourceName: res.name,
        facilityId: facilityId!,
        statusLabel: "noActiveBooking",
        currentOrNextEndUtc: null,
        currentOrNextStartUtc: null,
        activeReservationId: null,
      };
    });

    return {
      stage: "ready",
      facilityId,
      facilityName,
      timeZoneId,
      asOfUtc: projections[0]?.asOfUtc || currentUtcIso,
      localDate,
      kpis,
      hourlyLoad: hourlyBuckets,
      atAGlance,
      upNext,
      resourceActivity,
      recentActivityDeferred: true,
      error: false,
    };
  }
}
