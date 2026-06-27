// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.authentication.intro" },

  // Flowchart 1: Login and Workspace Routing Flow
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.flowTitle",
    id: "auth-flow",
  },
  {
    type: "flowchart",
    title: "Login & Workspace Routing Flow",
    direction: "vertical",
    nodes: [
      { id: "login_start", label: "POST /api/v1/auth/admin/login", type: "default" },
      { id: "check_lockout", label: "Is Account Locked Out? (LockoutEnd > UtcNow)", type: "danger" },
      { id: "lockout_reject", label: "Reject Login: auth.accountLocked", type: "danger" },
      { id: "check_tenant", label: "Is TenantId / isPlatformAdmin provided?", type: "info" },
      { id: "tenant_scoped", label: "Case A: Decrypt TenantId & Query Candidate", type: "primary" },
      { id: "platform_scoped", label: "Case A': Query TenantId = null", type: "primary" },
      { id: "discovery", label: "Case B: Cross-Tenant Email Discovery", type: "warning" },
      { id: "verify_pw", label: "Verify Password via BCrypt", type: "warning" },
      { id: "pw_candidates", label: "Verify Candidates (Password Verified?)", type: "warning" },
      { id: "workspace_count", label: "Workspace Matches Count?", type: "info" },
      { id: "picker", label: "Return: RequiresWorkspaceSelection", type: "info" },
      { id: "direct_login", label: "Proceed to Post-Login Checks", type: "success" },
    ],
    connections: [
      { from: "login_start", to: "check_lockout" },
      { from: "check_lockout", to: "lockout_reject", label: "Yes" },
      { from: "check_lockout", to: "check_tenant", label: "No" },
      { from: "check_tenant", to: "tenant_scoped", label: "Has TenantId" },
      { from: "check_tenant", to: "platform_scoped", label: "isPlatformAdmin" },
      { from: "check_tenant", to: "discovery", label: "Neither" },
      { from: "tenant_scoped", to: "verify_pw" },
      { from: "platform_scoped", to: "verify_pw" },
      { from: "discovery", to: "pw_candidates" },
      { from: "pw_candidates", to: "workspace_count" },
      { from: "workspace_count", to: "picker", label: "N > 1 workspaces" },
      { from: "workspace_count", to: "direct_login", label: "1 workspace" },
      { from: "verify_pw", to: "direct_login", label: "Success" },
    ],
  },

  // Flowchart 2: Post-Login Security Gates & 2FA Flow
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.twoFactorTitle",
    id: "two-factor-flow",
  },
  {
    type: "flowchart",
    title: "Post-Login Security Gates & 2FA Flow",
    direction: "vertical",
    nodes: [
      { id: "gate_start", label: "Post-Login Security Gate", type: "default" },
      { id: "tenant_status", label: "Is Tenant Suspended / Deactivated?", type: "warning" },
      { id: "tenant_blocked", label: "Block login: tenantSuspended / tenantDeactivated", type: "danger" },
      { id: "pw_expiry", label: "ITenantPasswordValidator: Password Expired?", type: "warning" },
      { id: "mcp_active", label: "Set MustChangePassword = true, JWT has mcp:true", type: "warning" },
      { id: "check_2fa", label: "Is 2FA enabled on Admin?", type: "info" },
      { id: "temp_token", label: "Issue Temporary 2FA Token", type: "info" },
      { id: "verify_2fa", label: "POST /api/v1/auth/admin/2fa/verify", type: "default" },
      { id: "anti_replay", label: "Check 60s Window & SHA256 Code Match", type: "danger" },
      { id: "replay_reject", label: "Reject: 2FA Code Already Used", type: "danger" },
      { id: "backup_code", label: "Backup Code Used? Consume One-Time Code", type: "warning" },
      { id: "issue_jwt", label: "Issue Final JWT Access & Refresh Tokens", type: "success" },
    ],
    connections: [
      { from: "gate_start", to: "tenant_status" },
      { from: "tenant_status", to: "tenant_blocked", label: "Yes" },
      { from: "tenant_status", to: "pw_expiry", label: "No" },
      { from: "pw_expiry", to: "mcp_active", label: "Yes" },
      { from: "mcp_active", to: "check_2fa" },
      { from: "pw_expiry", to: "check_2fa", label: "No" },
      { from: "check_2fa", to: "issue_jwt", label: "No" },
      { from: "check_2fa", to: "temp_token", label: "Yes" },
      { from: "temp_token", to: "verify_2fa" },
      { from: "verify_2fa", to: "anti_replay" },
      { from: "anti_replay", to: "replay_reject", label: "Replayed" },
      { from: "anti_replay", to: "backup_code", label: "Not Replayed" },
      { from: "backup_code", to: "issue_jwt", label: "Valid OTP/Backup" },
    ],
  },

  // — Multi-Workspace Login Discovery
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.workspaceTitle",
    id: "workspace-discovery",
  },
  { type: "paragraph", contentKey: "features.authentication.workspaceIntro" },
  {
    type: "table",
    headers: ["Case", "Condition", "Behavior"],
    rows: [
      [
        "Case A — Tenant-Scoped",
        "tenantId is provided",
        "Strict domain isolation. Decrypts TenantId and queries exclusively for the admin in that tenant.",
      ],
      [
        "Case A' — Platform Admin",
        "isPlatformAdmin = true",
        "Bypasses workspace discovery. Queries for TenantId = null (platform level) to prevent workspace picker infinite loop.",
      ],
      [
        "Case B — Discovery",
        "No tenantId, not isPlatformAdmin",
        "Step 1: Check for platform admin. Step 2: Search all tenants by email. 0 matches -> invalid, 1 match -> direct login, N matches -> return workspace selection list.",
      ],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "features.authentication.workspaceNote",
  },

  // — OIDC/SSO Callback Flow
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.ssoCallbackTitle",
    id: "sso-callback-flow",
  },
  { type: "paragraph", contentKey: "features.authentication.ssoCallbackIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "SSO Callback & Selection Cache",
    code: `// Temporary selection cache setup in OIDC Callback:
var token = Guid.NewGuid().ToString("N");
await _cache.SetAsync($"sso-login-selection:{token}", new SsoTempLoginData
{
    Email = email,
    Provider = provider
}, TimeSpan.FromMinutes(10));

// Complete Workspace Selection command handler:
var loginData = await _cache.GetAsync<SsoTempLoginData>($"sso-login-selection:{request.Token}");
var targetTenantId = _idEncryption.Decrypt(request.TenantId);
var admin = allMatchingAdmins.FirstOrDefault(a => a.IsActive && a.TenantId == targetTenantId);`,
  },

  // — Password Expiry Enforcement
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.passwordExpiryTitle",
    id: "password-expiry",
  },
  { type: "paragraph", contentKey: "features.authentication.passwordExpiryIntro" },

  // — MustChangePassword Middleware
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.mcpMiddlewareTitle",
    id: "mcp-middleware",
  },
  { type: "paragraph", contentKey: "features.authentication.mcpMiddlewareIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "MustChangePasswordMiddleware.cs Whitelist Enforcement",
    code: `public async Task InvokeAsync(HttpContext context)
{
    if (context.User.Identity?.IsAuthenticated == true)
    {
        var mcpClaim = context.User.FindFirst("mcp")?.Value;
        if (mcpClaim == "true")
        {
            var path = context.Request.Path.Value ?? "";
            var isAllowed = AllowedPatterns.Any(pattern => pattern.IsMatch(path));

            if (!isAllowed)
            {
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\\"error\\":\\"Password change required.\\",\\"code\\":\\"MustChangePassword\\"}");
                return;
            }
        }
    }
    await _next(context);
}`,
  },

  // — SSO Tenant Suspension Gate
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.ssoSuspensionTitle",
    id: "sso-suspension-gate",
  },
  { type: "paragraph", contentKey: "features.authentication.ssoSuspensionIntro" },
  {
    type: "info",
    variant: "warning",
    contentKey: "features.authentication.ssoSuspensionWarning",
  },

  // — JWT Token Configuration & Validation
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.jwtTitle",
    id: "jwt-config",
  },
  { type: "paragraph", contentKey: "features.authentication.jwtIntro" },
  {
    type: "table",
    headers: ["Token Type", "Lifetime", "Storage", "Rotation / Purpose"],
    rows: [
      ["Access Token (JWT)", "15 minutes", "Memory / Cookie", "Refreshed automatically"],
      ["Refresh Token", "7 days", "HttpOnly Cookie", "Rotated on each use (one-time use)"],
      ["2FA Temporary Token", "5 minutes", "Memory", "Discarded after 2FA verification"],
    ],
  },
  {
    type: "heading",
    level: 3,
    titleKey: "features.authentication.tokenValidationTitle",
    id: "token-validation-pipeline",
  },
  { type: "paragraph", contentKey: "features.authentication.tokenValidationIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "JwtBearerEvents.OnTokenValidated Pipeline Enforcement",
    code: `OnTokenValidated = async context =>
{
    var idClaim = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var isAdmin = context.Principal?.FindFirst("admin")?.Value == "true";

    if (string.IsNullOrEmpty(idClaim) || !Guid.TryParse(idClaim, out var id))
    {
        context.Fail("Invalid token: missing or invalid ID claim");
        return;
    }

    using var scope = context.HttpContext.RequestServices.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();

    if (isAdmin)
    {
        var admin = await dbContext.Admins
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, context.HttpContext.RequestAborted);

        if (admin == null || !admin.IsActive)
        {
            context.Fail("Admin no longer exists or is inactive");
        }
    }
    else
    {
        var user = await dbContext.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, context.HttpContext.RequestAborted);

        if (user == null || !user.IsActive)
        {
            context.Fail("User no longer exists or is inactive");
        }
    }
}`,
  },

  // — Dual Authentication (Admin & User)
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.dualAuthTitle",
    id: "dual-auth",
  },
  { type: "paragraph", contentKey: "features.authentication.dualAuthIntro" },
  {
    type: "table",
    headers: ["Dimension", "Admin Authentication", "User (Client) Authentication"],
    rows: [
      ["API Route Prefix", "/api/v1/auth/admin", "/api/v1/auth/user"],
      ["Controller File", "AdminAuthController.cs", "UserAuthController.cs"],
      ["Primary Command", "AdminLoginCommand", "UserLoginCommand"],
      ["Domain Entity", "Admin", "User"],
      ["Token Claims", "Sub (Id), Username, TenantId, HierarchyPath, MCP", "Sub (Id), Username, TenantId"],
      ["Permission Scheme", "Server-side cache IAdminPermissionCache", "Lean JWT (implied tenant scopes, no cache)"],
      ["2FA Support", "Yes (TOTP + Backup Codes)", "Yes (TOTP + Backup Codes)"],
      ["Lockout Policy", "5 attempts / 15 min lockout", "5 attempts / 15 min lockout"],
    ],
  },

  // — Admin Entity
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.adminEntityTitle",
    id: "admin-entity",
  },
  { type: "paragraph", contentKey: "features.authentication.adminEntityIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Purpose"],
    rows: [
      ["IsSuperAdmin", "bool", "System-level access, bypasses tenant scoping"],
      ["IsProtected", "bool", "Cannot be deleted, deactivated, or demoted (Guardian enforced)"],
      ["IsLastSuperAdminInTenant", "bool", "Safety flag; blocks deletion/deactivation if true"],
      ["PasswordLastChanged", "DateTime?", "Checked against TenantSettings.PasswordExpiryDays for rotation"],
      ["UsernameLastChanged", "DateTime?", "30-day cooldown on username changes"],
      ["IsTwoFactorEnabled", "bool", "Whether 2FA is active for this admin"],
      ["TwoFactorSecret", "string?", "Secret key for TOTP generation"],
      ["BackupCodesJson", "string?", "JSON array of hashed backup codes"],
      ["LastTwoFactorCodeUsed", "string?", "Anti-replay: hash of last OTP code used"],
      ["LastTwoFactorCodeUsedAt", "DateTime?", "Anti-replay: timestamp of last OTP use"],
      ["FailedLoginAttempts", "int", "Counter for lockout threshold"],
      ["LockoutEnd", "DateTime?", "When lockout expires"],
    ],
  },

  // — 2FA / TOTP Anti-Replay
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.antiReplayTitle",
    id: "two-factor-deep",
  },
  { type: "paragraph", contentKey: "features.authentication.antiReplayIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "CheckAndTrackTotpReplay Implementation",
    code: `public bool CheckAndTrackTotpReplay(string code, Func<string, string> hashCode)
{
    var hashedCode = hashCode(code);
    if (LastTwoFactorCodeUsedAt.HasValue)
    {
        var timeSinceLastUse = DateTime.UtcNow - LastTwoFactorCodeUsedAt.Value;
        if (timeSinceLastUse.TotalSeconds < 60 && LastTwoFactorCodeUsed == hashedCode)
        {
            return false; // Code replayed within the 60-second window
        }
    }

    LastTwoFactorCodeUsed = hashedCode;
    LastTwoFactorCodeUsedAt = DateTime.UtcNow;
    return true;
}`,
  },

  // — Password Policy
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.passwordPolicyTitle",
    id: "password-policy",
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

  // — Admin Auth Endpoints
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.endpointsAdminTitle",
    id: "admin-auth-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/admin/login",
        descriptionKey: "Username + password login with discovery option",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/refresh",
        descriptionKey: "Rotate refresh token and issue new JWT",
        auth: "Refresh Token",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/discover-workspaces",
        descriptionKey: "Discover all workspaces associated with email",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/logout",
        descriptionKey: "Revoke current refresh token and clear session",
        auth: "Public",
      },
      {
        method: "GET",
        path: "/api/v1/auth/admin/sessions",
        descriptionKey: "List all active sessions for current admin",
        auth: "JWT",
      },
      {
        method: "DELETE",
        path: "/api/v1/auth/admin/sessions/{tokenId}",
        descriptionKey: "Revoke specific active session by ID",
        auth: "JWT",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/sessions/revoke-all",
        descriptionKey: "Revoke all sessions except the current one",
        auth: "JWT",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/2fa/enable",
        descriptionKey: "Generate TOTP secret and QR code for activation",
        auth: "JWT",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/2fa/confirm",
        descriptionKey: "Confirm 2FA setup by verifying code from authenticator",
        auth: "JWT",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/2fa/verify",
        descriptionKey: "Verify 2FA code during login process",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/2fa/disable",
        descriptionKey: "Disable 2FA for the account",
        auth: "JWT",
      },
      {
        method: "POST",
        path: "/api/v1/auth/admin/2fa/backup-codes/regenerate",
        descriptionKey: "Regenerate a new set of backup codes",
        auth: "JWT",
      },
      {
        method: "GET",
        path: "/api/v1/auth/admin/security-log",
        descriptionKey: "Get security activity log for the current admin",
        auth: "JWT",
      },
    ],
  },

  // — User Auth Endpoints
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.endpointsUserTitle",
    id: "user-auth-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/auth/user/login",
        descriptionKey: "Email/phone + password login",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/login/{provider}",
        descriptionKey: "External provider login (Google, Facebook, Apple, Microsoft)",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/register",
        descriptionKey: "Self-registration using TenantCode",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/verify-email",
        descriptionKey: "Verify email address with OTP code",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/verify-phone",
        descriptionKey: "Verify phone number with OTP code",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/send-email-verification",
        descriptionKey: "Send or resend email verification OTP",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/send-phone-verification",
        descriptionKey: "Send or resend phone verification OTP",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/request-password-reset",
        descriptionKey: "Request password reset via email OTP",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/reset-password",
        descriptionKey: "Reset password using OTP code",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/refresh",
        descriptionKey: "Rotate refresh token and issue new JWT",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/user/logout",
        descriptionKey: "Revoke current refresh token and log out",
        auth: "JWT",
      },
    ],
  },

  // — Rate Limiting Policies
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.rateLimitingTitle",
    id: "rate-limiting",
  },
  { type: "paragraph", contentKey: "features.authentication.rateLimitingIntro" },
  {
    type: "table",
    headers: ["Policy Name", "Window Type", "Limit Threshold", "Scope / Partition Key"],
    rows: [
      ["Global", "Fixed Window", "1000 requests per minute", "Server-wide global DDoS ceiling"],
      ["PerIp", "Fixed Window", "200 requests per minute", "Client IP Address"],
      ["Login", "Fixed Window", "10 requests per 5 minutes", "Brute-force protection: login:{IP}"],
      ["read-api", "Sliding Window", "200 requests per minute", "Infinite loop/scraping protection: read:{UserId/IP}"],
      ["mutation-api", "Sliding Window", "30 requests per minute", "Automated modification abuse: mutation:{UserId/IP}"],
      ["per-user", "Sliding Window", "100 requests per minute", "User-session activity ceiling: user:{UserId/IP}"],
      ["export-heavy", "Fixed Window", "5 requests per minute", "High CPU reports/exports: export:{UserId/IP}"],
      ["webhook", "Sliding Window", "500 requests per minute", "Webhook delivery burster: webhook:{IP}"],
      ["signup", "Fixed Window", "3 requests per hour", "Registration/Tenant creation spam: signup:{IP}"],
      ["phone-otp-send", "Fixed Window", "3 requests per 15 minutes", "SMS billing bombing prevention: phone-otp:{IP}"],
      ["passkey-auth", "Fixed Window", "5 requests per 15 minutes", "WebAuthn brute-force protection: passkey:{IP}"],
      ["qr-poll", "Sliding Window", "60 requests per minute", "Session polling limits: qr-poll:{IP}"],
      ["password-reset", "Fixed Window", "5 requests per 15 minutes", "Recovery enumeration protection: password-reset:{IP}"],
      ["token-refresh", "Sliding Window", "20 requests per minute", "Refresh farming prevention: token-refresh:{IP}"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "features.authentication.lockoutPolicyTitle",
    id: "lockout-policy-section",
  },
  { type: "paragraph", contentKey: "features.authentication.lockoutPolicyIntro" },
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
  relatedSlugs: [
    "features/role-permissions",
    "features/audit-system",
    "security/authentication-deep",
  ],
  lastUpdated: "2026-06-28",
});
