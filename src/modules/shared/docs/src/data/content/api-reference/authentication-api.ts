// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "apiReference.authApi.intro" },

  // ─── Base Configuration ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.authApi.configTitle",
    id: "configuration",
  },
  {
    type: "table",
    headers: ["Setting", "Value", "Description"],
    rows: [
      ["Base URL", "/api/v1/auth/admin", "All admin auth endpoints base path"],
      ["Profile Base URL", "/api/v1/Admins", "Admin self-service profile and password endpoints"],
      [
        "Auth Required",
        "Partial",
        "Login, refresh, 2FA verify, discover-workspaces, and password reset are public; others require Bearer token",
      ],
      [
        "Rate Limits",
        "Login (10 req/5 min), token-refresh, password-reset",
        "Protects authentication flows from brute force",
      ],
      [
        "Content-Type",
        "application/json (multipart/form-data for avatar)",
        "All request and response payloads",
      ],
    ],
  },

  // ─── Login & Sessions ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.authApi.loginTitle",
    id: "login",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/admin/login",
        descriptionKey: "apiReference.authApi.loginDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/refresh",
        descriptionKey: "apiReference.authApi.refreshDesc",
        auth: "None (uses refresh token)",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/discover-workspaces",
        descriptionKey: "apiReference.authApi.discoverWorkspacesDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/logout",
        descriptionKey: "apiReference.authApi.logoutDesc",
        auth: "None (revokes refresh token)",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "POST /login Request",
        language: "json",
        filename: "POST /api/v1/auth/admin/login — Request Body",
        code: `{
  "identifier": "admin@example.com",
  "password": "P@ssw0rd123!",
  "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321", // Optional
  "deviceInfo": "Mozilla/5.0 Chrome/120.0.0", // Optional
  "isPlatformAdmin": false
}`,
      },
      {
        label: "Success Response (200)",
        language: "json",
        filename: "Login Success — Response",
        code: `{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "requiresTwoFactor": false,
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "admin@example.com",
    "username": "admin",
    "firstName": "John",
    "lastName": "Doe",
    "role": "SuperAdmin",
    "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321",
    "tenantCode": "ACME",
    "permissions": ["admins.view", "tenants.view", "roles.manage"]
  }
}`,
      },
      {
        label: "2FA Required (200)",
        language: "json",
        filename: "Login — 2FA Challenge",
        code: `{
  "requiresTwoFactor": true,
  "twoFactorSessionToken": "temp_session_abc123...",
  "message": "Two-factor authentication is required for this account."
}`,
      },
      {
        label: "Discover Workspaces Response",
        language: "json",
        filename: "POST /discover-workspaces — Response",
        code: `{
  "workspaces": [
    {
      "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321",
      "name": "Acme Corp",
      "code": "ACME",
      "logoUrl": "/uploads/tenants/acme-logo.png"
    }
  ],
  "requires2Fa": false
}`,
      },
    ],
  },

  // ─── Session Management ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.authApi.sessionsDesc",
    id: "sessions",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/auth/admin/sessions",
        descriptionKey: "apiReference.authApi.sessionsDesc",
        auth: "Bearer Token",
      },
      {
        method: "DELETE",
        path: "/api/v1/auth/admin/sessions/{tokenId}",
        descriptionKey: "apiReference.authApi.revokeSessionDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/sessions/revoke-all",
        descriptionKey: "apiReference.authApi.revokeAllSessionsDesc",
        auth: "Bearer Token",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "GET /sessions Response",
        language: "json",
        filename: "GET /api/v1/auth/admin/sessions — Response",
        code: `[
  {
    "tokenId": "session-token-uuid-1",
    "deviceInfo": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0",
    "ipAddress": "192.168.1.50",
    "isCurrent": true,
    "lastActiveAt": "2026-06-28T11:30:00Z",
    "createdAt": "2026-06-28T09:00:00Z"
  },
  {
    "tokenId": "session-token-uuid-2",
    "deviceInfo": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2) Safari/604.1",
    "ipAddress": "172.56.21.9",
    "isCurrent": false,
    "lastActiveAt": "2026-06-27T18:45:00Z",
    "createdAt": "2026-06-25T14:20:00Z"
  }
]`,
      },
      {
        label: "POST /sessions/revoke-all",
        language: "json",
        filename: "POST /api/v1/auth/admin/sessions/revoke-all — Request & Response",
        code: `// Request Body
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}

// Response (200 OK)
{
  "revokedCount": 1
}`,
      },
    ],
  },

  // ─── Two-Factor Authentication (2FA) ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.authApi.tfaTitle",
    id: "two-factor",
  },
  { type: "paragraph", contentKey: "apiReference.authApi.tfaIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/admin/2fa/enable",
        descriptionKey: "apiReference.authApi.tfaEnableDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/2fa/confirm",
        descriptionKey: "apiReference.authApi.tfaConfirmDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/2fa/verify",
        descriptionKey: "apiReference.authApi.tfaVerifyDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/2fa/disable",
        descriptionKey: "apiReference.authApi.tfaDisableDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/2fa/backup-codes/regenerate",
        descriptionKey: "apiReference.authApi.tfaBackupDesc",
        auth: "Bearer Token",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Enable 2FA Response",
        language: "json",
        filename: "POST /2fa/enable — Response",
        code: `{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUri": "otpauth://totp/SCRIPE:admin@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SCRIPE",
  "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANSU..."
}`,
      },
      {
        label: "Confirm 2FA Setup",
        language: "json",
        filename: "POST /2fa/confirm — Request",
        code: `// Request
{
  "code": "123456"
}

// Response (200 OK)
{
  "message": "2FA enabled successfully"
}`,
      },
      {
        label: "Verify 2FA (Login)",
        language: "json",
        filename: "POST /2fa/verify — Request",
        code: `// Request
{
  "identifier": "admin@example.com",
  "password": "P@ssw0rd123!",
  "code": "654321",
  "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321" // Optional
}

// Response (200 OK) — Same as TokenResponse
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "cmVmcmVzaC10b2tlbg...",
  "expiresIn": 3600
}`,
      },
      {
        label: "Disable 2FA",
        language: "json",
        filename: "POST /2fa/disable — Request",
        code: `// Request
{
  "password": "P@ssw0rd123!",
  "twoFactorCode": "123456"
}

// Response (200 OK)
{
  "message": "2FA disabled successfully"
}`,
      },
    ],
  },

  // ─── Impersonation ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.adminApi.impersonationTitle",
    id: "impersonation",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/admin/impersonate/{id}",
        descriptionKey: "apiReference.adminApi.impersonateDesc",
        auth: "Bearer Token",
        permission: "admins.impersonate",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/stop-impersonation",
        descriptionKey: "apiReference.adminApi.stopImpersonateDesc",
        auth: "Bearer Token",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Impersonate Response",
        language: "json",
        filename: "POST /impersonate/{id} — Response",
        code: `{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Impersonated Admin JWT
  "refreshToken": "impersonation_refresh_token_here...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "requiresTwoFactor": false,
  "user": {
    "id": "target-admin-uuid",
    "email": "target@example.com",
    "role": "TenantAdmin",
    "tenantId": "target-tenant-uuid",
    "impersonatorAdminId": "superadmin-uuid" // Auditing trail marker
  }
}`,
      },
      {
        label: "Stop Impersonation",
        language: "json",
        filename: "POST /stop-impersonation — Request",
        code: `// Request
{
  "refreshToken": "impersonation_refresh_token_here..."
}

// Response (200 OK) — Restored Original Session TokenResponse
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Original Admin JWT
  "refreshToken": "original_restored_refresh_token...",
  "expiresIn": 3600
}`,
      },
    ],
  },

  // ─── External Identity Linking ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.externalTitle",
    id: "external-logins",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/auth/admin/external-logins",
        descriptionKey: "apiReference.authApi.getExternalLoginsDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/external-logins/link",
        descriptionKey: "apiReference.authApi.linkExternalLoginDesc",
        auth: "Bearer Token",
      },
      {
        method: "DELETE",
        path: "/api/v1/auth/admin/external-logins/{externalLoginId}",
        descriptionKey: "apiReference.authApi.unlinkExternalLoginDesc",
        auth: "Bearer Token",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "GET /external-logins Response",
        language: "json",
        filename: "GET /external-logins — Response",
        code: `[
  {
    "id": "external-login-uuid-1",
    "providerName": "Google",
    "providerKey": "1048596048593028",
    "email": "admin@gmail.com",
    "displayName": "John Google",
    "linkedAt": "2026-06-20T10:00:00Z",
    "lastUsedAt": "2026-06-28T08:30:00Z"
  }
]`,
      },
      {
        label: "POST /link Request",
        language: "json",
        filename: "POST /external-logins/link — Request",
        code: `{
  "identityProviderId": "idp-config-uuid",
  "providerName": "Google",
  "providerKey": "1048596048593028",
  "email": "admin@gmail.com",
  "displayName": "John Google"
}`,
      },
      {
        label: "Link Success (201)",
        language: "json",
        filename: "POST /external-logins/link — Response",
        code: `{
  "id": "external-login-uuid-1",
  "providerName": "Google",
  "email": "admin@gmail.com"
}`,
      },
    ],
  },

  // ─── Admin Password Reset ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.passwordResetTitle",
    id: "password-reset-flow",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/admin/request-password-reset",
        descriptionKey: "apiReference.authApi.requestPasswordResetDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/verify-reset-otp",
        descriptionKey: "apiReference.authApi.verifyResetOtpDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/reset-password",
        descriptionKey: "apiReference.authApi.resetPasswordDesc",
        auth: "None",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Step 1: Request Reset",
        language: "json",
        filename: "POST /request-password-reset — Request & Response",
        code: `// Request
{
  "email": "admin@example.com",
  "tenantId": "optional-tenant-uuid",
  "method": "otp" // "otp" or "magic-link"
}

// Response (202 Accepted)
{
  "sent": true,
  "retryAfterSeconds": null
}`,
      },
      {
        label: "Step 2: Verify OTP",
        language: "json",
        filename: "POST /verify-reset-otp — Request & Response",
        code: `// Request
{
  "email": "admin@example.com",
  "code": "123456"
}

// Response (200 OK)
{
  "email": "admin@example.com",
  "workspaces": [
    {
      "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321",
      "name": "Acme Corp",
      "code": "ACME"
    }
  ]
}`,
      },
      {
        label: "Step 3: Reset Password",
        language: "json",
        filename: "POST /reset-password — Request",
        code: `// Request
{
  "email": "admin@example.com",
  "code": "123456", // Or "otp" field
  "newPassword": "NewSecureP@ssword1!",
  "tenantIds": ["f8e7d6c5-b4a3-2190-fedc-ba0987654321"] // Decryptable/Encrypted list or null (null resets all)
}`,
      },
    ],
  },

  // ─── Profile Management (Self-Service) ────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.authApi.profileTitle",
    id: "profile-management",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/Admins/me",
        descriptionKey: "apiReference.authApi.meDesc",
        auth: "Bearer Token",
      },
      {
        method: "PUT",
        path: "/api/v1/Admins/me",
        descriptionKey: "apiReference.authApi.updateProfileDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/Admins/{id}/change-password",
        descriptionKey: "apiReference.authApi.changePasswordDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/Admins/me/avatar",
        descriptionKey: "apiReference.authApi.uploadAvatarDesc",
        auth: "Bearer Token",
      },
      {
        method: "DELETE",
        path: "/api/v1/Admins/me/avatar",
        descriptionKey: "apiReference.authApi.removeAvatarDesc",
        auth: "Bearer Token",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "GET /me Response",
        language: "json",
        filename: "GET /api/v1/Admins/me — Response",
        code: `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "admin@example.com",
  "username": "admin",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "avatarUrl": "/uploads/avatars/admin.png",
  "isActive": true,
  "twoFactorEnabled": true,
  "roleId": "superadmin-role-uuid",
  "roleName": "SuperAdmin",
  "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321",
  "createdAt": "2026-01-01T00:00:00Z"
}`,
      },
      {
        label: "PUT /me Request",
        language: "json",
        filename: "PUT /api/v1/Admins/me — Request",
        code: `{
  "firstName": "Johnny",
  "lastName": "Doel",
  "phoneNumber": "+1098765432"
}`,
      },
    ],
  },

  // ─── Security Activity Log ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.authApi.securityTitle",
    id: "security-activity",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/auth/admin/security-log",
        descriptionKey: "apiReference.authApi.securityLogDesc",
        auth: "Bearer Token",
      },
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
  relatedSlugs: [
    "api-reference/user-auth-api",
    "security/authentication-deep",
    "api-reference/admin-api",
  ],
  lastUpdated: "2026-06-28",
});
