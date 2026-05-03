import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.compliance.consent.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.flowTitle",
    id: "consent-flow",
  },
  {
    type: "flowchart",
    title: "modules.compliance.consent.flowTitle",
    direction: "vertical",
    nodes: [
      { id: "purpose", label: "Consent Purpose", type: "primary", description: "Defines what is being consented to (e.g. Marketing)" },
      { id: "record", label: "Consent Record", type: "info", description: "User's current state (Granted/Revoked) per purpose" },
      { id: "snapshot", label: "Consent Snapshot", type: "warning", description: "Immutable point-in-time capture of consent grant/revoke" },
      { id: "job", label: "Consent Expiry Job", type: "default", description: "Daily job revokes expired consents" }
    ],
    connections: [
      { from: "purpose", to: "record", label: "templates" },
      { from: "record", to: "snapshot", label: "generates on change" },
      { from: "job", to: "record", label: "auto-revokes if expired" }
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.consent.immutabilityTitle",
    id: "immutability",
  },
  { type: "paragraph", contentKey: "modules.compliance.consent.immutabilityIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ConsentSnapshot.cs",
    code: `public class ConsentSnapshot : BaseEntity<Guid>
{
    public Guid ConsentRecordId { get; set; }
    public ConsentState State { get; set; } // Granted/Revoked
    public DateTime Timestamp { get; set; }
    
    // Hash of (RecordId + State + Timestamp + PreviousHash) for tampering detection
    [MaxLength(256)]
    public string IntegrityHash { get; set; } = null!;
}`
  }
];

registerPage({
  slug: "modules/compliance-consent",
  titleKey: "modules.compliance.consent.title",
  descriptionKey: "modules.compliance.consent.description",
  category: "modules",
  order: 3,
  sections,
  relatedSlugs: ["modules/compliance-overview"],
  lastUpdated: "2026-05-03",
});
