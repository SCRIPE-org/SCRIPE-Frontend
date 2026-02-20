import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "security.apiSecurity.intro" },

      // ─── Rate Limiting ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.apiSecurity.rateLimitTitle", id: "rate-limiting",
      },
      { type: "paragraph", contentKey: "security.apiSecurity.rateLimitIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "RateLimitingConfiguration.cs",
            code: `public static IServiceCollection AddRateLimitingConfiguration(
    this IServiceCollection services)
{
    services.AddRateLimiter(options =>
    {
        // 1. Global fixed window — 100 requests per minute per IP
        options.AddFixedWindowLimiter("global", opt =>
        {
            opt.PermitLimit = 100;
            opt.Window = TimeSpan.FromMinutes(1);
            opt.QueueLimit = 0; // Reject immediately
        });

        // 2. Auth endpoints — strict: 10 attempts per 5 minutes
        options.AddSlidingWindowLimiter("auth", opt =>
        {
            opt.PermitLimit = 10;
            opt.Window = TimeSpan.FromMinutes(5);
            opt.SegmentsPerWindow = 5;
            opt.QueueLimit = 0;
        });

        // 3. OTP/Verification — very strict: 5 per hour
        options.AddTokenBucketLimiter("otp", opt =>
        {
            opt.TokenLimit = 5;
            opt.ReplenishmentPeriod = TimeSpan.FromHours(1);
            opt.TokensPerPeriod = 5;
            opt.QueueLimit = 0;
        });

        // Custom response for rate-limited requests
        options.OnRejected = async (context, ct) =>
        {
            context.HttpContext.Response.StatusCode = 429;
            await context.HttpContext.Response.WriteAsJsonAsync(new
            {
                error = "Too many requests. Please try again later.",
                retryAfter = context.Lease.TryGetMetadata(
                    MetadataName.RetryAfter, out var retry) ? retry.TotalSeconds : 60
            }, ct);
        };
    });
    return services;
}`,
            highlightLines: [7, 8, 9, 10, 15, 16, 17, 18, 24, 25, 26, 27],
      },
      {
            type: "table",
            headers: ["Policy", "Type", "Limit", "Window", "Applied To"],
            rows: [
                  ["global", "Fixed Window", "100 req", "1 minute", "All endpoints"],
                  ["auth", "Sliding Window", "10 req", "5 minutes", "Login, Register, Refresh"],
                  ["otp", "Token Bucket", "5 req", "1 hour", "Send Verification, Password Reset"],
                  ["upload", "Concurrency", "3 concurrent", "—", "File/Image upload"],
                  ["export", "Fixed Window", "5 req", "10 minutes", "Dashboard export, CSV/PDF"],
            ],
      },

      // ─── CORS Configuration ───────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.apiSecurity.corsTitle", id: "cors",
      },
      { type: "paragraph", contentKey: "security.apiSecurity.corsIntro" },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Development",
                        language: "csharp",
                        filename: "CORS — Development Configuration",
                        code: `// Development: Allow any origin for local testing
policy.WithOrigins(
    "http://localhost:3000",    // Next.js dev
    "http://localhost:5173",    // Vite dev
    "http://localhost:4200"     // Angular dev
)
.AllowAnyMethod()
.AllowAnyHeader()
.AllowCredentials()              // Required for cookies/SignalR
.WithExposedHeaders(
    "Content-Disposition",        // File downloads
    "X-Correlation-Id",           // Request tracing
    "X-Total-Count",              // Pagination
    "X-Request-Id"
);`,
                  },
                  {
                        label: "Production",
                        language: "csharp",
                        filename: "CORS — Production Configuration",
                        code: `// Production: Whitelist specific origins only
var allowedOrigins = configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

policy.WithOrigins(allowedOrigins)
    .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
    .WithHeaders(
        "Authorization",
        "Content-Type",
        "X-Correlation-Id",
        "X-CSRF-Token",
        "X-Request-Nonce"
    )
    .AllowCredentials()
    .SetPreflightMaxAge(TimeSpan.FromHours(1));`,
                  },
            ],
      },

      // ─── CSRF Protection ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.apiSecurity.csrfTitle", id: "csrf",
      },
      { type: "paragraph", contentKey: "security.apiSecurity.csrfIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "CsrfMiddleware.cs",
            code: `/// <summary>
/// Double-submit cookie pattern for CSRF protection.
/// Client must send X-CSRF-Token header matching the csrf-token cookie.
/// Applied to state-changing methods (POST, PUT, PATCH, DELETE).
/// </summary>
public class CsrfMiddleware
{
    private static readonly HashSet<string> SafeMethods = new()
        { "GET", "HEAD", "OPTIONS", "TRACE" };

    public async Task InvokeAsync(HttpContext context)
    {
        if (!SafeMethods.Contains(context.Request.Method))
        {
            var cookieToken = context.Request.Cookies["csrf-token"];
            var headerToken = context.Request.Headers["X-CSRF-Token"]
                .FirstOrDefault();

            if (string.IsNullOrEmpty(cookieToken) ||
                cookieToken != headerToken)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "CSRF token validation failed"
                });
                return;
            }
        }
        await _next(context);
    }
}`,
            highlightLines: [13, 19, 20],
      },

      // ─── Replay Protection ────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.apiSecurity.replayTitle", id: "replay-protection",
      },
      { type: "paragraph", contentKey: "security.apiSecurity.replayIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "ReplayProtectionMiddleware.cs",
            code: `/// <summary>
/// Prevents request replay attacks using nonce-based validation.
/// Each request must include a unique X-Request-Nonce header.
/// Nonces are stored in cache and rejected if reused within 5 minutes.
/// </summary>
public class ReplayProtectionMiddleware
{
    public async Task InvokeAsync(HttpContext context, ICacheService cache)
    {
        var nonce = context.Request.Headers["X-Request-Nonce"].FirstOrDefault();

        if (!string.IsNullOrEmpty(nonce))
        {
            var cacheKey = $"nonce:{nonce}";
            var exists = await cache.GetAsync<bool>(cacheKey);

            if (exists)
            {
                context.Response.StatusCode = 409;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Request nonce already used (replay detected)"
                });
                return;
            }

            // Store nonce for 5 minutes to prevent reuse
            await cache.SetAsync(cacheKey, true, TimeSpan.FromMinutes(5));
        }

        await _next(context);
    }
}`,
            highlightLines: [10, 16, 17, 27],
      },

      // ─── Input Validation ─────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.apiSecurity.inputValidationTitle", id: "input-validation",
      },
      { type: "paragraph", contentKey: "security.apiSecurity.inputValidationIntro" },
      {
            type: "table",
            headers: ["Attack Vector", "Protection", "Implementation"],
            rows: [
                  ["SQL Injection", "Parameterized queries (EF Core)", "All queries go through LINQ → SQL — no raw SQL"],
                  ["XSS (Cross-Site Scripting)", "HTML sanitization + output encoding", "EmailHtmlSanitizer strips dangerous tags/attributes"],
                  ["Path Traversal", "Path normalization + validation", "DownloadService blocks ../ sequences"],
                  ["File Upload Attacks", "Type, size, dimension validation", "ImageService + FileService validate all uploads"],
                  ["Mass Assignment", "DTO binding — no direct entity binding", "Only explicitly mapped fields are accepted"],
                  ["JSON Injection", "System.Text.Json (safe by default)", "No Newtonsoft JsonConvert with TypeNameHandling"],
                  ["Header Injection", "ASP.NET Core built-in protection", "Framework sanitizes response headers"],
                  ["Request Smuggling", "Kestrel strict parsing", "Rejects ambiguous Content-Length/Transfer-Encoding"],
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "EmailHtmlSanitizer.cs — XSS Prevention",
            code: `/// <summary>
/// Sanitizes HTML content in email bodies to prevent XSS.
/// Uses allowlist approach — only safe tags/attributes permitted.
/// </summary>
public static class EmailHtmlSanitizer
{
    private static readonly HashSet<string> AllowedTags = new()
    {
        "p", "br", "b", "i", "u", "strong", "em", "a", "ul", "ol", "li",
        "h1", "h2", "h3", "h4", "h5", "h6", "table", "tr", "td", "th",
        "span", "div", "img"
    };

    private static readonly HashSet<string> AllowedAttributes = new()
    {
        "href", "src", "alt", "class", "style", "target"
    };

    // Strips all tags/attributes not in allowlists
    // Removes: <script>, onclick=, javascript:, data:, etc.
}`,
      },

      // ─── Security Headers ─────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.apiSecurity.headersTitle", id: "security-headers",
      },
      { type: "paragraph", contentKey: "security.apiSecurity.headersIntro" },
      {
            type: "table",
            headers: ["Header", "Value", "Purpose"],
            rows: [
                  ["Strict-Transport-Security", "max-age=31536000; includeSubDomains", "Force HTTPS for 1 year"],
                  ["X-Content-Type-Options", "nosniff", "Prevent MIME-type sniffing"],
                  ["X-Frame-Options", "DENY", "Prevent clickjacking"],
                  ["X-XSS-Protection", "1; mode=block", "Legacy XSS filter"],
                  ["Content-Security-Policy", "default-src 'self'; script-src 'self'", "Restrict resource origins"],
                  ["Referrer-Policy", "strict-origin-when-cross-origin", "Control referrer leakage"],
                  ["Permissions-Policy", "camera=(), microphone=(), geolocation=()", "Disable unused browser features"],
                  ["Cache-Control", "no-store, no-cache, must-revalidate", "Prevent sensitive data caching"],
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "security.apiSecurity.headersTip",
      },
];

registerPage({
      slug: "security/api-security",
      titleKey: "security.apiSecurity.title",
      descriptionKey: "security.apiSecurity.description",
      category: "security",
      order: 4,
      sections,
      relatedSlugs: ["security/overview", "security/authentication-deep", "security/middleware-pipeline"],
      lastUpdated: "2026-02-20",
});
