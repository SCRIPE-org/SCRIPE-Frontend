import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "modules.media.intro" },

      // ─ Upload
      {
            type: "heading", level: 2,
            titleKey: "modules.media.uploadTitle", id: "upload",
      },
      { type: "paragraph", contentKey: "modules.media.uploadDesc" },
      {
            type: "table",
            headers: ["Feature", "Description"],
            rows: [
                  ["Multi-part Upload", "Streaming for large files"],
                  ["Validation", "File type whitelist, max size enforcement"],
                  ["Thumbnails", "Auto-generated for image files"],
                  ["Tenant Scoping", "Files isolated per tenant"],
            ],
      },

      // ─ Storage
      {
            type: "heading", level: 2,
            titleKey: "modules.media.storageTitle", id: "storage",
      },
      { type: "paragraph", contentKey: "modules.media.storageDesc" },
      {
            type: "table",
            headers: ["Backend", "Config Key", "Use Case"],
            rows: [
                  ["Local", "Storage:Provider=Local", "Development and testing"],
                  ["AWS S3", "Storage:Provider=S3", "Production (Amazon)"],
                  ["Azure Blob", "Storage:Provider=AzureBlob", "Production (Azure)"],
            ],
      },
];

registerPage({
      slug: "modules/media",
      titleKey: "modules.media.title",
      descriptionKey: "modules.media.description",
      category: "modules",
      order: 4,
      sections,
      relatedSlugs: ["features/file-upload", "features/download-export"],
      lastUpdated: "2026-03-02",
});
