import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "infrastructure/file-storage",
  titleKey: "infrastructure.fileStorage.title",
  category: "infrastructure",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "infrastructure.fileStorage.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.fileStorage.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.fileStorage.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    interface([\"IFileStorageService\"])\n    %% interface: Abstraction interface\n    local([\"LocalFileStorage\"])\n    %% local: wwwroot/ filesystem\n    azure([\"AzureBlobStorage\"])\n    %% azure: Azure Blob Containers\n    aws{{\"AwsS3Storage\"}}\n    %% aws: AWS S3 Buckets\n    minio[\"MinIOStorage\"]\n    %% minio: Self-hosted S3-compatible\n    local -->|\"implements\"| interface\n    azure -->|\"implements\"| interface\n    aws -->|\"implements\"| interface\n    minio -->|\"implements\"| interface",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.fileStorage.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.fileStorage.section_5_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public interface IFileStorageService\n{\n    Task<string> UploadAsync(Stream stream, string fileName,\n        string folder, CancellationToken ct = default);\n\n    Task<Stream?> DownloadAsync(string path,\n        CancellationToken ct = default);\n\n    Task<bool> DeleteAsync(string path,\n        CancellationToken ct = default);\n\n    Task<bool> ExistsAsync(string path,\n        CancellationToken ct = default);\n\n    Task<FileMetadata> GetMetadataAsync(string path,\n        CancellationToken ct = default);\n\n    string GetPublicUrl(string path);\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.fileStorage.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "infrastructure.fileStorage.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.fileStorage.section_9_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"FileStorage\": {\n    \"Provider\": \"Local\",\n    \"Local\": {\n      \"BasePath\": \"wwwroot/uploads\",\n      \"RequestPath\": \"/uploads\",\n      \"MaxFileSizeMB\": 10,\n      \"AllowedExtensions\": [\".jpg\", \".png\", \".pdf\", \".docx\"]\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "infrastructure.fileStorage.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.fileStorage.section_12_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"FileStorage\": {\n    \"Provider\": \"AzureBlob\",\n    \"AzureBlob\": {\n      \"ConnectionString\": \"DefaultEndpointsProtocol=https;AccountName=...\",\n      \"ContainerName\": \"scripe-uploads\",\n      \"MaxFileSizeMB\": 50,\n      \"EnableCDN\": true,\n      \"CDNEndpoint\": \"https://cdn.scripe.dev\"\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "infrastructure.fileStorage.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.fileStorage.section_15_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"FileStorage\": {\n    \"Provider\": \"AwsS3\",\n    \"AwsS3\": {\n      \"BucketName\": \"scripe-uploads\",\n      \"Region\": \"us-east-1\",\n      \"AccessKeyId\": \"AKIA...\",\n      \"SecretAccessKey\": \"...\",\n      \"MaxFileSizeMB\": 50\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "infrastructure.fileStorage.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.fileStorage.section_18_content"
  },
  {
    "type": "code",
    "language": "json",
    "code": "{\n  \"FileStorage\": {\n    \"Provider\": \"MinIO\",\n    \"MinIO\": {\n      \"Endpoint\": \"minio.internal:9000\",\n      \"BucketName\": \"scripe-uploads\",\n      \"AccessKey\": \"minioadmin\",\n      \"SecretKey\": \"minioadmin\",\n      \"UseSSL\": false\n    }\n  }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.fileStorage.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "infrastructure.fileStorage.section_21_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// In Controller\n[HttpPost(\"upload\")]\n[RequestSizeLimit(10_000_000)] // 10 MB\npublic async Task<IActionResult> Upload(IFormFile file)\n{\n    // 1. Validate file\n    var validation = _fileValidator.Validate(file);\n    if (!validation.IsValid)\n        return BadRequest(validation.Errors);\n\n    // 2. Generate safe filename\n    var safeFileName = $\"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}\";\n\n    // 3. Upload via storage service\n    var path = await _storage.UploadAsync(\n        file.OpenReadStream(),\n        safeFileName,\n        \"avatars\", // folder\n        ct\n    );\n\n    // 4. Return public URL\n    return Ok(new { url = _storage.GetPublicUrl(path) });\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.fileStorage.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "table",
    "headers": [
      "infrastructure.fileStorage.section_24_hdr_0",
      "infrastructure.fileStorage.section_24_hdr_1",
      "infrastructure.fileStorage.section_24_hdr_2"
    ],
    "rows": [
      [
        "infrastructure.fileStorage.section_24_cell_0_0",
        "infrastructure.fileStorage.section_24_cell_0_1",
        "infrastructure.fileStorage.section_24_cell_0_2"
      ],
      [
        "infrastructure.fileStorage.section_24_cell_1_0",
        "infrastructure.fileStorage.section_24_cell_1_1",
        "infrastructure.fileStorage.section_24_cell_1_2"
      ],
      [
        "infrastructure.fileStorage.section_24_cell_2_0",
        "infrastructure.fileStorage.section_24_cell_2_1",
        "infrastructure.fileStorage.section_24_cell_2_2"
      ],
      [
        "infrastructure.fileStorage.section_24_cell_3_0",
        "infrastructure.fileStorage.section_24_cell_3_1",
        "infrastructure.fileStorage.section_24_cell_3_2"
      ],
      [
        "infrastructure.fileStorage.section_24_cell_4_0",
        "infrastructure.fileStorage.section_24_cell_4_1",
        "infrastructure.fileStorage.section_24_cell_4_2"
      ],
      [
        "infrastructure.fileStorage.section_24_cell_5_0",
        "infrastructure.fileStorage.section_24_cell_5_1",
        "infrastructure.fileStorage.section_24_cell_5_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "infrastructure.fileStorage.section_25_title",
    "contentKey": "infrastructure.fileStorage.section_25_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "infrastructure.fileStorage.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "infrastructure.fileStorage.section_27_item_0",
      "infrastructure.fileStorage.section_27_item_1",
      "infrastructure.fileStorage.section_27_item_2"
    ]
  }
],
  relatedSlugs: [
  "api-reference/system-api",
  "infrastructure/background-jobs",
  "security/data-protection"
],
  lastUpdated: "2026-06-09",
});
