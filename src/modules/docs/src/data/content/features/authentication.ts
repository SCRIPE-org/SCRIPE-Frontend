import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "features.authentication.intro" },
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.flowTitle", id: "auth-flow",
      },
      {
            type: "flowchart",
            title: "Authentication Flow",
            direction: "vertical",
            nodes: [
                  { id: "login", label: "POST /api/v1/auth/login", type: "primary" },
                  { id: "validate", label: "Validate Credentials", type: "warning" },
                  { id: "2fa", label: "2FA Check (if enabled)", type: "info" },
                  { id: "jwt", label: "Generate JWT + Refresh Token", type: "success" },
                  { id: "audit", label: "Log Audit Event", type: "default" },
                  { id: "response", label: "Return Tokens", type: "primary" },
            ],
            connections: [
                  { from: "login", to: "validate" },
                  { from: "validate", to: "2fa" },
                  { from: "2fa", to: "jwt" },
                  { from: "jwt", to: "audit" },
                  { from: "audit", to: "response" },
            ],
      },
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.jwtTitle", id: "jwt-tokens",
      },
      { type: "paragraph", contentKey: "features.authentication.jwtIntro" },
      {
            type: "table",
            headers: ["Token Type", "Lifetime", "Storage", "Refresh Strategy"],
            rows: [
                  ["Access Token (JWT)", "15 minutes", "Memory (httpOnly cookie)", "Auto-refresh via interceptor"],
                  ["Refresh Token", "7 days", "Database + httpOnly cookie", "Rotate on each use"],
                  ["2FA Token", "5 minutes", "Server-side cache", "Single use, auto-expire"],
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "JWT Generation — JwtService.cs",
            code: `public string GenerateAccessToken(User user, IEnumerable<string> permissions)
{
    var claims = new List<Claim>
    {
        new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new(ClaimTypes.Email, user.Email),
        new(ClaimTypes.Name, user.FullName),
        new("tenant_id", user.TenantId?.ToString() ?? ""),
        new("permissions", JsonSerializer.Serialize(permissions)),
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.SecretKey));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _config.Issuer,
        audience: _config.Audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(_config.AccessTokenExpirationMinutes),
        signingCredentials: credentials);

    return new JwtSecurityTokenHandler().WriteToken(token);
}`,
            highlightLines: [5, 6, 7, 8, 9, 20],
      },
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.endpointsTitle", id: "endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/auth/login", description: "Authenticate with email/password", auth: "None" },
                  { method: "POST", path: "/api/v1/auth/refresh", description: "Refresh access token", auth: "Refresh Token" },
                  { method: "POST", path: "/api/v1/auth/logout", description: "Invalidate refresh token", auth: "Bearer" },
                  { method: "POST", path: "/api/v1/auth/verify-2fa", description: "Verify 2FA OTP code", auth: "Partial" },
                  { method: "POST", path: "/api/v1/auth/forgot-password", description: "Send password reset email", auth: "None" },
                  { method: "POST", path: "/api/v1/auth/reset-password", description: "Reset password with token", auth: "None" },
                  { method: "GET", path: "/api/v1/auth/me", description: "Get current user profile", auth: "Bearer" },
            ],
      },
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.rateLimitingTitle", id: "rate-limiting",
      },
      { type: "paragraph", contentKey: "features.authentication.rateLimitingIntro" },
      {
            type: "table",
            headers: ["Policy", "Limit", "Window", "Applied To"],
            rows: [
                  ["Global DDoS", "100 requests/min", "1 minute", "All endpoints"],
                  ["Per-IP", "30 requests/min", "1 minute", "Per client IP"],
                  ["Login", "5 attempts", "15 minutes", "/auth/login only"],
                  ["Password Reset", "3 requests", "1 hour", "/auth/forgot-password"],
            ],
      },
      {
            type: "info",
            variant: "warning",
            contentKey: "features.authentication.lockoutWarning",
      },
];

registerPage({
      slug: "features/authentication",
      titleKey: "features.authentication.title",
      descriptionKey: "features.authentication.description",
      category: "features",
      order: 1,
      sections,
      relatedSlugs: ["features/multi-tenancy", "security/overview"],
      lastUpdated: "2026-02-19",
});
