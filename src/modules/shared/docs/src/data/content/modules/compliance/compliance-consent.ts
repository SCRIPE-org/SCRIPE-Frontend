import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.compliance.consent.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.compliance.consent.infoTitle",
    contentKey: "modules.compliance.consent.infoContent",
  },

  // ─── Consent Logging & Verification Flow ──────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.flowTitle",
    id: "consent-flow",
  },
  { type: "paragraph", contentKey: "modules.compliance.consent.flowIntro" },
  {
    type: "flowchart",
    titleKey: "modules.compliance.consent.flowTitle",
    direction: "vertical",
    nodes: [
      {
        id: "submit",
        labelKey: "modules.compliance.consent.nodeSubmit",
        type: "primary",
        descriptionKey: "modules.compliance.consent.descSubmit",
      },
      {
        id: "validate",
        labelKey: "modules.compliance.consent.nodeValidate",
        type: "warning",
        descriptionKey: "modules.compliance.consent.descValidate",
      },
      {
        id: "ledger",
        labelKey: "modules.compliance.consent.nodeLedger",
        type: "info",
        descriptionKey: "modules.compliance.consent.descLedger",
      },
      {
        id: "upsert",
        labelKey: "modules.compliance.consent.nodeUpsert",
        type: "success",
        descriptionKey: "modules.compliance.consent.descUpsert",
      },
      {
        id: "events",
        labelKey: "modules.compliance.consent.nodeEvents",
        type: "default",
        descriptionKey: "modules.compliance.consent.descEvents",
      },
      {
        id: "expiry",
        labelKey: "modules.compliance.consent.nodeExpiry",
        type: "danger",
        descriptionKey: "modules.compliance.consent.descExpiry",
      },
    ],
    connections: [
      { from: "submit", to: "validate", labelKey: "modules.compliance.consent.connSubmitValidate" },
      { from: "validate", to: "ledger", labelKey: "modules.compliance.consent.connValidateLedger" },
      { from: "ledger", to: "upsert", labelKey: "modules.compliance.consent.connLedgerUpsert" },
      { from: "upsert", to: "events", labelKey: "modules.compliance.consent.connUpsertEvents" },
      { from: "expiry", to: "upsert", labelKey: "modules.compliance.consent.connExpiryUpsert" },
    ],
  },

  // ─── Consent Purposes & Settings ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.purposesTitle",
    id: "consent-purposes",
  },
  { type: "paragraph", contentKey: "modules.compliance.consent.purposesIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.consent.purposesKey",
      "modules.compliance.consent.purposesBasis",
      "modules.compliance.consent.purposesRequired",
      "modules.compliance.consent.purposesSort",
      "modules.compliance.consent.purposesActive",
    ],
    rows: [
      ["essential", "modules.compliance.consent.basisContract", "True", "1", "True"],
      ["marketing", "modules.compliance.consent.basisConsent", "False", "2", "True"],
      ["analytics", "modules.compliance.consent.basisConsent", "False", "3", "True"],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "AddConsentPurposeCommandValidator.cs",
    code: `RuleFor(x => x.RegulationProfileId).NotEmpty().WithMessage("Regulation profile ID is required.");
RuleFor(x => x.Key)
    .NotEmpty().WithMessage("Purpose key is required.")
    .MaximumLength(100).WithMessage("Purpose key must not exceed 100 characters.")
    .Matches(@"^[a-z0-9_\\.\\-]+$").WithMessage("Purpose key must use lowercase letters, digits, underscores, dots or hyphens.");
RuleFor(x => x.Name)
    .NotEmpty().WithMessage("Purpose name is required.")
    .MaximumLength(200).WithMessage("Purpose name must not exceed 200 characters.");
RuleFor(x => x.LegalBasis)
    .NotEmpty().WithMessage("Legal basis is required.")
    .MaximumLength(100).WithMessage("Legal basis must not exceed 100 characters.");
RuleFor(x => x.SortOrder)
    .GreaterThanOrEqualTo(0).WithMessage("Sort order cannot be negative.");`,
  },

  // ─── Dual-Table Database Architecture ────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.immutabilityTitle",
    id: "dual-table",
  },
  { type: "paragraph", contentKey: "modules.compliance.consent.immutabilityIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ConsentSnapshotRepository.cs",
    code: `public async Task UpsertAsync(ConsentSnapshot snapshot, CancellationToken ct = default)
{
    var existing = await context.Set<ConsentSnapshot>()
        .FirstOrDefaultAsync(s => s.SubjectId == snapshot.SubjectId
                               && s.PurposeId == snapshot.PurposeId
                               && s.TenantId == snapshot.TenantId, ct);
    if (existing is null)
        await context.Set<ConsentSnapshot>().AddAsync(snapshot, ct);
    else
    {
        existing.CurrentAction = snapshot.CurrentAction;
        existing.ConsentVersion = snapshot.ConsentVersion;
        existing.RequiresReConsent = snapshot.RequiresReConsent;
        existing.LastUpdatedAt = snapshot.LastUpdatedAt;
    }
}`,
  },

  // ─── Entity Reference ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.entitiesTitle",
    id: "entities",
  },
  { type: "paragraph", contentKey: "modules.compliance.consent.entitiesIntro" },
  {
    type: "heading",
    level: 3,
    titleKey: "modules.compliance.consent.entitiesLedgerTitle",
    id: "entity-consent-record",
  },
  {
    type: "table",
    headers: [
      "modules.compliance.consent.field",
      "modules.compliance.consent.type",
      "modules.compliance.consent.description",
    ],
    rows: [
      ["Id", "Guid", "modules.compliance.consent.fId"],
      ["TenantId", "Guid", "modules.compliance.consent.fTenantId"],
      ["SubjectId", "Guid", "modules.compliance.consent.fSubjectId"],
      ["PurposeId", "Guid", "modules.compliance.consent.fPurposeId"],
      ["Action", "Enum (Granted/Withdrawn)", "modules.compliance.consent.fAction"],
      ["RecordedAt", "DateTime", "modules.compliance.consent.fRecordedAt"],
      ["ConsentVersion", "String", "modules.compliance.consent.fConsentVersion"],
      ["IpAddress", "String", "modules.compliance.consent.fIpAddress"],
      ["UserAgent", "String", "modules.compliance.consent.fUserAgent"],
      ["RegulationBasis", "String", "modules.compliance.consent.fRegulationBasis"],
      ["CollectionMethod", "String", "modules.compliance.consent.fCollectionMethod"],
    ],
  },
  {
    type: "heading",
    level: 3,
    titleKey: "modules.compliance.consent.entitiesSnapshotTitle",
    id: "entity-consent-snapshot",
  },
  {
    type: "table",
    headers: [
      "modules.compliance.consent.field",
      "modules.compliance.consent.type",
      "modules.compliance.consent.description",
    ],
    rows: [
      ["Id", "Guid", "modules.compliance.consent.fId"],
      ["TenantId", "Guid", "modules.compliance.consent.fTenantId"],
      ["SubjectId", "Guid", "modules.compliance.consent.fSubjectId"],
      ["PurposeId", "Guid", "modules.compliance.consent.fPurposeId"],
      ["CurrentAction", "Enum (Granted/Withdrawn)", "modules.compliance.consent.fCurrentAction"],
      ["LastUpdatedAt", "DateTime", "modules.compliance.consent.fLastUpdatedAt"],
      ["RequiresReConsent", "Boolean", "modules.compliance.consent.fRequiresReConsent"],
      ["ConsentVersion", "String", "modules.compliance.consent.fConsentVersion"],
    ],
  },

  // ─── Best Practices ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.bestPracticesTitle",
    id: "best-practices",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "modules.compliance.consent.doTitle",
        variant: "positive",
        items: [
          "modules.compliance.consent.do1",
          "modules.compliance.consent.do2",
          "modules.compliance.consent.do3",
        ],
      },
      {
        titleKey: "modules.compliance.consent.dontTitle",
        variant: "negative",
        items: [
          "modules.compliance.consent.dont1",
          "modules.compliance.consent.dont2",
          "modules.compliance.consent.dont3",
        ],
      },
    ],
  },

  // ─── API Endpoints ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/compliance/consent",
        descriptionKey: "modules.compliance.consent.epRecord",
        auth: "AdminOrUser",
        permission: "compliance_consent.manage",
      },
      {
        method: "POST",
        path: "/api/v1/compliance/consent/withdraw",
        descriptionKey: "modules.compliance.consent.epWithdraw",
        auth: "AdminOrUser",
        permission: "compliance_consent.manage",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/consent/me",
        descriptionKey: "modules.compliance.consent.epGetMy",
        auth: "UserOnly",
        permission: "compliance_consent.view_self",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/consent",
        descriptionKey: "modules.compliance.consent.epList",
        auth: "AdminOnly",
        permission: "compliance_consent.view",
      },
      {
        method: "GET",
        path: "/api/v1/compliance/consent/analytics",
        descriptionKey: "modules.compliance.consent.epAnalytics",
        auth: "AdminOnly",
        permission: "compliance_consent.view_analytics",
      },
    ],
  },
];

registerPage({
  slug: "modules/compliance-consent",
  titleKey: "modules.compliance.consent.title",
  descriptionKey: "modules.compliance.consent.description",
  category: "modules",
  order: 3,
  sections,
  relatedSlugs: ["modules/compliance-overview", "infrastructure/background-jobs"],
  lastUpdated: "2026-06-28",
});
