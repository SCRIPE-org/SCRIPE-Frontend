import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.venue.booking.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.venue.booking.infoTitle",
    contentKey: "modules.venue.booking.infoContent",
  },

  // ─── 2-Phase Concurrency Hold Lifecycle ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.booking.holdLifecycleTitle",
    id: "two-phase-holds",
  },
  { type: "paragraph", contentKey: "modules.venue.booking.holdLifecycleDesc" },
  {
    type: "code",
    language: "text",
    filename: "Hold Expiration State Transitions",
    code: `[User Selects Slot]
        │
        ▼ (POST /api/v1/venue/booking-holds)
[Hold Active (10-minute Lock Acquired)] ──(No payment after 10m)──► [Expired / Slot Released]
        │
        ▼ (User Submits Sealed Price Quote & Payment)
[Hold Committed -> Reservation Confirmed]
        │
        ▼ (Customer Arrives)
[Checked-In] ────► [Completed]`,
  },

  // ─── Client-Side Reducer Architecture ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.booking.reducerTitle",
    id: "frontend-reducer",
  },
  { type: "paragraph", contentKey: "modules.venue.booking.reducerDesc" },
  {
    type: "code",
    language: "typescript",
    filename: "src/modules/venue/booking/src/presentation/viewmodels/bookingWorkspaceState.ts",
    code: `export function reduceBookingWorkspace(
  state: BookingWorkspaceState,
  action: BookingWorkspaceAction
): BookingWorkspaceState {
  switch (action.type) {
    case "SET_CRITERIA":
      return { ...state, criteria: action.payload, candidates: [] };
    case "SET_HOLD_ACQUIRED":
      return {
        ...state,
        activeHold: action.payload,
        holdExpiryUtc: action.payload.expiryUtc,
        stage: "held",
      };
    case "SET_CONFIRMED":
      return { ...state, reservation: action.payload, stage: "confirmed" };
    default:
      return state;
  }
}`,
  },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.booking.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/venue/booking-holds",
        descriptionKey: "modules.venue.booking.apiHold",
        auth: "Bearer JWT",
        permission: "venue.holds.create",
      },
      {
        method: "POST",
        path: "/api/v1/venue/reservations/{id}/confirm",
        descriptionKey: "modules.venue.booking.apiConfirm",
        auth: "Bearer JWT",
        permission: "venue.reservations.update",
      },
    ],
  },
];

registerPage({
  slug: "modules/venue/booking-workspace",
  titleKey: "modules.venue.booking.title",
  descriptionKey: "modules.venue.booking.description",
  category: "module-venue",
  order: 4,
  sections,
  relatedSlugs: [
    "modules/venue-overview",
    "modules/venue/availability-engine",
    "tutorials/user-journey-venue-booking",
  ],
  lastUpdated: "2026-10-03",
});
