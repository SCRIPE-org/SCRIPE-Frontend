import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.workManagement.boards.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.workManagement.boards.infoTitle",
    contentKey: "modules.workManagement.boards.infoContent",
  },

  // ─── Custom Workflow State Machines ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.boards.stateMachineTitle",
    id: "state-machine-transitions",
  },
  { type: "paragraph", contentKey: "modules.workManagement.boards.stateMachineDesc" },

  // ─── Kanban Boards, Sprint Cycles & Backlogs ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.boards.kanbanTitle",
    id: "kanban-and-sprints",
  },
  { type: "paragraph", contentKey: "modules.workManagement.boards.kanbanDesc" },
];

registerPage({
  slug: "modules/work-management/boards-workflows",
  titleKey: "modules.workManagement.boards.title",
  descriptionKey: "modules.workManagement.boards.description",
  category: "module-work-management",
  order: 3,
  sections,
  relatedSlugs: [
    "modules/work-management/work-management-overview",
    "modules/work-management/work-items",
  ],
  lastUpdated: "2026-10-03",
});
