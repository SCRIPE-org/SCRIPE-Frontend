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
    title: "Full Middleware Pipeline (Order of Execution)",
    direction: "vertical",
    nodes: [
      {
        id: "m1",
        label: "1. GlobalExceptionMiddleware",
        type: "danger",
        description: "Catches all unhandled exceptions",
      },
      {
        id: "m2",
        label: "2. CorrelationIdMiddleware",
        type: "info",
        description: "Assigns X-Correlation-Id to every request",
      },
      {
        id: "m3",
        label: "3. RequestLoggingMiddleware",
        type: "info",
        description: "Structured logging with timing",
      },
      { id: "m4", label: "4. CORS Middleware", type: "default" },
      { id: "m5", label: "5. HSTS Middleware", type: "default", description: "Production only" },
      { id: "m6", label: "6. Rate Limiter", type: "warning" },
      {
        id: "m7",
        label: "7. CsrfMiddleware",
        type: "warning",
        description: "Double-submit cookie validation",
      },
      {
        id: "m8",
        label: "8. ReplayProtectionMiddleware",
        type: "warning",
        description: "Nonce-based replay prevention",
      },
      { id: "m9", label: "9. Authentication", type: "primary" },
      {
        id: "m10",
        label: "10. CookieAuthMiddleware",
        type: "primary",
        description: "Cookie-based auth fallback",
      },
      {
        id: "m11",
        label: "11. TenantContextMiddleware",
        type: "success",
        description: "Sets tenant scope from JWT",
      },
      { id: "m12", label: "12. Authorization", type: "primary" },
      {
        id: "m13",
        label: "13. FieldProjectionMiddleware",
        type: "info",
        description: "Restricted field filtering",
      },
      {
        id: "m14",
        label: "14. CacheHeadersMiddleware",
        type: "success",
        description: "ETag + Cache-Control",
      },
      {
        id: "m15",
        label: "15. ObservabilityMiddleware",
        type: "info",
        description: "Metrics + distributed tracing",
      },
      { id: "m16", label: "16. Response Compression", type: "success" },
      { id: "controller", label: "Controller / Endpoint", type: "primary" },
    ],
    connections: [
      { from: "m1", to: "m2" },
      { from: "m2", to: "m3" },
      { from: "m3", to: "m4" },
      { from: "m4", to: "m5" },
      { from: "m5", to: "m6" },
      { from: "m6", to: "m7" },
      { from: "m7", to: "m8" },
      { from: "m8", to: "m9" },
      { from: "m9", to: "m10" },
      { from: "m10", to: "m11" },
      { from: "m11", to: "m12" },
      { from: "m12", to: "m13" },
      { from: "m13", to: "m14" },
      { from: "m14", to: "m15" },
      { from: "m15", to: "m16" },
      { from: "m16", to: "controller" },
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
app.UseMiddleware<GlobalExceptionMiddleware>();      // 1. Catch all errors
app.UseMiddleware<CorrelationIdMiddleware>();         // 2. Request tracing
app.UseMiddleware<RequestLoggingMiddleware>();        // 3. Structured logging

app.UseCors(policyName);                             // 4. CORS
if (app.Environment.IsProduction())
    app.UseHsts();                                   // 5. HSTS

app.UseRateLimiter();                                // 6. Rate limiting
app.UseMiddleware<CsrfMiddleware>();                 // 7. CSRF protection
app.UseMiddleware<ReplayProtectionMiddleware>();      // 8. Replay protection

app.UseAuthentication();                             // 9. JWT validation
app.UseMiddleware<CookieAuthMiddleware>();            // 10. Cookie fallback
app.UseMiddleware<TenantContextMiddleware>();         // 11. Tenant scope

app.UseAuthorization();                              // 12. Permission checks
app.UseMiddleware<FieldProjectionMiddleware>();       // 13. Field filtering
app.UseMiddleware<CacheHeadersMiddleware>();          // 14. ETag/caching
app.UseMiddleware<ObservabilityMiddleware>();         // 15. Metrics/tracing

app.UseResponseCompression();                        // 16. Brotli+Gzip

app.MapControllers();
app.MapHub<AuditHub>("/hubs/audit");
app.MapHub<NotificationHub>("/hubs/notification");
app.Run();`,
    highlightLines: [3, 4, 5, 6, 12, 13, 14, 16, 17, 18, 20, 21, 22, 23],
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
    headers: ["#", "Middleware", "Purpose", "Short-Circuits?", "Scope"],
    rows: [
      [
        "1",
        "GlobalExceptionMiddleware",
        "Structured error responses",
        "On exception",
        "All requests",
      ],
      [
        "2",
        "CorrelationIdMiddleware",
        "Distributed tracing via X-Correlation-Id",
        "No",
        "All requests",
      ],
      [
        "3",
        "RequestLoggingMiddleware",
        "Structured request logging + audit trail",
        "No",
        "All requests",
      ],
      ["4", "CORS", "Cross-origin request validation", "On invalid origin", "Cross-origin"],
      ["5", "HSTS", "Force HTTPS in production", "No", "Production only"],
      [
        "6",
        "Rate Limiter",
        "Request throttling",
        "On rate limit exceeded (429)",
        "Configurable per policy",
      ],
      [
        "7",
        "CsrfMiddleware",
        "CSRF token validation",
        "On invalid token (403)",
        "State-changing methods",
      ],
      [
        "8",
        "ReplayProtectionMiddleware",
        "Nonce-based replay prevention",
        "On duplicate nonce (409)",
        "All with nonce header",
      ],
      ["9", "Authentication", "JWT token validation", "No (sets User)", "All requests"],
      [
        "10",
        "CookieAuthMiddleware",
        "Cookie-to-Bearer fallback",
        "No",
        "Requests without Auth header",
      ],
      [
        "11",
        "TenantContextMiddleware",
        "Sets tenant scope for DB queries",
        "No",
        "Authenticated requests",
      ],
      ["12", "Authorization", "Permission/role checks", "On denied (403)", "Attributed endpoints"],
      ["13", "FieldProjectionMiddleware", "Filters response fields by role", "No", "GET responses"],
      [
        "14",
        "CacheHeadersMiddleware",
        "ETag + conditional 304 responses",
        "On cache hit (304)",
        "GET requests",
      ],
      ["15", "ObservabilityMiddleware", "Metrics + OpenTelemetry enrichment", "No", "All requests"],
      ["16", "Response Compression", "Brotli + Gzip compression", "No", "Responses > threshold"],
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
  lastUpdated: "2026-02-20",
});
