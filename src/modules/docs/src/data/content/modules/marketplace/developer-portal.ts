import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Introduction ────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.marketplaceDeveloper.intro" },

  // ─── DeveloperProfile Entity ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceDeveloper.profileTitle",
    id: "developer-profile",
  },
  { type: "paragraph", contentKey: "modules.marketplaceDeveloper.profileIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["TenantId", "Guid", "The tenant that owns this developer profile"],
      ["DeveloperName", "string", "Public display name of the developer / organization"],
      ["Website", "string", "Developer's website URL for branding and verification"],
      ["SupportEmail", "string", "Email address for support inquiries from app users"],
      ["Bio", "string", "Developer biography / description shown on the developer page"],
      ["IsVerified", "bool", "Whether the developer has been verified by platform admins"],
      ["StripeConnectAccountId", "string", "Stripe Connect account ID for receiving marketplace payouts"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.marketplaceDeveloper.profileNote",
  },

  // ─── AppSubmission Entity ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceDeveloper.submissionTitle",
    id: "app-submission",
  },
  { type: "paragraph", contentKey: "modules.marketplaceDeveloper.submissionIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["AppListingId", "Guid", "FK to the app listing this submission belongs to"],
      ["PluginVersionId", "Guid", "FK to the specific plugin version being submitted for review"],
      ["Status", "SubmissionStatus", "Current status in the review pipeline (Submitted, InAutomatedScan, InManualReview, Approved, Rejected)"],
      ["SubmittedAt", "DateTime", "UTC timestamp when the developer submitted this version for review"],
      ["ReviewedAt", "DateTime?", "UTC timestamp when an admin completed the review (null if still pending)"],
    ],
  },

  // ─── DeveloperPayout Entity ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceDeveloper.payoutTitle",
    id: "developer-payout",
  },
  { type: "paragraph", contentKey: "modules.marketplaceDeveloper.payoutIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["DeveloperProfileId", "Guid", "FK to the developer receiving this payout"],
      ["Amount", "decimal", "Total payout amount after platform commission deduction"],
      ["Currency", "string", "ISO 4217 currency code (e.g. \"USD\")"],
      ["PeriodStart", "DateTime", "Start date of the payout period (inclusive)"],
      ["PeriodEnd", "DateTime", "End date of the payout period (inclusive)"],
      ["Status", "PayoutStatus", "Current payout status (Pending, Processing, Paid, Failed)"],
      ["StripeTransferId", "string", "Stripe Transfer ID for reconciliation (empty until transfer is initiated)"],
    ],
  },

  // ─── Onboarding Flowchart ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceDeveloper.onboardingTitle",
    id: "developer-onboarding",
  },
  { type: "paragraph", contentKey: "modules.marketplaceDeveloper.onboardingIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "register", label: "Register Developer Profile", type: "default" },
      { id: "verify", label: "Admin Verification", type: "warning" },
      { id: "stripe", label: "Connect Stripe Account", type: "info" },
      { id: "publish", label: "Publish App Listing", type: "primary" },
      { id: "submit", label: "Submit for Review", type: "warning" },
      { id: "approved", label: "Listing Approved", type: "success" },
      { id: "payout", label: "Receive Payout", type: "success" },
    ],
    connections: [
      { from: "register", to: "verify", label: "profile created" },
      { from: "verify", to: "stripe", label: "verified" },
      { from: "stripe", to: "publish", label: "account connected" },
      { from: "publish", to: "submit", label: "version ready" },
      { from: "submit", to: "approved", label: "review passes" },
      { from: "approved", to: "payout", label: "sales accumulated" },
    ],
  },
];

registerPage({
  slug: "modules/marketplace/developer-portal",
  titleKey: "modules.marketplaceDeveloper.title",
  descriptionKey: "modules.marketplaceDeveloper.description",
  category: "modules",
  order: 72,
  sections,
  relatedSlugs: [
    "modules/marketplace/marketplace-overview",
    "modules/marketplace/app-listings",
    "modules/marketplace/app-purchases",
  ],
  lastUpdated: "2026-06-29",
});
