// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "security.apiSecurity.intro" },

  // ─── Mutating Request Security pipeline flowchart ─────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.apiSecurity.inputValidationTitle", // We can use it or another header, but wait, let's keep the existing header IDs or titles. Let's make an overview heading.
    id: "security-pipeline",
  },
  {
    type: "flowchart",
    title: "Mutating Request Security Verification Pipeline",
    direction: "vertical",
    nodes: [
      { id: "req", label: "Mutating Request (POST/PUT/PATCH/DELETE)", type: "default" },
      {
        id: "limiter",
        label: "Rate Limiter",
        type: "warning",
        description: "Per-IP, Global, or Endpoint policy",
      },
      {
        id: "csrf",
        label: "CSRF Middleware",
        type: "warning",
        description: "Fetch site/mode metadata validation",
      },
      {
        id: "csrf_check",
        label: "HMAC Signed Token Check",
        type: "warning",
        description: "FixedTimeEquals double-submit validation",
      },
      {
        id: "auth",
        label: "Authentication (JWT)",
        type: "primary",
        description: "Validate access token & resolve claims",
      },
      {
        id: "replay",
        label: "Replay Protection",
        type: "danger",
        description: "Timestamp ±5m & Nonce unique (10m cache)",
      },
      {
        id: "authz",
        label: "Authorization (RBAC)",
        type: "primary",
        description: "Verify user permissions & scopes",
      },
      {
        id: "sanitizer",
        label: "Input Sanitization",
        type: "info",
        description: "InputSanitizationMiddleware HTML strip",
      },
      {
        id: "controller",
        label: "Controller Action",
        type: "success",
        description: "Execute business logic",
      },
    ],
    connections: [
      { from: "req", to: "limiter" },
      { from: "limiter", to: "csrf" },
      { from: "csrf", to: "csrf_check" },
      { from: "csrf_check", to: "auth" },
      { from: "auth", to: "replay" },
      { from: "replay", to: "authz" },
      { from: "authz", to: "sanitizer" },
      { from: "sanitizer", to: "controller" },
    ],
  },

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
    if (!settings.Enabled) return services;

    services.AddRateLimiter(options =>
    {
        // 1. Global DDoS ceiling - 1000 requests per minute
        options.AddFixedWindowLimiter("Global", opt =>
        {
            opt.PermitLimit = settings.GlobalLimit; // 1000
            opt.Window = TimeSpan.FromMinutes(1);
            opt.QueueLimit = 0;
        });

        // 2. Per-IP general ceiling - 200 requests per minute
        options.AddPolicy("PerIp", context => {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions {
                PermitLimit = settings.PerIpLimit, // 200
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            });
        });

        // 3. Login / Auth endpoints brute-force shield - 10 attempts per 5 minutes per IP
        options.AddPolicy("Login", context => {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter($"login:{ip}", _ => new FixedWindowRateLimiterOptions {
                PermitLimit = settings.LoginLimit, // 10
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0
            });
        });

        // 4. Token refresh rate limiting (prevent refresh farming) - 20 per minute sliding
        options.AddPolicy("token-refresh", context => {
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetSlidingWindowLimiter($"refresh:{ip}", _ => new SlidingWindowRateLimiterOptions {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
                QueueLimit = 0
            });
        });
    });
    return services;
}`,
    highlightLines: [9, 10, 18, 19, 28, 29, 39, 40],
  },
  {
    type: "table",
    headers: [
      "Policy Name",
      "Limitation Type",
      "Default Threshold",
      "Window/Period",
      "Scope / Application Target",
    ],
    rows: [
      [
        "Global",
        "Fixed Window",
        "1000 requests",
        "1 minute",
        "Global server-wide protection (DDoS ceiling)",
      ],
      [
        "PerIp",
        "Fixed Window",
        "200 requests",
        "1 minute",
        "General unauthenticated API abuse prevention",
      ],
      [
        "Login",
        "Fixed Window",
        "10 requests",
        "5 minutes",
        "Brute-force protection on /login and /2fa/verify",
      ],
      [
        "token-refresh",
        "Sliding Window",
        "20 requests",
        "1 minute",
        "Refresh token endpoint (prevent refresh farming)",
      ],
      [
        "read-api",
        "Sliding Window",
        "200 requests",
        "1 minute",
        "GET endpoints (prevents client-side infinite loops)",
      ],
      [
        "mutation-api",
        "Sliding Window",
        "30 requests",
        "1 minute",
        "Mutating endpoints (POST/PUT/PATCH/DELETE)",
      ],
      [
        "per-user",
        "Sliding Window",
        "100 requests",
        "1 minute",
        "Total ceiling per authenticated user session",
      ],
      [
        "export-heavy",
        "Fixed Window",
        "5 requests",
        "1 minute",
        "CPU-heavy data export (CSV/Excel/PDF) endpoints",
      ],
      [
        "webhook",
        "Sliding Window",
        "500 requests",
        "1 minute",
        "Unauthenticated webhook endpoints (e.g. Stripe bursts)",
      ],
      [
        "signup",
        "Fixed Window",
        "3 requests",
        "1 hour",
        "Self-service registration endpoints (prevent signup spam)",
      ],
      [
        "phone-otp-send",
        "Fixed Window",
        "3 requests",
        "15 minutes",
        "SMS/OTP request endpoints (prevent SMS bombing)",
      ],
      [
        "password-reset",
        "Fixed Window",
        "5 requests",
        "15 minutes",
        "Password reset/OTP validation endpoints",
      ],
      [
        "passkey-auth",
        "Fixed Window",
        "5 requests",
        "15 minutes",
        "WebAuthn / passkey authentication attempts",
      ],
      [
        "qr-poll",
        "Sliding Window",
        "60 requests",
        "1 minute",
        "QR code authentication status polling endpoints",
      ],
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
        code: `// Development: Allow local dev origins with credentials
