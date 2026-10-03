import type { OperationsCalendarDay, CalendarResource, OperationsCalendarBlock } from "@modules/venue/operations-calendar/src/domain/entities/OperationsCalendar";
import type { VenueOverviewState } from "../../domain/entities/VenueOverview";
import type { VenueAttentionPage } from "@modules/venue/attention-center/src/domain/entities/VenueAttention";

export function getRealisticVenueOperationalData(targetDate?: string): VenueOverviewState {
  const today = targetDate || new Date().toISOString().slice(0, 10);
  const now = new Date();
  const currentHour = now.getHours();

  // Sports Resources
  const resources: CalendarResource[] = [
    {
      id: "res-padel-1",
      name: "Padel Court 1 (Indoor Panoramic)",
      profileId: "prof-padel",
      profileName: "Padel",
      facilityId: "fac-cairo-downtown",
      facilityName: "Al-Ahly Sports Hub & Padel Club",
      resourceKindCode: "Padel",
      timeZoneId: "Africa/Cairo",
    },
    {
      id: "res-padel-2",
      name: "Padel Court 2 (Indoor Panoramic)",
      profileId: "prof-padel",
      profileName: "Padel",
      facilityId: "fac-cairo-downtown",
      facilityName: "Al-Ahly Sports Hub & Padel Club",
      resourceKindCode: "Padel",
      timeZoneId: "Africa/Cairo",
    },
    {
      id: "res-padel-3",
      name: "Padel Court 3 (Outdoor Pro)",
      profileId: "prof-padel",
      profileName: "Padel",
      facilityId: "fac-cairo-downtown",
      facilityName: "Al-Ahly Sports Hub & Padel Club",
      resourceKindCode: "Padel",
      timeZoneId: "Africa/Cairo",
    },
    {
      id: "res-football-1",
      name: "Pitch A (7v7 Turf)",
      profileId: "prof-football",
      profileName: "Football",
      facilityId: "fac-cairo-downtown",
      facilityName: "Al-Ahly Sports Hub & Padel Club",
      resourceKindCode: "Football",
      timeZoneId: "Africa/Cairo",
    },
    {
      id: "res-tennis-1",
      name: "Clay Court 1",
      profileId: "prof-tennis",
      profileName: "Tennis",
      facilityId: "fac-cairo-downtown",
      facilityName: "Al-Ahly Sports Hub & Padel Club",
      resourceKindCode: "Tennis",
      timeZoneId: "Africa/Cairo",
    },
    {
      id: "res-basket-1",
      name: "Indoor Basketball Arena",
      profileId: "prof-basket",
      profileName: "Basketball",
      facilityId: "fac-cairo-downtown",
      facilityName: "Al-Ahly Sports Hub & Padel Club",
      resourceKindCode: "Basketball",
      timeZoneId: "Africa/Cairo",
    },
    {
      id: "res-swim-1",
      name: "Olympic Pool (Lane 1-4)",
      profileId: "prof-swim",
      profileName: "Swimming",
      facilityId: "fac-cairo-downtown",
      facilityName: "Al-Ahly Sports Hub & Padel Club",
      resourceKindCode: "Swimming",
      timeZoneId: "Africa/Cairo",
    },
    {
      id: "res-gym-1",
      name: "Performance & Fitness Studio",
      profileId: "prof-gym",
      profileName: "Gym",
      facilityId: "fac-cairo-downtown",
      facilityName: "Al-Ahly Sports Hub & Padel Club",
      resourceKindCode: "Gym",
      timeZoneId: "Africa/Cairo",
    },
  ];

  // Helper to format ISO strings
  const pad = (n: number) => n.toString().padStart(2, "0");
  const isoTime = (h: number, m: number = 0) => `${today}T${pad(h)}:${pad(m)}:00Z`;

  interface MockCalendarBlock {
    id?: string;
    resourceId: string;
    reservationId?: string | null;
    reservationNumber?: string | null;
    holdId?: string | null;
    customerPartyId?: string | null;
    customerDisplayName?: string;
    status: string;
    startUtc: string;
    endUtc: string;
    label?: string;
  }

  // Realistic Operational Blocks
  const blocks: MockCalendarBlock[] = [
    // Padel 1: Morning Completed, Currently Checked In, Afternoon Confirmed, Evening Hold
    {
      id: "blk-101",
      resourceId: "res-padel-1",
      reservationId: "res-001",
      reservationNumber: "RES-9801",
      holdId: null,
      customerPartyId: "cust-1",
      customerDisplayName: "Tamer Hosny",
      status: "Completed",
      startUtc: isoTime(7, 0),
      endUtc: isoTime(8, 30),
      label: "Morning Drill — Tamer Hosny",
    },
    {
      id: "blk-102",
      resourceId: "res-padel-1",
      reservationId: "res-002",
      reservationNumber: "RES-9802",
      holdId: null,
      customerPartyId: "cust-2",
      customerDisplayName: "Karim Zaki",
      status: "CheckedIn",
      startUtc: isoTime(9, 0),
      endUtc: isoTime(11, 0),
      label: "Match: Zaki vs Mansour",
    },
    {
      id: "blk-103",
      resourceId: "res-padel-1",
      reservationId: "res-003",
      reservationNumber: "RES-9803",
      holdId: null,
      customerPartyId: "cust-3",
      customerDisplayName: "Youssef Nabil",
      status: "Confirmed",
      startUtc: isoTime(12, 0),
      endUtc: isoTime(13, 30),
      label: "Private Coaching — Youssef Nabil",
    },
    {
      id: "blk-104",
      resourceId: "res-padel-1",
      reservationId: null,
      reservationNumber: null,
      holdId: "hld-001",
      customerPartyId: "cust-4",
      customerDisplayName: "Omar Tarek",
      status: "Held",
      startUtc: isoTime(16, 0),
      endUtc: isoTime(17, 30),
      label: "Hold (15m expiry) — Omar Tarek",
    },
    {
      id: "blk-105",
      resourceId: "res-padel-1",
      reservationId: "res-005",
      reservationNumber: "RES-9805",
      holdId: null,
      customerPartyId: "cust-5",
      customerDisplayName: "Ahmed Ezz",
      status: "Confirmed",
      startUtc: isoTime(18, 0),
      endUtc: isoTime(20, 0),
      label: "Evening League QF",
    },

    // Padel 2: Checked In now, Maintenance slot, Confirmed evening
    {
      id: "blk-201",
      resourceId: "res-padel-2",
      reservationId: "res-006",
      reservationNumber: "RES-9806",
      holdId: null,
      customerPartyId: "cust-6",
      customerDisplayName: "Tariq Mansour",
      status: "CheckedIn",
      startUtc: isoTime(8, 30),
      endUtc: isoTime(10, 30),
      label: "Singles Ladder — Tariq Mansour",
    },
    {
      id: "blk-202",
      resourceId: "res-padel-2",
      reservationId: null,
      reservationNumber: null,
      holdId: null,
      customerPartyId: null,
      customerDisplayName: "Maintenance Team",
      status: "Maintenance",
      startUtc: isoTime(11, 0),
      endUtc: isoTime(12, 0),
      label: "Turf Glass Inspection & Brushing",
    },
    {
      id: "blk-203",
      resourceId: "res-padel-2",
      reservationId: "res-007",
      reservationNumber: "RES-9807",
      holdId: null,
      customerPartyId: "cust-7",
      customerDisplayName: "Ziad El-Sayed",
      status: "Confirmed",
      startUtc: isoTime(14, 0),
      endUtc: isoTime(16, 0),
      label: "Doubles Social Match",
    },
    {
      id: "blk-204",
      resourceId: "res-padel-2",
      reservationId: "res-008",
      reservationNumber: "RES-9808",
      holdId: null,
      customerPartyId: "cust-8",
      customerDisplayName: "Mohamed Samir",
      status: "Confirmed",
      startUtc: isoTime(17, 30),
      endUtc: isoTime(19, 0),
      label: "Smash Padel Tournament",
    },

    // Padel 3: Confirmed, CheckedIn
    {
      id: "blk-301",
      resourceId: "res-padel-3",
      reservationId: "res-009",
      reservationNumber: "RES-9809",
      holdId: null,
      customerPartyId: "cust-9",
      customerDisplayName: "Sherif Amer",
      status: "CheckedIn",
      startUtc: isoTime(9, 30),
      endUtc: isoTime(11, 0),
      label: "Corporate Booking — Amer & Partners",
    },
    {
      id: "blk-302",
      resourceId: "res-padel-3",
      reservationId: "res-010",
      reservationNumber: "RES-9810",
      holdId: null,
      customerPartyId: "cust-10",
      customerDisplayName: "Malak Fahmy",
      status: "Confirmed",
      startUtc: isoTime(13, 0),
      endUtc: isoTime(14, 30),
      label: "Ladies Clinic — Malak Fahmy",
    },

    // Football Pitch A
    {
      id: "blk-401",
      resourceId: "res-football-1",
      reservationId: "res-011",
      reservationNumber: "RES-9811",
      holdId: null,
      customerPartyId: "cust-11",
      customerDisplayName: "Arsenal Cairo Academy",
      status: "CheckedIn",
      startUtc: isoTime(8, 0),
      endUtc: isoTime(10, 0),
      label: "Academy Training U16",
    },
    {
      id: "blk-402",
      resourceId: "res-football-1",
      reservationId: "res-012",
      reservationNumber: "RES-9812",
      holdId: null,
      customerPartyId: "cust-12",
      customerDisplayName: "Cairo Tigers FC",
      status: "Confirmed",
      startUtc: isoTime(15, 0),
      endUtc: isoTime(17, 0),
      label: "Youth Premier League Match",
    },
    {
      id: "blk-403",
      resourceId: "res-football-1",
      reservationId: null,
      reservationNumber: null,
      holdId: "hld-002",
      customerPartyId: "cust-13",
      customerDisplayName: "Vodafone Corporate",
      status: "Held",
      startUtc: isoTime(18, 0),
      endUtc: isoTime(20, 0),
      label: "Held Corporate Tournament",
    },

    // Tennis Court 1
    {
      id: "blk-501",
      resourceId: "res-tennis-1",
      reservationId: "res-013",
      reservationNumber: "RES-9813",
      holdId: null,
      customerPartyId: "cust-14",
      customerDisplayName: "Nouran Gohar",
      status: "CheckedIn",
      startUtc: isoTime(8, 0),
      endUtc: isoTime(9, 30),
      label: "Pro Squad Practice",
    },
    {
      id: "blk-502",
      resourceId: "res-tennis-1",
      reservationId: "res-014",
      reservationNumber: "RES-9814",
      holdId: null,
      customerPartyId: "cust-15",
      customerDisplayName: "Hazem Emam",
      status: "Confirmed",
      startUtc: isoTime(10, 0),
      endUtc: isoTime(11, 30),
      label: "Member Session — Hazem Emam",
    },

    // Basketball Arena
    {
      id: "blk-601",
      resourceId: "res-basket-1",
      reservationId: "res-015",
      reservationNumber: "RES-9815",
      holdId: null,
      customerPartyId: "cust-16",
      customerDisplayName: "Zamalek Youth Basketball",
      status: "Confirmed",
      startUtc: isoTime(14, 0),
      endUtc: isoTime(16, 0),
      label: "Junior Basketball League",
    },

    // Olympic Pool
    {
      id: "blk-701",
      resourceId: "res-swim-1",
      reservationId: "res-016",
      reservationNumber: "RES-9816",
      holdId: null,
      customerPartyId: "cust-17",
      customerDisplayName: "Cairo Masters Swimming",
      status: "CheckedIn",
      startUtc: isoTime(7, 0),
      endUtc: isoTime(9, 0),
      label: "Morning Masters Swim",
    },

    // Gym Studio
    {
      id: "blk-801",
      resourceId: "res-gym-1",
      reservationId: "res-017",
      reservationNumber: "RES-9817",
      holdId: null,
      customerPartyId: "cust-18",
      customerDisplayName: "Coach Aly Mazhar",
      status: "Confirmed",
      startUtc: isoTime(11, 0),
      endUtc: isoTime(12, 30),
      label: "Athletic Conditioning Bootcamp",
    },
  ];

  const timelineDay: OperationsCalendarDay = {
    dateLocal: today,
    timeZoneId: "Africa/Cairo",
    fromUtc: `${today}T06:00:00Z`,
    toUtc: `${today}T23:00:00Z`,
    asOfUtc: now.toISOString(),
    isTruncated: false,
    blocks: blocks as unknown as OperationsCalendarBlock[],
  };

  // Up Next Items
  const upNext = [
    {
      reservationId: "res-003",
      reservationNumber: "RES-9803",
      resourceId: "res-padel-1",
      resourceName: "Padel Court 1 (Indoor Panoramic)",
      customerPartyId: "cust-3",
      customerDisplayName: "Youssef Nabil",
      status: "Confirmed" as const,
      startUtc: isoTime(12, 0),
      endUtc: isoTime(13, 30),
      startLocal: `${today} 12:00`,
      endLocal: `${today} 13:30`,
    },
    {
      reservationId: "res-010",
      reservationNumber: "RES-9810",
      resourceId: "res-padel-3",
      resourceName: "Padel Court 3 (Outdoor Pro)",
      customerPartyId: "cust-10",
      customerDisplayName: "Malak Fahmy",
      status: "Confirmed" as const,
      startUtc: isoTime(13, 0),
      endUtc: isoTime(14, 30),
      startLocal: `${today} 13:00`,
      endLocal: `${today} 14:30`,
    },
    {
      reservationId: "res-007",
      reservationNumber: "RES-9807",
      resourceId: "res-padel-2",
      resourceName: "Padel Court 2 (Indoor Panoramic)",
      customerPartyId: "cust-7",
      customerDisplayName: "Ziad El-Sayed",
      status: "Confirmed" as const,
      startUtc: isoTime(14, 0),
      endUtc: isoTime(16, 0),
      startLocal: `${today} 14:00`,
      endLocal: `${today} 16:00`,
    },
    {
      reservationId: "res-015",
      reservationNumber: "RES-9815",
      resourceId: "res-basket-1",
      resourceName: "Indoor Basketball Arena",
      customerPartyId: "cust-16",
      customerDisplayName: "Zamalek Youth Basketball",
      status: "Confirmed" as const,
      startUtc: isoTime(14, 0),
      endUtc: isoTime(16, 0),
      startLocal: `${today} 14:00`,
      endLocal: `${today} 16:00`,
    },
    {
      reservationId: "res-012",
      reservationNumber: "RES-9812",
      resourceId: "res-football-1",
      resourceName: "Pitch A (7v7 Turf)",
      customerPartyId: "cust-12",
      customerDisplayName: "Cairo Tigers FC",
      status: "Confirmed" as const,
      startUtc: isoTime(15, 0),
      endUtc: isoTime(17, 0),
      startLocal: `${today} 15:00`,
      endLocal: `${today} 17:00`,
    },
  ];

  // Resource Activity Pulse
  const resourceActivity = [
    {
      resourceId: "res-padel-1",
      resourceName: "Padel Court 1 (Indoor Panoramic)",
      facilityId: "fac-cairo-downtown",
      statusLabel: "checkedIn" as const,
      currentOrNextEndUtc: isoTime(11, 0),
      currentOrNextStartUtc: null,
      activeReservationId: "res-002",
    },
    {
      resourceId: "res-padel-2",
      resourceName: "Padel Court 2 (Indoor Panoramic)",
      facilityId: "fac-cairo-downtown",
      statusLabel: "checkedIn" as const,
      currentOrNextEndUtc: isoTime(10, 30),
      currentOrNextStartUtc: null,
      activeReservationId: "res-006",
    },
    {
      resourceId: "res-padel-3",
      resourceName: "Padel Court 3 (Outdoor Pro)",
      facilityId: "fac-cairo-downtown",
      statusLabel: "checkedIn" as const,
      currentOrNextEndUtc: isoTime(11, 0),
      currentOrNextStartUtc: null,
      activeReservationId: "res-009",
    },
    {
      resourceId: "res-football-1",
      resourceName: "Pitch A (7v7 Turf)",
      facilityId: "fac-cairo-downtown",
      statusLabel: "checkedIn" as const,
      currentOrNextEndUtc: isoTime(10, 0),
      currentOrNextStartUtc: null,
      activeReservationId: "res-011",
    },
    {
      resourceId: "res-tennis-1",
      resourceName: "Clay Court 1",
      facilityId: "fac-cairo-downtown",
      statusLabel: "nextBooking" as const,
      currentOrNextEndUtc: null,
      currentOrNextStartUtc: isoTime(10, 0),
      activeReservationId: null,
    },
    {
      resourceId: "res-basket-1",
      resourceName: "Indoor Basketball Arena",
      facilityId: "fac-cairo-downtown",
      statusLabel: "nextBooking" as const,
      currentOrNextEndUtc: null,
      currentOrNextStartUtc: isoTime(14, 0),
      activeReservationId: null,
    },
    {
      resourceId: "res-swim-1",
      resourceName: "Olympic Pool (Lane 1-4)",
      facilityId: "fac-cairo-downtown",
      statusLabel: "checkedIn" as const,
      currentOrNextEndUtc: isoTime(9, 0),
      currentOrNextStartUtc: null,
      activeReservationId: "res-016",
    },
    {
      resourceId: "res-gym-1",
      resourceName: "Performance & Fitness Studio",
      facilityId: "fac-cairo-downtown",
      statusLabel: "noActiveBooking" as const,
      currentOrNextEndUtc: null,
      currentOrNextStartUtc: null,
      activeReservationId: null,
    },
  ];

  // Hourly Load curve (peak afternoon/evening)
  const hourlyLoad = Array.from({ length: 24 }, (_, h) => {
    let held = 0;
    let confirmed = 0;
    let checkedIn = 0;
    let completed = 0;

    if (h < 6) {
      // closed
    } else if (h < 9) {
      completed = h === 7 ? 2 : 1;
      checkedIn = h === 8 ? 4 : 2;
    } else if (h < 12) {
      checkedIn = 5;
      confirmed = 2;
    } else if (h < 15) {
      confirmed = 4;
      held = 1;
    } else if (h < 19) {
      confirmed = 7;
      held = 2;
    } else if (h < 22) {
      confirmed = 6;
      held = 1;
    }

    const total = held + confirmed + checkedIn + completed;
    return {
      hour: h,
      label: `${pad(h)}:00`,
      held,
      confirmed,
      checkedIn,
      completed,
      other: 0,
      total,
    };
  });

  return {
    stage: "ready",
    facilityId: "fac-cairo-downtown",
    facilityName: "Al-Ahly Sports Hub & Padel Club",
    timeZoneId: "Africa/Cairo",
    asOfUtc: now.toISOString(),
    localDate: today,
    kpis: {
      todayReservationsCount: 28,
      todayReservationsConfirmedCount: 16,
      todayReservationsCheckedInCount: 6,
      activeHoldsCount: 3,
      nearestHoldExpiryUtc: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
      checkedInNowCount: 6,
      activeResourcesCount: 8,
    },
    hourlyLoad,
    atAGlance: [
      { status: "Confirmed", count: 16 },
      { status: "CheckedIn", count: 6 },
      { status: "Held", count: 3 },
      { status: "Completed", count: 3 },
    ],
    upNext,
    resourceActivity,
    timelineDay,
    timelineResources: resources,
    recentActivityDeferred: true,
    error: false,
  };
}

