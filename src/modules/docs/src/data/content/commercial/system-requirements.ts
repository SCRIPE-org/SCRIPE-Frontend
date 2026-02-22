import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.systemRequirements.intro" },

      // ─── Development Environment ────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.systemRequirements.devTitle", id: "development" },
      {
            type: "table",
            headers: [
                  "commercial.systemRequirements.tblDevHeader1",
                  "commercial.systemRequirements.tblDevHeader2",
                  "commercial.systemRequirements.tblDevHeader3"
            ],
            rows: [
                  ["commercial.systemRequirements.tblDevR1C1", "commercial.systemRequirements.tblDevR1C2", "commercial.systemRequirements.tblDevR1C3"],
                  ["commercial.systemRequirements.tblDevR2C1", "commercial.systemRequirements.tblDevR2C2", "commercial.systemRequirements.tblDevR2C3"],
                  ["commercial.systemRequirements.tblDevR3C1", "commercial.systemRequirements.tblDevR3C2", "commercial.systemRequirements.tblDevR3C3"],
                  ["commercial.systemRequirements.tblDevR4C1", "commercial.systemRequirements.tblDevR4C2", "commercial.systemRequirements.tblDevR4C3"],
                  ["commercial.systemRequirements.tblDevR5C1", "commercial.systemRequirements.tblDevR5C2", "commercial.systemRequirements.tblDevR5C3"],
                  ["commercial.systemRequirements.tblDevR6C1", "commercial.systemRequirements.tblDevR6C2", "commercial.systemRequirements.tblDevR6C3"],
                  ["commercial.systemRequirements.tblDevR7C1", "commercial.systemRequirements.tblDevR7C2", "commercial.systemRequirements.tblDevR7C3"],
                  ["commercial.systemRequirements.tblDevR8C1", "commercial.systemRequirements.tblDevR8C2", "commercial.systemRequirements.tblDevR8C3"],
            ],
      },

      // ─── Production — Monolith ──────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.systemRequirements.prodMonoTitle", id: "production-monolith" },
      {
            type: "table",
            headers: [
                  "commercial.systemRequirements.tblProdMonoHeader1",
                  "commercial.systemRequirements.tblProdMonoHeader2",
                  "commercial.systemRequirements.tblProdMonoHeader3"
            ],
            rows: [
                  ["commercial.systemRequirements.tblProdMonoR1C1", "commercial.systemRequirements.tblProdMonoR1C2", "commercial.systemRequirements.tblProdMonoR1C3"],
                  ["commercial.systemRequirements.tblProdMonoR2C1", "commercial.systemRequirements.tblProdMonoR2C2", "commercial.systemRequirements.tblProdMonoR2C3"],
                  ["commercial.systemRequirements.tblProdMonoR3C1", "commercial.systemRequirements.tblProdMonoR3C2", "commercial.systemRequirements.tblProdMonoR3C3"],
                  ["commercial.systemRequirements.tblProdMonoR4C1", "commercial.systemRequirements.tblProdMonoR4C2", "commercial.systemRequirements.tblProdMonoR4C3"],
                  ["commercial.systemRequirements.tblProdMonoR5C1", "commercial.systemRequirements.tblProdMonoR5C2", "commercial.systemRequirements.tblProdMonoR5C3"],
                  ["commercial.systemRequirements.tblProdMonoR6C1", "commercial.systemRequirements.tblProdMonoR6C2", "commercial.systemRequirements.tblProdMonoR6C3"],
                  ["commercial.systemRequirements.tblProdMonoR7C1", "commercial.systemRequirements.tblProdMonoR7C2", "commercial.systemRequirements.tblProdMonoR7C3"],
            ],
      },

      // ─── Production — Microservices ─────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.systemRequirements.prodMicroTitle", id: "production-micro" },
      {
            type: "table",
            headers: [
                  "commercial.systemRequirements.tblProdMicroHeader1",
                  "commercial.systemRequirements.tblProdMicroHeader2",
                  "commercial.systemRequirements.tblProdMicroHeader3"
            ],
            rows: [
                  ["commercial.systemRequirements.tblProdMicroR1C1", "commercial.systemRequirements.tblProdMicroR1C2", "commercial.systemRequirements.tblProdMicroR1C3"],
                  ["commercial.systemRequirements.tblProdMicroR2C1", "commercial.systemRequirements.tblProdMicroR2C2", "commercial.systemRequirements.tblProdMicroR2C3"],
                  ["commercial.systemRequirements.tblProdMicroR3C1", "commercial.systemRequirements.tblProdMicroR3C2", "commercial.systemRequirements.tblProdMicroR3C3"],
                  ["commercial.systemRequirements.tblProdMicroR4C1", "commercial.systemRequirements.tblProdMicroR4C2", "commercial.systemRequirements.tblProdMicroR4C3"],
                  ["commercial.systemRequirements.tblProdMicroR5C1", "commercial.systemRequirements.tblProdMicroR5C2", "commercial.systemRequirements.tblProdMicroR5C3"],
                  ["commercial.systemRequirements.tblProdMicroR6C1", "commercial.systemRequirements.tblProdMicroR6C2", "commercial.systemRequirements.tblProdMicroR6C3"],
                  ["commercial.systemRequirements.tblProdMicroR7C1", "commercial.systemRequirements.tblProdMicroR7C2", "commercial.systemRequirements.tblProdMicroR7C3"],
            ],
      },

      // ─── Database Server ────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.systemRequirements.dbTitle", id: "database" },
      {
            type: "table",
            headers: [
                  "commercial.systemRequirements.tblDbHeader1",
                  "commercial.systemRequirements.tblDbHeader2",
                  "commercial.systemRequirements.tblDbHeader3",
                  "commercial.systemRequirements.tblDbHeader4"
            ],
            rows: [
                  ["commercial.systemRequirements.tblDbR1C1", "commercial.systemRequirements.tblDbR1C2", "commercial.systemRequirements.tblDbR1C3", "commercial.systemRequirements.tblDbR1C4"],
                  ["commercial.systemRequirements.tblDbR2C1", "commercial.systemRequirements.tblDbR2C2", "commercial.systemRequirements.tblDbR2C3", "commercial.systemRequirements.tblDbR2C4"],
                  ["commercial.systemRequirements.tblDbR3C1", "commercial.systemRequirements.tblDbR3C2", "commercial.systemRequirements.tblDbR3C3", "commercial.systemRequirements.tblDbR3C4"],
                  ["commercial.systemRequirements.tblDbR4C1", "commercial.systemRequirements.tblDbR4C2", "commercial.systemRequirements.tblDbR4C3", "commercial.systemRequirements.tblDbR4C4"],
            ],
      },

      // ─── Network Requirements ───────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.systemRequirements.networkTitle", id: "network" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "commercial.systemRequirements.lstNetI1",
                  "commercial.systemRequirements.lstNetI2",
                  "commercial.systemRequirements.lstNetI3",
                  "commercial.systemRequirements.lstNetI4",
                  "commercial.systemRequirements.lstNetI5",
                  "commercial.systemRequirements.lstNetI6",
                  "commercial.systemRequirements.lstNetI7",
            ],
      },

      { type: "info", variant: "tip", contentKey: "commercial.systemRequirements.cloudTip" },
];

registerPage({
      slug: "commercial/system-requirements",
      titleKey: "commercial.systemRequirements.title",
      descriptionKey: "commercial.systemRequirements.description",
      category: "commercial-platform",
      order: 5,
      sections,
      relatedSlugs: ["commercial/deployment-modes", "commercial/technology-stack"],
      lastUpdated: "2026-02-20",
});
