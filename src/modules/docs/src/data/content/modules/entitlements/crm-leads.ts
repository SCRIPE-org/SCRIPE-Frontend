import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.intro",
  },

  // ─── What is the Leads CRM ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.whatIsTitle",
    id: "what-is-crm-leads",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.whatIsIntro",
  },
  {
    type: "table",
    headers: ["Concept", "Role", "Example"],
    rows: [
      [
        "Lead",
        "A prospect who submitted a Contact Sales request",
        "Acme Corp — Enterprise interest via signup wizard",
      ],
      [
        "Source",
        "How the lead entered the system",
        "Website form (signup wizard) or Admin-created manually",
      ],
      [
        "Status",
        "Current stage in the sales lifecycle",
        "New → Contacted → Qualified → Won / Lost / Converted",
      ],
      [
        "Assignment",
        "Which admin is responsible for follow-up",
        "sales@acme.internal assigned to jane.doe",
      ],
      [
        "Conversion",
        "Turning a lead into a live tenant",
        "One-click: creates tenant + assigns edition + sends setup email",
      ],
    ],
  },

  // ─── Lead Lifecycle ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.lifecycleTitle",
    id: "lead-lifecycle",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.lifecycleIntro",
  },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "new", label: "New", description: "Lead created via signup wizard Contact Sales form" },
      {
        id: "contacted",
        label: "Contacted",
        description: "Sales admin reached out to the prospect",
      },
      { id: "qualified", label: "Qualified", description: "Lead confirmed as a real opportunity" },
      { id: "won", label: "Won", description: "Deal agreed — ready for conversion" },
      {
        id: "converted",
        label: "Converted",
        description: "Tenant created, edition assigned, setup email sent",
      },
      { id: "lost", label: "Lost", description: "Prospect did not move forward" },
    ],
    connections: [
      { from: "new", to: "contacted", label: "admin outreach" },
      { from: "contacted", to: "qualified", label: "demo completed" },
      { from: "qualified", to: "won", label: "deal agreed" },
      { from: "won", to: "converted", label: "Convert to Tenant" },
      { from: "contacted", to: "lost", label: "no response" },
      { from: "qualified", to: "lost", label: "budget/fit mismatch" },
    ],
  },

  // ─── Discovery Intelligence ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.discoveryTitle",
    id: "discovery-intelligence",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.discoveryIntro",
  },
  {
    type: "table",
    headers: ["Discovery Field", "Source Question", "Stored In"],
    rows: [
      ["Business Type", "Q1 — Industry selector", "PlatformLead.BusinessType"],
      ["Team Size", "Q2 — Team size picker", "PlatformLead.TeamSize"],
      ["Priority", "Q3 — Priority multi-select (max 3)", "PlatformLead.Priority"],
      ["Recommended Tier", "Computed by recommendation engine", "PlatformLead.RecommendedTier"],
      ["Edition Key", "Plan card selected before Contact Sales", "PlatformLead.EditionKey"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.crmLeads.discoveryTip",
  },

  // ─── Backend Architecture ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.backendTitle",
    id: "backend-architecture",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.backendIntro",
  },
  {
    type: "code",
    language: "text",
    filename: "Backend Structure — Leads",
    code: `Entitlements.Domain/
├── Entities/
│   └── PlatformLead.cs              # Lead entity (inherits AuditableEntity)
├── Enums/
│   ├── LeadStatus.cs                # New, Contacted, Qualified, Won, Converted, Lost
│   └── LeadSource.cs                # Website, Admin
└── Interfaces/
    └── IPlatformLeadRepository.cs   # Repository contract

Entitlements.Application/
├── Commands/
│   └── Leads/
│       ├── SubmitContactSalesLead/   # Public signup wizard form submission
│       ├── CreateLead/               # Admin-created lead
│       ├── UpdateLeadStatus/         # Status transition (New → Contacted → …)
│       ├── AssignLead/               # Assign/unassign to admin
│       ├── ConvertLeadToTenant/      # Atomic lead → tenant conversion
│       └── DeleteLead/               # Soft delete
├── Queries/
│   └── Leads/
│       ├── GetLeads/                 # Paginated list with filters
│       ├── GetLeadById/              # Full detail
│       └── GetLeadActivity/          # Timeline of status changes + notes
└── DTOs/
    └── Leads/
        └── PlatformLeadResponse.cs   # Full detail DTO
        └── PlatformLeadListResponse.cs

Entitlements.Infrastructure/
└── Persistence/
    └── PlatformLeadRepository.cs     # EF Core implementation`,
  },

  // ─── PlatformLead Entity ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.entityTitle",
    id: "platform-lead-entity",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.entityIntro",
  },
  {
    type: "code",
    language: "csharp",
    filename: "PlatformLead.cs",
    code: `public class PlatformLead : AuditableEntity
{
    // ── Contact info ──────────────────────────────────────────────
    public string CompanyName { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string Email       { get; set; } = string.Empty;
    public string? Phone      { get; set; }

    // ── Interest ──────────────────────────────────────────────────
    public string?     EditionKey      { get; set; }  // Plan selected in wizard
    public string?     Message         { get; set; }  // Free-text message
    public LeadSource  Source          { get; set; } = LeadSource.Website;

    // ── Discovery Intelligence (from signup wizard) ───────────────
    public string? BusinessType     { get; set; }   // Q1: erp / healthcare / general
    public string? TeamSize         { get; set; }   // Q2: solo / 2-10 / 11-50 / …
    public string? Priority         { get; set; }   // Q3: comma-separated, max 3
    public string? RecommendedTier  { get; set; }   // Computed: free / pro / business / enterprise

    // ── CRM Lifecycle ─────────────────────────────────────────────
    public LeadStatus Status             { get; set; } = LeadStatus.New;
    public Guid?      AssignedToAdminId  { get; set; }
    public string?    Notes              { get; set; }

    // ── Conversion ────────────────────────────────────────────────
    public DateTime? ConvertedAt           { get; set; }
    public string?   ConvertedToTenantId  { get; set; }  // Encrypted
}`,
  },

  // ─── API Endpoints ───────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.endpointsTitle",
    id: "api-endpoints",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.endpointsIntro",
  },
  {
    type: "table",
    headers: ["Method", "Route", "Permission", "Description"],
    rows: [
      [
        "POST",
        "/api/v1/leads/contact-sales",
        "Public (no auth)",
        "Submit a Contact Sales request from the signup wizard",
      ],
      ["POST", "/api/v1/leads", "leads.create", "Admin-created lead"],
      [
        "GET",
        "/api/v1/leads",
        "leads.view",
        "Paginated list with filters (status, source, assigned)",
      ],
      ["GET", "/api/v1/leads/{id}", "leads.view", "Full lead detail including Discovery data"],
      ["GET", "/api/v1/leads/{id}/activity", "leads.view", "Timeline of status changes and notes"],
      ["PUT", "/api/v1/leads/{id}/status", "leads.update", "Transition lead status"],
      ["PUT", "/api/v1/leads/{id}/assign", "leads.update", "Assign or unassign lead to admin"],
      [
        "POST",
        "/api/v1/leads/{id}/convert-to-tenant",
        "leads.convert",
        "Atomic conversion: create tenant + assign edition + mark Converted",
      ],
      ["DELETE", "/api/v1/leads/{id}", "leads.delete", "Soft-delete a lead"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.crmLeads.endpointsNote",
  },

  // ─── ConvertToTenant Command ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.convertTitle",
    id: "convert-to-tenant",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.convertIntro",
  },
  {
    type: "code",
    language: "csharp",
    filename: "ConvertLeadToTenantCommand.cs",
    code: `public record ConvertLeadToTenantCommand(
    string  EncryptedLeadId,
    string  TenantName,
    string  TenantCode,
    string  AdminEmail,
    string? AdminUsername,
    string? EditionId,          // null = use lead's EditionKey
    string? SubscriptionType,   // null = handler decides
    string  Currency,           // default: USD
    bool    SkipPayment = true  // always true for contact-sales
) : ICommand<ConvertLeadToTenantResult>;

// Handler steps (all in a single transaction):
// 1. Decrypt + fetch lead — validate Status ≠ Converted
// 2. Resolve EditionId from lead.EditionKey if not provided
// 3. Call ITenantProvisioner.ProvisionAsync() → creates tenant + admin user
// 4. Assign edition subscription (SkipPayment = true → no Stripe)
// 5. Log LeadActivity: "Converted to Tenant {tenantId}"
// 6. Update lead: Status = Converted, ConvertedAt = UtcNow, ConvertedToTenantId
// 7. SaveChangesAsync → publish domain events → return result`,
  },

  // ─── Email Notifications ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.emailsTitle",
    id: "email-notifications",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.emailsIntro",
  },
  {
    type: "table",
    headers: ["Email", "Recipient", "Trigger", "Template Style"],
    rows: [
      [
        "Prospect Confirmation",
        "lead.Email",
        "Contact Sales form submitted",
        "Indigo branded — thanks + what happens next",
      ],
      [
        "Sales Team Alert",
        "Leads:SalesNotificationEmail (appsettings)",
        "Contact Sales form submitted",
        "Amber alert — company, contact, discovery data, admin link",
      ],
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "appsettings.json — Email Config",
    code: `{
  "Leads": {
    "SalesNotificationEmail": "sales@yourcompany.com"
  },
  "SmtpSettings": {
    "Host": "smtp-relay.gmail.com",
    "Port": 587,
    "Username": "noreply@yourcompany.com",
    "Password": "<app-password>",
    "FromName": "SCRIPE",
    "FromEmail": "noreply@yourcompany.com",
    "EnableSsl": true
  }
}`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.crmLeads.emailsTip",
  },

  // ─── Frontend Architecture ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.frontendTitle",
    id: "frontend-architecture",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.frontendIntro",
  },
  {
    type: "code",
    language: "text",
    filename: "Frontend — Leads Sub-Module Structure",
    code: `src/modules/entitlements/leads/
├── locales/
│   ├── leads.en.ts                    # EN translations (drawer, stats, dialogs)
│   ├── leads.ar.ts                    # AR translations (native UTF-8)
│   └── index.ts
└── src/
    ├── domain/
    │   ├── entities/
    │   │   └── PlatformLead.ts         # Rich entity with computed getters
    │   └── interfaces/
    │       └── ILeadsRepository.ts     # Repository contract
    ├── data/
    │   ├── models/
    │   │   └── leads.models.ts         # PlatformLeadDto + request models
    │   ├── mappers/
    │   │   └── LeadsMapper.ts          # DTO ↔ PlatformLead entity
    │   ├── services/
    │   │   └── LeadsService.ts         # HTTP calls via IApiService
    │   └── repositories/
    │       └── LeadsRepository.ts      # Service → entity via mapper
    └── presentation/
        ├── viewmodels/
        │   └── useLeadsViewModel.ts    # TanStack Query + mutations + drawer state
        ├── views/
        │   └── LeadsView.tsx           # Stats bar + table + all dialogs mounted
        └── components/
            ├── LeadDetailDrawer.tsx    # 480px slide-in drawer (8 sections)
            ├── AssignLeadDialog.tsx    # Assign/unassign with admin selector
            ├── ConvertToTenantDialog.tsx # Pre-filled conversion form
            └── CreateLeadDialog.tsx    # 2-column admin lead creation form`,
  },

  // ─── PlatformLead Entity (Frontend) ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.frontendEntityTitle",
    id: "frontend-entity",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.frontendEntityIntro",
  },
  {
    type: "code",
    language: "typescript",
    filename: "PlatformLead.ts",
    code: `export class PlatformLead {
  constructor(private readonly data: PlatformLeadData) {}

  // ── Identity ──────────────────────────────────────────────────
  get id()          { return this.data.id; }
  get companyName() { return this.data.companyName; }
  get contactName() { return this.data.contactName; }
  get email()       { return this.data.email; }
  get phone()       { return this.data.phone ?? ""; }

  // ── CRM state ────────────────────────────────────────────────
  get status()           { return this.data.status; }          // "New" | "Contacted" | …
  get source()           { return this.data.source; }          // "Website" | "Admin"
  get assignedToAdminId(){ return this.data.assignedToAdminId; }
  get editionKey()       { return this.data.editionKey ?? ""; }

  // ── Discovery Intelligence ────────────────────────────────────
  get businessType()    { return this.data.businessType ?? ""; }
  get teamSize()        { return this.data.teamSize ?? ""; }
  get priority()        { return this.data.priority ?? ""; }
  get recommendedTier() { return this.data.recommendedTier ?? ""; }

  // ── Computed ─────────────────────────────────────────────────
  get discoveryTags(): string[] {
    return [this.businessType, this.teamSize, this.priority]
      .filter(Boolean);
  }
  get isConverted() { return this.status === "Converted"; }
  get relativeTime() {
    // Uses Intl.RelativeTimeFormat for "2h ago" / "3 days ago"
    const diff = Date.now() - new Date(this.data.createdAt).getTime();
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (diff < 3_600_000) return rtf.format(-Math.floor(diff / 60_000), "minute");
    if (diff < 86_400_000) return rtf.format(-Math.floor(diff / 3_600_000), "hour");
    return rtf.format(-Math.floor(diff / 86_400_000), "day");
  }
}`,
  },

  // ─── Permissions ──────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.permissionsTitle",
    id: "permissions",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.permissionsIntro",
  },
  {
    type: "table",
    headers: ["Permission Key", "Description", "Used By"],
    rows: [
      ["leads.view", "Read lead list and detail", "LeadsController.GetAll, GetById, GetActivity"],
      ["leads.create", "Create a new lead from admin panel", "LeadsController.Create"],
      ["leads.update", "Change status or assign lead", "LeadsController.UpdateStatus, AssignLead"],
      [
        "leads.convert",
        "Convert lead to tenant (high-privilege)",
        "LeadsController.ConvertToTenant",
      ],
      ["leads.delete", "Soft-delete a lead", "LeadsController.Delete"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.crmLeads.permissionsTip",
  },

  // ─── Quick Start ───────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.crmLeads.quickStartTitle",
    id: "quick-start",
  },
  {
    type: "paragraph",
    contentKey: "modules.crmLeads.quickStartIntro",
  },
  {
    type: "code",
    language: "text",
    filename: "Typical CRM Flow",
    code: `Step 1: Prospect completes Contact Sales form in signup wizard
  → POST /api/v1/leads/contact-sales (no auth)
  → Lead created (Status: New, Source: Website)
  → Sales team receives alert email
  → Prospect receives confirmation email

Step 2: Sales admin reviews lead
  → GET /api/v1/leads → list with Discovery tags visible
  → Click row → LeadDetailDrawer opens with full context

Step 3: Admin assigns lead to team member
  → PUT /api/v1/leads/{id}/assign  { adminId: "..." }
  → Lead status transitions to Contacted

Step 4: Qualify + advance status
  → PUT /api/v1/leads/{id}/status  { status: "Qualified" }
  → PUT /api/v1/leads/{id}/status  { status: "Won" }

Step 5: Convert to tenant (one-click)
  → POST /api/v1/leads/{id}/convert-to-tenant
  → Tenant created, edition assigned, setup email sent
  → Lead status: Converted, ConvertedToTenantId set`,
  },
];

registerPage({
  slug: "modules/crm-leads",
  titleKey: "modules.crmLeads.title",
  descriptionKey: "modules.crmLeads.description",
  category: "modules",
  order: 10,
  sections,
  relatedSlugs: [
    "modules/entitlements-overview",
    "modules/editions",
    "features/email-system",
    "features/multi-tenancy",
  ],
  lastUpdated: "2026-06-13",
});