policy.WithOrigins(
    "http://localhost:3000",    // Next.js dev
    "https://localhost:3000",   // Next.js secure dev
    "http://localhost:3001"
)
.AllowAnyMethod()
.AllowAnyHeader()
.AllowCredentials()             // Cookies and SignalR hubs support
.WithExposedHeaders("X-SignalR-User-Agent", "X-CSRF-Token")
.SetPreflightMaxAge(TimeSpan.FromHours(1));`,
      },
      {
        label: "Production",
        language: "csharp",
        filename: "CORS — Production Configuration",
        code: `// Production: Strict environment CORS settings
var allowedOrigins = configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

// S0.14: Crashes early if non-development environment has empty CORS origins (fail-closed)
if (allowedOrigins.Length == 0)
    throw new InvalidOperationException("CORS AllowedOrigins must be configured!");

policy
    // S0.14+: Lookalike-safe validator protects subdomain wildcards (HTTPS only)
    .SetIsOriginAllowed(origin => CorsOriginValidator.IsAllowed(origin, allowedOrigins))
    .AllowAnyMethod()
    .AllowAnyHeader()
    .SetPreflightMaxAge(TimeSpan.FromHours(1));

if (corsSettings.AllowCredentials)
{
    policy.AllowCredentials() // Wildcard '*' rejected when credentials enabled
          .WithExposedHeaders("X-CSRF-Token");
}`,
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
/// S0.15: Signed Double-Submit Cookie Pattern for CSRF protection.
/// 
/// Defense Layers:
/// 1. Sec-Fetch-Metadata + Origin Validation (blocks form-based navigate actions cross-site).
/// 2. Bearer token bypass: requests using custom Authorization headers bypass double-submit checks
///    because Bearer tokens are stored in JS memory and cannot be attached by browser cross-origin.
/// 3. HMAC-SHA256 Signed token: Bound to the JWT session's 'jti' claim to prevent token forgery.
/// 4. __Host- cookie prefix enforces Secure, Path=/, and blocks subdomain injection.
/// </summary>
public class CsrfMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        // Issue fresh token on every response (Response header + Cookie)
        IssueSignedCsrfToken(context);

        // Safe methods (GET, HEAD, OPTIONS) are exempt
        if (SafeMethod(context.Request.Method) || PathExcluded(context.Request.Path))
        {
            await _next(context);
            return;
        }

        // Layer 1: Fetch Metadata Validation
        var fetchSite = context.Request.Headers["Sec-Fetch-Site"].FirstOrDefault();
        var fetchMode = context.Request.Headers["Sec-Fetch-Mode"].FirstOrDefault();
        if (fetchSite == "cross-site" && fetchMode == "navigate")
        {
            context.Response.StatusCode = 403; // Reject form post CSRF
            return;
        }

        // Layer 2: Bearer Token bypass
        if (context.Request.Headers.ContainsKey("Authorization"))
        {
            await _next(context);
            return;
        }

        // Layer 3: Double-Submit Token verification
        var cookieToken = context.Request.Cookies["__Host-XSRF-TOKEN"];
        var headerToken = context.Request.Headers["X-CSRF-Token"].FirstOrDefault();

        if (string.IsNullOrEmpty(cookieToken) || string.IsNullOrEmpty(headerToken))
        {
            context.Response.StatusCode = 403;
            return;
        }

        // Constant-time check prevents timing side-channels
        if (!CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(cookieToken),
            Encoding.UTF8.GetBytes(headerToken)))
        {
            context.Response.StatusCode = 403;
            return;
        }

        await _next(context);
    }
}`,
    highlightLines: [15, 20, 27, 33, 40, 48, 49],
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
/// Requires X-Request-Timestamp (Unix epoch ms) and X-Request-Nonce (UUID format).
/// </summary>
public class ReplayProtectionMiddleware
{
    public async Task InvokeAsync(HttpContext context, ICacheService cache)
    {
        // Skip safe methods (GET, HEAD, OPTIONS)
        if (HttpMethods.IsGet(context.Request.Method))
        {
            await _next(context);
            return;
        }

        // Skip SignalR hubs & OpenIddict auth endpoints
        if (IsExcludedPath(context.Request.Path))
        {
            await _next(context);
            return;
        }

        // Skip unauthenticated requests
        if (context.User.Identity?.IsAuthenticated != true)
        {
            await _next(context);
            return;
        }

        var timestampHeader = context.Request.Headers["X-Request-Timestamp"].FirstOrDefault();
        var nonceHeader = context.Request.Headers["X-Request-Nonce"].FirstOrDefault();

        // Reject missing headers immediately
        if (string.IsNullOrEmpty(timestampHeader) || string.IsNullOrEmpty(nonceHeader))
        {
            context.Response.StatusCode = 400; // BAD_REQUEST
            return;
        }

        // Nonce validation - max 36 chars, valid UUID
        if (nonceHeader.Length > 36 || !Guid.TryParse(nonceHeader, out _))
        {
            context.Response.StatusCode = 400; // INVALID_NONCE
            return;
        }

        // Timestamp validation - max 5 minutes drift (clock skew mitigation)
        var requestTime = DateTimeOffset.FromUnixTimeMilliseconds(long.Parse(timestampHeader));
        var drift = (DateTimeOffset.UtcNow - requestTime).Duration();
        if (drift > TimeSpan.FromMinutes(5))
        {
            context.Response.StatusCode = 400; // STALE_REQUEST
            return;
        }

        // Nonce uniqueness check (cache TTL = 10 minutes)
        var cacheKey = $"replay-nonce:{nonceHeader}";
        var exists = await cache.GetAsync<string>(cacheKey);
        if (exists is not null)
        {
            context.Response.StatusCode = 409; // REQUEST_REPLAY_DETECTED (Conflict)
            return;
        }

        await cache.SetAsync(cacheKey, "1", TimeSpan.FromMinutes(10));
        await _next(context);
    }
}`,
  },

  // ─── JWT lifetimes and PKCE ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.apiSecurity.headersTitle", // We can repurpose this or use a generic heading. Wait! We can use this ID and change the title.
    id: "jwt-lifetimes-pkce",
  },
  {
    type: "table",
    headers: [
      "Security Aspect",
      "Value / Mechanism",
      "Implementation details",
      "Defense Objective",
    ],
    rows: [
      [
        "Access Token Lifetime",
        "15 minutes",
        "Configured in Jwt:ExpiryMinutes. Short lifetime limits the window of opportunity for stolen tokens.",
        "Mitigate token theft / session hijacking",
      ],
      [
        "Refresh Token Lifetime",
        "7 days",
        "Configured in Jwt:RefreshExpiryDays. Single-use rotated refresh tokens mapped in database.",
        "Maintain active sessions securely",
      ],
      [
        "Refresh Token Hashing",
        "SHA-256 One-Way Hash",
        "Refresh tokens are hashed prior to database persistence. Plaintext tokens never stored.",
        "Protect database secrets from breach leak",
      ],
      [
        "PKCE Client Validation",
        "S256 Challenge Method",
        "OidcClientService generates random 32-byte code_verifier and SHA-256 code_challenge.",
        "Prevent authorization code interception attacks",
      ],
      [
        "PKCE Server Enforcement",
        "OpenIddict Global Rule",
        "OpenIddict is configured to globally require PKCE for all authorization code flows.",
        "Enforce modern OAuth 2.1 security standards",
      ],
    ],
  },

  // ─── Security Headers ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.apiSecurity.headersTitle", // Wait, let's keep it but since we used headersTitle above, let's keep this as security-headers
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
  lastUpdated: "2026-06-28",
});
