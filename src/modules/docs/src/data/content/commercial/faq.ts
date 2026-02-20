import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.faq.intro" },

      { type: "heading", level: 2, titleKey: "commercial.faq.generalTitle", id: "general" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q1", id: "q1" },
      { type: "paragraph", contentKey: "commercial.faq.a1" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q2", id: "q2" },
      { type: "paragraph", contentKey: "commercial.faq.a2" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q3", id: "q3" },
      { type: "paragraph", contentKey: "commercial.faq.a3" },

      { type: "heading", level: 2, titleKey: "commercial.faq.technicalTitle", id: "technical" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q4", id: "q4" },
      { type: "paragraph", contentKey: "commercial.faq.a4" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q5", id: "q5" },
      { type: "paragraph", contentKey: "commercial.faq.a5" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q6", id: "q6" },
      { type: "paragraph", contentKey: "commercial.faq.a6" },

      { type: "heading", level: 2, titleKey: "commercial.faq.licensingTitle", id: "licensing" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q7", id: "q7" },
      { type: "paragraph", contentKey: "commercial.faq.a7" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q8", id: "q8" },
      { type: "paragraph", contentKey: "commercial.faq.a8" },
      { type: "heading", level: 3, titleKey: "commercial.faq.q9", id: "q9" },
      { type: "paragraph", contentKey: "commercial.faq.a9" },
];

registerPage({
      slug: "commercial/faq",
      titleKey: "commercial.faq.title",
      descriptionKey: "commercial.faq.description",
      category: "commercial-support",
      order: 3,
      sections,
      relatedSlugs: ["commercial/getting-started-guide", "commercial/roadmap"],
      lastUpdated: "2026-02-20",
});
