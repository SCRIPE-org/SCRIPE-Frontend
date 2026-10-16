import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.partyKernel.dedup.intro" },
  {
    type: "info",
    variant: "warning",
    titleKey: "modules.partyKernel.dedup.infoTitle",
    contentKey: "modules.partyKernel.dedup.infoContent",
  },

  // ─── Automated Match Scoring & Fuzzy Detection ────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.dedup.scoringTitle",
    id: "match-scoring",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.dedup.scoringDesc" },

  // ─── Merge Candidate Workflows & Tombstone Preservation ───────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.dedup.mergeTitle",
    id: "merge-candidate-workflow",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.dedup.mergeDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.dedup.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/party-kernel/merge-candidates",
        descriptionKey: "modules.partyKernel.dedup.apiCandidates",
        auth: "Bearer JWT",
        permission: "parties.merge.view",
      },
      {
        method: "POST",
        path: "/api/v1/party-kernel/merge-candidates/{id}/merge",
        descriptionKey: "modules.partyKernel.dedup.apiExecuteMerge",
        auth: "Bearer JWT",
        permission: "parties.merge.execute",
      },
    ],
  },
];

registerPage({
  slug: "modules/party-kernel/deduplication-merge",
  titleKey: "modules.partyKernel.dedup.title",
  descriptionKey: "modules.partyKernel.dedup.description",
  category: "module-party-kernel",
  order: 4,
  sections,
  relatedSlugs: ["modules/party-kernel-overview", "modules/party-kernel/polymorphic-model"],
  lastUpdated: "2026-10-03",
});
