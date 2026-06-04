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
      { id: "m1", label: "1. ForwardedHeaders", type: "info", description: "Real client IP from proxy" },
      { id: "m2", label: "2. GlobalExceptionMiddleware", type: "danger", description: "Catches all unhandled exceptions" },
      { id: "m3", label: "3. Security Headers", type: "default", description: "HSTS, CSP, clickjacking prevention" },
      { id: "m4", label: "4. CorrelationIdMiddleware", type: "info", description: "Request correlation ID" },
      { id: "m5", label: "5. ObservabilityMiddleware", type: "info", description: "Distributed tracing & metrics" },
      { id: "m6", label: "6. HTTPS Redirection", type: "default", description: "Redirect HTTP to HTTPS" },
      { id: "m7", label: "7. Response Compression", type: "success", description: "Brotli/Gzip compression" },
      { id: "m8", label: "8. Request Localization", type: "default", description: "Sets culture info from headers" },
      { id: "m9", label: "9. Static Files", type: "default", description: "Serves physical files" },
      { id: "m10", label: "10. CORS", type: "default", description: "Cross-origin validation" },
      { id: "m11", label: "11. Background Jobs Dashboard", type: "default", description: "Dashboard access control" },
      { id: "m12", label: "12. Rate Limiter", type: "warning", description: "Request throttling" },
      { id: "m13", label: "13. Response Caching", type: "success", description: "Caching GET responses" },
      { id: "m14", label: "14. CacheHeadersMiddleware", type: "success", description: "ETag freshness check (304)" },
      { id: "m15", label: "15. CookieAuthMiddleware", type: "primary", description: "Injects cookie token to header" },
      { id: "m16", label: "16. Authentication", type: "primary", description: "JWT validation" },
      { id: "m17", label: "17. CsrfMiddleware", type: "warning", description: "CSRF double-submit token check" },
      { id: "m18", label: "18. InputSanitizationMiddleware", type: "info", description: "Strips HTML from JSON values" },
      { id: "m19", label: "19. Authorization", type: "primary", description: "Permission & role checks" },
      { id: "m20", label: "20. MustChangePasswordMiddleware", type: "warning", description: "Forces change on temporary pass" },
      { id: "m21", label: "21. ReplayProtectionMiddleware", type: "warning", description: "Nonce-based replay prevention" },
      { id: "m22", label: "22. TenantContextValidation", type: "success", description: "Scopes database to current tenant" },
      { id: "m23", label: "23. FieldProjectionMiddleware", type: "info", description: "Restricts fields by role" },
      { id: "m24", label: "24. RequestLoggingMiddleware", type: "info", description: "Logs request metadata with user info" },
      { id: "m25", label: "25. HealthChecks", type: "success", description: "System health check endpoints" },
      { id: "m26", label: "26. ETagMiddleware", type: "success", description: "ETag wrapping of controller execution" },
      { id: "m27", label: "27. Controllers", type: "primary", description: "Executes business logic" },
      { id: "m28", label: "28. Prometheus Metrics", type: "info", description: "Prometheus scraping endpoint" },
      { id: "m29", label: "29. SignalR Hubs", type: "success", description: "Real-time updates transport" },
      { id: "m30", label: "30. YARP Gateway", type: "info", description: "Microservice reverse proxy" }
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
      { from: "m16", to: "m17" },
      { from: "m17", to: "m18" },
      { from: "m18", to: "m19" },
      { from: "m19", to: "m20" },
      { from: "m20", to: "m21" },
      { from: "m21", to: "m22" },
      { from: "m22", to: "m23" },
      { from: "m23", to: "m24" },
      { from: "m24", to: "m25" },
      { from: "m25", to: "m26" },
      { from: "m26", to: "m27" },
      { from: "m27", to: "m28" },
      { from: "m28", to: "m29" },
      { from: "m29", to: "m30" }
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
app.UseForwardedHeadersConfiguration();                // 1. Forwarded headers
app.UseMiddleware<GlobalExceptionMiddleware>();        // 2. Catch all errors
app.UseSecurityConfiguration(configuration);           // 3. Security headers (HSTS, etc.)
app.UseCorrelationId();                                // 4. Request tracing
app.UseObservabilityMiddleware();                      // 5. OpenTelemetry metrics/traces
app.UseResponseCompression();                          // 6. Response compression
app.UseRequestLocalization(locOptions);                // 7. Request localization
app.UseStaticFiles(staticFileOptions);                 // 8. Physical files host
app.UseCorsConfiguration(app.Environment);             // 9. CORS
app.UseBackgroundJobsConfiguration(configuration);      // 10. Hangfire/Quartz dashboard
app.UseRateLimitingConfiguration(configuration);       // 11. Rate limiting
app.UseResponseCaching();                              // 12. Response caching
app.UseMiddleware<CacheHeadersMiddleware>();           // 13. Cache headers
app.UseCookieAuth();                                   // 14. Cookie auth fallback
app.UseAuthentication();                               // 15. JWT authentication
app.UseCsrfProtection();                               // 16. CSRF validation
app.UseInputSanitization();                            // 17. HTML tag striping
app.UseAuthorization();                                // 18. RBAC validation
app.UseMiddleware<MustChangePasswordMiddleware>();     // 19. Force pass change
app.UseReplayProtection();                             // 20. Request replay protection
app.UseTenantContextValidation();                      // 21. Tenant context check
app.UseMiddleware<FieldProjectionMiddleware>();        // 22. Field-level security
app.UseRequestLogging();                               // 23. Request logging (after auth)
app.MapHealthCheckEndpoints();                         // 24. Health checks
app.UseMiddleware<ETagMiddleware>();                   // 25. ETag generation
app.MapControllers();                                  // 26. REST controllers
app.MapPrometheusScrapingEndpoint("/metrics");         // 27. Prometheus metrics
app.MapSignalRHubs();                                  // 28. SignalR hubs
app.UseGatewayConfiguration(configuration);            // 29. YARP Gateway proxy
app.Run();`,
    highlightLines: [4, 5, 14, 18, 19, 23, 24, 26, 27],
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
      ["1", "ForwardedHeaders", "Reads client IP from reverse proxy headers", "No", "All requests"],
      ["2", "GlobalExceptionMiddleware", "Structured error responses", "On exception", "All requests"],
      ["3", "Security Headers", "HSTS, CSP, clickjacking prevention", "No", "All requests"],
      ["4", "CorrelationIdMiddleware", "Distributed tracing via X-Correlation-Id", "No", "All requests"],
      ["5", "ObservabilityMiddleware", "Metrics + OpenTelemetry enrichment", "No", "All requests"],
      ["6", "HTTPS Redirection", "Forces HTTP to HTTPS redirection", "On redirect", "Production only"],
      ["7", "Response Compression", "Brotli + Gzip compression", "No", "All requests"],
      ["8", "Request Localization", "Sets culture info from Accept-Language", "No", "All requests"],
      ["9", "Static Files", "Serves physical files from /api/files", "On file match", "Matching paths"],
      ["10", "CORS", "Cross-origin request validation", "On invalid origin", "Cross-origin"],
      ["11", "Background Jobs Dashboard", "Dashboard UI endpoint access control", "On endpoint match", "Dashboard path"],
      ["12", "Rate Limiter", "Request throttling", "On rate limit exceeded (429)", "Configurable"],
      ["13", "Response Caching", "GET query response caching", "On cache hit", "GET requests"],
      ["14", "CacheHeadersMiddleware", "ETag conditional 304 checks", "On cache hit (304)", "GET requests"],
      ["15", "CookieAuthMiddleware", "Cookie-to-Bearer fallback token injection", "No", "Without Auth header"],
      ["16", "Authentication", "JWT token signature validation", "No (sets User)", "All requests"],
      ["17", "CsrfMiddleware", "Double-submit cookie CSRF validation", "On invalid token (403)", "Mutations"],
      ["18", "InputSanitizationMiddleware", "Strips HTML tags from JSON string properties", "No", "POST/PUT/PATCH/DELETE"],
      ["19", "Authorization", "Permission/role checks", "On denied (403)", "Attributed endpoints"],
      ["20", "MustChangePasswordMiddleware", "Blocks standard requests if mcp claim set", "On restriction (403)", "Needs password change"],
      ["21", "ReplayProtectionMiddleware", "Nonce-based replay prevention", "On duplicate nonce (409)", "Mutations with nonce"],
      ["22", "TenantContextValidation", "Scopes database context to current tenant ID", "On invalid context (403)", "Tenant-scoped"],
      ["23", "FieldProjectionMiddleware", "Filters response fields by role permissions", "No", "GET responses"],
      ["24", "RequestLoggingMiddleware", "Logs request metadata + audits (after auth)", "No", "All requests"],
      ["25", "HealthChecks", "System health check endpoints", "On match", "Matching paths"],
      ["26", "ETagMiddleware", "Computes and sets ETag headers", "No", "GET requests"],
      ["27", "Controllers", "Executes endpoint business logic", "Yes", "Endpoint match"],
      ["28", "Prometheus Metrics", "Exposes metrics for scraping", "On match", "Metrics path"],
      ["29", "SignalR Hubs", "Real-time updates websocket hubs", "On match", "Hub paths"],
      ["30", "YARP Gateway", "Microservice reverse proxy", "On match", "Gateway mode only"]
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
