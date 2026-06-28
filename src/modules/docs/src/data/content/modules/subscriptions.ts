import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.subscriptions2.intro" },

  // ─── TenantSubscription Entity ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions2.entityTitle",
    id: "tenant-subscription-entity",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Entitlements.Domain/Entities/TenantSubscription.cs",
    code: `public class TenantSubscription : AuditableEntity
{
    public Guid TenantId { get; set; }
    public Guid EditionId { get; set; }
    public SubscriptionType SubscriptionType { get; set; } = SubscriptionType.Monthly;
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Trial;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? TrialEndDate { get; set; }
    public bool IsTrialConverted { get; set; }

    // Pricing metadata
    public string? Currency { get; set; }
    public decimal BaseAmount { get; set; }
    public decimal TotalAmount { get; set; }

    // Navigation
    public virtual Tenant Tenant { get; set; } = default!;
    public virtual Edition Edition { get; set; } = default!;
}`,
  },

  // ─── Subscription Lifecycle ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions2.lifecycleTitle",
    id: "lifecycle",
  },
  {
    type: "flowchart",
    title: "Subscription Status Lifecycle",
    direction: "vertical",
    nodes: [
      { id: "n1", label: "Trial", type: "info" },
      { id: "n2", label: "Active", type: "success" },
      { id: "n3", label: "Suspended", type: "warning" },
      { id: "n4", label: "Expired", type: "danger" },
      { id: "n5", label: "Cancelled", type: "danger" },
    ],
    connections: [
      { from: "n1", to: "n2", label: "converted to paid" },
      { from: "n1", to: "n4", label: "trial expires" },
      { from: "n2", to: "n3", label: "payment failure" },
      { from: "n2", to: "n4", label: "end date reached" },
      { from: "n2", to: "n5", label: "user cancels" },
      { from: "n3", to: "n2", label: "payment resumes" },
    ],
  },

  // ─── Subscription Status Enum ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions2.statusEnumTitle",
    id: "status-enum",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Entitlements.Domain/Enums/SubscriptionStatus.cs",
    code: `public enum SubscriptionStatus
{
    Trial = 0,      // Free trial period (max 30 days)
    Active = 1,     // Paid and in good standing
    Suspended = 2,  // Payment issue — access blocked
    Cancelled = 3,  // User-cancelled — access ends at period end
    Expired = 4,    // End date passed — access removed
}`,
  },
  {
    type: "table",
    headers: ["Status", "Max Duration", "Access", "Auto-Transitions To"],
    rows: [
      ["Trial", "30 days (configurable)", "Full edition features", "Active (converted) or Expired"],
      ["Active", "Subscription period", "Full edition features", "Expired (end date) or Suspended"],
      ["Suspended", "Until resolved", "Blocked — no login", "Active (payment resumed)"],
      ["Cancelled", "Until period end", "Full until end date", "Expired (period ends)"],
      ["Expired", "Permanent", "None — features blocked", "Active (if renewed)"],
    ],
  },

  // ─── API Endpoints ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.subscriptions2.endpointsTitle",
    id: "api-endpoints",
  },
  {
    type: "table",
    headers: ["Method", "Endpoint", "Description"],
    rows: [
      ["GET", "/api/subscriptions", "List all subscriptions (paginated, filterable by status/tenant)"],
      ["GET", "/api/subscriptions/{id}", "Get subscription details by encrypted ID"],
      ["POST", "/api/subscriptions", "Create a trial subscription (assign tenant to edition)"],
      ["PUT", "/api/subscriptions/{id}/activate", "Convert trial to paid active subscription"],
      ["DELETE", "/api/subscriptions/{id}/cancel", "Cancel a subscription (access ends at period end)"],
    ],
  },

  // ─── Info Tip ─────────────────────────────────────────────
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.subscriptions2.featureGatingTip",
  },
];

registerPage({
  slug: "modules/subscriptions",
  titleKey: "modules.subscriptions2.title",
  descriptionKey: "modules.subscriptions2.description",
  category: "modules",
  order: 15,
  sections,
  relatedSlugs: ["modules/editions", "architecture/cross-module-collaboration"],
  lastUpdated: "2026-06-28",
});
