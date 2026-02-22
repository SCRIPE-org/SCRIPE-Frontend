import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.successMetrics.intro" },

      // ─── Platform Scale ─────────────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.successMetrics.scaleTitle", id: "platform-scale" },
      {
            type: "table",
            headers: [
                  "commercial.successMetrics.tblScaleHeader1",
                  "commercial.successMetrics.tblScaleHeader2",
                  "commercial.successMetrics.tblScaleHeader3"
            ],
            rows: [
                  ["commercial.successMetrics.tblScaleR1C1", "commercial.successMetrics.tblScaleR1C2", "commercial.successMetrics.tblScaleR1C3"],
                  ["commercial.successMetrics.tblScaleR2C1", "commercial.successMetrics.tblScaleR2C2", "commercial.successMetrics.tblScaleR2C3"],
                  ["commercial.successMetrics.tblScaleR3C1", "commercial.successMetrics.tblScaleR3C2", "commercial.successMetrics.tblScaleR3C3"],
                  ["commercial.successMetrics.tblScaleR4C1", "commercial.successMetrics.tblScaleR4C2", "commercial.successMetrics.tblScaleR4C3"],
                  ["commercial.successMetrics.tblScaleR5C1", "commercial.successMetrics.tblScaleR5C2", "commercial.successMetrics.tblScaleR5C3"],
                  ["commercial.successMetrics.tblScaleR6C1", "commercial.successMetrics.tblScaleR6C2", "commercial.successMetrics.tblScaleR6C3"],
                  ["commercial.successMetrics.tblScaleR7C1", "commercial.successMetrics.tblScaleR7C2", "commercial.successMetrics.tblScaleR7C3"],
                  ["commercial.successMetrics.tblScaleR8C1", "commercial.successMetrics.tblScaleR8C2", "commercial.successMetrics.tblScaleR8C3"],
            ],
      },

      // ─── Performance Benchmarks ─────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.successMetrics.performanceTitle", id: "performance" },
      { type: "paragraph", contentKey: "commercial.successMetrics.performanceContent" },
      {
            type: "table",
            headers: [
                  "commercial.successMetrics.tblPerfHeader1",
                  "commercial.successMetrics.tblPerfHeader2",
                  "commercial.successMetrics.tblPerfHeader3"
            ],
            rows: [
                  ["commercial.successMetrics.tblPerfR1C1", "commercial.successMetrics.tblPerfR1C2", "commercial.successMetrics.tblPerfR1C3"],
                  ["commercial.successMetrics.tblPerfR2C1", "commercial.successMetrics.tblPerfR2C2", "commercial.successMetrics.tblPerfR2C3"],
                  ["commercial.successMetrics.tblPerfR3C1", "commercial.successMetrics.tblPerfR3C2", "commercial.successMetrics.tblPerfR3C3"],
                  ["commercial.successMetrics.tblPerfR4C1", "commercial.successMetrics.tblPerfR4C2", "commercial.successMetrics.tblPerfR4C3"],
                  ["commercial.successMetrics.tblPerfR5C1", "commercial.successMetrics.tblPerfR5C2", "commercial.successMetrics.tblPerfR5C3"],
                  ["commercial.successMetrics.tblPerfR6C1", "commercial.successMetrics.tblPerfR6C2", "commercial.successMetrics.tblPerfR6C3"],
                  ["commercial.successMetrics.tblPerfR7C1", "commercial.successMetrics.tblPerfR7C2", "commercial.successMetrics.tblPerfR7C3"],
                  ["commercial.successMetrics.tblPerfR8C1", "commercial.successMetrics.tblPerfR8C2", "commercial.successMetrics.tblPerfR8C3"],
            ],
      },

      // ─── Development Velocity ───────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.successMetrics.velocityTitle", id: "velocity" },
      { type: "paragraph", contentKey: "commercial.successMetrics.velocityContent" },
      {
            type: "table",
            headers: [
                  "commercial.successMetrics.tblVelHeader1",
                  "commercial.successMetrics.tblVelHeader2",
                  "commercial.successMetrics.tblVelHeader3"
            ],
            rows: [
                  ["commercial.successMetrics.tblVelR1C1", "commercial.successMetrics.tblVelR1C2", "commercial.successMetrics.tblVelR1C3"],
                  ["commercial.successMetrics.tblVelR2C1", "commercial.successMetrics.tblVelR2C2", "commercial.successMetrics.tblVelR2C3"],
                  ["commercial.successMetrics.tblVelR3C1", "commercial.successMetrics.tblVelR3C2", "commercial.successMetrics.tblVelR3C3"],
                  ["commercial.successMetrics.tblVelR4C1", "commercial.successMetrics.tblVelR4C2", "commercial.successMetrics.tblVelR4C3"],
                  ["commercial.successMetrics.tblVelR5C1", "commercial.successMetrics.tblVelR5C2", "commercial.successMetrics.tblVelR5C3"],
                  ["commercial.successMetrics.tblVelR6C1", "commercial.successMetrics.tblVelR6C2", "commercial.successMetrics.tblVelR6C3"],
                  ["commercial.successMetrics.tblVelR7C1", "commercial.successMetrics.tblVelR7C2", "commercial.successMetrics.tblVelR7C3"],
                  ["commercial.successMetrics.tblVelR8C1", "commercial.successMetrics.tblVelR8C2", "commercial.successMetrics.tblVelR8C3"],
            ],
      },

      // ─── Architecture Quality ───────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.successMetrics.qualityTitle", id: "quality" },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "layers", titleKey: "commercial.successMetrics.cleanArch", descriptionKey: "commercial.successMetrics.cleanArchDesc" },
                  { icon: "shield", titleKey: "commercial.successMetrics.typeSafety", descriptionKey: "commercial.successMetrics.typeSafetyDesc" },
                  { icon: "zap", titleKey: "commercial.successMetrics.patterns", descriptionKey: "commercial.successMetrics.patternsDesc" },
            ],
      },

      // ─── Community & Ecosystem ──────────────────────────────
      { type: "heading", level: 2, titleKey: "commercial.successMetrics.ecosystemTitle", id: "ecosystem" },
      {
            type: "table",
            headers: [
                  "commercial.successMetrics.tblEcoHeader1",
                  "commercial.successMetrics.tblEcoHeader2",
                  "commercial.successMetrics.tblEcoHeader3"
            ],
            rows: [
                  ["commercial.successMetrics.tblEcoR1C1", "commercial.successMetrics.tblEcoR1C2", "commercial.successMetrics.tblEcoR1C3"],
                  ["commercial.successMetrics.tblEcoR2C1", "commercial.successMetrics.tblEcoR2C2", "commercial.successMetrics.tblEcoR2C3"],
                  ["commercial.successMetrics.tblEcoR3C1", "commercial.successMetrics.tblEcoR3C2", "commercial.successMetrics.tblEcoR3C3"],
                  ["commercial.successMetrics.tblEcoR4C1", "commercial.successMetrics.tblEcoR4C2", "commercial.successMetrics.tblEcoR4C3"],
                  ["commercial.successMetrics.tblEcoR5C1", "commercial.successMetrics.tblEcoR5C2", "commercial.successMetrics.tblEcoR5C3"],
                  ["commercial.successMetrics.tblEcoR6C1", "commercial.successMetrics.tblEcoR6C2", "commercial.successMetrics.tblEcoR6C3"],
                  ["commercial.successMetrics.tblEcoR7C1", "commercial.successMetrics.tblEcoR7C2", "commercial.successMetrics.tblEcoR7C3"],
                  ["commercial.successMetrics.tblEcoR8C1", "commercial.successMetrics.tblEcoR8C2", "commercial.successMetrics.tblEcoR8C3"],
            ],
      },
];

registerPage({
      slug: "commercial/success-metrics",
      titleKey: "commercial.successMetrics.title",
      descriptionKey: "commercial.successMetrics.description",
      category: "commercial-why-nexora",
      order: 4,
      sections,
      relatedSlugs: ["commercial/why-nexora-overview", "commercial/performance-benchmarks"],
      lastUpdated: "2026-02-20",
});
