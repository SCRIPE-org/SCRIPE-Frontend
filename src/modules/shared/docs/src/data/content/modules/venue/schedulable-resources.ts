import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.venue.resources.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.venue.resources.infoTitle",
    contentKey: "modules.venue.resources.infoContent",
  },

  // ─── Resource Hierarchy Architecture ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.resources.hierarchyTitle",
    id: "composite-hierarchy",
  },
  { type: "paragraph", contentKey: "modules.venue.resources.hierarchyDesc" },
  {
    type: "code",
    language: "text",
    filename: "Schedulable Resource Composite Hierarchy",
    code: `Facility: Olympic Aquatic & Sports Center
├── Schedulable Resource [Id: res_pool_main] (Full 50m Olympic Pool)
│   ├── Sub-resource [res_lane_1] (Lane 1 - Speed)
│   ├── Sub-resource [res_lane_2] (Lane 2 - Speed)
│   └── Sub-resource [res_lane_3] (Lane 3 - Open Swim)
└── Schedulable Resource [res_arena_indoor] (Multi-purpose Stadium)
    ├── Partition [res_arena_half_a] (Basketball Court Alpha)
    └── Partition [res_arena_half_b] (Basketball Court Beta)`,
  },

  // ─── Domain Model & Constraints ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.resources.modelTitle",
    id: "domain-model",
  },
  { type: "paragraph", contentKey: "modules.venue.resources.modelDesc" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/Venue/Venue.Domain/Entities/SchedulableResource.cs",
    code: `public sealed class SchedulableResource : TenantAggregateRoot
{
    public Guid FacilityId { get; private set; }
    public Guid? ParentResourceId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string KindCode { get; private set; } = string.Empty;
    public int Capacity { get; private set; }
    public bool IsComposite { get; private set; }
    public PublicationStatus PublicationStatus { get; private set; }
    public TimeZoneInfo FacilityTimeZone { get; private set; } = TimeZoneInfo.Utc;

    public Result Publish(PublicationChecklist checklist)
    {
        if (!checklist.HasOperatingHours || !checklist.HasRateCard)
            return Result.Failure("Cannot publish resource without active hours and pricing.");

        PublicationStatus = PublicationStatus.Published;
        RaiseDomainEvent(new SchedulableResourcePublishedDomainEvent(Id, TenantId, FacilityId));
        return Result.Success();
    }
}`,
  },

  // ─── Publication Checklist & Validation ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.resources.checklistTitle",
    id: "publication-checklist",
  },
  { type: "paragraph", contentKey: "modules.venue.resources.checklistDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.venue.resources.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/venue/schedulable-resources",
        descriptionKey: "modules.venue.resources.apiList",
        auth: "Bearer JWT",
        permission: "venue.resources.view",
      },
      {
        method: "POST",
        path: "/api/v1/venue/schedulable-resources",
        descriptionKey: "modules.venue.resources.apiCreate",
        auth: "Bearer JWT",
        permission: "venue.resources.create",
      },
      {
        method: "POST",
        path: "/api/v1/venue/schedulable-resources/{id}/publish",
        descriptionKey: "modules.venue.resources.apiPublish",
        auth: "Bearer JWT",
        permission: "venue.resources.publish",
      },
    ],
  },
];

registerPage({
  slug: "modules/venue/schedulable-resources",
  titleKey: "modules.venue.resources.title",
  descriptionKey: "modules.venue.resources.description",
  category: "module-venue",
  order: 2,
  sections,
  relatedSlugs: [
    "modules/venue-overview",
    "modules/venue/availability-engine",
    "modules/venue/booking-workspace",
  ],
  lastUpdated: "2026-10-03",
});
