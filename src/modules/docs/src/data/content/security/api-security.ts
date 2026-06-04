import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "security.apiSecurity.intro" },

  // ─── Rate Limiting ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.apiSecurity.rateLimitTitle",
    id: "rate-limiting",
  },
  { type: "paragraph", contentKey: "security.apiSecurity.rateLimitIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "RateLimitingConfiguration.cs",
    code: `public static IServiceCollection AddRateLimitingConfiguration(
    this IServiceCollection services, IConfiguration configuration)
{
    var settings = configuration.GetSection("RateLimiting").Get<RateLimitingSettings>();
    
    services.AddRateLimiter(options =>
    {
        // 1. Global DDoS ceiling (1000 requests / minute)
        options.AddFixedWindowLimiter("Global", opt => {
            opt.PermitLimit = settings.GlobalLimit;
            opt.Window = TimeSpan.FromMinutes(1);
        });

        // 2. Per-IP general abuse protection (200 requests / minute)
        options.AddPolicy("PerIp", context => {
            var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter(clientIp, _ => new() {
                PermitLimit = settings.PerIpLimit,
                Window = TimeSpan.FromMinutes(1)
            });
        });

        // 3. Login brute-force protection (10 attempts / 5 minutes)
        options.AddPolicy("Login", context => {
            var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter($"login:{clientIp}", _ => new() {
                PermitLimit = settings.LoginLimit,
                Window = TimeSpan.FromMinutes(5)
            });
        });

        // 4. General per-user ceiling (300 requests / minute, sliding window)
        options.AddPolicy("per-user", context => {
            var userId = GetPartitionKey(context);
            return RateLimitPartition.GetSlidingWindowLimiter($"user:{userId}", _ => new() {
                PermitLimit = settings.PerUserLimit,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6
            });
        });
        
        // Additional policies: read-api (200/min), mutation-api (30/min),
        // export-heavy (5/min), webhook (500/min), signup (3/hr),
        // phone-otp-send (3/15m), passkey-auth (5/15m), qr-poll (60/min)
    });
    return services;
}`,
    highlightLines: [8, 9, 14, 15, 23, 24, 32, 33],
  },
  {
    type: "table",
    headers: ["Policy Name", "Window Type", "Default Limit", "Time Window", "Partition Key"],
    rows: [
      ["Global", "Fixed Window", "1,000 req", "1 minute", "Per server"],
      ["PerIp", "Fixed Window", "200 req", "1 minute", "Client IP"],
      ["Login", "Fixed Window", "10 req", "5 minutes", "Client IP"],
      ["read-api", "Sliding Window", "200 req", "1 minute", "User ID / IP"],
      ["mutation-api", "Sliding Window", "30 req", "1 minute", "User ID / IP"],
      ["per-user", "Sliding Window", "300 req", "1 minute", "User ID / IP"],
      ["export-heavy", "Fixed Window", "5 req", "1 minute", "User ID / IP"],
      ["webhook", "Sliding Window", "500 req", "1 minute", "Client IP"],
      ["signup", "Fixed Window", "3 req", "1 hour", "Client IP"],
      ["phone-otp-send", "Fixed Window", "3 req", "15 minutes", "Client IP"],
      ["passkey-auth", "Fixed Window", "5 req", "15 minutes", "Client IP"],
      ["qr-poll", "Sliding Window", "60 req", "1 minute", "QR Session ID"],
    ],
  },

  // ─── CORS Configuration ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.apiSecurity.corsTitle",
    id: "cors",
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
    type: "heading",
    level: 2,
    titleKey: "security.apiSecurity.csrfTitle",
    id: "csrf",
  },
  { type: "paragraph", contentKey: "security.apiSecurity.csrfIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "CsrfMiddleware.cs",
    code: `/// <summary>
/// S0.15: Double-submit cookie pattern for CSRF protection.
/// Cookie: XSRF-TOKEN (NOT httpOnly — frontend JS reads it)
/// Header: X-CSRF-Token (frontend sends cookie value as header)
/// Uses CryptographicOperations.FixedTimeEquals for timing-attack safety.
/// </summary>
public class CsrfMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        // Skip safe methods, unauthenticated, SignalR/OIDC/SAML
        if (SafeMethod || !Authenticated || ExcludedPath)
        {
            EnsureCsrfCookie(context);
            await _next(context);
            return;
        }

        var cookieToken = context.Request.Cookies["XSRF-TOKEN"];
        var headerToken = context.Request.Headers["X-CSRF-Token"]
            .FirstOrDefault();

        if (string.IsNullOrEmpty(cookieToken) ||
            string.IsNullOrEmpty(headerToken))
        {
            // 403 CSRF_VALIDATION_FAILED
            return;
        }

        // Constant-time comparison — prevents timing attacks
        if (!CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(cookieToken),
            Encoding.UTF8.GetBytes(headerToken)))
        {
            // 403 CSRF_TOKEN_MISMATCH
            return;
        }

        await _next(context);
    }
}`,
    highlightLines: [19, 20, 32, 33, 34],
  },

  // ─── Replay Protection ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.apiSecurity.replayTitle",
    id: "replay-protection",
  },
  { type: "paragraph", contentKey: "security.apiSecurity.replayIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "ReplayProtectionMiddleware.cs",
    code: `/// <summary>
/// P6.3: Request replay protection — MANDATORY on all authenticated mutations.
/// Frontend must send X-Request-Timestamp (epoch ms) + X-Request-Nonce (UUID).
/// Missing headers → 400 MISSING_REPLAY_HEADERS (no gradual rollout).
/// SignalR /hubs/ paths are excluded (library can't inject headers).
/// </summary>
public class ReplayProtectionMiddleware
{
    public async Task InvokeAsync(HttpContext context, ICacheService cache)
    {
        // Skip safe methods, /hubs/ paths, unauthenticated
        var timestamp = context.Request.Headers["X-Request-Timestamp"];
        var nonce = context.Request.Headers["X-Request-Nonce"];

        // MANDATORY — reject if missing
        if (string.IsNullOrEmpty(timestamp) || string.IsNullOrEmpty(nonce))
        {
            // 400 MISSING_REPLAY_HEADERS
            return;
        }

        // Validate timestamp freshness (±5 min clock skew)
        var drift = DateTimeOffset.UtcNow - requestTime;
        if (drift > TimeSpan.FromMinutes(5))
        {
            // 400 STALE_REQUEST
            return;
        }

        // Validate nonce uniqueness (cache TTL = 10 min)
        var exists = await cache.GetAsync<string>($"replay-nonce:{nonce}");
        if (exists is not null)
        {
            // 409 REQUEST_REPLAY_DETECTED
            return;
        }

        await cache.SetAsync(cacheKey, "1", TimeSpan.FromMinutes(10));
        await _next(context);
    }
}`,
    highlightLines: [4, 16, 17, 24, 25, 32, 33],
  },

  // ─── Input Validation ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.apiSecurity.inputValidationTitle",
    id: "input-validation",
  },
  { type: "paragraph", contentKey: "security.apiSecurity.inputValidationIntro" },
  {
    type: "table",
    headers: ["Attack Vector", "Protection", "Implementation"],
    rows: [
      [
        "SQL Injection",
        "Parameterized queries (EF Core)",
        "All queries go through LINQ → SQL — no raw SQL",
      ],
      [
        "XSS (Cross-Site Scripting)",
        "HTML sanitization + output encoding",
        "EmailHtmlSanitizer strips dangerous tags/attributes",
      ],
      ["Path Traversal", "Path normalization + validation", "DownloadService blocks ../ sequences"],
      [
        "File Upload Attacks",
        "Type, size, dimension validation",
        "ImageService + FileService validate all uploads",
      ],
      [
        "Mass Assignment",
        "DTO binding — no direct entity binding",
        "Only explicitly mapped fields are accepted",
      ],
      [
        "JSON Injection",
        "System.Text.Json (safe by default)",
        "No Newtonsoft JsonConvert with TypeNameHandling",
      ],
      [
        "Backend Input Sanitization",
        "InputSanitizationMiddleware",
        "Strips HTML tags from ALL JSON string values on POST/PUT/PATCH/DELETE",
      ],
      [
        "Header Injection",
        "ASP.NET Core built-in protection",
        "Framework sanitizes response headers",
      ],
      [
        "Request Smuggling",
        "Kestrel strict parsing",
        "Rejects ambiguous Content-Length/Transfer-Encoding",
      ],
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
    type: "heading",
    level: 2,
    titleKey: "security.apiSecurity.headersTitle",
    id: "security-headers",
  },
  { type: "paragraph", contentKey: "security.apiSecurity.headersIntro" },
  {
    type: "table",
    headers: ["Header", "Value", "Purpose"],
    rows: [
      [
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
        "Force HTTPS for 1 year",
      ],
      ["X-Content-Type-Options", "nosniff", "Prevent MIME-type sniffing"],
      ["X-Frame-Options", "DENY", "Prevent clickjacking"],
      ["X-XSS-Protection", "1; mode=block", "Legacy XSS filter"],
      [
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'",
        "Restrict resource origins",
      ],
      ["Referrer-Policy", "strict-origin-when-cross-origin", "Control referrer leakage"],
      [
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()",
        "Disable unused browser features",
      ],
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
  relatedSlugs: [
    "security/overview",
    "security/authentication-deep",
    "security/middleware-pipeline",
  ],
  lastUpdated: "2026-03-13",
});
