import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.hrms.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.hrms.overview.infoTitle",
    contentKey: "modules.hrms.overview.infoContent",
  },

  // ─── Architectural Overview ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.overview.archTitle",
    id: "hrms-architecture",
  },
  { type: "paragraph", contentKey: "modules.hrms.overview.archIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "UserCheck",
        titleKey: "modules.hrms.overview.featureStaff",
        descriptionKey: "modules.hrms.overview.featureStaffDesc",
      },
      {
        icon: "FileText",
        titleKey: "modules.hrms.overview.featureEmployment",
        descriptionKey: "modules.hrms.overview.featureEmploymentDesc",
      },
      {
        icon: "Award",
        titleKey: "modules.hrms.overview.featureQualifications",
        descriptionKey: "modules.hrms.overview.featureQualificationsDesc",
      },
      {
        icon: "ShieldAlert",
        titleKey: "modules.hrms.overview.featureCompliance",
        descriptionKey: "modules.hrms.overview.featureComplianceDesc",
      },
      {
        icon: "Clock",
        titleKey: "modules.hrms.overview.featureAvailability",
        descriptionKey: "modules.hrms.overview.featureAvailabilityDesc",
      },
      {
        icon: "Calendar",
        titleKey: "modules.hrms.overview.featureAssignments",
        descriptionKey: "modules.hrms.overview.featureAssignmentsDesc",
      },
    ],
  },

  // ─── Domain Model & Entities ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.overview.modelTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.hrms.overview.modelIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/Hrms/Hrms.Domain/Entities/StaffMember.cs",
    code: `public sealed class StaffMember : TenantAggregateRoot
{
    public string EmployeeNumber { get; private set; } = string.Empty;
    public string FullNameEn { get; private set; } = string.Empty;
    public string FullNameAr { get; private set; } = string.Empty;
    public string ContactEmail { get; private set; } = string.Empty;
    public string ContactPhone { get; private set; } = string.Empty;
    public Guid? IdentityActorId { get; private set; }
    public bool IsActive { get; private set; } = true;
    public List<EmploymentRecord> EmploymentHistory { get; private set; } = new();
    public List<Certification> Certifications { get; private set; } = new();
    public List<StaffAvailability> Availabilities { get; private set; } = new();

    public Result AssignToShift(Guid venueId, DateTimeOffset startUtc, DateTimeOffset endUtc)
    {
        // Enforces active employment contract and verified certification checks
        var hasValidCert = Certifications.Any(c => c.IsValidForSession(startUtc));
        if (!hasValidCert)
            return Result.Failure("Staff member does not have verified, active certification for session date.");

        RaiseDomainEvent(new StaffAssignedDomainEvent(Id, TenantId, venueId, startUtc, endUtc));
        return Result.Success();
    }
}`,
  },

  // ─── Staff Certification & Assignment Verification Workflow ───────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.overview.complianceFlowTitle",
    id: "certification-verification-workflow",
  },
  { type: "paragraph", contentKey: "modules.hrms.overview.complianceFlowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "Coach/Staff Member added or schedules updated", type: "default" },
      {
        id: "B",
        label: "Submit Professional License / Coaching Certification credentials",
        type: "primary",
      },
      {
        id: "C",
        label: "HR Admin verifies accrediting body, license number & expiry",
        type: "warning",
      },
      {
        id: "D",
        label: "Certification marked Verified with automated 30-day expiry tracker",
        type: "info",
      },
      { id: "E", label: "Scheduler attempts Venue Session / Roster Assignment", type: "default" },
      {
        id: "F",
        label: "Automated Compliance Gate verifies shift availability & non-expired license",
        type: "primary",
      },
      { id: "G", label: "Assignment confirmed & dispatched to Coach Mobile App", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
      { from: "F", to: "G" },
    ],
  },

  // ─── API Reference ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.hrms.overview.apiTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.hrms.overview.apiIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/hrms/staff",
        descriptionKey: "modules.hrms.api.listStaff",
        auth: "Bearer JWT",
        permission: "hrms.staff.view",
      },
      {
        method: "POST",
        path: "/api/v1/hrms/staff",
        descriptionKey: "modules.hrms.api.createStaff",
        auth: "Bearer JWT",
        permission: "hrms.staff.create",
      },
      {
        method: "GET",
        path: "/api/v1/hrms/staff/{id}/certifications",
        descriptionKey: "modules.hrms.api.listCertifications",
        auth: "Bearer JWT",
        permission: "hrms.staff.view",
      },
      {
        method: "POST",
        path: "/api/v1/hrms/staff/{id}/certifications",
        descriptionKey: "modules.hrms.api.addCertification",
        auth: "Bearer JWT",
        permission: "hrms.staff.update",
      },
      {
        method: "POST",
        path: "/api/v1/hrms/staff/{id}/certifications/{certId}/verify",
        descriptionKey: "modules.hrms.api.verifyCertification",
        auth: "Bearer JWT",
        permission: "hrms.staff.update",
      },
      {
        method: "GET",
        path: "/api/v1/hrms/staff/{id}/availability",
        descriptionKey: "modules.hrms.api.getAvailability",
        auth: "Bearer JWT",
        permission: "hrms.staff.view",
      },
      {
        method: "POST",
        path: "/api/v1/hrms/assignments",
        descriptionKey: "modules.hrms.api.createAssignment",
        auth: "Bearer JWT",
        permission: "hrms.assignments.create",
      },
    ],
  },
];

registerPage({
  slug: "modules/hrms-overview",
  titleKey: "modules.hrms.overview.title",
  descriptionKey: "modules.hrms.overview.description",
  category: "modules",
  order: 2.8,
  sections,
  relatedSlugs: [
    "modules/party-kernel-overview",
    "modules/organization-core-overview",
    "modules/venue-overview",
  ],
  lastUpdated: "2026-10-03",
});
