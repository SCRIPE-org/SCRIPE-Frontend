import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Upload Architecture ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.fileUpload.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.fileUpload.architectureIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Upload Architecture",
    nodes: [
      { id: "img", label: "ImageUploadController (Profile photos, logos)", type: "default" },
      { id: "file", label: "UploadsController (General files)", type: "default" },
      { id: "is", label: "ImageService (Resize, crop, format)", type: "primary" },
      { id: "fs", label: "FileService (Validation, storage)", type: "primary" },
      { id: "blob", label: "IBlobStorage (Local / Azure / S3 / MinIO)", type: "success" },
      { id: "static", label: "StaticFileMiddleware (Serves from storage)", type: "info" },
    ],
    connections: [
      { from: "img", to: "is" },
      { from: "file", to: "fs" },
      { from: "is", to: "fs" },
      { from: "fs", to: "blob" },
      { from: "blob", to: "static" },
    ],
  },

  // ─── Chunked Uploads & Assembly ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.fileUpload.chunkedUploadsTitle",
    id: "chunked-uploads",
  },
  { type: "paragraph", contentKey: "features.fileUpload.chunkedUploadsIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "File Chunk Assembly & Processing",
    nodes: [
      { id: "init", label: "Initialize Session (POST /api/uploads/initialize)", type: "default" },
      { id: "gen", label: "Generate Upload ID & Temp File Path", type: "primary" },
      { id: "chunk", label: "Upload Chunks (POST /api/uploads/{id}/chunk)", type: "default" },
      { id: "write", label: "Write/Append to Temp File (FileMode.Append)", type: "info" },
      {
        id: "complete",
        label: "Complete Session (POST /api/uploads/{id}/complete)",
        type: "default",
      },
      { id: "validate", label: "Validate Magic Bytes & Size", type: "warning" },
      { id: "save", label: "Save to IBlobStorage", type: "success" },
      { id: "cleanup", label: "Clean Up Temp File", type: "info" },
    ],
    connections: [
      { from: "init", to: "gen" },
      { from: "gen", to: "chunk" },
      { from: "chunk", to: "write" },
      { from: "write", to: "chunk", label: "Repeat for each chunk" },
      { from: "chunk", to: "complete", label: "All chunks uploaded" },
      { from: "complete", to: "validate" },
      { from: "validate", to: "save" },
      { from: "save", to: "cleanup" },
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "UploadService.cs",
    code: `public async Task UploadChunkAsync(string uploadId, Stream chunk, long offset, CancellationToken cancellationToken = default)
{
    if (!_sessions.TryGetValue(uploadId, out var session))
    {
        throw new InvalidOperationException($"Upload {uploadId} not found");
    }

    // Opens or appends chunk data depending on the current offset
    await using var fileStream = new FileStream(
        session.TempPath,
        offset == 0 ? FileMode.Create : FileMode.Append,
        FileAccess.Write
    );

    await chunk.CopyToAsync(fileStream, cancellationToken);
    session.UploadedBytes = fileStream.Length;
}`,
  },

  // ─── Image Upload Pipeline ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.fileUpload.imagePipelineTitle",
    id: "image-pipeline",
  },
  {
    type: "code",
    language: "csharp",
    filename: "ImageService.cs",
    code: `public class ImageService : IImageService
{
    public async Task<string> UploadAsync(IFormFile file, ImageUploadOptions options)
    {
        // 1. Validate file type (JPEG, PNG, WebP)
        ValidateImageType(file);
        
        // 2. Validate file size (max configurable, default 5MB)
        ValidateFileSize(file, options.MaxSize);
        
        // 3. Read and process image
        using var image = await Image.LoadAsync(file.OpenReadStream());
        
        // 4. Resize if needed (maintains aspect ratio)
        if (image.Width > options.MaxWidth || image.Height > options.MaxHeight)
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(options.MaxWidth, options.MaxHeight),
                Mode = ResizeMode.Max
            }));
        }
        
        // 5. Save to storage via IBlobStorage
        var path = $"{options.Folder}/{Guid.NewGuid()}.webp";
        await _blobStorage.UploadAsync(path, imageStream, "image/webp");
        
        return path;
    }
}`,
  },

  // ─── Storage Providers ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.fileUpload.storageProvidersTitle",
    id: "storage-providers",
  },
  { type: "paragraph", contentKey: "features.fileUpload.storageProvidersIntro" },
  {
    type: "table",
    headers: ["Provider", "Configuration Key", "Details"],
    rows: [
      ["Local Disk", 'Provider: "local"', "Saves files to ContentRootPath/FileHost"],
      ["AWS S3", 'Provider: "AwsS3"', "Uses AWSSDK.S3 to upload to configured bucket"],
      ["Azure Blob", 'Provider: "AzureBlob"', "Uses Azure.Storage.Blobs client SDK"],
      ["MinIO", 'Provider: "MinIO"', "S3-compatible API client configured locally"],
    ],
  },

  // ─── File Validation Rules ──────────────────────────
  { type: "heading", level: 2, titleKey: "features.fileUpload.validationTitle", id: "validation" },
  {
    type: "table",
    headers: ["Rule", "Default", "Configurable / Enforcement"],
    rows: [
      ["Image max size", "10 MB", "FileSettings.MaxFileSizeMb"],
      ["Document max size", "100 MB", "FileSettings.MaxFileSizeMb"],
      ["Allowed image types", "JPEG, PNG, WebP, GIF", "FileSettings.AllowedExtensions"],
      [
        "Allowed document types",
        "PDF, DOC, DOCX, XLS, XLSX, PPTX",
        "FileSettings.AllowedExtensions",
      ],
      [
        "Magic-byte validation",
        "PNG, JPEG, GIF, PDF, WebP headers",
        "Enforced on save to prevent malicious files (S0.12)",
      ],
      [
        "SVG Sanitization",
        "Remove script, iframe, onload, javascript: URI",
        "Enforced for SVG/XML types (S0.11)",
      ],
      ["Tenant-scoped isolation", "Stored in directory uploads/{tenant-id}/", "Enforced on save"],
    ],
  },

  // ─── General File Upload ────────────────────────────
  { type: "heading", level: 2, titleKey: "features.fileUpload.generalTitle", id: "general" },
  {
    type: "code",
    language: "csharp",
    filename: "FileService.cs",
    code: `public class FileService : IFileService
{
    public async Task<string> SaveFileAsync(Stream stream, string fileName, string scheme, string? preferredFileName = null, CancellationToken cancellationToken = default)
    {
        var settings = GetSettings(scheme);
        var extension = Path.GetExtension(fileName).TrimStart('.').ToLowerInvariant();

        // 1. Validate extension against whitelist
        if (settings.AllowedExtensions != null && !settings.AllowedExtensions.Contains(extension))
            throw new InvalidOperationException($"File type '{extension}' is not allowed");

        // 2. Validate size
        if (stream.Length > settings.MaxFileSizeBytes)
            throw new InvalidOperationException($"File size exceeds maximum");

        // 3. Magic-byte signature validation (S0.12)
        if (stream.CanSeek)
        {
            var originalPos = stream.Position;
            if (!ValidateMagicBytes(stream, extension))
                throw new InvalidOperationException("File content does not match declared extension.");
            stream.Position = originalPos;
        }

        // 4. Save to destination
        var uniqueFileName = preferredFileName ?? $"{Guid.NewGuid():N}.{extension}";
        if (!_blobStorageSettings.Provider.Equals("local", StringComparison.OrdinalIgnoreCase) && IsPublicScheme(scheme))
        {
            var contentType = GetContentType("." + extension);
            return await _blobStorage.UploadAsync(scheme, uniqueFileName, stream, contentType, cancellationToken);
        }

        var relativePath = Path.Combine(settings.StoragePath!, uniqueFileName);
        var absolutePath = GetAbsolutePath(relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(absolutePath)!);

        await using var fileStream = new FileStream(absolutePath, FileMode.Create);
        await stream.CopyToAsync(fileStream, cancellationToken);
        return $"{settings.RequestPath}/{uniqueFileName}";
    }
}`,
  },

  // ─── Static File Serving ────────────────────────────
  { type: "heading", level: 2, titleKey: "features.fileUpload.servingTitle", id: "serving" },
  {
    type: "code",
    language: "csharp",
    filename: "Program.cs",
    code: `// Static file middleware for uploaded files
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(settings.StoragePath),
    RequestPath = "/uploads",
    ServeUnknownFileTypes = false,
    DefaultContentType = "application/octet-stream"
});`,
  },
  { type: "paragraph", contentKey: "features.fileUpload.servingNote" },

  // ─── Tenant-Scoped Storage ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.fileUpload.tenantScopedTitle",
    id: "tenant-scoped",
  },
  {
    type: "code",
    language: "text",
    filename: "Storage Directory Structure",
    code: `uploads/
└── {tenant-id}/
    ├── admins/{admin-id}/profile.webp
    ├── logos/tenant-logo.png
    └── documents/{file-id}.pdf`,
  },
];

registerPage({
  slug: "features/file-upload",
  titleKey: "features.fileUpload.title",
  descriptionKey: "features.fileUpload.description",
  category: "features",
  order: 11,
  sections,
  relatedSlugs: ["features/download-export"],
  lastUpdated: "2026-02-20",
});
