import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.storageOptions.intro" },
      { type: "heading", level: 2, titleKey: "commercial.storageOptions.providersTitle", id: "storage-providers" },
      {
            type: "table", headers: ["Provider", "Use Case", "Cost", "Region Support"], rows: [
                  ["Local FileSystem", "Development, on-premise", "Free", "On-premise only"],
                  ["Azure Blob Storage", "Azure cloud deployments", "Pay per GB", "Global (60+ regions)"],
                  ["AWS S3", "AWS cloud deployments", "Pay per GB", "Global (30+ regions)"],
                  ["MinIO", "Self-hosted S3-compatible", "Free (open-source)", "On-premise / any cloud"],
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.storageOptions.apiTitle", id: "unified-api" },
      {
            type: "code", language: "csharp", filename: "IBlobStorage Interface",
            code: `public interface IBlobStorage
{
    Task<string> UploadAsync(string path, Stream content, string contentType);
    Task<Stream> DownloadAsync(string path);
    Task DeleteAsync(string path);
    Task<bool> ExistsAsync(string path);
    Task<BlobInfo> GetInfoAsync(string path);
}`,
      },
      { type: "paragraph", contentKey: "commercial.storageOptions.apiNote" },
      { type: "heading", level: 2, titleKey: "commercial.storageOptions.configTitle", id: "configuration" },
      {
            type: "code", language: "json", filename: "Local FileSystem (Development)",
            code: `{
  "BlobStorage": {
    "Provider": "Local",
    "BasePath": "./uploads",
    "MaxFileSize": 30000000
  }
}`,
      },
      {
            type: "code", language: "json", filename: "Azure Blob Storage (Production)",
            code: `{
  "BlobStorage": {
    "Provider": "Azure",
    "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=...",
    "ContainerName": "nexora-uploads"
  }
}`,
      },
      { type: "heading", level: 2, titleKey: "commercial.storageOptions.organizationTitle", id: "file-organization" },
      {
            type: "code", language: "text", filename: "Tenant-Scoped File Organization",
            code: `uploads/
├── tenants/
│   └── {tenant-id}/
│       ├── logos/
│       │   └── logo.png
│       └── documents/
│           └── report-2024.pdf
├── admins/
│   └── {admin-id}/
│       └── profile/
│           └── avatar.jpg
└── temp/
    └── {session-id}/
        └── export.xlsx`,
      },
      { type: "heading", level: 2, titleKey: "commercial.storageOptions.pipelineTitle", id: "image-processing" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.storageOptions.img1", contentKey: "commercial.storageOptions.img1Desc" },
                  { titleKey: "commercial.storageOptions.img2", contentKey: "commercial.storageOptions.img2Desc" },
                  { titleKey: "commercial.storageOptions.img3", contentKey: "commercial.storageOptions.img3Desc" },
                  { titleKey: "commercial.storageOptions.img4", contentKey: "commercial.storageOptions.img4Desc" },
                  { titleKey: "commercial.storageOptions.img5", contentKey: "commercial.storageOptions.img5Desc" },
                  { titleKey: "commercial.storageOptions.img6", contentKey: "commercial.storageOptions.img6Desc" },
                  { titleKey: "commercial.storageOptions.img7", contentKey: "commercial.storageOptions.img7Desc" },
            ],
      },
      { type: "heading", level: 2, titleKey: "commercial.storageOptions.servingTitle", id: "serving-strategy" },
      {
            type: "table", headers: ["Storage Provider", "Serving Method"], rows: [
                  ["Local", "ASP.NET Core UseStaticFiles middleware"],
                  ["Azure", "Azure CDN or direct blob URL"],
                  ["S3", "CloudFront CDN or presigned URL"],
                  ["MinIO", "Nginx reverse proxy or presigned URL"],
            ],
      },
];

registerPage({
      slug: "commercial/storage-options",
      titleKey: "commercial.storageOptions.title",
      descriptionKey: "commercial.storageOptions.description",
      category: "commercial-technical",
      order: 3,
      sections,
      relatedSlugs: ["commercial/database-support", "commercial/technology-stack"],
      lastUpdated: "2026-02-19",
});
