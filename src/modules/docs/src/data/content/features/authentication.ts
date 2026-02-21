import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "features.authentication.intro" },

      // â”€â”€â”€ Auth Flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.flowTitle", id: "auth-flow",
      },
      {
            type: "flowchart",
            title: "Authentication Flow",
            direction: "vertical",
            nodes: [
                  { id: "login", label: "POST /auth/login", type: "default" },
                  { id: "validate", label: "Validate Credentials + BCrypt", type: "warning" },
                  { id: "lockout", label: "Check Lockout (5 attempts / 15 min)", type: "danger" },
                  { id: "2fa", label: "2FA Required?", type: "info" },
                  { id: "no2fa", label: "Issue JWT + Refresh Token", type: "success" },
                  { id: "yes2fa", label: "Issue Temporary 2FA Token", type: "info" },
                  { id: "verify2fa", label: "POST /auth/verify-2fa", type: "default" },
                  { id: "jwt", label: "Issue Full JWT + Refresh Token", type: "success" },
            ],
            connections: [
                  { from: "login", to: "validate" },
                  { from: "validate", to: "lockout" },
                  { from: "lockout", to: "2fa" },
                  { from: "2fa", to: "no2fa", label: "No" },
                  { from: "2fa", to: "yes2fa", label: "Yes" },
                  { from: "yes2fa", to: "verify2fa" },
                  { from: "verify2fa", to: "jwt" },
            ],
      },

      // â”€â”€â”€ JWT Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.jwtTitle", id: "jwt-config",
      },
      { type: "paragraph", contentKey: "features.authentication.jwtIntro" },
      {
            type: "table",
            headers: ["Token Type", "Lifetime", "Storage", "Rotation"],
            rows: [
                  ["Access Token (JWT)", "15 minutes", "Memory / Cookie", "Refreshed automatically"],
                  ["Refresh Token", "7 days", "HttpOnly Cookie", "Rotated on each use (one-time)"],
                  ["2FA Temporary Token", "5 minutes", "Memory", "Discarded after 2FA verification"],
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "JWT Generation",
            code: `var claims = new[]
{
    new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
    new Claim("TenantId", admin.TenantId.ToString()),
    new Claim("IsSuperAdmin", admin.IsSuperAdmin.ToString()),
    new Claim(ClaimTypes.Role, string.Join(",", roleNames)),
};

var token = new JwtSecurityToken(
    issuer: _config["Jwt:Issuer"],
    audience: _config["Jwt:Audience"],
    claims: claims,
    expires: DateTime.UtcNow.AddMinutes(15),
    signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
);`,
            highlightLines: [3, 4, 5],
      },

      // â”€â”€â”€ Dual Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.dualAuthTitle", id: "dual-auth",
      },
      { type: "paragraph", contentKey: "features.authentication.dualAuthIntro" },
      {
            type: "table",
            headers: ["Feature", "Admin Auth", "User Auth"],
            rows: [
                  ["Controller", "AdminAuthController", "UserAuthController"],
                  ["JWT Claims", "TenantId, IsSuperAdmin, Roles", "NationalId, Gender, Country"],
                  ["2FA Support", "Yes (TOTP + backup codes)", "No"],
                  ["Register", "Created by another admin", "Self-registration (POST /user-auth/register)"],
                  ["Refresh Token", "7-day rotation", "7-day rotation"],
                  ["Rate Limiting", "5 attempts / 15 min lockout", "5 attempts / 15 min lockout"],
                  ["Session Management", "Revoke individual/all sessions", "Basic logout"],
            ],
      },

      // â”€â”€â”€ Admin Entity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.adminEntityTitle", id: "admin-entity",
      },
      { type: "paragraph", contentKey: "features.authentication.adminEntityIntro" },
      {
            type: "table",
            headers: ["Field", "Type", "Purpose"],
            rows: [
                  ["IsSuperAdmin", "bool", "System-level access, bypasses tenant scoping"],
                  ["IsProtected", "bool", "Cannot be deleted, deactivated, or demoted (Guardian enforced)"],
                  ["IsLastSuperAdminInTenant", "bool (cached)", "Safety flag  blocks deletion/deactivation if true"],
                  ["PasswordLastChanged", "DateTime?", "Checked against TenantSettings.PasswordExpiryDays for rotation enforcement"],
                  ["UsernameLastChanged", "DateTime?", "30-day cooldown on username changes"],
                  ["TwoFactorEnabled", "bool", "Whether 2FA is active for this admin"],
                  ["TwoFactorSecret", "string?", "Secret key for TOTP generation"],
                  ["BackupCodesJson", "string?", "JSON array of hashed backup codes"],
                  ["LastTwoFactorCodeUsed", "string?", "Anti-replay: last OTP code used"],
                  ["LastTwoFactorCodeUsedAt", "DateTime?", "Anti-replay: timestamp of last OTP use"],
                  ["FailedLoginAttempts", "int", "Counter for lockout threshold"],
                  ["LockoutEnd", "DateTime?", "When lockout expires"],
            ],
      },

      // â”€â”€â”€ 2FA Deep â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.twoFactorTitle", id: "two-factor",
      },
      { type: "paragraph", contentKey: "features.authentication.twoFactorIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "2FA Anti-Replay Protection",
            code: `// In Verify2FA handler:
if (admin.LastTwoFactorCodeUsed == code &&
    admin.LastTwoFactorCodeUsedAt?.AddMinutes(1) > DateTime.UtcNow)
{
    // Same code used within 1 minute  replay attack!
    return Result.Failure("2FA code already used");
}

// Verify TOTP
var totp = new Totp(Base32Encoding.ToBytes(admin.TwoFactorSecret));
bool isValid = totp.VerifyTotp(code, out _);

// If backup code
if (!isValid && admin.BackupCodesJson != null)
{
    var backupCodes = JsonSerializer.Deserialize<List<string>>(admin.BackupCodesJson);
    var hashedCode = HashHelper.Sha256(code);
    if (backupCodes.Remove(hashedCode))  // One-time use
    {
        admin.BackupCodesJson = JsonSerializer.Serialize(backupCodes);
        isValid = true;
    }
}

// Record for anti-replay
admin.LastTwoFactorCodeUsed = code;
admin.LastTwoFactorCodeUsedAt = DateTime.UtcNow;`,
            highlightLines: [2, 3, 17, 25, 26],
      },

      // â”€â”€â”€ Password Policy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.passwordPolicyTitle", id: "password-policy",
      },
      { type: "paragraph", contentKey: "features.authentication.passwordPolicyIntro" },
      {
            type: "table",
            headers: ["Setting", "Default", "Description"],
            rows: [
                  ["MinPasswordLength", "8", "Minimum characters"],
                  ["RequireUppercase", "true", "Must contain A-Z"],
                  ["RequireNumber", "true", "Must contain 0-9"],
                  ["RequireSpecialCharacter", "true", "Must contain !@#$%..."],
                  ["PasswordExpiryDays", "90", "0 = never expire"],
                  ["LockoutThreshold", "5", "Failed attempts before lockout"],
                  ["LockoutDurationMinutes", "30", "Lockout duration"],
                  ["Require2FA", "false", "Force 2FA for all admins in tenant"],
            ],
      },

      // â”€â”€â”€ Admin Auth Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.endpointsAdminTitle", id: "admin-auth-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/admin-auth/login", descriptionKey: "Username + password login", auth: "Public" },
                  { method: "POST", path: "/api/v1/admin-auth/refresh", descriptionKey: "Rotate refresh token", auth: "Refresh Token" },
                  { method: "POST", path: "/api/v1/admin-auth/verify-2fa", descriptionKey: "Verify TOTP code or backup code", auth: "2FA Token" },
                  { method: "POST", path: "/api/v1/admin-auth/logout", descriptionKey: "Revoke current refresh token", auth: "JWT" },
                  { method: "GET", path: "/api/v1/admin-auth/me", descriptionKey: "Current admin profile + roles", auth: "JWT" },
                  { method: "POST", path: "/api/v1/admin-auth/enable-2fa", descriptionKey: "Generate TOTP secret + QR code", auth: "JWT" },
                  { method: "POST", path: "/api/v1/admin-auth/disable-2fa", descriptionKey: "Disable 2FA (requires current code)", auth: "JWT" },
                  { method: "POST", path: "/api/v1/admin-auth/regenerate-backup-codes", descriptionKey: "Generate new set of backup codes", auth: "JWT" },
            ],
      },

      // â”€â”€â”€ User Auth Endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.endpointsUserTitle", id: "user-auth-endpoints",
      },
      {
            type: "api-table",
            endpoints: [
                  { method: "POST", path: "/api/v1/user-auth/register", descriptionKey: "Self-registration", auth: "Public" },
                  { method: "POST", path: "/api/v1/user-auth/login", descriptionKey: "Email/phone + password login", auth: "Public" },
                  { method: "POST", path: "/api/v1/user-auth/refresh", descriptionKey: "Rotate refresh token", auth: "Refresh Token" },
                  { method: "POST", path: "/api/v1/user-auth/logout", descriptionKey: "Revoke current session", auth: "JWT" },
                  { method: "GET", path: "/api/v1/user-auth/me", descriptionKey: "Current user profile", auth: "JWT" },
                  { method: "POST", path: "/api/v1/user-auth/verify-email", descriptionKey: "Verify email via OTP", auth: "Public" },
                  { method: "POST", path: "/api/v1/user-auth/verify-phone", descriptionKey: "Verify phone via OTP", auth: "Public" },
                  { method: "POST", path: "/api/v1/user-auth/forgot-password", descriptionKey: "Send password reset OTP", auth: "Public" },
                  { method: "POST", path: "/api/v1/user-auth/reset-password", descriptionKey: "Reset password with OTP", auth: "Public" },
            ],
      },

      // â”€â”€â”€ Rate Limiting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      {
            type: "heading", level: 2,
            titleKey: "features.authentication.rateLimitingTitle", id: "rate-limiting",
      },
      { type: "paragraph", contentKey: "features.authentication.rateLimitingIntro" },
      {
            type: "table",
            headers: ["Endpoint", "Policy", "Limit", "Window"],
            rows: [
                  ["/admin-auth/login", "Login", "5 requests", "15 minutes"],
                  ["/admin-auth/refresh", "Refresh", "10 requests", "1 minute"],
                  ["/admin-auth/verify-2fa", "2FA", "5 requests", "5 minutes"],
                  ["/user-auth/login", "Login", "5 requests", "15 minutes"],
                  ["/user-auth/register", "Register", "3 requests", "1 hour"],
                  ["/user-auth/forgot-password", "ForgotPwd", "3 requests", "1 hour"],
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
      relatedSlugs: ["features/role-permissions", "features/audit-system"],
      lastUpdated: "2026-02-20",
});
