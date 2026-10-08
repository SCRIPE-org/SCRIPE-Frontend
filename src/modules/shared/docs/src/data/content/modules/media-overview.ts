import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.media.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.media.overview.infoTitle",
    contentKey: "modules.media.overview.infoContent",
  },

  // ─── Architectural Overview ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.media.overview.archTitle",
    id: "media-architecture",
  },
  { type: "paragraph", contentKey: "modules.media.overview.archIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Folder",
        titleKey: "modules.media.overview.featureFolders",
        descriptionKey: "modules.media.overview.featureFoldersDesc",
      },
      {
        icon: "File",
        titleKey: "modules.media.overview.featureFiles",
        descriptionKey: "modules.media.overview.featureFilesDesc",
      },
      {
        icon: "Key",
        titleKey: "modules.media.overview.featureGrants",
        descriptionKey: "modules.media.overview.featureGrantsDesc",
      },
      {
        icon: "UploadCloud",
        titleKey: "modules.media.overview.featureMultipart",
        descriptionKey: "modules.media.overview.featureMultipartDesc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "modules.media.overview.featureVirusScan",
        descriptionKey: "modules.media.overview.featureVirusScanDesc",
      },
      {
        icon: "Globe",
        titleKey: "modules.media.overview.featureCDN",
        descriptionKey: "modules.media.overview.featureCDNDesc",
      },
    ],
  },

  // ─── Domain Model & Entities ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.media.overview.modelTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.media.overview.modelIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/Media/Media.Domain/Entities/MediaFile.cs",
    code: `public sealed class MediaFile : TenantAggregateRoot
{
    public Guid? FolderId { get; private set; }
    public string OriginalFileName { get; private set; } = string.Empty;
    public string StoredFileName { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public long FileSizeBytes { get; private set; }
    public string Sha256Checksum { get; private set; } = string.Empty;
    public string StorageProvider { get; private set; } = "Local";
    public bool IsPublic { get; private set; }
    public List<MediaAccessGrant> AccessGrants { get; private set; } = new();

    public Result<string> GenerateSignedDownloadUrl(TimeSpan validityWindow, string secretKey)
    {
        // Generates HMAC-SHA256 signed temporary access token
        var expiry = DateTimeOffset.UtcNow.Add(validityWindow).ToUnixTimeSeconds();
        var token = MediaSignatureGenerator.Sign(Id, TenantId, expiry, secretKey);
        return Result<string>.Success($"/api/v1/media/files/{Id}/download?exp={expiry}&sig={token}");
    }
}`,
  },

  // ─── Multipart Resumable Upload Pipeline ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.media.overview.uploadFlowTitle",
    id: "upload-pipeline",
  },
  { type: "paragraph", contentKey: "modules.media.overview.uploadFlowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "Client initiates chunked upload session", type: "default" },
      { id: "B", label: "Validate file size against edition quota", type: "warning" },
      { id: "C", label: "Stream binary chunks into isolated staging bucket", type: "info" },
      { id: "D", label: "Assemble chunks & compute SHA-256 integrity checksum", type: "primary" },
      { id: "E", label: "ClamAV asynchronous anti-malware scan verification", type: "warning" },
      { id: "F", label: "Move to production storage (S3 / Azure Blob / MinIO)", type: "success" },
      {
        id: "G",
        label: "Emit MediaFileCreatedDomainEvent & trigger image optimizer",
        type: "success",
      },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
      { from: "F", to: "G" },
    ],
  },

  // ─── API Reference ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.media.overview.apiTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.media.overview.apiIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/media/folders",
        descriptionKey: "modules.media.api.listFolders",
        auth: "Bearer JWT",
        permission: "media.folders.view",
      },
      {
        method: "POST",
        path: "/api/v1/media/folders",
        descriptionKey: "modules.media.api.createFolder",
        auth: "Bearer JWT",
        permission: "media.folders.create",
      },
      {
        method: "GET",
        path: "/api/v1/media/files",
        descriptionKey: "modules.media.api.listFiles",
        auth: "Bearer JWT",
        permission: "media.files.view",
      },
      {
        method: "POST",
        path: "/api/v1/media/files/upload",
        descriptionKey: "modules.media.api.uploadFile",
        auth: "Bearer JWT",
        permission: "media.files.create",
      },
      {
        method: "POST",
        path: "/api/v1/media/files/{id}/grants",
        descriptionKey: "modules.media.api.createGrant",
        auth: "Bearer JWT",
        permission: "media.files.update",
      },
      {
        method: "GET",
        path: "/api/v1/media/files/{id}/download",
        descriptionKey: "modules.media.api.downloadFile",
        auth: "Bearer JWT / Signed Token",
        permission: "media.files.view",
      },
    ],
  },
];

registerPage({
  slug: "modules/media-overview",
  titleKey: "modules.media.overview.title",
  descriptionKey: "modules.media.overview.description",
  category: "modules",
  order: 2.35,
  sections,
  relatedSlugs: ["infrastructure/file-storage", "infrastructure/media", "modules/custom-fields"],
  lastUpdated: "2026-10-03",
});
