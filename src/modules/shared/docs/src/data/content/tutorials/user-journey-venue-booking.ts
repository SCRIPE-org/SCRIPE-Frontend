import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "tutorials.ujVenueBooking.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "tutorials.ujVenueBooking.infoTitle",
    contentKey: "tutorials.ujVenueBooking.infoContent",
  },

  // ─── Step 1: Sites & Facility Creation ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujVenueBooking.step1Title",
    id: "step-1-sites-facilities",
  },
  { type: "paragraph", contentKey: "tutorials.ujVenueBooking.step1Desc" },
  {
    type: "code",
    language: "json",
    filename: "Create Site (POST /api/v1/venue/sites)",
    code: `{
  "name": "Manhattan Sports Complex",
  "address": "450 W 33rd St, New York, NY 10001",
  "timeZone": "America/New_York",
  "latitude": 40.7535,
  "longitude": -73.9995
}`,
  },

  // ─── Step 2: Schedulable Resource Tree Builder ────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujVenueBooking.step2Title",
    id: "step-2-resource-tree",
  },
  { type: "paragraph", contentKey: "tutorials.ujVenueBooking.step2Desc" },
  {
    type: "code",
    language: "text",
    filename: "Resource Hierarchy Visual Structure",
    code: `Manhattan Sports Complex (Site)
└── Building A: Indoor Arenas (Facility)
    ├── Basketball Court 1 (Schedulable Resource - Hardwood)
    │   ├── Half Court A (Sub-resource)
    │   └── Half Court B (Sub-resource)
    ├── Tennis Court East (Schedulable Resource - Clay)
    └── Padel Court North (Schedulable Resource - Panoramic Glass)`,
  },

  // ─── Step 3: Operating Hours, Blackouts & Maintenance ─────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujVenueBooking.step3Title",
    id: "step-3-hours-blackouts",
  },
  { type: "paragraph", contentKey: "tutorials.ujVenueBooking.step3Desc" },

  // ─── Step 4: Operating the Visual Booking Workspace ───────────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujVenueBooking.step4Title",
    id: "step-4-booking-workspace",
  },
  { type: "paragraph", contentKey: "tutorials.ujVenueBooking.step4Desc" },

  // ─── Step 5: 2-Phase Concurrency Hold & Final Confirmation ────────
  {
    type: "heading",
    level: 2,
    titleKey: "tutorials.ujVenueBooking.step5Title",
    id: "step-5-two-phase-hold",
  },
  { type: "paragraph", contentKey: "tutorials.ujVenueBooking.step5Desc" },
  {
    type: "code",
    language: "bash",
    filename: "Create Draft (POST /api/v1/Reservations)",
    code: `curl -X POST http://localhost:5000/api/v1/Reservations \\
  -H "Authorization: Bearer \$TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "resourceId": "<encrypted-resource-id>",
    "customerPartyId": "<encrypted-party-id>",
    "requestedStartUtc": "2026-10-20T09:00:00Z",
    "requestedEndUtc": "2026-10-20T10:00:00Z",
    "quantity": 1,
    "idempotencyKey": "draft_intent_8f93a10c-2374-4b51"
  }'`,
  },
  {
    type: "code",
    language: "bash",
    filename: "Hold Acquisition (POST /api/v1/BookingHolds)",
    code: `curl -X POST http://localhost:5000/api/v1/BookingHolds \\
  -H "Authorization: Bearer \$TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "reservationId": "<encrypted-reservation-id>",
    "idempotencyKey": "hold_intent_45ae79e1-65d1-447e"
  }'`,
  },
  {
    type: "code",
    language: "bash",
    filename: "Calculate Price Quote (reuse the same body and key on retry)",
    code: `curl -X POST http://localhost:5000/api/v1/catalog-pricing/price-quotes/calculate \\
  -H "Authorization: Bearer \$TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "offeringId": "<encrypted-offering-id>",
    "schedulableResourceId": "<encrypted-resource-id>",
    "partyId": "<encrypted-party-id>",
    "quantity": 1,
    "requestedStartUtc": "2026-10-20T09:00:00Z",
    "requestedEndUtc": "2026-10-20T10:00:00Z",
    "currencyCode": "EGP",
    "expiresAtUtc": "2026-10-20T09:30:00Z",
    "idempotencyKey": "quote_intent_6198e7f8-52b2-4e73"
  }'`,
  },
];

registerPage({
  slug: "tutorials/user-journey-venue-booking",
  titleKey: "tutorials.ujVenueBooking.title",
  descriptionKey: "tutorials.ujVenueBooking.description",
  category: "tutorials",
  order: 2,
  sections,
  relatedSlugs: ["modules/venue-overview", "tutorials/user-journey-pricing-finance"],
  lastUpdated: "2026-10-14",
});
