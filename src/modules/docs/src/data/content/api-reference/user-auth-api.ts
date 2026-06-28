// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "apiReference.userAuthApi.intro" },

  // ─── Base Configuration ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.configTitle",
    id: "configuration",
  },
  {
    type: "table",
    headers: ["Setting", "Value", "Description"],
    rows: [
      ["Base URL", "/api/v1/auth/user", "All regular user (client) auth endpoints base path"],
      ["Profile Base URL", "/api/v1/Users", "User profile management endpoints"],
      [
        "Auth Required",
        "Partial",
        "Login, register, external-login, verification, refresh, and password-reset are public; others require Bearer token",
      ],
      [
        "Rate Limits",
        "Login (10 req/5 min), password-reset, otp-verification",
        "Protects client-facing auth endpoints",
      ],
      ["Content-Type", "application/json", "All requests and responses use JSON format"],
    ],
  },

  // ─── Registration ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.registerTitle",
    id: "register",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/user/register",
        descriptionKey: "apiReference.userAuthApi.registerDesc",
        auth: "None",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Registration Request",
        language: "json",
        filename: "POST /api/v1/auth/user/register — Request Body",
        code: `{
  "username": "alicejohnson",
  "password": "SecureP@ssword1!",
  "email": "alice@example.com",
  "phoneNumber": "+1234567890",
  "tenantCode": "ACME" // Public tenant workspace code
}`,
      },
      {
        label: "Registration Response (201)",
        language: "json",
        filename: "Registration Success — Response",
        code: `{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 3600,
  "tokenType": "Bearer",
  "requiresTwoFactor": false,
  "user": {
    "id": "user-uuid-12345",
    "email": "alice@example.com",
    "username": "alicejohnson",
    "firstName": null,
    "lastName": null,
    "role": "User",
    "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321",
    "tenantCode": "ACME",
    "emailVerified": false,
    "phoneVerified": false
  }
}`,
      },
    ],
  },

  // ─── Login & OAuth ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.loginTitle",
    id: "login",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/user/login",
        descriptionKey: "apiReference.userAuthApi.loginDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/login/{provider}",
        descriptionKey: "apiReference.userAuthApi.loginProviderDesc",
        auth: "None",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Password Login",
        language: "json",
        filename: "POST /api/v1/auth/user/login — Request",
        code: `{
  "username": "alicejohnson", // Can be email or username
  "password": "SecureP@ssword1!",
  "deviceInfo": "Mozilla/5.0 Chrome/120.0.0" // Optional
}`,
      },
      {
        label: "OAuth Login (Google/etc.)",
        language: "json",
        filename: "POST /api/v1/auth/user/login/google — Request",
        code: `{
  "token": "oauth-provider-id-token-here...",
  "deviceInfo": "Mozilla/5.0 Chrome/120.0.0"
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
    "id": "user-uuid-12345",
    "email": "alice@example.com",
    "username": "alicejohnson",
    "role": "User",
    "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321",
    "emailVerified": true,
    "phoneVerified": false
  }
}`,
      },
    ],
  },

  // ─── Verification & OTPs ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.verificationTitle",
    id: "verification",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/user/verify-email",
        descriptionKey: "apiReference.userAuthApi.verifyEmailDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/verify-phone",
        descriptionKey: "apiReference.userAuthApi.verifyPhoneDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/send-email-verification",
        descriptionKey: "apiReference.userAuthApi.sendEmailVerificationDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/send-phone-verification",
        descriptionKey: "apiReference.userAuthApi.sendPhoneVerificationDesc",
        auth: "None",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Verify Email",
        language: "json",
        filename: "POST /api/v1/auth/user/verify-email — Request & Response",
        code: `// Request Body
{
  "email": "alice@example.com",
  "code": "654321"
}

// Response (200 OK)
{
  "message": "Email verified successfully"
}`,
      },
      {
        label: "Send Email OTP",
        language: "json",
        filename: "POST /api/v1/auth/user/send-email-verification — Request & Response",
        code: `// Request Body
{
  "email": "alice@example.com"
}

// Response (202 Accepted)
{
  "sent": true,
  "retryAfterSeconds": null
}`,
      },
      {
        label: "Verify Phone",
        language: "json",
        filename: "POST /api/v1/auth/user/verify-phone — Request & Response",
        code: `// Request Body
{
  "phoneNumber": "+1234567890",
  "code": "123456"
}

// Response (200 OK)
{
  "message": "Phone verified successfully"
}`,
      },
    ],
  },

  // ─── Password Reset ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.passwordResetTitle",
    id: "password-reset",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/user/request-password-reset",
        descriptionKey: "apiReference.userAuthApi.forgotPasswordDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/reset-password",
        descriptionKey: "apiReference.userAuthApi.resetPasswordDesc",
        auth: "None",
      },
    ],
  },
  {
    type: "tabs",
    tabs: [
      {
        label: "Request Reset OTP",
        language: "json",
        filename: "POST /api/v1/auth/user/request-password-reset — Request & Response",
        code: `// Request
{
  "email": "alice@example.com"
}

// Response (202 Accepted)
{
  "sent": true,
  "retryAfterSeconds": null
}`,
      },
      {
        label: "Reset Password with OTP",
        language: "json",
        filename: "POST /api/v1/auth/user/reset-password — Request",
        code: `// Request
{
  "email": "alice@example.com",
  "code": "123456",
  "newPassword": "NewSecurePassword2!"
}`,
      },
    ],
  },

  // ─── Token Management ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.tokenTitle",
    id: "token-management",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/user/refresh",
        descriptionKey: "apiReference.userAuthApi.refreshDesc",
        auth: "None (uses refresh token)",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/logout",
        descriptionKey: "apiReference.userAuthApi.logoutDesc",
        auth: "Bearer Token",
      },
    ],
  },

  // ─── Two-Factor Authentication (2FA) ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.tfaTitle",
    id: "user-2fa",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/user/2fa/enable",
        descriptionKey: "apiReference.userAuthApi.tfaEnableDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/2fa/confirm",
        descriptionKey: "apiReference.userAuthApi.tfaConfirmDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/2fa/verify",
        descriptionKey: "apiReference.userAuthApi.tfaVerifyDesc",
        auth: "None",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/2fa/disable",
        descriptionKey: "apiReference.userAuthApi.tfaDisableDesc",
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
  "qrCodeUri": "otpauth://totp/SCRIPE:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SCRIPE",
  "qrCodeBase64": "data:image/png;base64,iVBORw..."
}`,
      },
      {
        label: "Confirm 2FA Setup",
        language: "json",
        filename: "POST /2fa/confirm — Request & Response",
        code: `// Request
{
  "code": "123456"
}