export function getRealisticVenueAttentionData(): VenueAttentionPage {
  const nowIso = new Date().toISOString();
  return {
    items: [
      {
        kind: "HardBlackoutOverlapsLiveAllocation",
        severity: "High",
        resourceId: "res-padel-1",
        resourceName: "Padel Court 1 (Indoor Panoramic)",
        reservationId: "res-003",
        blockId: "blk-104",
        startUtc: nowIso,
        endUtc: null,
        occurredAtUtc: nowIso,
      },
      {
        kind: "HardMaintenanceBlockOverlapsLiveAllocation",
        severity: "Warning",
        resourceId: "res-padel-2",
        resourceName: "Padel Court 2 (Indoor Panoramic)",
        reservationId: null,
        blockId: "blk-202",
        startUtc: nowIso,
        endUtc: null,
        occurredAtUtc: nowIso,
      },
      {
        kind: "PublishedResourceWithoutUsableBaseCalendar",
        severity: "Warning",
        resourceId: "res-gym-1",
        resourceName: "Performance & Fitness Studio",
        reservationId: null,
        blockId: null,
        startUtc: null,
        endUtc: null,
        occurredAtUtc: nowIso,
      },
    ],
    totalCount: 3,
    page: 1,
    pageSize: 10,
    asOfUtc: nowIso,
  };
}
