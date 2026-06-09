import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "security/api-security",
  titleKey: "security.apiSecurity.title",
  category: "security",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.apiSecurity.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_3_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_4_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public static IServiceCollection AddRateLimitingConfiguration(\n    this IServiceCollection services, IConfiguration configuration)\n{\n    var settings = configuration.GetSection(\"RateLimiting\").Get<RateLimitingSettings>();\n    \n    services.AddRateLimiter(options =>\n    {\n        // 1. Global DDoS ceiling (1000 requests / minute)\n        options.AddFixedWindowLimiter(\"Global\", opt => {\n            opt.PermitLimit = settings.GlobalLimit;\n            opt.Window = TimeSpan.FromMinutes(1);\n        });\n\n        // 2. Per-IP general abuse protection (200 requests / minute)\n        options.AddPolicy(\"PerIp\", context => {\n            var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? \"unknown\";\n            return RateLimitPartition.GetFixedWindowLimiter(clientIp, _ => new() {\n                PermitLimit = settings.PerIpLimit,\n                Window = TimeSpan.FromMinutes(1)\n            });\n        });\n\n        // 3. Login brute-force protection (10 attempts / 5 minutes)\n        options.AddPolicy(\"Login\", context => {\n            var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? \"unknown\";\n            return RateLimitPartition.GetFixedWindowLimiter($\"login:{clientIp}\", _ => new() {\n                PermitLimit = settings.LoginLimit,\n                Window = TimeSpan.FromMinutes(5)\n            });\n        });\n\n        // 4. General per-user ceiling (300 requests / minute, sliding window)\n        options.AddPolicy(\"per-user\", context => {\n            var userId = GetPartitionKey(context);\n            return RateLimitPartition.GetSlidingWindowLimiter($\"user:{userId}\", _ => new() {\n                PermitLimit = settings.PerUserLimit,\n                Window = TimeSpan.FromMinutes(1),\n                SegmentsPerWindow = 6\n            });\n        });\n        \n        // Additional policies: read-api (200/min), mutation-api (30/min),\n        // export-heavy (5/min), webhook (500/min), signup (3/hr),\n        // phone-otp-send (3/15m), passkey-auth (5/15m), qr-poll (60/min)\n    });\n    return services;\n}",
    "filename": ""
  },
  {
    "type": "table",
    "headers": [
      "security.apiSecurity.section_6_hdr_0",
      "security.apiSecurity.section_6_hdr_1",
      "security.apiSecurity.section_6_hdr_2",
      "security.apiSecurity.section_6_hdr_3",
      "security.apiSecurity.section_6_hdr_4"
    ],
    "rows": [
      [
        "security.apiSecurity.section_6_cell_0_0",
        "security.apiSecurity.section_6_cell_0_1",
        "security.apiSecurity.section_6_cell_0_2",
        "security.apiSecurity.section_6_cell_0_3",
        "security.apiSecurity.section_6_cell_0_4"
      ],
      [
        "security.apiSecurity.section_6_cell_1_0",
        "security.apiSecurity.section_6_cell_1_1",
        "security.apiSecurity.section_6_cell_1_2",
        "security.apiSecurity.section_6_cell_1_3",
        "security.apiSecurity.section_6_cell_1_4"
      ],
      [
        "security.apiSecurity.section_6_cell_2_0",
        "security.apiSecurity.section_6_cell_2_1",
        "security.apiSecurity.section_6_cell_2_2",
        "security.apiSecurity.section_6_cell_2_3",
        "security.apiSecurity.section_6_cell_2_4"
      ],
      [
        "security.apiSecurity.section_6_cell_3_0",
        "security.apiSecurity.section_6_cell_3_1",
        "security.apiSecurity.section_6_cell_3_2",
        "security.apiSecurity.section_6_cell_3_3",
        "security.apiSecurity.section_6_cell_3_4"
      ],
      [
        "security.apiSecurity.section_6_cell_4_0",
        "security.apiSecurity.section_6_cell_4_1",
        "security.apiSecurity.section_6_cell_4_2",
        "security.apiSecurity.section_6_cell_4_3",
        "security.apiSecurity.section_6_cell_4_4"
      ],
      [
        "security.apiSecurity.section_6_cell_5_0",
        "security.apiSecurity.section_6_cell_5_1",
        "security.apiSecurity.section_6_cell_5_2",
        "security.apiSecurity.section_6_cell_5_3",
        "security.apiSecurity.section_6_cell_5_4"
      ],
      [
        "security.apiSecurity.section_6_cell_6_0",
        "security.apiSecurity.section_6_cell_6_1",
        "security.apiSecurity.section_6_cell_6_2",
        "security.apiSecurity.section_6_cell_6_3",
        "security.apiSecurity.section_6_cell_6_4"
      ],
      [
        "security.apiSecurity.section_6_cell_7_0",
        "security.apiSecurity.section_6_cell_7_1",
        "security.apiSecurity.section_6_cell_7_2",
        "security.apiSecurity.section_6_cell_7_3",
        "security.apiSecurity.section_6_cell_7_4"
      ],
      [
        "security.apiSecurity.section_6_cell_8_0",
        "security.apiSecurity.section_6_cell_8_1",
        "security.apiSecurity.section_6_cell_8_2",
        "security.apiSecurity.section_6_cell_8_3",
        "security.apiSecurity.section_6_cell_8_4"
      ],
      [
        "security.apiSecurity.section_6_cell_9_0",
        "security.apiSecurity.section_6_cell_9_1",
        "security.apiSecurity.section_6_cell_9_2",
        "security.apiSecurity.section_6_cell_9_3",
        "security.apiSecurity.section_6_cell_9_4"
      ],
      [
        "security.apiSecurity.section_6_cell_10_0",
        "security.apiSecurity.section_6_cell_10_1",
        "security.apiSecurity.section_6_cell_10_2",
        "security.apiSecurity.section_6_cell_10_3",
        "security.apiSecurity.section_6_cell_10_4"
      ],
      [
        "security.apiSecurity.section_6_cell_11_0",
        "security.apiSecurity.section_6_cell_11_1",
        "security.apiSecurity.section_6_cell_11_2",
        "security.apiSecurity.section_6_cell_11_3",
        "security.apiSecurity.section_6_cell_11_4"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.apiSecurity.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_8_content"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "security.apiSecurity.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_10_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Development: Allow any origin for local testing\npolicy.WithOrigins(\n    \"http://localhost:3000\",    // Next.js dev\n    \"http://localhost:5173\",    // Vite dev\n    \"http://localhost:4200\"     // Angular dev\n)\n.AllowAnyMethod()\n.AllowAnyHeader()\n.AllowCredentials()              // Required for cookies/SignalR\n.WithExposedHeaders(\n    \"Content-Disposition\",        // File downloads\n    \"X-Correlation-Id\",           // Request tracing\n    \"X-Total-Count\",              // Pagination\n    \"X-Request-Id\"\n);",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "security.apiSecurity.section_12_title",
    "id": "sec_12"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_13_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "// Production: Whitelist specific origins only\nvar allowedOrigins = configuration\n    .GetSection(\"Cors:AllowedOrigins\")\n    .Get<string[]>() ?? Array.Empty<string>();\n\npolicy.WithOrigins(allowedOrigins)\n    .WithMethods(\"GET\", \"POST\", \"PUT\", \"PATCH\", \"DELETE\", \"OPTIONS\")\n    .WithHeaders(\n        \"Authorization\",\n        \"Content-Type\",\n        \"X-Correlation-Id\",\n        \"X-CSRF-Token\",\n        \"X-Request-Nonce\"\n    )\n    .AllowCredentials()\n    .SetPreflightMaxAge(TimeSpan.FromHours(1));",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.apiSecurity.section_15_title",
    "id": "sec_15"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_16_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_17_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// S0.15: Double-submit cookie pattern for CSRF protection.\n/// Cookie: XSRF-TOKEN (NOT httpOnly — frontend JS reads it)\n/// Header: X-CSRF-Token (frontend sends cookie value as header)\n/// Uses CryptographicOperations.FixedTimeEquals for timing-attack safety.\n/// </summary>\npublic class CsrfMiddleware\n{\n    public async Task InvokeAsync(HttpContext context)\n    {\n        // Skip safe methods, unauthenticated, SignalR/OIDC/SAML\n        if (SafeMethod || !Authenticated || ExcludedPath)\n        {\n            EnsureCsrfCookie(context);\n            await _next(context);\n            return;\n        }\n\n        var cookieToken = context.Request.Cookies[\"XSRF-TOKEN\"];\n        var headerToken = context.Request.Headers[\"X-CSRF-Token\"]\n            .FirstOrDefault();\n\n        if (string.IsNullOrEmpty(cookieToken) ||\n            string.IsNullOrEmpty(headerToken))\n        {\n            // 403 CSRF_VALIDATION_FAILED\n            return;\n        }\n\n        // Constant-time comparison — prevents timing attacks\n        if (!CryptographicOperations.FixedTimeEquals(\n            Encoding.UTF8.GetBytes(cookieToken),\n            Encoding.UTF8.GetBytes(headerToken)))\n        {\n            // 403 CSRF_TOKEN_MISMATCH\n            return;\n        }\n\n        await _next(context);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.apiSecurity.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_20_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_21_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// P6.3: Request replay protection — MANDATORY on all authenticated mutations.\n/// Frontend must send X-Request-Timestamp (epoch ms) + X-Request-Nonce (UUID).\n/// Missing headers → 400 MISSING_REPLAY_HEADERS (no gradual rollout).\n/// SignalR /hubs/ paths are excluded (library can't inject headers).\n/// </summary>\npublic class ReplayProtectionMiddleware\n{\n    public async Task InvokeAsync(HttpContext context, ICacheService cache)\n    {\n        // Skip safe methods, /hubs/ paths, unauthenticated\n        var timestamp = context.Request.Headers[\"X-Request-Timestamp\"];\n        var nonce = context.Request.Headers[\"X-Request-Nonce\"];\n\n        // MANDATORY — reject if missing\n        if (string.IsNullOrEmpty(timestamp) || string.IsNullOrEmpty(nonce))\n        {\n            // 400 MISSING_REPLAY_HEADERS\n            return;\n        }\n\n        // Validate timestamp freshness (±5 min clock skew)\n        var drift = DateTimeOffset.UtcNow - requestTime;\n        if (drift > TimeSpan.FromMinutes(5))\n        {\n            // 400 STALE_REQUEST\n            return;\n        }\n\n        // Validate nonce uniqueness (cache TTL = 10 min)\n        var exists = await cache.GetAsync<string>($\"replay-nonce:{nonce}\");\n        if (exists is not null)\n        {\n            // 409 REQUEST_REPLAY_DETECTED\n            return;\n        }\n\n        await cache.SetAsync(cacheKey, \"1\", TimeSpan.FromMinutes(10));\n        await _next(context);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.apiSecurity.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_24_content"
  },
  {
    "type": "table",
    "headers": [
      "security.apiSecurity.section_25_hdr_0",
      "security.apiSecurity.section_25_hdr_1",
      "security.apiSecurity.section_25_hdr_2"
    ],
    "rows": [
      [
        "security.apiSecurity.section_25_cell_0_0",
        "security.apiSecurity.section_25_cell_0_1",
        "security.apiSecurity.section_25_cell_0_2"
      ],
      [
        "security.apiSecurity.section_25_cell_1_0",
        "security.apiSecurity.section_25_cell_1_1",
        "security.apiSecurity.section_25_cell_1_2"
      ],
      [
        "security.apiSecurity.section_25_cell_2_0",
        "security.apiSecurity.section_25_cell_2_1",
        "security.apiSecurity.section_25_cell_2_2"
      ],
      [
        "security.apiSecurity.section_25_cell_3_0",
        "security.apiSecurity.section_25_cell_3_1",
        "security.apiSecurity.section_25_cell_3_2"
      ],
      [
        "security.apiSecurity.section_25_cell_4_0",
        "security.apiSecurity.section_25_cell_4_1",
        "security.apiSecurity.section_25_cell_4_2"
      ],
      [
        "security.apiSecurity.section_25_cell_5_0",
        "security.apiSecurity.section_25_cell_5_1",
        "security.apiSecurity.section_25_cell_5_2"
      ],
      [
        "security.apiSecurity.section_25_cell_6_0",
        "security.apiSecurity.section_25_cell_6_1",
        "security.apiSecurity.section_25_cell_6_2"
      ],
      [
        "security.apiSecurity.section_25_cell_7_0",
        "security.apiSecurity.section_25_cell_7_1",
        "security.apiSecurity.section_25_cell_7_2"
      ],
      [
        "security.apiSecurity.section_25_cell_8_0",
        "security.apiSecurity.section_25_cell_8_1",
        "security.apiSecurity.section_25_cell_8_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_26_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Sanitizes HTML content in email bodies to prevent XSS.\n/// Uses allowlist approach — only safe tags/attributes permitted.\n/// </summary>\npublic static class EmailHtmlSanitizer\n{\n    private static readonly HashSet<string> AllowedTags = new()\n    {\n        \"p\", \"br\", \"b\", \"i\", \"u\", \"strong\", \"em\", \"a\", \"ul\", \"ol\", \"li\",\n        \"h1\", \"h2\", \"h3\", \"h4\", \"h5\", \"h6\", \"table\", \"tr\", \"td\", \"th\",\n        \"span\", \"div\", \"img\"\n    };\n\n    private static readonly HashSet<string> AllowedAttributes = new()\n    {\n        \"href\", \"src\", \"alt\", \"class\", \"style\", \"target\"\n    };\n\n    // Strips all tags/attributes not in allowlists\n    // Removes: <script>, onclick=, javascript:, data:, etc.\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.apiSecurity.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "security.apiSecurity.section_29_content"
  },
  {
    "type": "table",
    "headers": [
      "security.apiSecurity.section_30_hdr_0",
      "security.apiSecurity.section_30_hdr_1",
      "security.apiSecurity.section_30_hdr_2"
    ],
    "rows": [
      [
        "security.apiSecurity.section_30_cell_0_0",
        "security.apiSecurity.section_30_cell_0_1",
        "security.apiSecurity.section_30_cell_0_2"
      ],
      [
        "security.apiSecurity.section_30_cell_1_0",
        "security.apiSecurity.section_30_cell_1_1",
        "security.apiSecurity.section_30_cell_1_2"
      ],
      [
        "security.apiSecurity.section_30_cell_2_0",
        "security.apiSecurity.section_30_cell_2_1",
        "security.apiSecurity.section_30_cell_2_2"
      ],
      [
        "security.apiSecurity.section_30_cell_3_0",
        "security.apiSecurity.section_30_cell_3_1",
        "security.apiSecurity.section_30_cell_3_2"
      ],
      [
        "security.apiSecurity.section_30_cell_4_0",
        "security.apiSecurity.section_30_cell_4_1",
        "security.apiSecurity.section_30_cell_4_2"
      ],
      [
        "security.apiSecurity.section_30_cell_5_0",
        "security.apiSecurity.section_30_cell_5_1",
        "security.apiSecurity.section_30_cell_5_2"
      ],
      [
        "security.apiSecurity.section_30_cell_6_0",
        "security.apiSecurity.section_30_cell_6_1",
        "security.apiSecurity.section_30_cell_6_2"
      ],
      [
        "security.apiSecurity.section_30_cell_7_0",
        "security.apiSecurity.section_30_cell_7_1",
        "security.apiSecurity.section_30_cell_7_2"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "security.apiSecurity.section_31_title",
    "contentKey": "security.apiSecurity.section_31_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.apiSecurity.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "security.apiSecurity.section_33_item_0",
      "security.apiSecurity.section_33_item_1",
      "security.apiSecurity.section_33_item_2"
    ]
  }
],
  relatedSlugs: [
  "security/overview",
  "security/authentication-deep",
  "security/middleware-pipeline"
],
  lastUpdated: "2026-06-09",
});
