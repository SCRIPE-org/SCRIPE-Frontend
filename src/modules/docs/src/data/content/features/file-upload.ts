import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/file-upload",
  titleKey: "features.fileUpload.title",
  category: "features",
  order: 11,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.fileUpload.section_0_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.fileUpload.section_1_title",
    "id": "sec_1"
  },
  {
    "type": "paragraph",
    "contentKey": "features.fileUpload.section_2_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    img[\"ImageUploadController (Profile photos, logos)\"]\n    file[\"UploadsController (General files)\"]\n    is([\"ImageService (Resize, crop, format)\"])\n    fs([\"FileService (Validation, storage)\"])\n    blob([\"IBlobStorage (Local / Azure / S3 / MinIO)\"])\n    static([\"StaticFileMiddleware (Serves from storage)\"])\n    img --> is\n    file --> fs\n    is --> fs\n    fs --> blob\n    blob --> static",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.fileUpload.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "features.fileUpload.section_5_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class ImageService : IImageService\n{\n    public async Task<string> UploadAsync(IFormFile file, ImageUploadOptions options)\n    {\n        // 1. Validate file type (JPEG, PNG, WebP)\n        ValidateImageType(file);\n        \n        // 2. Validate file size (max configurable, default 5MB)\n        ValidateFileSize(file, options.MaxSize);\n        \n        // 3. Read and process image\n        using var image = await Image.LoadAsync(file.OpenReadStream());\n        \n        // 4. Resize if needed (maintains aspect ratio)\n        if (image.Width > options.MaxWidth || image.Height > options.MaxHeight)\n        {\n            image.Mutate(x => x.Resize(new ResizeOptions\n            {\n                Size = new Size(options.MaxWidth, options.MaxHeight),\n                Mode = ResizeMode.Max\n            }));\n        }\n        \n        // 5. Save to storage via IBlobStorage\n        var path = $\"{options.Folder}/{Guid.NewGuid()}.webp\";\n        await _blobStorage.UploadAsync(path, imageStream, \"image/webp\");\n        \n        return path;\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.fileUpload.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "table",
    "headers": [
      "features.fileUpload.section_8_hdr_0",
      "features.fileUpload.section_8_hdr_1",
      "features.fileUpload.section_8_hdr_2"
    ],
    "rows": [
      [
        "features.fileUpload.section_8_cell_0_0",
        "features.fileUpload.section_8_cell_0_1",
        "features.fileUpload.section_8_cell_0_2"
      ],
      [
        "features.fileUpload.section_8_cell_1_0",
        "features.fileUpload.section_8_cell_1_1",
        "features.fileUpload.section_8_cell_1_2"
      ],
      [
        "features.fileUpload.section_8_cell_2_0",
        "features.fileUpload.section_8_cell_2_1",
        "features.fileUpload.section_8_cell_2_2"
      ],
      [
        "features.fileUpload.section_8_cell_3_0",
        "features.fileUpload.section_8_cell_3_1",
        "features.fileUpload.section_8_cell_3_2"
      ],
      [
        "features.fileUpload.section_8_cell_4_0",
        "features.fileUpload.section_8_cell_4_1",
        "features.fileUpload.section_8_cell_4_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.fileUpload.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "features.fileUpload.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class FileService : IFileService\n{\n    public async Task<string> UploadAsync(IFormFile file, string folder)\n    {\n        // 1. Validate extension against whitelist\n        var ext = Path.GetExtension(file.FileName).ToLower();\n        if (!_settings.AllowedExtensions.Contains(ext))\n            throw new ValidationException($\"File type {ext} not allowed\");\n\n        // 2. Generate safe filename (GUID prevents collisions / path traversal)\n        var safeFileName = $\"{Guid.NewGuid()}{ext}\";\n        var path = Path.Combine(folder, safeFileName);\n\n        // 3. Delegate to blob storage\n        await _blobStorage.UploadAsync(path, file.OpenReadStream(), file.ContentType);\n        \n        return path;\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.fileUpload.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "features.fileUpload.section_13_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Static file middleware for uploaded files\napp.UseStaticFiles(new StaticFileOptions\n{\n    FileProvider = new PhysicalFileProvider(settings.StoragePath),\n    RequestPath = \"/uploads\",\n    ServeUnknownFileTypes = false,\n    DefaultContentType = \"application/octet-stream\"\n});",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "features.fileUpload.section_15_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.fileUpload.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "features.fileUpload.section_17_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "uploads/\n└── {tenant-id}/\n    ├── admins/{admin-id}/profile.webp\n    ├── logos/tenant-logo.png\n    └── documents/{file-id}.pdf",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.fileUpload.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.fileUpload.section_20_item_0"
    ]
  }
],
  relatedSlugs: [
  "features/download-export"
],
  lastUpdated: "2026-06-09",
});
