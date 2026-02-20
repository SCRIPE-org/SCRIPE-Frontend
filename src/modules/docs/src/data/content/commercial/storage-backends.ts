import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.storageBackends.intro" },
      { type: "heading", level: 2, titleKey: "commercial.storageBackends.providersTitle", id: "providers" },
      {
            type: "table",
            headers: ["Backend", "Best For", "Scalability", "Cost"],
            rows: [
                  ["Local Disk", "Development, small deployments", "Limited to server disk", "Free"],
                  ["Azure Blob Storage", "Azure cloud deployments", "Virtually unlimited", "Pay per GB"],
                  ["AWS S3", "AWS cloud deployments", "Virtually unlimited", "Pay per GB"],
                  ["MinIO", "On-premise, S3-compatible", "Cluster scalable", "Free (open-source)"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.storageBackends.featuresTitle", id: "features" },
      {
            type: "feature-grid",
            columns: 2,
            items: [
                  { icon: "shield", titleKey: "commercial.storageBackends.tenantIsolation", descriptionKey: "commercial.storageBackends.tenantIsolationDesc" },
                  { icon: "zap", titleKey: "commercial.storageBackends.imageProcessing", descriptionKey: "commercial.storageBackends.imageProcessingDesc" },
                  { icon: "server", titleKey: "commercial.storageBackends.resumableDownload", descriptionKey: "commercial.storageBackends.resumableDownloadDesc" },
                  { icon: "building", titleKey: "commercial.storageBackends.pluggable", descriptionKey: "commercial.storageBackends.pluggableDesc" },
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.storageBackends.configTitle", id: "config" },
      {
            type: "code",
            language: "json",
            filename: "Storage Backend Configuration",
            code: `{
  "StorageSettings": {
    "Provider": "azure",  // "local", "aws", "minio"
    "Azure": {
      "ConnectionString": "DefaultEndpointsProtocol=https;...",
      "ContainerName": "nexora-files"
    }
  }
}`,
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
