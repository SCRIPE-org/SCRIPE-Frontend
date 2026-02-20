import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "infrastructure.fileStorage.intro" },

      // ─── Storage Architecture ─────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.fileStorage.architectureTitle", id: "architecture",
      },
      {
            type: "flowchart",
            title: "File Storage Architecture (Strategy Pattern)",
            direction: "vertical",
            nodes: [
                  { id: "interface", label: "IFileStorageService", type: "primary", description: "Abstraction interface" },
                  { id: "local", label: "LocalFileStorage", type: "info", description: "wwwroot/ filesystem" },
                  { id: "azure", label: "AzureBlobStorage", type: "success", description: "Azure Blob Containers" },
                  { id: "aws", label: "AwsS3Storage", type: "warning", description: "AWS S3 Buckets" },
                  { id: "minio", label: "MinIOStorage", type: "danger", description: "Self-hosted S3-compatible" },
            ],
            connections: [
                  { from: "local", to: "interface", label: "implements" },
                  { from: "azure", to: "interface", label: "implements" },
                  { from: "aws", to: "interface", label: "implements" },
                  { from: "minio", to: "interface", label: "implements" },
            ],
      },

      // ─── Interface ────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.fileStorage.interfaceTitle", id: "interface",
      },
      {
            type: "code",
            language: "csharp",
            filename: "IFileStorageService — Contract",
            code: `public interface IFileStorageService
{
    Task<string> UploadAsync(Stream stream, string fileName,
        string folder, CancellationToken ct = default);

    Task<Stream?> DownloadAsync(string path,
        CancellationToken ct = default);

    Task<bool> DeleteAsync(string path,
        CancellationToken ct = default);

    Task<bool> ExistsAsync(string path,
        CancellationToken ct = default);

    Task<FileMetadata> GetMetadataAsync(string path,
        CancellationToken ct = default);

    string GetPublicUrl(string path);
}`,
      },

      // ─── Provider Configuration ───────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.fileStorage.providerTitle", id: "provider-config",
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Local Storage",
                        language: "json",
                        filename: "appsettings.json — Local",
                        code: `{
  "FileStorage": {
    "Provider": "Local",
    "Local": {
      "BasePath": "wwwroot/uploads",
      "RequestPath": "/uploads",
      "MaxFileSizeMB": 10,
      "AllowedExtensions": [".jpg", ".png", ".pdf", ".docx"]
    }
  }
}`,
                  },
                  {
                        label: "Azure Blob",
                        language: "json",
                        filename: "appsettings.json — Azure Blob",
                        code: `{
  "FileStorage": {
    "Provider": "AzureBlob",
    "AzureBlob": {
      "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=...",
      "ContainerName": "nexora-uploads",
      "MaxFileSizeMB": 50,
      "EnableCDN": true,
      "CDNEndpoint": "https://cdn.nexora.dev"
    }
  }
}`,
                  },
                  {
                        label: "AWS S3",
                        language: "json",
                        filename: "appsettings.json — AWS S3",
                        code: `{
  "FileStorage": {
    "Provider": "AwsS3",
    "AwsS3": {
      "BucketName": "nexora-uploads",
      "Region": "us-east-1",
      "AccessKeyId": "AKIA...",
      "SecretAccessKey": "...",
      "MaxFileSizeMB": 50
    }
  }
}`,
                  },
                  {
                        label: "MinIO",
                        language: "json",
                        filename: "appsettings.json — MinIO (Self-Hosted)",
                        code: `{
  "FileStorage": {
    "Provider": "MinIO",
    "MinIO": {
      "Endpoint": "minio.internal:9000",
      "BucketName": "nexora-uploads",
      "AccessKey": "minioadmin",
      "SecretKey": "minioadmin",
      "UseSSL": false
    }
  }
}`,
                  },
            ],
      },

      // ─── Upload Flow ──────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.fileStorage.uploadTitle", id: "upload-flow",
      },
      {
            type: "code",
            language: "csharp",
            filename: "Upload Flow with Validation",
            code: `// In Controller
[HttpPost("upload")]
[RequestSizeLimit(10_000_000)] // 10 MB
public async Task<IActionResult> Upload(IFormFile file)
{
    // 1. Validate file
    var validation = _fileValidator.Validate(file);
    if (!validation.IsValid)
        return BadRequest(validation.Errors);

    // 2. Generate safe filename
    var safeFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

    // 3. Upload via storage service
    var path = await _storage.UploadAsync(
        file.OpenReadStream(),
        safeFileName,
        "avatars", // folder
        ct
    );

    // 4. Return public URL
    return Ok(new { url = _storage.GetPublicUrl(path) });
}`,
      },

      // ─── File Validation ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "infrastructure.fileStorage.validationTitle", id: "validation",
      },
      {
            type: "table",
            headers: ["Validation", "Rule", "Error Message"],
            rows: [
                  ["File size", "Max 10 MB (configurable)", "File exceeds maximum size"],
                  ["Image dimensions", "Max 4096×4096 px", "Image dimensions too large"],
                  ["Extension whitelist", ".jpg, .png, .gif, .webp, .pdf, .docx", "File type not allowed"],
                  ["MIME type check", "Verify MIME matches extension", "File content doesn't match extension"],
                  ["Magic bytes", "Check file header bytes", "Corrupted or fake file detected"],
                  ["Filename sanitization", "Remove special chars, limit length", "Applied automatically"],
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "infrastructure.fileStorage.tenantIsolationTip",
      },
];

registerPage({
      slug: "infrastructure/file-storage",
      titleKey: "infrastructure.fileStorage.title",
      descriptionKey: "infrastructure.fileStorage.description",
      category: "infrastructure",
      order: 3,
      sections,
      relatedSlugs: ["api-reference/system-api", "infrastructure/background-jobs", "security/data-protection"],
      lastUpdated: "2026-02-20",
});
