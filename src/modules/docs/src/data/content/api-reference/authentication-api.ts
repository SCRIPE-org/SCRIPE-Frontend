import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "apiReference.authApi.intro" },

      // ─── Base Configuration ───────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.authApi.configTitle", id: "configuration",
      },
      {
            type: "table",
            headers: ["Setting", "Value", "Description"],
            rows: [
                  ["Base URL", "/api/v1/auth", "All admin auth endpoints"],
                  ["Auth Required", "Partial", "Login/Refresh are public; others require Bearer token"],
                  ["Rate Limit", "auth policy (10 req / 5 min)", "Applied to login and refresh"],
                  ["Content-Type", "application/json", "All request/response bodies"],
            ],
      },

      // ─── Login ────────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.authApi.loginTitle", id: "login",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/auth/login", descriptionKey: "apiReference.authApi.loginDesc", auth: "None" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Request",
                        language: "json",
                        filename: "POST /api/v1/auth/login — Request Body",
                        code: `{
  "email": "admin@company.com",
  "password": "P@ssw0rd123!"
}`,
                  },
                  {
                        label: "Success Response (200)",
                        language: "json",
                        filename: "Login Success — Response",
                        code: `{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "requiresTwoFactor": false,
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "admin@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "SuperAdmin",
    "avatarUrl": "/uploads/avatars/a1b2c3d4.jpg",
    "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321",
    "tenantName": "Acme Corp"
  }
}`,
                  },
                  {
                        label: "2FA Required (200)",
                        language: "json",
                        filename: "Login — 2FA Required Response",
                        code: `{
  "requiresTwoFactor": true,
  "twoFactorSessionToken": "temp_session_abc123...",
  "message": "Two-factor authentication required"
}
// Client must call POST /auth/2fa/verify with session token + TOTP code`,
                  },
                  {
                        label: "Error Responses",
                        language: "json",
                        filename: "Login Error Responses",
                        code: `// 401 - Invalid credentials
{ "error": "Invalid email or password" }

// 423 - Account locked
{
  "error": "Account is locked",
  "lockoutEnd": "2026-02-20T18:00:00Z",
  "attemptsRemaining": 0
}

// 403 - Account disabled
{ "error": "Account has been deactivated" }

// 429 - Rate limited
{
  "error": "Too many login attempts",
  "retryAfter": 300
}`,
                  },
            ],
      },

      // ─── Refresh Token ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.authApi.refreshTitle", id: "refresh",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/auth/refresh", descriptionKey: "apiReference.authApi.refreshDesc", auth: "None (uses refresh token)" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Request",
                        language: "json",
                        filename: "POST /api/v1/auth/refresh",
                        code: `{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
// Note: Refresh token can also be sent via HttpOnly cookie`,
                  },
                  {
                        label: "Response (200)",
                        language: "json",
                        filename: "Refresh — New Token Pair",
                        code: `{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.new_token...",
  "refreshToken": "bmV3IHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 900
}
// Old refresh token is revoked (single-use rotation)`,
                  },
            ],
      },

      // ─── Logout ───────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.authApi.logoutTitle", id: "logout",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/auth/logout", descriptionKey: "apiReference.authApi.logoutDesc", auth: "Bearer Token" },
            ],
      },
      {
            type: "code",
            language: "json",
            filename: "POST /api/v1/auth/logout — Response (200)",
            code: `{
  "message": "Logged out successfully"
}
// All refresh tokens for this user are revoked
// Access token remains valid until expiry (15 min max)`,
      },

      // ─── 2FA Endpoints ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.authApi.tfaTitle", id: "two-factor",
      },
      { type: "paragraph", contentKey: "apiReference.authApi.tfaIntro" },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/auth/2fa/enable", descriptionKey: "apiReference.authApi.tfaEnableDesc", auth: "Bearer Token" },
                  { method: "POST", path: "/api/v1/auth/2fa/confirm", descriptionKey: "apiReference.authApi.tfaConfirmDesc", auth: "Bearer Token" },
                  { method: "POST", path: "/api/v1/auth/2fa/verify", descriptionKey: "apiReference.authApi.tfaVerifyDesc", auth: "2FA Session Token" },
                  { method: "POST", path: "/api/v1/auth/2fa/disable", descriptionKey: "apiReference.authApi.tfaDisableDesc", auth: "Bearer Token" },
                  { method: "POST", path: "/api/v1/auth/2fa/backup-codes", descriptionKey: "apiReference.authApi.tfaBackupDesc", auth: "Bearer Token" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Enable 2FA",
                        language: "json",
                        filename: "POST /auth/2fa/enable — Response",
                        code: `{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUri": "otpauth://totp/NEXORA:admin@company.com?secret=JBSWY3DPEHPK3PXP&issuer=NEXORA",
  "qrCodeBase64": "data:image/png;base64,iVBOR..."
}`,
                  },
                  {
                        label: "Confirm 2FA",
                        language: "json",
                        filename: "POST /auth/2fa/confirm — Request & Response",
                        code: `// Request
{ "code": "123456" }

// Response (200)
{
  "backupCodes": [
    "12345678", "23456789", "34567890",
    "45678901", "56789012", "67890123",
    "78901234", "89012345", "90123456", "01234567"
  ],
  "message": "2FA enabled successfully. Save your backup codes!"
}`,
                  },
                  {
                        label: "Verify 2FA",
                        language: "json",
                        filename: "POST /auth/2fa/verify — Login Completion",
                        code: `// Request
{
  "sessionToken": "temp_session_abc123...",
  "code": "654321"
}

// Response (200) — Same as login success
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "cmVmcmVzaC10b2tlbg...",
  "expiresIn": 900,
  "user": { ... }
}`,
                  },
            ],
      },

      // ─── Profile Endpoints ────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.authApi.profileTitle", id: "profile",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/auth/me", descriptionKey: "apiReference.authApi.meDesc", auth: "Bearer Token" },
                  { method: "PUT", path: "/api/v1/auth/profile", descriptionKey: "apiReference.authApi.updateProfileDesc", auth: "Bearer Token" },
                  { method: "PUT", path: "/api/v1/auth/change-password", descriptionKey: "apiReference.authApi.changePasswordDesc", auth: "Bearer Token" },
                  { method: "POST", path: "/api/v1/auth/avatar", descriptionKey: "apiReference.authApi.uploadAvatarDesc", auth: "Bearer Token" },
                  { method: "DELETE", path: "/api/v1/auth/avatar", descriptionKey: "apiReference.authApi.removeAvatarDesc", auth: "Bearer Token" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Get Profile (GET /me)",
                        language: "json",
                        filename: "GET /auth/me — Response",
                        code: `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "admin@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "role": {
    "id": "role-uuid",
    "name": "SuperAdmin"
  },
  "permissions": ["admins.view", "users.view", "roles.manage"],
  "tenant": {
    "id": "tenant-uuid",
    "name": "Acme Corp",
    "logoUrl": "/uploads/tenants/acme-logo.png"
  },
  "avatarUrl": "/uploads/avatars/john.jpg",
  "twoFactorEnabled": true,
  "emailVerified": true,
  "createdAt": "2026-01-15T10:30:00Z",
  "lastLoginAt": "2026-02-20T14:00:00Z"
}`,
                  },
                  {
                        label: "Update Profile",
                        language: "json",
                        filename: "PUT /auth/profile — Request",
                        code: `{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+9876543210"
}`,
                  },
                  {
                        label: "Change Password",
                        language: "json",
                        filename: "PUT /auth/change-password — Request",
                        code: `{
  "currentPassword": "OldP@ss123!",
  "newPassword": "NewP@ss456!",
  "confirmPassword": "NewP@ss456!"
}`,
                  },
            ],
      },

      // ─── Admin Security Endpoints ─────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.authApi.securityTitle", id: "security",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/auth/security-log", descriptionKey: "apiReference.authApi.securityLogDesc", auth: "Bearer Token" },
                  { method: "GET", path: "/api/v1/auth/sessions", descriptionKey: "apiReference.authApi.sessionsDesc", auth: "Bearer Token" },
                  { method: "DELETE", path: "/api/v1/auth/sessions/{id}", descriptionKey: "apiReference.authApi.revokeSessionDesc", auth: "Bearer Token" },
            ],
      },
      {
            type: "info",
            variant: "tip",
            contentKey: "apiReference.authApi.securityTip",
      },
];

registerPage({
      slug: "api-reference/authentication-api",
      titleKey: "apiReference.authApi.title",
      descriptionKey: "apiReference.authApi.description",
      category: "api-reference",
      order: 2,
      sections,
      relatedSlugs: ["api-reference/user-auth-api", "security/authentication-deep", "api-reference/admin-api"],
      lastUpdated: "2026-02-20",
});
