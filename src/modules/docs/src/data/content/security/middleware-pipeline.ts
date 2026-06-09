import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "security/middleware-pipeline",
  titleKey: "security.middlewarePipeline.title",
  category: "security",
  order: 5,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    m1([\"1. ForwardedHeaders\"])\n    %% m1: Real client IP from proxy\n    m2[\"2. GlobalExceptionMiddleware\"]\n    %% m2: Catches all unhandled exceptions\n    m3[\"3. Security Headers\"]\n    %% m3: HSTS, CSP, clickjacking prevention\n    m4([\"4. CorrelationIdMiddleware\"])\n    %% m4: Request correlation ID\n    m5([\"5. ObservabilityMiddleware\"])\n    %% m5: Distributed tracing & metrics\n    m6[\"6. HTTPS Redirection\"]\n    %% m6: Redirect HTTP to HTTPS\n    m7([\"7. Response Compression\"])\n    %% m7: Brotli/Gzip compression\n    m8[\"8. Request Localization\"]\n    %% m8: Sets culture info from headers\n    m9[\"9. Static Files\"]\n    %% m9: Serves physical files\n    m10[\"10. CORS\"]\n    %% m10: Cross-origin validation\n    m11[\"11. Background Jobs Dashboard\"]\n    %% m11: Dashboard access control\n    m12{{\"12. Rate Limiter\"}}\n    %% m12: Request throttling\n    m13([\"13. Response Caching\"])\n    %% m13: Caching GET responses\n    m14([\"14. CacheHeadersMiddleware\"])\n    %% m14: ETag freshness check (304)\n    m15([\"15. CookieAuthMiddleware\"])\n    %% m15: Injects cookie token to header\n    m16([\"16. Authentication\"])\n    %% m16: JWT validation\n    m17{{\"17. CsrfMiddleware\"}}\n    %% m17: CSRF double-submit token check\n    m18([\"18. InputSanitizationMiddleware\"])\n    %% m18: Strips HTML from JSON values\n    m19([\"19. Authorization\"])\n    %% m19: Permission & role checks\n    m20{{\"20. MustChangePasswordMiddleware\"}}\n    %% m20: Forces change on temporary pass\n    m21{{\"21. ReplayProtectionMiddleware\"}}\n    %% m21: Nonce-based replay prevention\n    m22([\"22. TenantContextValidation\"])\n    %% m22: Scopes database to current tenant\n    m23([\"23. FieldProjectionMiddleware\"])\n    %% m23: Restricts fields by role\n    m24([\"24. RequestLoggingMiddleware\"])\n    %% m24: Logs request metadata with user info\n    m25([\"25. HealthChecks\"])\n    %% m25: System health check endpoints\n    m26([\"26. ETagMiddleware\"])\n    %% m26: ETag wrapping of controller execution\n    m27([\"27. Controllers\"])\n    %% m27: Executes business logic\n    m28([\"28. Prometheus Metrics\"])\n    %% m28: Prometheus scraping endpoint\n    m29([\"29. SignalR Hubs\"])\n    %% m29: Real-time updates transport\n    m30([\"30. YARP Gateway\"])\n    %% m30: Microservice reverse proxy\n    m1 --> m2\n    m2 --> m3\n    m3 --> m4\n    m4 --> m5\n    m5 --> m6\n    m6 --> m7\n    m7 --> m8\n    m8 --> m9\n    m9 --> m10\n    m10 --> m11\n    m11 --> m12\n    m12 --> m13\n    m13 --> m14\n    m14 --> m15\n    m15 --> m16\n    m16 --> m17\n    m17 --> m18\n    m18 --> m19\n    m19 --> m20\n    m20 --> m21\n    m21 --> m22\n    m22 --> m23\n    m23 --> m24\n    m24 --> m25\n    m25 --> m26\n    m26 --> m27\n    m27 --> m28\n    m28 --> m29\n    m29 --> m30",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_6_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_7_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Top-level exception handler. Catches ALL unhandled exceptions\n/// and returns a structured error response instead of exposing stack traces.\n/// Must be FIRST in the pipeline to catch errors from all middleware.\n/// </summary>\npublic class GlobalExceptionMiddleware\n{\n    public async Task InvokeAsync(HttpContext context)\n    {\n        try\n        {\n            await _next(context);\n        }\n        catch (ValidationException ex)\n        {\n            context.Response.StatusCode = 400;\n            await context.Response.WriteAsJsonAsync(new\n            {\n                type = \"ValidationError\",\n                errors = ex.Errors.Select(e => new { e.PropertyName, e.ErrorMessage })\n            });\n        }\n        catch (UnauthorizedAccessException)\n        {\n            context.Response.StatusCode = 401;\n            await context.Response.WriteAsJsonAsync(new\n            {\n                type = \"Unauthorized\",\n                message = \"Authentication required\"\n            });\n        }\n        catch (ForbiddenAccessException ex)\n        {\n            context.Response.StatusCode = 403;\n            await context.Response.WriteAsJsonAsync(new { type = \"Forbidden\", ex.Message });\n        }\n        catch (NotFoundException ex)\n        {\n            context.Response.StatusCode = 404;\n            await context.Response.WriteAsJsonAsync(new { type = \"NotFound\", ex.Message });\n        }\n        catch (Exception ex)\n        {\n            _logger.LogError(ex, \"Unhandled exception for {Path}\", context.Request.Path);\n            context.Response.StatusCode = 500;\n            await context.Response.WriteAsJsonAsync(new\n            {\n                type = \"InternalError\",\n                message = _env.IsDevelopment() ? ex.Message : \"An error occurred\",\n                traceId = Activity.Current?.Id ?? context.TraceIdentifier\n            });\n        }\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_10_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_11_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Assigns a unique correlation ID to every request for distributed tracing.\n/// If the client sends X-Correlation-Id, it is reused; otherwise generated.\n/// The correlation ID is:\n///   1. Added to the response header\n///   2. Stored in HttpContext.Items\n///   3. Added to the logging scope (appears in all log entries)\n/// </summary>\npublic class CorrelationIdMiddleware\n{\n    private const string HeaderName = \"X-Correlation-Id\";\n\n    public async Task InvokeAsync(HttpContext context)\n    {\n        var correlationId = context.Request.Headers[HeaderName].FirstOrDefault()\n            ?? Guid.NewGuid().ToString();\n\n        context.Items[\"CorrelationId\"] = correlationId;\n        context.Response.Headers[HeaderName] = correlationId;\n\n        using (_logger.BeginScope(new Dictionary<string, object>\n        {\n            [\"CorrelationId\"] = correlationId\n        }))\n        {\n            await _next(context);\n        }\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_14_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_15_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Logs every HTTP request with structured data:\n/// Method, Path, StatusCode, Duration, UserId, TenantId, IP, UserAgent.\n/// Also creates audit log entries for state-changing requests.\n/// </summary>\npublic class RequestLoggingMiddleware\n{\n    public async Task InvokeAsync(HttpContext context, IAuditService auditService)\n    {\n        var stopwatch = Stopwatch.StartNew();\n        var originalBody = context.Response.Body;\n\n        try\n        {\n            await _next(context);\n        }\n        finally\n        {\n            stopwatch.Stop();\n            var statusCode = context.Response.StatusCode;\n            var method = context.Request.Method;\n            var path = context.Request.Path;\n            var userId = context.User.FindFirst(\"sub\")?.Value;\n            var tenantId = context.User.FindFirst(\"tenant_id\")?.Value;\n\n            _logger.LogInformation(\n                \"{Method} {Path} → {StatusCode} ({Duration}ms) | User:{UserId} Tenant:{TenantId} IP:{IP}\",\n                method, path, statusCode, stopwatch.ElapsedMilliseconds,\n                userId, tenantId, context.Connection.RemoteIpAddress);\n\n            // Create audit entry for non-GET requests\n            if (method != \"GET\" && userId != null)\n            {\n                await auditService.LogAsync(new AuditEntry\n                {\n                    Action = $\"{method} {path}\",\n                    UserId = userId,\n                    TenantId = tenantId,\n                    StatusCode = statusCode,\n                    Duration = stopwatch.ElapsedMilliseconds,\n                    IpAddress = context.Connection.RemoteIpAddress?.ToString(),\n                    UserAgent = context.Request.Headers.UserAgent.ToString()\n                });\n            }\n        }\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_18_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_19_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Fallback authentication middleware that reads JWT from HttpOnly cookie\n/// when the Authorization header is missing.\n/// This supports browser-based flows where cookies are more secure than\n/// storing tokens in localStorage.\n/// </summary>\npublic class CookieAuthMiddleware\n{\n    private const string CookieName = \"scripe-auth\";\n\n    public async Task InvokeAsync(HttpContext context)\n    {\n        // Only activate if no Authorization header present\n        if (!context.Request.Headers.ContainsKey(\"Authorization\"))\n        {\n            var token = context.Request.Cookies[CookieName];\n            if (!string.IsNullOrEmpty(token))\n            {\n                // Set Authorization header from cookie\n                context.Request.Headers.Authorization = $\"Bearer {token}\";\n            }\n        }\n        await _next(context);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_22_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "security.middlewarePipeline.section_23_title",
    "contentKey": "security.middlewarePipeline.section_23_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_25_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_26_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Filters response JSON to only include fields the user's role permits.\n/// Uses RestrictedFields from role configuration.\n/// Runs AFTER the controller has produced the response.\n/// </summary>\npublic class FieldProjectionMiddleware\n{\n    public async Task InvokeAsync(HttpContext context)\n    {\n        // Capture the response body\n        var originalBodyStream = context.Response.Body;\n        using var memoryStream = new MemoryStream();\n        context.Response.Body = memoryStream;\n\n        await _next(context);\n\n        // Read the response\n        memoryStream.Seek(0, SeekOrigin.Begin);\n        var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();\n\n        // Apply field filtering if restricted fields are set\n        if (context.Items.TryGetValue(\"RestrictedFields\", out var fields)\n            && fields is HashSet<string> restrictedFields)\n        {\n            responseBody = FilterJsonFields(responseBody, restrictedFields);\n        }\n\n        // Write filtered response\n        var bytes = Encoding.UTF8.GetBytes(responseBody);\n        await originalBodyStream.WriteAsync(bytes);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_29_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_30_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Implements conditional caching with ETag support:\n/// 1. Computes ETag (MD5 hash of response body)\n/// 2. Handles If-None-Match → returns 304 Not Modified\n/// 3. Sets Cache-Control headers based on endpoint configuration\n/// </summary>\npublic class CacheHeadersMiddleware\n{\n    public async Task InvokeAsync(HttpContext context)\n    {\n        await _next(context);\n\n        if (context.Request.Method == \"GET\" &&\n            context.Response.StatusCode == 200)\n        {\n            // Compute ETag from response body\n            var etag = ComputeETag(context.Response);\n            context.Response.Headers.ETag = etag;\n\n            // Check If-None-Match from client\n            var clientETag = context.Request.Headers.IfNoneMatch.FirstOrDefault();\n            if (clientETag == etag)\n            {\n                context.Response.StatusCode = 304; // Not Modified\n                context.Response.ContentLength = 0;\n                return;\n            }\n        }\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_33_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_34_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Enriches distributed traces and metrics for monitoring:\n/// 1. Adds custom tags to Activity (OpenTelemetry span)\n/// 2. Records request duration histogram\n/// 3. Increments request counter by status code\n/// </summary>\npublic class ObservabilityMiddleware\n{\n    private static readonly Histogram<double> RequestDuration =\n        Meters.Default.CreateHistogram<double>(\"http.request.duration\", \"ms\");\n\n    private static readonly Counter<long> RequestCount =\n        Meters.Default.CreateCounter<long>(\"http.request.count\");\n\n    public async Task InvokeAsync(HttpContext context)\n    {\n        var stopwatch = Stopwatch.StartNew();\n        var activity = Activity.Current;\n\n        activity?.SetTag(\"tenant.id\", context.User.FindFirst(\"tenant_id\")?.Value);\n        activity?.SetTag(\"user.id\", context.User.FindFirst(\"sub\")?.Value);\n\n        try\n        {\n            await _next(context);\n        }\n        finally\n        {\n            stopwatch.Stop();\n            var tags = new TagList\n            {\n                { \"http.method\", context.Request.Method },\n                { \"http.status_code\", context.Response.StatusCode },\n                { \"http.route\", context.GetEndpoint()?.DisplayName }\n            };\n\n            RequestDuration.Record(stopwatch.Elapsed.TotalMilliseconds, tags);\n            RequestCount.Add(1, tags);\n        }\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_37_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.middlewarePipeline.section_38_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "var app = builder.Build();\n\n// ─── Middleware Pipeline (ORDER MATTERS!) ───────────────\napp.UseForwardedHeadersConfiguration();                // 1. Forwarded headers\napp.UseMiddleware<GlobalExceptionMiddleware>();        // 2. Catch all errors\napp.UseSecurityConfiguration(configuration);           // 3. Security headers (HSTS, etc.)\napp.UseCorrelationId();                                // 4. Request tracing\napp.UseObservabilityMiddleware();                      // 5. OpenTelemetry metrics/traces\napp.UseResponseCompression();                          // 6. Response compression\napp.UseRequestLocalization(locOptions);                // 7. Request localization\napp.UseStaticFiles(staticFileOptions);                 // 8. Physical files host\napp.UseCorsConfiguration(app.Environment);             // 9. CORS\napp.UseBackgroundJobsConfiguration(configuration);      // 10. Hangfire/Quartz dashboard\napp.UseRateLimitingConfiguration(configuration);       // 11. Rate limiting\napp.UseResponseCaching();                              // 12. Response caching\napp.UseMiddleware<CacheHeadersMiddleware>();           // 13. Cache headers\napp.UseCookieAuth();                                   // 14. Cookie auth fallback\napp.UseAuthentication();                               // 15. JWT authentication\napp.UseCsrfProtection();                               // 16. CSRF validation\napp.UseInputSanitization();                            // 17. HTML tag striping\napp.UseAuthorization();                                // 18. RBAC validation\napp.UseMiddleware<MustChangePasswordMiddleware>();     // 19. Force pass change\napp.UseReplayProtection();                             // 20. Request replay protection\napp.UseTenantContextValidation();                      // 21. Tenant context check\napp.UseMiddleware<FieldProjectionMiddleware>();        // 22. Field-level security\napp.UseRequestLogging();                               // 23. Request logging (after auth)\napp.MapHealthCheckEndpoints();                         // 24. Health checks\napp.UseMiddleware<ETagMiddleware>();                   // 25. ETag generation\napp.MapControllers();                                  // 26. REST controllers\napp.MapPrometheusScrapingEndpoint(\"/metrics\");         // 27. Prometheus metrics\napp.MapSignalRHubs();                                  // 28. SignalR hubs\napp.UseGatewayConfiguration(configuration);            // 29. YARP Gateway proxy\napp.Run();",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "security.middlewarePipeline.section_40_title",
    "contentKey": "security.middlewarePipeline.section_40_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_41_title",
    "id": "sec_41"
  },
  {
    "type": "table",
    "headers": [
      "security.middlewarePipeline.section_42_hdr_0",
      "security.middlewarePipeline.section_42_hdr_1",
      "security.middlewarePipeline.section_42_hdr_2",
      "security.middlewarePipeline.section_42_hdr_3",
      "security.middlewarePipeline.section_42_hdr_4"
    ],
    "rows": [
      [
        "security.middlewarePipeline.section_42_cell_0_0",
        "security.middlewarePipeline.section_42_cell_0_1",
        "security.middlewarePipeline.section_42_cell_0_2",
        "security.middlewarePipeline.section_42_cell_0_3",
        "security.middlewarePipeline.section_42_cell_0_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_1_0",
        "security.middlewarePipeline.section_42_cell_1_1",
        "security.middlewarePipeline.section_42_cell_1_2",
        "security.middlewarePipeline.section_42_cell_1_3",
        "security.middlewarePipeline.section_42_cell_1_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_2_0",
        "security.middlewarePipeline.section_42_cell_2_1",
        "security.middlewarePipeline.section_42_cell_2_2",
        "security.middlewarePipeline.section_42_cell_2_3",
        "security.middlewarePipeline.section_42_cell_2_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_3_0",
        "security.middlewarePipeline.section_42_cell_3_1",
        "security.middlewarePipeline.section_42_cell_3_2",
        "security.middlewarePipeline.section_42_cell_3_3",
        "security.middlewarePipeline.section_42_cell_3_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_4_0",
        "security.middlewarePipeline.section_42_cell_4_1",
        "security.middlewarePipeline.section_42_cell_4_2",
        "security.middlewarePipeline.section_42_cell_4_3",
        "security.middlewarePipeline.section_42_cell_4_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_5_0",
        "security.middlewarePipeline.section_42_cell_5_1",
        "security.middlewarePipeline.section_42_cell_5_2",
        "security.middlewarePipeline.section_42_cell_5_3",
        "security.middlewarePipeline.section_42_cell_5_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_6_0",
        "security.middlewarePipeline.section_42_cell_6_1",
        "security.middlewarePipeline.section_42_cell_6_2",
        "security.middlewarePipeline.section_42_cell_6_3",
        "security.middlewarePipeline.section_42_cell_6_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_7_0",
        "security.middlewarePipeline.section_42_cell_7_1",
        "security.middlewarePipeline.section_42_cell_7_2",
        "security.middlewarePipeline.section_42_cell_7_3",
        "security.middlewarePipeline.section_42_cell_7_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_8_0",
        "security.middlewarePipeline.section_42_cell_8_1",
        "security.middlewarePipeline.section_42_cell_8_2",
        "security.middlewarePipeline.section_42_cell_8_3",
        "security.middlewarePipeline.section_42_cell_8_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_9_0",
        "security.middlewarePipeline.section_42_cell_9_1",
        "security.middlewarePipeline.section_42_cell_9_2",
        "security.middlewarePipeline.section_42_cell_9_3",
        "security.middlewarePipeline.section_42_cell_9_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_10_0",
        "security.middlewarePipeline.section_42_cell_10_1",
        "security.middlewarePipeline.section_42_cell_10_2",
        "security.middlewarePipeline.section_42_cell_10_3",
        "security.middlewarePipeline.section_42_cell_10_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_11_0",
        "security.middlewarePipeline.section_42_cell_11_1",
        "security.middlewarePipeline.section_42_cell_11_2",
        "security.middlewarePipeline.section_42_cell_11_3",
        "security.middlewarePipeline.section_42_cell_11_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_12_0",
        "security.middlewarePipeline.section_42_cell_12_1",
        "security.middlewarePipeline.section_42_cell_12_2",
        "security.middlewarePipeline.section_42_cell_12_3",
        "security.middlewarePipeline.section_42_cell_12_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_13_0",
        "security.middlewarePipeline.section_42_cell_13_1",
        "security.middlewarePipeline.section_42_cell_13_2",
        "security.middlewarePipeline.section_42_cell_13_3",
        "security.middlewarePipeline.section_42_cell_13_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_14_0",
        "security.middlewarePipeline.section_42_cell_14_1",
        "security.middlewarePipeline.section_42_cell_14_2",
        "security.middlewarePipeline.section_42_cell_14_3",
        "security.middlewarePipeline.section_42_cell_14_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_15_0",
        "security.middlewarePipeline.section_42_cell_15_1",
        "security.middlewarePipeline.section_42_cell_15_2",
        "security.middlewarePipeline.section_42_cell_15_3",
        "security.middlewarePipeline.section_42_cell_15_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_16_0",
        "security.middlewarePipeline.section_42_cell_16_1",
        "security.middlewarePipeline.section_42_cell_16_2",
        "security.middlewarePipeline.section_42_cell_16_3",
        "security.middlewarePipeline.section_42_cell_16_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_17_0",
        "security.middlewarePipeline.section_42_cell_17_1",
        "security.middlewarePipeline.section_42_cell_17_2",
        "security.middlewarePipeline.section_42_cell_17_3",
        "security.middlewarePipeline.section_42_cell_17_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_18_0",
        "security.middlewarePipeline.section_42_cell_18_1",
        "security.middlewarePipeline.section_42_cell_18_2",
        "security.middlewarePipeline.section_42_cell_18_3",
        "security.middlewarePipeline.section_42_cell_18_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_19_0",
        "security.middlewarePipeline.section_42_cell_19_1",
        "security.middlewarePipeline.section_42_cell_19_2",
        "security.middlewarePipeline.section_42_cell_19_3",
        "security.middlewarePipeline.section_42_cell_19_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_20_0",
        "security.middlewarePipeline.section_42_cell_20_1",
        "security.middlewarePipeline.section_42_cell_20_2",
        "security.middlewarePipeline.section_42_cell_20_3",
        "security.middlewarePipeline.section_42_cell_20_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_21_0",
        "security.middlewarePipeline.section_42_cell_21_1",
        "security.middlewarePipeline.section_42_cell_21_2",
        "security.middlewarePipeline.section_42_cell_21_3",
        "security.middlewarePipeline.section_42_cell_21_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_22_0",
        "security.middlewarePipeline.section_42_cell_22_1",
        "security.middlewarePipeline.section_42_cell_22_2",
        "security.middlewarePipeline.section_42_cell_22_3",
        "security.middlewarePipeline.section_42_cell_22_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_23_0",
        "security.middlewarePipeline.section_42_cell_23_1",
        "security.middlewarePipeline.section_42_cell_23_2",
        "security.middlewarePipeline.section_42_cell_23_3",
        "security.middlewarePipeline.section_42_cell_23_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_24_0",
        "security.middlewarePipeline.section_42_cell_24_1",
        "security.middlewarePipeline.section_42_cell_24_2",
        "security.middlewarePipeline.section_42_cell_24_3",
        "security.middlewarePipeline.section_42_cell_24_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_25_0",
        "security.middlewarePipeline.section_42_cell_25_1",
        "security.middlewarePipeline.section_42_cell_25_2",
        "security.middlewarePipeline.section_42_cell_25_3",
        "security.middlewarePipeline.section_42_cell_25_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_26_0",
        "security.middlewarePipeline.section_42_cell_26_1",
        "security.middlewarePipeline.section_42_cell_26_2",
        "security.middlewarePipeline.section_42_cell_26_3",
        "security.middlewarePipeline.section_42_cell_26_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_27_0",
        "security.middlewarePipeline.section_42_cell_27_1",
        "security.middlewarePipeline.section_42_cell_27_2",
        "security.middlewarePipeline.section_42_cell_27_3",
        "security.middlewarePipeline.section_42_cell_27_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_28_0",
        "security.middlewarePipeline.section_42_cell_28_1",
        "security.middlewarePipeline.section_42_cell_28_2",
        "security.middlewarePipeline.section_42_cell_28_3",
        "security.middlewarePipeline.section_42_cell_28_4"
      ],
      [
        "security.middlewarePipeline.section_42_cell_29_0",
        "security.middlewarePipeline.section_42_cell_29_1",
        "security.middlewarePipeline.section_42_cell_29_2",
        "security.middlewarePipeline.section_42_cell_29_3",
        "security.middlewarePipeline.section_42_cell_29_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.middlewarePipeline.section_43_title",
    "id": "sec_43"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "security.middlewarePipeline.section_44_item_0",
      "security.middlewarePipeline.section_44_item_1",
      "security.middlewarePipeline.section_44_item_2"
    ]
  }
],
  relatedSlugs: [
  "security/api-security",
  "architecture/backend",
  "security/authentication-deep"
],
  lastUpdated: "2026-06-09",
});
