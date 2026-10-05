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
    filename: "Hold Acquisition (POST /api/v1/venue/booking-holds)",
    code: `curl -X POST http://localhost:5000/api/v1/venue/booking-holds \\
  -H "Authorization: Bearer \$TOKEN" \\
  -H "X-Idempotency-Key: hold_8f93a10c-2374-4b51" \\
  -H "Content-Type: application/json" \\
  -d '{
    "facilityId": "f781a921-2e55-46aa-bfa7-4f51e0618012",
    "resourceId": "b1836f33-1498-466d-8e68-07d4fa124991",
    "customerReferenceId": "cust_9921",
    "startTimeUtc": "2026-10-10T14:00:00Z",
    "endTimeUtc": "2026-10-10T15:00:00Z",
    "holdDurationMinutes": 10
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
  relatedSlugs: [
    "modules/venue-overview",
    "tutorials/user-journey-pricing-finance",
  ],
  lastUpdated: "2026-10-03",
});
