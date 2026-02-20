import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "apiReference.userAuthApi.intro" },

      // ─── Base Configuration ───────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userAuthApi.configTitle", id: "configuration",
      },
      {
            type: "table",
            headers: ["Setting", "Value"],
            rows: [
                  ["Base URL", "/api/v1/user-auth"],
                  ["Auth Required", "Partial (Login, Register, Verify are public)"],
                  ["Rate Limit", "auth policy (10 req / 5 min)"],
                  ["Total Endpoints", "19"],
            ],
      },

      // ─── Registration ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userAuthApi.registerTitle", id: "register",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/user-auth/register", descriptionKey: "apiReference.userAuthApi.registerDesc", auth: "None" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Request",
                        language: "json",
                        filename: "POST /user-auth/register",
                        code: `{
  "email": "user@example.com",
  "password": "SecureP@ss1!",
  "confirmPassword": "SecureP@ss1!",
  "firstName": "Alice",
  "lastName": "Johnson",
  "phoneNumber": "+1234567890",
  "tenantId": "f8e7d6c5-b4a3-2190-fedc-ba0987654321"
}`,
                  },
                  {
                        label: "Response (201)",
                        language: "json",
                        filename: "Register — Success Response",
                        code: `{
  "id": "new-user-uuid",
  "email": "user@example.com",
  "message": "Registration successful. Please verify your email.",
  "requiresEmailVerification": true
}`,
                  },
            ],
      },

      // ─── Login ────────────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userAuthApi.loginTitle", id: "login",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/user-auth/login", descriptionKey: "apiReference.userAuthApi.loginDesc", auth: "None" },
            ],
      },
      {
            type: "code",
            language: "json",
            filename: "POST /user-auth/login — Same structure as admin auth",
            code: `// Request
{ "email": "user@example.com", "password": "SecureP@ss1!" }

// Response (200)
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "cmVmcmVzaC10b2tlbg...",
  "expiresIn": 900,
  "requiresTwoFactor": false,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "Alice",
    "role": "User",
    "tenantId": "tenant-uuid",
    "emailVerified": true,
    "phoneVerified": false
  }
}`,
      },

      // ─── External Auth ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userAuthApi.externalTitle", id: "external-auth",
      },
      { type: "paragraph", contentKey: "apiReference.userAuthApi.externalIntro" },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/user-auth/external-login", descriptionKey: "apiReference.userAuthApi.externalLoginDesc", auth: "None" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Google Login",
                        language: "json",
                        filename: "External Login — Google",
                        code: `// Request
{
  "provider": "google",
  "token": "ya29.a0AfH6SMC...",
  "tenantId": "tenant-uuid"
}

// Response (200) — New or existing user
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "cmVmcmVzaC10b2tlbg...",
  "expiresIn": 900,
  "isNewUser": true,
  "user": {
    "id": "user-uuid",
    "email": "alice@gmail.com",
    "firstName": "Alice",
    "lastName": "Johnson",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "provider": "google"
  }
}`,
                  },
                  {
                        label: "Facebook Login",
                        language: "json",
                        filename: "External Login — Facebook",
                        code: `{
  "provider": "facebook",
  "token": "EAAGm0PX4ZCps...",
  "tenantId": "tenant-uuid"
}`,
                  },
                  {
                        label: "Apple Login",
                        language: "json",
                        filename: "External Login — Apple",
                        code: `{
  "provider": "apple",
  "token": "eyJraWQiOiI4NkQ4OT...",
  "tenantId": "tenant-uuid"
}`,
                  },
            ],
      },

      // ─── Verification Endpoints ───────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userAuthApi.verificationTitle", id: "verification",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/user-auth/verify-email", descriptionKey: "apiReference.userAuthApi.verifyEmailDesc", auth: "None (uses OTP)" },
                  { method: "POST", path: "/api/v1/user-auth/verify-phone", descriptionKey: "apiReference.userAuthApi.verifyPhoneDesc", auth: "None (uses OTP)" },
                  { method: "POST", path: "/api/v1/user-auth/send-verification", descriptionKey: "apiReference.userAuthApi.sendVerificationDesc", auth: "None" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Verify Email",
                        language: "json",
                        filename: "POST /user-auth/verify-email",
                        code: `// Request
{
  "email": "user@example.com",
  "code": "123456"
}

// Response (200)
{
  "message": "Email verified successfully",
  "emailVerified": true
}`,
                  },
                  {
                        label: "Send Verification",
                        language: "json",
                        filename: "POST /user-auth/send-verification",
                        code: `// Request
{
  "email": "user@example.com",
  "type": "email"  // "email" | "phone"
}

// Response (200)
{
  "message": "Verification code sent",
  "expiresIn": 900
}

// Rate limited: max 5 requests per hour per email/phone`,
                  },
            ],
      },

      // ─── Password Reset ───────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userAuthApi.passwordResetTitle", id: "password-reset",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/user-auth/forgot-password", descriptionKey: "apiReference.userAuthApi.forgotPasswordDesc", auth: "None" },
                  { method: "POST", path: "/api/v1/user-auth/reset-password", descriptionKey: "apiReference.userAuthApi.resetPasswordDesc", auth: "None (uses OTP)" },
            ],
      },
      {
            type: "tabs",
            tabs: [
                  {
                        label: "Forgot Password",
                        language: "json",
                        filename: "POST /user-auth/forgot-password",
                        code: `// Request
{ "email": "user@example.com" }

// Response (200) — Always returns success (prevent email enumeration)
{ "message": "If an account exists, a reset code has been sent" }`,
                  },
                  {
                        label: "Reset Password",
                        language: "json",
                        filename: "POST /user-auth/reset-password",
                        code: `// Request
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecureP@ss2!",
  "confirmPassword": "NewSecureP@ss2!"
}

// Response (200)
{ "message": "Password reset successfully" }`,
                  },
            ],
      },

      // ─── Token Management ─────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userAuthApi.tokenTitle", id: "token-management",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/user-auth/refresh", descriptionKey: "apiReference.userAuthApi.refreshDesc", auth: "None (uses refresh token)" },
                  { method: "POST", path: "/api/v1/user-auth/logout", descriptionKey: "apiReference.userAuthApi.logoutDesc", auth: "Bearer Token" },
            ],
      },

      // ─── 2FA Endpoints ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userAuthApi.tfaTitle", id: "user-2fa",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/user-auth/2fa/enable", descriptionKey: "apiReference.userAuthApi.tfaEnableDesc", auth: "Bearer Token" },
                  { method: "POST", path: "/api/v1/user-auth/2fa/confirm", descriptionKey: "apiReference.userAuthApi.tfaConfirmDesc", auth: "Bearer Token" },
                  { method: "POST", path: "/api/v1/user-auth/2fa/verify", descriptionKey: "apiReference.userAuthApi.tfaVerifyDesc", auth: "2FA Session Token" },
                  { method: "POST", path: "/api/v1/user-auth/2fa/disable", descriptionKey: "apiReference.userAuthApi.tfaDisableDesc", auth: "Bearer Token" },
                  { method: "POST", path: "/api/v1/user-auth/2fa/backup-codes", descriptionKey: "apiReference.userAuthApi.tfaBackupDesc", auth: "Bearer Token" },
            ],
      },

      // ─── Profile Endpoints ────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userAuthApi.profileTitle", id: "profile",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "GET", path: "/api/v1/user-auth/me", descriptionKey: "apiReference.userAuthApi.meDesc", auth: "Bearer Token" },
                  { method: "PUT", path: "/api/v1/user-auth/profile", descriptionKey: "apiReference.userAuthApi.updateProfileDesc", auth: "Bearer Token" },
                  { method: "PUT", path: "/api/v1/user-auth/change-password", descriptionKey: "apiReference.userAuthApi.changePasswordDesc", auth: "Bearer Token" },
            ],
      },

      // ─── Full Endpoint Summary ────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "apiReference.userAuthApi.summaryTitle", id: "endpoint-summary",
      },
      {
            type: "table",
            headers: ["#", "Endpoint", "Method", "Auth", "Rate Limit"],
            rows: [
                  ["1", "/user-auth/register", "POST", "None", "global"],
                  ["2", "/user-auth/login", "POST", "None", "auth"],
                  ["3", "/user-auth/external-login", "POST", "None", "auth"],
                  ["4", "/user-auth/refresh", "POST", "Refresh Token", "auth"],
                  ["5", "/user-auth/logout", "POST", "Bearer", "global"],
                  ["6", "/user-auth/verify-email", "POST", "None", "otp"],
                  ["7", "/user-auth/verify-phone", "POST", "None", "otp"],
                  ["8", "/user-auth/send-verification", "POST", "None", "otp"],
                  ["9", "/user-auth/forgot-password", "POST", "None", "otp"],
                  ["10", "/user-auth/reset-password", "POST", "None", "otp"],
                  ["11", "/user-auth/2fa/enable", "POST", "Bearer", "global"],
                  ["12", "/user-auth/2fa/confirm", "POST", "Bearer", "global"],
                  ["13", "/user-auth/2fa/verify", "POST", "2FA Session", "auth"],
                  ["14", "/user-auth/2fa/disable", "POST", "Bearer", "global"],
                  ["15", "/user-auth/2fa/backup-codes", "POST", "Bearer", "global"],
                  ["16", "/user-auth/me", "GET", "Bearer", "global"],
                  ["17", "/user-auth/profile", "PUT", "Bearer", "global"],
                  ["18", "/user-auth/change-password", "PUT", "Bearer", "global"],
                  ["19", "/user-auth/sessions", "GET", "Bearer", "global"],
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
      relatedSlugs: ["api-reference/authentication-api", "security/authentication-deep", "api-reference/admin-api"],
      lastUpdated: "2026-02-20",
});
