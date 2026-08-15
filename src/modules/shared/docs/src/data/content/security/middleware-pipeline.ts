// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "security.middlewarePipeline.intro" },

  // ─── Pipeline Overview ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.overviewTitle",
    id: "pipeline-overview",
  },
  { type: "paragraph", contentKey: "security.middlewarePipeline.overviewIntro" },
  {
    type: "flowchart",
    title: "Full HTTP Request Middleware Execution Pipeline",
    direction: "vertical",
    nodes: [
      { id: "p1", label: "PHASE 1: Request Bootstrapping & Diagnostics", type: "primary" },
      { id: "m1", label: "1. Forwarded Headers (Real IP)", type: "default" },
      {
        id: "m2",
        label: "2. Global Exception Middleware",
        type: "danger",
        description: "Sanitizes stack traces",
      },
      {
        id: "m3",
        label: "3. HSTS & Security Headers",
        type: "default",
        description: "HSTS in Prod, X-Frame-Options",
      },
      {
        id: "m4",
        label: "4. Correlation ID Middleware",
        type: "info",
        description: "Assigns X-Correlation-Id",
      },
      {
        id: "m5",
        label: "5. Observability Middleware",
        type: "info",
        description: "OpenTelemetry enrichment",
      },
      { id: "m6", label: "6. HTTPS Redirection", type: "default" },
      { id: "m7", label: "7. Response Compression", type: "success" },
      {
        id: "m8",
        label: "8. Request Localization",
        type: "default",
        description: "Culture selection",
      },

      { id: "p2", label: "PHASE 2: Routing, Gateway & Access Policies", type: "primary" },
      { id: "m9", label: "9. Static Files (/api/files)", type: "default" },
      { id: "m10", label: "10. CORS Middleware", type: "default", description: "Origin checking" },
      {
        id: "m11",
        label: "11. Cloudflare Origin Verification",
        type: "danger",
        description: "Fail-closed check",
      },
      { id: "m12", label: "12. Background Jobs Dashboard", type: "default" },
      {
        id: "m13",
        label: "13. Rate Limiter",
        type: "warning",
        description: "Tiered rate limiting",
      },
      { id: "m14", label: "14. Response Caching & Cache Headers", type: "success" },

      { id: "p3", label: "PHASE 3: Authentication & Anti-CSRF", type: "primary" },
      { id: "m15", label: "15. Cookie Auth (Cookie-to-Bearer)", type: "info" },
      {
        id: "m16",
        label: "16. Authentication (JWT)",
        type: "primary",
        description: "Validates access token",
      },
      {
        id: "m17",
        label: "17. CSRF Protection",
        type: "warning",
        description: "Double-submit validation",
      },
      { id: "m18", label: "18. Input Sanitization", type: "info", description: "Strips HTML tags" },

      { id: "p4", label: "PHASE 4: Authorization, Replay & Tenant Isolation", type: "primary" },
      {
        id: "m19",
        label: "19. Authorization (RBAC)",
        type: "primary",
        description: "Permission checks",
      },
      {
        id: "m20",
        label: "20. Must Change Password Gate",
        type: "danger",
        description: "Blocks expired credentials",
      },
      {
        id: "m21",
        label: "21. Replay Protection",
        type: "danger",
        description: "Timestamp ±5m & Nonce unique",
      },
      {
        id: "m22",
        label: "22. Tenant Context Validation",
        type: "warning",
        description: "Validates tenant context",
      },
      {
        id: "m23",
        label: "23. TenantContextMiddleware",
        type: "success",
        description: "IDataScopeService scoping",
      },
      {
        id: "m24",
        label: "24. Field Projection",
        type: "info",
        description: "Filters restricted fields",
      },
      {
        id: "m25",
        label: "25. Request Logging & Audit",
        type: "success",
        description: "Serilog audit trail creation",
      },

      { id: "p5", label: "PHASE 5: Endpoint Mapping & Execution", type: "primary" },
      { id: "m26", label: "26. Health Checks (/health)", type: "success" },
      {
        id: "m27",
        label: "27. ETag Middleware",
        type: "success",
        description: "Calculates ETag hashes",
      },
      { id: "m28", label: "28. API Controllers / SignalR / YARP", type: "primary" },
    ],
    connections: [
      { from: "p1", to: "m1" },
      { from: "m1", to: "m2" },
      { from: "m2", to: "m3" },
      { from: "m3", to: "m4" },
      { from: "m4", to: "m5" },
      { from: "m5", to: "m6" },
      { from: "m6", to: "m7" },
      { from: "m7", to: "m8" },
      { from: "m8", to: "p2" },

      { from: "p2", to: "m9" },
      { from: "m9", to: "m10" },
      { from: "m10", to: "m11" },
      { from: "m11", to: "m12" },
      { from: "m12", to: "m13" },
      { from: "m13", to: "m14" },
      { from: "m14", to: "p3" },

      { from: "p3", to: "m15" },
      { from: "m15", to: "m16" },
      { from: "m16", to: "m17" },
      { from: "m17", to: "m18" },
      { from: "m18", to: "p4" },

      { from: "p4", to: "m19" },
      { from: "m19", to: "m20" },
      { from: "m20", to: "m21" },
      { from: "m21", to: "m22" },
      { from: "m22", to: "m23" },
      { from: "m23", to: "m24" },
      { from: "m25", to: "p5" },

      { from: "p5", to: "m26" },
      { from: "m26", to: "m27" },
      { from: "m27", to: "m28" },
    ],
  },

  // ─── 1. GlobalExceptionMiddleware ────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.globalExceptionTitle",
    id: "global-exception",
  },
  { type: "paragraph", contentKey: "security.middlewarePipeline.globalExceptionIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "GlobalExceptionMiddleware.cs",
    code: `/// <summary>
/// Top-level exception handler. Catches ALL unhandled exceptions
/// and returns a structured error response instead of exposing stack traces.
/// Must be FIRST in the pipeline to catch errors from all middleware.
/// </summary>
public class GlobalExceptionMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new
            {
                type = "ValidationError",
                errors = ex.Errors.Select(e => new { e.PropertyName, e.ErrorMessage })
            });
        }
        catch (UnauthorizedAccessException)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new
            {
                type = "Unauthorized",
                message = "Authentication required"
            });
        }
        catch (ForbiddenAccessException ex)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { type = "Forbidden", ex.Message });
        }
        catch (NotFoundException ex)
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsJsonAsync(new { type = "NotFound", ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Path}", context.Request.Path);
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new
            {
                type = "InternalError",
                message = _env.IsDevelopment() ? ex.Message : "An error occurred",
                traceId = Activity.Current?.Id ?? context.TraceIdentifier
            });
        }
    }
}`,
    highlightLines: [3, 4, 14, 23, 32, 37, 42, 43],
  },

  // ─── 2. CorrelationIdMiddleware ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.correlationIdTitle",
    id: "correlation-id",
  },
  { type: "paragraph", contentKey: "security.middlewarePipeline.correlationIdIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "CorrelationIdMiddleware.cs",
    code: `/// <summary>
/// Assigns a unique correlation ID to every request for distributed tracing.
/// If the client sends X-Correlation-Id, it is reused; otherwise generated.
/// The correlation ID is:
///   1. Added to the response header
///   2. Stored in HttpContext.Items
///   3. Added to the logging scope (appears in all log entries)
/// </summary>
public class CorrelationIdMiddleware
{
    private const string HeaderName = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[HeaderName].FirstOrDefault()
            ?? Guid.NewGuid().ToString();

        context.Items["CorrelationId"] = correlationId;
        context.Response.Headers[HeaderName] = correlationId;

        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId
        }))
        {
            await _next(context);
        }
    }
}`,
    highlightLines: [15, 16, 18, 19, 21, 22, 23],
  },

  // ─── 3. RequestLoggingMiddleware ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.requestLoggingTitle",
    id: "request-logging",
  },
  { type: "paragraph", contentKey: "security.middlewarePipeline.requestLoggingIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "RequestLoggingMiddleware.cs",
    code: `/// <summary>
/// Logs every HTTP request with structured data:
/// Method, Path, StatusCode, Duration, UserId, TenantId, IP, UserAgent.
/// Also creates audit log entries for state-changing requests.
/// </summary>
public class RequestLoggingMiddleware
{
    public async Task InvokeAsync(HttpContext context, IAuditService auditService)
    {
        var stopwatch = Stopwatch.StartNew();
        var originalBody = context.Response.Body;

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            var statusCode = context.Response.StatusCode;
            var method = context.Request.Method;
            var path = context.Request.Path;
            var userId = context.User.FindFirst("sub")?.Value;
            var tenantId = context.User.FindFirst("tenant_id")?.Value;

            _logger.LogInformation(
                "{Method} {Path} → {StatusCode} ({Duration}ms) | User:{UserId} Tenant:{TenantId} IP:{IP}",
                method, path, statusCode, stopwatch.ElapsedMilliseconds,
                userId, tenantId, context.Connection.RemoteIpAddress);

            // Create audit entry for non-GET requests
            if (method != "GET" && userId != null)
            {
                await auditService.LogAsync(new AuditEntry
                {
                    Action = $"{method} {path}",
                    UserId = userId,
                    TenantId = tenantId,
                    StatusCode = statusCode,
                    Duration = stopwatch.ElapsedMilliseconds,
                    IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = context.Request.Headers.UserAgent.ToString()
                });
            }
        }
    }
}`,
    highlightLines: [10, 25, 26, 27, 31, 32, 33, 34],
  },

  // ─── 4. CookieAuthMiddleware ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.cookieAuthTitle",
    id: "cookie-auth",
  },
  { type: "paragraph", contentKey: "security.middlewarePipeline.cookieAuthIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "CookieAuthMiddleware.cs",
    code: `/// <summary>
/// Fallback authentication middleware that reads JWT from HttpOnly cookie
/// when the Authorization header is missing.
/// This supports browser-based flows where cookies are more secure than
/// storing tokens in localStorage.
/// </summary>
public class CookieAuthMiddleware
{
    private const string CookieName = "scripe-auth";

    public async Task InvokeAsync(HttpContext context)
    {
        // Only activate if no Authorization header present
        if (!context.Request.Headers.ContainsKey("Authorization"))
        {
            var token = context.Request.Cookies[CookieName];
            if (!string.IsNullOrEmpty(token))
            {
                // Set Authorization header from cookie
                context.Request.Headers.Authorization = $"Bearer {token}";
            }
        }
        await _next(context);
    }
}`,
    highlightLines: [14, 15, 17, 18, 20],
  },

  // ─── 5. TenantContextMiddleware ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.tenantContextTitle",
    id: "tenant-context",
  },
  { type: "paragraph", contentKey: "security.middlewarePipeline.tenantContextIntro" },
  {
    type: "info",
    variant: "note",
    contentKey: "security.middlewarePipeline.tenantContextNote",
  },

  // ─── 6. FieldProjectionMiddleware ────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.fieldProjectionTitle",
    id: "field-projection",
  },
  { type: "paragraph", contentKey: "security.middlewarePipeline.fieldProjectionIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "FieldProjectionMiddleware.cs",
    code: `/// <summary>
/// Filters response JSON to only include fields the user's role permits.
/// Uses RestrictedFields from role configuration.
/// Runs AFTER the controller has produced the response.
/// </summary>
public class FieldProjectionMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        // Capture the response body
        var originalBodyStream = context.Response.Body;
        using var memoryStream = new MemoryStream();
        context.Response.Body = memoryStream;

        await _next(context);

        // Read the response
        memoryStream.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();

        // Apply field filtering if restricted fields are set
        if (context.Items.TryGetValue("RestrictedFields", out var fields)
            && fields is HashSet<string> restrictedFields)
        {
            responseBody = FilterJsonFields(responseBody, restrictedFields);
        }

        // Write filtered response
        var bytes = Encoding.UTF8.GetBytes(responseBody);
        await originalBodyStream.WriteAsync(bytes);
    }
}`,
    highlightLines: [21, 22, 23, 24, 25],
  },

  // ─── 7. CacheHeadersMiddleware ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.cacheHeadersTitle",
    id: "cache-headers",
  },
  { type: "paragraph", contentKey: "security.middlewarePipeline.cacheHeadersIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "CacheHeadersMiddleware.cs",
    code: `/// <summary>
/// Implements conditional caching with ETag support:
/// 1. Computes ETag (MD5 hash of response body)
/// 2. Handles If-None-Match → returns 304 Not Modified
/// 3. Sets Cache-Control headers based on endpoint configuration
/// </summary>
public class CacheHeadersMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        await _next(context);

        if (context.Request.Method == "GET" &&
            context.Response.StatusCode == 200)
        {
            // Compute ETag from response body
            var etag = ComputeETag(context.Response);
            context.Response.Headers.ETag = etag;

            // Check If-None-Match from client
            var clientETag = context.Request.Headers.IfNoneMatch.FirstOrDefault();
            if (clientETag == etag)
            {
                context.Response.StatusCode = 304; // Not Modified
                context.Response.ContentLength = 0;
                return;
            }
        }
    }
}`,
    highlightLines: [13, 14, 17, 21, 22, 23, 24],
  },

  // ─── 8. ObservabilityMiddleware ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.observabilityTitle",
    id: "observability",
  },
  { type: "paragraph", contentKey: "security.middlewarePipeline.observabilityIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ObservabilityMiddleware.cs",
    code: `/// <summary>
/// Enriches distributed traces and metrics for monitoring:
/// 1. Adds custom tags to Activity (OpenTelemetry span)
/// 2. Records request duration histogram
/// 3. Increments request counter by status code
/// </summary>
public class ObservabilityMiddleware
{
    private static readonly Histogram<double> RequestDuration =
        Meters.Default.CreateHistogram<double>("http.request.duration", "ms");

    private static readonly Counter<long> RequestCount =
        Meters.Default.CreateCounter<long>("http.request.count");

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var activity = Activity.Current;

        activity?.SetTag("tenant.id", context.User.FindFirst("tenant_id")?.Value);
        activity?.SetTag("user.id", context.User.FindFirst("sub")?.Value);

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            var tags = new TagList
            {
                { "http.method", context.Request.Method },
                { "http.status_code", context.Response.StatusCode },
                { "http.route", context.GetEndpoint()?.DisplayName }
            };

            RequestDuration.Record(stopwatch.Elapsed.TotalMilliseconds, tags);
            RequestCount.Add(1, tags);
        }
    }
}`,
    highlightLines: [9, 10, 12, 13, 20, 21, 36, 37],
  },

  // ─── Middleware Registration ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.registrationTitle",
    id: "registration",
  },
  { type: "paragraph", contentKey: "security.middlewarePipeline.registrationIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "Program.cs — Middleware Pipeline Registration",
    code: `var app = builder.Build();

// ─── Middleware Pipeline (ORDER MATTERS!) ───────────────
app.UseForwardedHeaders();                           // 1. Resolve client IP
app.UseMiddleware<GlobalExceptionMiddleware>();      // 2. Catch all errors
if (!app.Environment.IsDevelopment())
    app.UseHsts();                                   // 3. Enable HSTS
app.UseSecurityHeaders();                            // 4. Set secure response headers
app.UseCorrelationId();                              // 5. Trace logging correlation
app.UseObservabilityMiddleware();                    // 6. Trace enrichment
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();                       // 7. Enforce SSL
app.UseResponseCompression();                        // 8. Brotli/Gzip compression
app.UseRequestLocalization();                        // 9. Multi-lingual context
app.UseStaticFiles();                                // 10. Serve static files
app.UseCorsConfiguration();                          // 11. CORS policies
app.UseCloudflareOriginVerification();               // 12. Cloudflare gate
app.UseBackgroundJobsDashboard();                    // 13. Hangfire dashboard
app.UseRateLimiting();                               // 14. Throttling limiters
app.UseResponseCaching();                            // 15. Response caching
app.UseMiddleware<CacheHeadersMiddleware>();          // 16. Cache headers
app.UseCookieAuth();                                 // 17. Cookie auth fallback
app.UseAuthentication();                             // 18. Authenticate JWT token
app.UseCsrfProtection();                             // 19. CSRF double-submit
app.UseInputSanitization();                          // 20. Input sanitization
app.UseAuthorization();                              // 21. Check RBAC permissions
app.UseMiddleware<MustChangePasswordMiddleware>();   // 22. MCP flag check
app.UseReplayProtection();                           // 23. Timestamp & Nonce check
app.UseTenantContextValidation();                    // 24. Switch-tenant checks
app.UseMiddleware<FieldProjectionMiddleware>();       // 25. Field level security
app.UseRequestLogging();                             // 26. Log HTTP audits (after auth)

app.MapHealthChecks("/health");                      // 27. Health endpoint
app.UseMiddleware<ETagMiddleware>();                 // 28. Client ETag validation
app.MapControllers();                                // 29. Route to controllers
app.Run();`,
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "security.middlewarePipeline.orderWarning",
  },

  // ─── Summary Table ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.middlewarePipeline.summaryTitle",
    id: "summary",
  },
  {
    type: "table",
    headers: [
      "#",
      "Middleware",
      "Purpose & Responsibility",
      "Short-Circuits?",
      "Scope & Conditions",
    ],
    rows: [
      [
        "1",
        "Forwarded Headers",
        "Resolves client IP/Host headers behind reverse proxies",
        "No",
        "All incoming requests",
      ],
      [
        "2",
        "GlobalExceptionMiddleware",
        "Catches all unhandled exceptions and returns structured errors",
        "On exception",
        "All requests (top handler)",
      ],
      [
        "3",
        "HSTS",
        "Enforces Strict Transport Security header in production",
        "No",
        "Production requests only",
      ],
      [
        "4",
        "Security Headers",
        "Injects anti-clickjacking, nosniff, and CSP headers",
        "No",
        "All responses",
      ],
      [
        "5",
        "Correlation ID",
        "Generates or extracts X-Correlation-Id for distributed tracing",
        "No",
        "All requests",
      ],
      [
        "6",
        "Observability Middleware",
        "Enriches trace spans with tenant and user ID metadata",
        "No",
        "All requests",
      ],
      [
        "7",
        "HTTPS Redirection",
        "Redirects unencrypted HTTP requests to secure HTTPS",
        "Yes (Redirects 301)",
        "Non-development requests",
      ],
      [
        "8",
        "Response Compression",
        "Compresses HTTP payload using Brotli/Gzip",
        "No",
        "Responses exceeding threshold",
      ],
      [
        "9",
        "Request Localization",
        "Sets request culture context based on Accept-Language",
        "No",
        "All requests",
      ],
      [
        "10",
        "Static Files",
        "Serves secure files from FileHost folder under /api/files",
        "Yes (200 / 304)",
        "Requests to RequestPath",
      ],
      [
        "11",
        "CORS",
        "Validates cross-origin requests against whitelisted origins",
        "Yes (400 / Preflight 204)",
        "Cross-origin requests",
      ],
      [
        "12",
        "Cloudflare Origin Verification",
        "Blocks non-health requests that bypass Cloudflare proxies",
        "Yes (403 Forbidden)",
        "Non-health requests in Prod",
      ],
      [
        "13",
        "Background Jobs Dashboard",
        "Provides secure access dashboard for Hangfire or Quartz",
        "Yes (UI pages / 401)",
        "/hangfire or dashboard routes",
      ],
      [
        "14",
        "Rate Limiting",
        "Enforces request throttling based on IP/User policies",
        "Yes (429 Too Many Requests)",
        "All endpoints (configured)",
      ],
      [
        "15",
        "Response Caching",
        "Serves cached responses directly when available",
        "Yes (Cache hit 200)",
        "Configured GET requests",
      ],
      [
        "16",
        "CacheHeadersMiddleware",
        "Injects cache-control headers and computes ETag hashes",
        "Yes (304 Not Modified)",
        "All GET requests",
      ],
      [
        "17",
        "CookieAuthMiddleware",
        "Reads JWT from httpOnly cookie as Authorization header fallback",
        "No",
        "Authorization header missing",
      ],
      [
        "18",
        "Authentication",
        "Validates JWT signature, validity, and extracts identity claims",
        "Yes (401 Unauthorized on invalid)",
        "All requests",
      ],
      [
        "19",
        "CSRF Protection",
        "Validates double-submit cookie signature for state mutation",
        "Yes (403 CSRF Mismatch)",
        "POST/PUT/DELETE non-Bearer",
      ],
      [
        "20",
        "Input Sanitization",
        "Strips dangerous HTML/script tags from incoming JSON models",
        "No",
        "Mutating requests (JSON bodies)",
      ],
      [
        "21",
        "Authorization",
        "Validates user permissions and roles against endpoint targets",
        "Yes (403 Forbidden)",
        "Endpoints with auth attributes",
      ],
      [
        "22",
        "MustChangePasswordMiddleware",
        "Blocks resource access when password needs rotation",
        "Yes (403 Force Change)",
        "JWT contains mcp=true claim",
      ],
      [
        "23",
        "Replay Protection",
        "Validates uniqueness of request UUID nonces within skew window",
        "Yes (409 Conflict / 400)",
        "Mutating authenticated requests",
      ],
      [
        "24",
        "Tenant Context Validation",
        "Ensures request tenant matches user bounds or drill-downs",
        "Yes (403 Forbidden)",
        "Tenant-scoped requests",
      ],
      [
        "25",
        "TenantContextMiddleware",
        "Binds the active tenant context to IDataScopeService",
        "No",
        "Tenant-scoped requests",
      ],
      [
        "26",
        "FieldProjectionMiddleware",
        "Removes unauthorized restricted fields from JSON responses",
        "No",
        "GET requests with active policies",
      ],
      [
        "27",
        "Request Logging",
        "Logs request auditing data including user and tenant IDs",
        "No",
        "All requests (post-auth context)",
      ],
      [
        "28",
        "Health Checks",
        "Exposes system health, database, and readiness probes",
        "Yes (200 / 503)",
        "/health and /health/ready",
      ],
      [
        "29",
        "ETag Middleware",
        "Validates If-None-Match header against response MD5 hash",
        "Yes (304 Not Modified)",
        "GET requests",
      ],
    ],
  },
];

registerPage({
  slug: "security/middleware-pipeline",
  titleKey: "security.middlewarePipeline.title",
  descriptionKey: "security.middlewarePipeline.description",
  category: "security",
  order: 5,
  sections,
  relatedSlugs: ["security/api-security", "architecture/backend", "security/authentication-deep"],
  lastUpdated: "2026-06-28",
});