// Response (200 OK)
{
  "message": "2FA enabled successfully"
}`,
      },
    ],
  },

  // ─── External Logins Linking ──────────────────────────────
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
        path: "/api/v1/auth/user/external-logins",
        descriptionKey: "apiReference.userAuthApi.getExternalLoginsDesc",
        auth: "Bearer Token",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/external-logins/link",
        descriptionKey: "apiReference.userAuthApi.linkExternalLoginDesc",
        auth: "Bearer Token",
      },
      {
        method: "DELETE",
        path: "/api/v1/auth/user/external-logins/{externalLoginId}",
        descriptionKey: "apiReference.userAuthApi.unlinkExternalLoginDesc",
        auth: "Bearer Token",
      },
    ],
  },

  // ─── User Profile ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.profileTitle",
    id: "user-profile",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/Users/me",
        descriptionKey: "apiReference.userAuthApi.meDesc",
        auth: "Bearer Token",
      },
    ],
  },
  {
    type: "code",
    language: "json",
    filename: "GET /api/v1/Users/me — Response",
    code: `{
  "id": "user-uuid-12345",
  "username": "alicejohnson",
  "email": "alice@example.com",
  "firstName": "Alice",
  "lastName": "Johnson",
  "phoneNumber": "+1234567890",
  "avatarUrl": "/uploads/avatars/user1.png",
  "isActive": true,
  "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321",
  "emailVerified": true,
  "phoneVerified": false,
  "createdAt": "2026-06-25T14:20:00Z"
}`,
  },

  // ─── Full Endpoint Summary ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "apiReference.userAuthApi.summaryTitle",
    id: "endpoint-summary",
  },
  {
    type: "table",
    headers: ["Endpoint", "Method", "Auth", "Rate Limit"],
    rows: [
      ["/api/v1/auth/user/register", "POST", "None", "global"],
      ["/api/v1/auth/user/login", "POST", "None", "auth"],
      ["/api/v1/auth/user/login/{provider}", "POST", "None", "auth"],
      ["/api/v1/auth/user/verify-email", "POST", "None", "otp"],
      ["/api/v1/auth/user/verify-phone", "POST", "None", "otp"],
      ["/api/v1/auth/user/send-email-verification", "POST", "None", "otp"],
      ["/api/v1/auth/user/send-phone-verification", "POST", "None", "otp"],
      ["/api/v1/auth/user/request-password-reset", "POST", "None", "password-reset"],
      ["/api/v1/auth/user/reset-password", "POST", "None", "global"],
      ["/api/v1/auth/user/refresh", "POST", "None", "token-refresh"],
      ["/api/v1/auth/user/logout", "POST", "Bearer", "global"],
      ["/api/v1/auth/user/2fa/enable", "POST", "Bearer", "global"],
      ["/api/v1/auth/user/2fa/confirm", "POST", "Bearer", "global"],
      ["/api/v1/auth/user/2fa/verify", "POST", "None", "auth"],
      ["/api/v1/auth/user/2fa/disable", "POST", "Bearer", "global"],
      ["/api/v1/auth/user/external-logins", "GET", "Bearer", "global"],
      ["/api/v1/auth/user/external-logins/link", "POST", "Bearer", "global"],
      ["/api/v1/auth/user/external-logins/{externalLoginId}", "DELETE", "Bearer", "global"],
      ["/api/v1/Users/me", "GET", "Bearer", "global"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "apiReference.userAuthApi.diffNote",
  },
];

registerPage({
  slug: "api-reference/user-auth-api",
  titleKey: "apiReference.userAuthApi.title",
  descriptionKey: "apiReference.userAuthApi.description",
  category: "api-reference",
  order: 3,
  sections,
  relatedSlugs: [
    "api-reference/authentication-api",
    "security/authentication-deep",
    "api-reference/admin-api",
  ],
  lastUpdated: "2026-06-28",
});
