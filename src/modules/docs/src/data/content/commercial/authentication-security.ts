import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "commercial.authSecurity.intro" },

      { type: "heading", level: 2, titleKey: "commercial.authSecurity.jwtTitle", id: "jwt" },
      { type: "paragraph", contentKey: "commercial.authSecurity.jwtContent" },
      {
            type: "table",
            headers: ["Feature", "Implementation"],
            rows: [
                  ["Token Algorithm", "RS256 (asymmetric) for production, HS256 for development"],
                  ["Access Token Lifetime", "Configurable (default: 30 minutes)"],
                  ["Refresh Token Lifetime", "Configurable (default: 7 days)"],
                  ["Token Storage", "HTTP-only secure cookies + session storage"],
                  ["Claims", "UserId, TenantId, Roles, Permissions (fine-grained)"],
                  ["Key Rotation", "Automatic key rotation on schedule"],
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.authSecurity.twoFaTitle", id: "2fa" },
      { type: "paragraph", contentKey: "commercial.authSecurity.twoFaContent" },
      {
            type: "step-guide",
            steps: [
                  { titleKey: "commercial.authSecurity.twoFa1Title", contentKey: "commercial.authSecurity.twoFa1Content" },
                  { titleKey: "commercial.authSecurity.twoFa2Title", contentKey: "commercial.authSecurity.twoFa2Content" },
                  { titleKey: "commercial.authSecurity.twoFa3Title", contentKey: "commercial.authSecurity.twoFa3Content" },
                  { titleKey: "commercial.authSecurity.twoFa4Title", contentKey: "commercial.authSecurity.twoFa4Content" },
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.authSecurity.sessionTitle", id: "session" },
      {
            type: "table",
            headers: ["Feature", "Description"],
            rows: [
                  ["Device tracking", "Each login session identified by device fingerprint"],
                  ["Active sessions list", "Users can view all active login sessions"],
                  ["Force logout", "Admins can terminate any session remotely"],
                  ["Concurrent session limit", "Configurable max sessions per user"],
                  ["Session expiry", "Automatic cleanup of expired sessions"],
                  ["Geo-location tracking", "IP-based location tracking for sessions"],
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.authSecurity.passwordTitle", id: "password" },
      { type: "paragraph", contentKey: "commercial.authSecurity.passwordContent" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "Minimum length and complexity requirements (configurable)",
                  "Password history prevention (last N passwords blocked)",
                  "Account lockout after N failed attempts",
                  "Automatic unlock after configurable timeout",
                  "Password expiration policies (optional)",
                  "Bcrypt hashing with configurable work factor",
            ],
      },

      { type: "heading", level: 2, titleKey: "commercial.authSecurity.apiTitle", id: "api" },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/auth/login", descriptionKey: "Authenticate user", auth: "Public" },
                  { method: "POST", path: "/api/auth/refresh", descriptionKey: "Refresh access token", auth: "Required" },
                  { method: "POST", path: "/api/auth/logout", descriptionKey: "Invalidate session", auth: "Required" },
                  { method: "POST", path: "/api/auth/2fa/enable", descriptionKey: "Enable 2FA", auth: "Required" },
                  { method: "POST", path: "/api/auth/2fa/verify", descriptionKey: "Verify 2FA code", auth: "Required" },
                  { method: "POST", path: "/api/auth/forgot-password", descriptionKey: "Request password reset", auth: "Public" },
                  { method: "POST", path: "/api/auth/reset-password", descriptionKey: "Complete password reset", auth: "Public" },
                  { method: "GET", path: "/api/auth/sessions", descriptionKey: "List active sessions", auth: "Required" },
            ],
      },
];

registerPage({
      slug: "commercial/authentication-security",
      titleKey: "commercial.authSecurity.title",
      descriptionKey: "commercial.authSecurity.description",
      category: "commercial-security",
      order: 2,
      sections,
      relatedSlugs: ["commercial/security-overview", "commercial/data-protection"],
      lastUpdated: "2026-02-20",
});
