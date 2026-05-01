import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.storageBackends.intro" },

  // ─── Storage Providers ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.storageBackends.providersTitle",
    id: "providers",
  },
  { type: "paragraph", contentKey: "commercial.storageBackends.providersIntro" },
  {
    type: "table",
    headers: ["Backend", "Best For", "Scalability", "Cost"],
    rows: [
      ["Local Disk", "Development, small deployments", "Limited to server disk", "Free"],
      ["Azure Blob Storage", "Azure cloud deployments", "Virtually unlimited", "Pay per GB"],
      ["AWS S3", "AWS cloud deployments", "Virtually unlimited", "Pay per GB"],
      ["MinIO", "On-premise, S3-compatible", "Cluster scalable", "Free (open-source)"],
      ["Google Cloud Storage", "GCP deployments", "Virtually unlimited", "Pay per GB"],
    ],
  },

  // ─── Features ───────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.storageBackends.featuresTitle",
    id: "features",
  },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "shield",
        titleKey: "commercial.storageBackends.tenantIsolation",
        descriptionKey: "commercial.storageBackends.tenantIsolationDesc",
      },
      {
        icon: "zap",
        titleKey: "commercial.storageBackends.imageProcessing",
        descriptionKey: "commercial.storageBackends.imageProcessingDesc",
      },
      {
        icon: "server",
        titleKey: "commercial.storageBackends.resumableDownload",
        descriptionKey: "commercial.storageBackends.resumableDownloadDesc",
      },
      {
        icon: "building",
        titleKey: "commercial.storageBackends.pluggable",
        descriptionKey: "commercial.storageBackends.pluggableDesc",
      },
    ],
  },

  // ─── File Handling ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.storageBackends.handlingTitle",
    id: "file-handling",
  },
  {
    type: "table",
    headers: ["Feature", "Capability", "Notes"],
    rows: [
      ["Max file size", "Configurable (default 50 MB)", "Chunked upload for large files"],
      ["Allowed types", "Whitelist-based", "Configurable per tenant"],
      ["Virus scanning", "ClamAV integration", "Optional, scans on upload"],
      ["Image processing", "Auto-resize, thumbnails, WebP", "On-the-fly transformation"],
      ["CDN support", "Integration ready", "Cache headers, signed URLs"],
      ["Retention policy", "Auto-cleanup via background job", "Configurable per file type"],
    ],
  },

  // ─── Configuration ──────────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.storageBackends.configTitle", id: "config" },
  {
    type: "code",
    language: "json",
    filename: "Storage Backend Configuration",
    code: `{
  "StorageSettings": {
    "Provider": "azure",
    "MaxFileSizeMB": 50,
    "AllowedExtensions": [".pdf", ".docx", ".png", ".jpg", ".xlsx"],
    "Azure": {
      "ConnectionString": "DefaultEndpointsProtocol=https;...",
      "ContainerName": "nexora-files"
    },
    "S3": {
      "AccessKey": "...",
      "SecretKey": "...",
      "BucketName": "nexora-files",
      "Region": "us-east-1"
    }
  }
}`,
  },

  // ─── Migration Between Providers ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.storageBackends.migrationTitle",
    id: "migration",
  },
  { type: "paragraph", contentKey: "commercial.storageBackends.migrationContent" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "commercial.storageBackends.mig1Title",
        contentKey: "commercial.storageBackends.mig1Content",
      },
      {
        titleKey: "commercial.storageBackends.mig2Title",
        contentKey: "commercial.storageBackends.mig2Content",
      },
      {
        titleKey: "commercial.storageBackends.mig3Title",
        contentKey: "commercial.storageBackends.mig3Content",
      },
    ],
  },
];

registerPage({
  slug: "commercial/storage-backends",
  titleKey: "commercial.storageBackends.title",
  descriptionKey: "commercial.storageBackends.description",
  category: "commercial-technical",
  order: 3,
  sections,
  relatedSlugs: ["commercial/database-support", "commercial/resilience-patterns"],
  lastUpdated: "2026-02-20",
});
