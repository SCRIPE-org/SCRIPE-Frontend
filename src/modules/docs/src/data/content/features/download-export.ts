import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "features/download-export",
  titleKey: "features.downloadExport.title",
  category: "features",
  order: 12,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_0_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.downloadExport.section_1_title",
    "id": "sec_1"
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_2_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    auth[\"GET /api/downloads/{filePath} (JWT Required)\"]\n    session-create[\"POST /api/downloads/session (Returns sessionId)\"]\n    session-get{{\"GET /api/downloads/session/{sessionId} (No Auth)\"}}\n    ds([\"DownloadService\"])\n    cache([\"Cache: ETag check  304\"])\n    range([\"Range: partial  206\"])\n    stream([\"FileStream: 64KB buffer  200\"])\n    auth --> ds\n    session-create --> session-get\n    session-get --> ds\n    ds --> cache\n    ds --> range\n    ds --> stream",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.downloadExport.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "table",
    "headers": [
      "features.downloadExport.section_5_hdr_0",
      "features.downloadExport.section_5_hdr_1",
      "features.downloadExport.section_5_hdr_2",
      "features.downloadExport.section_5_hdr_3",
      "features.downloadExport.section_5_hdr_4"
    ],
    "rows": [
      [
        "features.downloadExport.section_5_cell_0_0",
        "features.downloadExport.section_5_cell_0_1",
        "features.downloadExport.section_5_cell_0_2",
        "features.downloadExport.section_5_cell_0_3",
        "features.downloadExport.section_5_cell_0_4"
      ],
      [
        "features.downloadExport.section_5_cell_1_0",
        "features.downloadExport.section_5_cell_1_1",
        "features.downloadExport.section_5_cell_1_2",
        "features.downloadExport.section_5_cell_1_3",
        "features.downloadExport.section_5_cell_1_4"
      ],
      [
        "features.downloadExport.section_5_cell_2_0",
        "features.downloadExport.section_5_cell_2_1",
        "features.downloadExport.section_5_cell_2_2",
        "features.downloadExport.section_5_cell_2_3",
        "features.downloadExport.section_5_cell_2_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.downloadExport.section_6_title",
    "id": "sec_6"
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_7_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_8_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Parse Range header: \"bytes=1024-2048\"\nprivate (long? Start, long? End) ParseRangeHeader(long fileSize)\n{\n    var range = rangeHeader.ToString(); // \"bytes=1024-2048\"\n    var parts = range[\"bytes=\".Length..].Split('-');\n    \n    long? start = string.IsNullOrEmpty(parts[0]) ? null : long.Parse(parts[0]);\n    long? end = string.IsNullOrEmpty(parts[1]) ? null : long.Parse(parts[1]);\n\n    // Handle suffix range (last N bytes): \"bytes=-500\"  last 500 bytes\n    if (!start.HasValue && end.HasValue)\n    {\n        start = fileSize - end.Value;\n        end = fileSize - 1;\n    }\n\n    return (start, end);\n}",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_10_content"
  },
  {
    "type": "code",
    "language": "http",
    "code": "HTTP/1.1 206 Partial Content\nContent-Range: bytes 1024-2048/10240\nAccept-Ranges: bytes",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.downloadExport.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_13_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Generate deterministic ETag from file metadata\nprivate static string GenerateETag(FileInfo fileInfo)\n{\n    var data = $\"{fileInfo.FullName}|{fileInfo.Length}|{fileInfo.LastWriteTimeUtc:O}\";\n    var hash = MD5.HashData(System.Text.Encoding.UTF8.GetBytes(data));\n    return $\"\\\"{Convert.ToHexString(hash)}\\\"\";\n}",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_15_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.downloadExport.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_17_content"
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_18_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public async Task<string> CreateDownloadSessionAsync(string filePath, TimeSpan? expiration, ...)\n{\n    var sessionId = Guid.NewGuid().ToString(\"N\"); // 32-char hex string\n    var exp = expiration ?? TimeSpan.FromHours(1);\n\n    await _cacheService.SetAsync(\n        $\"download:session:{sessionId}\",\n        new DownloadSession(filePath, DateTime.UtcNow.Add(exp)),\n        exp);\n\n    return sessionId;\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "features.downloadExport.section_20_title",
    "contentKey": "features.downloadExport.section_20_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.downloadExport.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_22_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "private string GetFullPath(string filePath)\n{\n    var normalizedPath = filePath.Replace(\"..\", \"\").TrimStart('/', '\\\\');\n    return Path.Combine(_settings.StoragePath ?? \"uploads\", normalizedPath);\n}",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_24_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.downloadExport.section_25_title",
    "id": "sec_25"
  },
  {
    "type": "paragraph",
    "contentKey": "features.downloadExport.section_26_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "var stream = new FileStream(\n    fullPath,\n    FileMode.Open,\n    FileAccess.Read,\n    FileShare.Read,      // Allow concurrent reads\n    bufferSize: 64 * 1024, // 64KB buffer (4Ã default)\n    useAsync: true         // Async I/O for non-blocking reads\n);",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "features.downloadExport.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "features.downloadExport.section_29_item_0"
    ]
  }
],
  relatedSlugs: [
  "features/file-upload"
],
  lastUpdated: "2026-06-09",
});
