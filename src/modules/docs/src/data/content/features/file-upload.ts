import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      // ─── Upload Architecture ────────────────────────────
      { type: "heading", level: 2, titleKey: "features.fileUpload.architectureTitle", id: "architecture" },
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

      // ─── Image Upload Pipeline ──────────────────────────
      { type: "heading", level: 2, titleKey: "features.fileUpload.imagePipelineTitle", id: "image-pipeline" },
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

      // ─── File Validation Rules ──────────────────────────
      { type: "heading", level: 2, titleKey: "features.fileUpload.validationTitle", id: "validation" },
      {
            type: "table",
            headers: ["Rule", "Default", "Configurable"],
            rows: [
                  ["Image max size", "5 MB", "FileSettings.MaxImageSize"],
                  ["Document max size", "25 MB", "FileSettings.MaxDocumentSize"],
                  ["Allowed image types", "JPEG, PNG, WebP, GIF", "FileSettings.AllowedImageTypes"],
                  ["Allowed document types", "PDF, DOCX, XLSX, CSV", "FileSettings.AllowedDocumentTypes"],
                  ["Image max dimensions", "2048 × 2048", "ImageUploadOptions"],
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
    public async Task<string> UploadAsync(IFormFile file, string folder)
    {
        // 1. Validate extension against whitelist
        var ext = Path.GetExtension(file.FileName).ToLower();
        if (!_settings.AllowedExtensions.Contains(ext))
            throw new ValidationException($"File type {ext} not allowed");

        // 2. Generate safe filename (GUID prevents collisions / path traversal)
        var safeFileName = $"{Guid.NewGuid()}{ext}";
        var path = Path.Combine(folder, safeFileName);

        // 3. Delegate to blob storage
        await _blobStorage.UploadAsync(path, file.OpenReadStream(), file.ContentType);
        
        return path;
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
      { type: "heading", level: 2, titleKey: "features.fileUpload.tenantScopedTitle", id: "tenant-scoped" },
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
