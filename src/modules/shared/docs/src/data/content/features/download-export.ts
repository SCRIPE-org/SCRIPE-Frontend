import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Architecture ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.downloadExport.architectureTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.downloadExport.architectureIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Download Architecture",
    nodes: [
      { id: "auth", label: "GET /api/downloads/{filePath} (JWT Required)", type: "default" },
      {
        id: "session-create",
        label: "POST /api/downloads/session (Returns sessionId)",
        type: "default",
      },
      {
        id: "session-get",
        label: "GET /api/downloads/session/{sessionId} (No Auth)",
        type: "warning",
      },
      { id: "ds", label: "DownloadService", type: "primary" },
      { id: "cache", label: "Cache: ETag check -> 304", type: "info" },
      { id: "range", label: "Range: partial -> 206", type: "info" },
      { id: "stream", label: "FileStream: 64KB buffer -> 200", type: "success" },
    ],
    connections: [
      { from: "auth", to: "ds" },
      { from: "session-create", to: "session-get" },
      { from: "session-get", to: "ds" },
      { from: "ds", to: "cache" },
      { from: "ds", to: "range" },
      { from: "ds", to: "stream" },
    ],
  },

  // ─── Download Session Token Generation ──────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.downloadExport.sessionTokenTitle",
    id: "session-token",
  },
  { type: "paragraph", contentKey: "features.downloadExport.sessionTokenIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Download Session Token Generation",
    nodes: [
      { id: "req", label: "Request Token (POST /api/downloads/session)", type: "default" },
      { id: "auth", label: "Verify JWT & Permissions", type: "primary" },
      { id: "check", label: "Verify File Existence", type: "warning" },
      { id: "gen", label: "Generate unique Session ID (GUID N)", type: "primary" },
      { id: "redis", label: "Store in Redis cache (TTL: ExpirationHours)", type: "success" },
      { id: "resp", label: "Return sessionId to Client", type: "info" },
      {
        id: "get",
        label: "Request File (GET /api/downloads/session/{sessionId})",
        type: "default",
      },
      { id: "lookup", label: "Fetch Session from Redis Cache", type: "primary" },
      { id: "stream", label: "Stream file to client with 64KB buffer", type: "success" },
    ],
    connections: [
      { from: "req", to: "auth" },
      { from: "auth", to: "check" },
      { from: "check", to: "gen" },
      { from: "gen", to: "redis" },
      { from: "redis", to: "resp" },
      { from: "resp", to: "get", label: "Share URL with external users" },
      { from: "get", to: "lookup" },
      { from: "lookup", to: "stream", label: "If exists & not expired" },
    ],
  },

  // ─── Controller Endpoints ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.downloadExport.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/downloads/{*filePath}",
        descriptionKey: "Download file (supports Range headers)",
        auth: "JWT",
      },
      {
        method: "POST",
        path: "/api/downloads/session",
        descriptionKey: "Create temp download URL",
        auth: "JWT",
      },
      {
        method: "GET",
        path: "/api/downloads/session/{sessionId}",
        descriptionKey: "Download via session (no auth required)",
        auth: "Public",
      },
    ],
  },

  // ─── Excel & CSV Export Engines ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.downloadExport.exportEnginesTitle",
    id: "export-engines",
  },
  { type: "paragraph", contentKey: "features.downloadExport.exportEnginesIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ExcelExportService.cs",
    code: `public Task<byte[]> GenerateExcelReportAsync(AuditExportData data, CancellationToken ct = default)
{
    using var workbook = new XLWorkbook();

    BuildSummarySheet(workbook, data);   // Sheet 1: Executive Summary & KPIs
    BuildDataSheet(workbook, data, ct);  // Sheet 2: Audit Logs Table (failures in light-red)
    BuildSecuritySheet(workbook, data);  // Sheet 3: Security Alerts & Suspicious IPs

    using var ms = new MemoryStream();
    workbook.SaveAs(ms);
    return Task.FromResult(ms.ToArray());
}`,
  },
  {
    type: "code",
    language: "csharp",
    filename: "CsvExportService.cs",
    code: `public Task<byte[]> GenerateCsvAsync(AuditExportData data, CancellationToken ct = default)
{
    using var ms = new MemoryStream();
    
    // Write UTF-8 BOM first for automatic Excel double-click encoding detection
    ms.Write(Encoding.UTF8.GetPreamble());

    using var writer = new StreamWriter(ms, new UTF8Encoding(false), leaveOpen: true);
    using var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture)
    {
        HasHeaderRecord = true,
        ShouldQuote = args => true // Security: always quote fields to prevent CSV Injection
    });

    // Write header and rows...
    csv.NextRecord();
    writer.Flush();
    return Task.FromResult(ms.ToArray());
}`,
  },

  // ─── Resumable Downloads ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.downloadExport.resumableTitle",
    id: "resumable",
  },
  { type: "paragraph", contentKey: "features.downloadExport.resumableIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "DownloadService.cs",
    code: `// Parse Range header: "bytes=1024-2048"
private (long? Start, long? End) ParseRangeHeader(long fileSize)
{
    var range = rangeHeader.ToString(); // "bytes=1024-2048"
    var parts = range["bytes=".Length..].Split('-');
    
    long? start = string.IsNullOrEmpty(parts[0]) ? null : long.Parse(parts[0]);
    long? end = string.IsNullOrEmpty(parts[1]) ? null : long.Parse(parts[1]);

    // Handle suffix range (last N bytes): "bytes=-500" -> last 500 bytes
    if (!start.HasValue && end.HasValue)
    {
        start = fileSize - end.Value;
        end = fileSize - 1;
    }

    return (start, end);
}`,
  },
  {
    type: "code",
    language: "http",
    filename: "Response with Range",
    code: `HTTP/1.1 206 Partial Content
Content-Range: bytes 1024-2048/10240
Accept-Ranges: bytes`,
  },

  // ─── ETag Caching ───────────────────────────────────
  { type: "heading", level: 2, titleKey: "features.downloadExport.etagTitle", id: "etag" },
  {
    type: "code",
    language: "csharp",
    filename: "DownloadService.cs",
    code: `// Generate deterministic ETag from file metadata
private static string GenerateETag(FileInfo fileInfo)
{
    var data = \`\${fileInfo.FullName}|\${fileInfo.Length}|\${fileInfo.LastWriteTimeUtc:O}\`;
    var hash = MD5.HashData(System.Text.Encoding.UTF8.GetBytes(data));
    return $"\\"{Convert.ToHexString(hash)}\\"";
}`,
  },
  { type: "paragraph", contentKey: "features.downloadExport.etagNote" },

  // ─── Session-Based Downloads ────────────────────────
  { type: "heading", level: 2, titleKey: "features.downloadExport.sessionTitle", id: "session" },
  { type: "paragraph", contentKey: "features.downloadExport.sessionIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "DownloadService.cs",
    code: `public async Task<string> CreateDownloadSessionAsync(string filePath, TimeSpan? expiration, ...)
{
    var sessionId = Guid.NewGuid().ToString("N"); // 32-char hex string
    var exp = expiration ?? TimeSpan.FromHours(1);

    await _cacheService.SetAsync(
        $"download:session:{sessionId}",
        new DownloadSession(filePath, DateTime.UtcNow.Add(exp)),
        exp);

    return sessionId;
}`,
  },
  { type: "info", variant: "warning", contentKey: "features.downloadExport.sessionWarning" },

  // ─── Path Traversal Prevention ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.downloadExport.pathTraversalTitle",
    id: "path-traversal",
  },
  {
    type: "code",
    language: "csharp",
    filename: "DownloadService.cs",
    code: `private string GetFullPath(string filePath)
{
    var normalizedPath = filePath.Replace("..", "").TrimStart('/', '\\\\');
    return Path.Combine(_settings.StoragePath ?? "uploads", normalizedPath);
}`,
  },
  { type: "paragraph", contentKey: "features.downloadExport.pathTraversalNote" },

  // ─── FileStream Configuration ───────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.downloadExport.streamConfigTitle",
    id: "stream-config",
  },
  {
    type: "code",
    language: "csharp",
    filename: "DownloadService.cs",
    code: `var stream = new FileStream(
    fullPath,
    FileMode.Open,
    FileAccess.Read,
    FileShare.Read,      // Allow concurrent reads
    bufferSize: 64 * 1024, // 64KB buffer (4x default)
    useAsync: true         // Async I/O for non-blocking reads
);`,
  },
];

registerPage({
  slug: "features/download-export",
  titleKey: "features.downloadExport.title",
  descriptionKey: "features.downloadExport.description",
  category: "features",
  order: 12,
  sections,
  relatedSlugs: ["features/file-upload"],
  lastUpdated: "2026-02-20",
});
