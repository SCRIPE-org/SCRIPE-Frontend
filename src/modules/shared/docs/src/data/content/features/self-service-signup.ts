import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.selfServiceSignup.intro" },

  // Flowchart: Self-Service Tenant Onboarding Saga
  {
    type: "heading",
    level: 2,
    titleKey: "features.selfServiceSignup.flowTitle",
    id: "signup-saga-flow",
  },
  {
    type: "flowchart",
    title: "Self-Service Tenant Onboarding Saga",
    direction: "vertical",
    nodes: [
      { id: "start", label: "POST /api/v1/auth/signup/self-service", type: "default" },
      { id: "verify_token", label: "Verify Signed OTP Verification Token", type: "warning" },
      { id: "check_subdomain", label: "Validate Subdomain Uniqueness & Format", type: "info" },
      {
        id: "provision_tenant",
        label: "Provision Tenant, Auto-Domain & Eager Settings",
        type: "primary",
      },
      {
        id: "scaffold_roles",
        label: "Scaffold Tenant Super Admin & Default Roles",
        type: "primary",
      },
      { id: "create_owner", label: "Create Owner Admin User (Pre-Activated)", type: "primary" },
      { id: "resolve_mode", label: "Resolve Checkout Mode from EditionId", type: "info" },
      { id: "mode_free", label: "Checkout Mode: Free?", type: "info" },
      { id: "free_active", label: "Generate JWT & Prime Permission Cache", type: "success" },
      { id: "trial_paid", label: "Checkout Mode: Trial / Paid?", type: "info" },
      { id: "create_session", label: "Create SignupSession (AwaitingPayment)", type: "warning" },
      {
        id: "init_stripe",
        label: "Dispatch AssignEditionSelfService (Stripe Connect)",
        type: "warning",
      },
      { id: "stripe_ok", label: "Stripe Session Created?", type: "info" },
      {
        id: "attach_checkout",
        label: "Attach Session to SignupSession & Return URL",
        type: "success",
      },
      { id: "compensate", label: "Abandon Signup Session (Compensate Phase 1)", type: "danger" },
    ],
    connections: [
      { from: "start", to: "verify_token" },
      { from: "verify_token", to: "check_subdomain" },
      { from: "check_subdomain", to: "provision_tenant" },
      { from: "provision_tenant", to: "scaffold_roles" },
      { from: "scaffold_roles", to: "create_owner" },
      { from: "create_owner", to: "resolve_mode" },
      { from: "resolve_mode", to: "mode_free" },
      { from: "mode_free", to: "free_active", label: "Yes (Free)" },
      { from: "mode_free", to: "trial_paid", label: "No" },
      { from: "trial_paid", to: "create_session", label: "Yes (Trial/Paid)" },
      { from: "create_session", to: "init_stripe" },
      { from: "init_stripe", to: "stripe_ok" },
      { from: "stripe_ok", to: "attach_checkout", label: "Yes" },
      { from: "stripe_ok", to: "compensate", label: "No (Stripe Fail)" },
    ],
  },

  // Section 2: Phase 1 — Identity Provisioning Transaction
  {
    type: "heading",
    level: 2,
    titleKey: "features.selfServiceSignup.phase1Title",
    id: "phase1-identity",
  },
  { type: "paragraph", contentKey: "features.selfServiceSignup.phase1Intro" },
  {
    type: "code",
    language: "csharp",
    code: `// Provisioning entities dynamically within RegisterTenantSelfServiceCommandHandler
await _unitOfWork.ExecuteInTransactionAsync(async (cancellationToken) =>
{
    // 1. Create Tenant
    var tenant = new Tenant
    {
        Id = tenantId,
        Name = request.WorkspaceName.Trim(),
        Code = tenantCode,
        IsActive = true,
        HierarchyLevel = 0,
        HierarchyPath = "/"
    };
    await _tenantRepository.AddAsync(tenant, cancellationToken);

    // 2. Provision TenantDomain (subdomain.platform.com)
    var autoDomain = new TenantDomain
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        Domain = $"\\{subdomain}.\\{platformDomain}",
        Type = "auto",
        IsPrimary = true,
        IsVerified = true,
        VerifiedAt = DateTime.UtcNow
    };
    tenant.Domains.Add(autoDomain);

    // 3. Eagerly provision TenantSettings (prevents null reference issues)
    var tenantSettings = new TenantSettings { Id = Guid.NewGuid(), TenantId = tenantId };
    tenant.Settings = tenantSettings;

    // 4. Create Roles
    var superAdminRole = new Role
    {
        Id = superAdminRoleId,
        Code = $"\\{tenantCode}_SUPER_ADMIN",
        NameEn = $"\\{request.WorkspaceName} Super Admin",
        TenantId = tenantId,
        Priority = 1,
        IsSystem = true,
        IsTenantSuperAdmin = true,
        IsPermissionLocked = false // UNLOCKED for subsequent feature assignment
    };
    await _roleRepository.AddAsync(superAdminRole, cancellationToken);

    // 5. Create pre-activated Owner user
    var admin = new Admin
    {
        Id = adminId,
        Username = $"\\{tenantCode}_\\{resolvedUsername}",
        PasswordHash = _passwordHasher.Hash(request.Password),
        Email = email,
        TenantId = tenantId,
        IsActive = true,
        IsAccountActivated = true // Pre-verified via OTP
    };
    admin.AdminRoles.Add(new AdminRole { RoleId = superAdminRoleId, TenantId = tenantId });
    await _adminRepository.AddAsync(admin, cancellationToken);

    await _unitOfWork.SaveChangesAsync(cancellationToken);
});`,
  },

  // Section 3: Subdomain Constraints & Safety List
  {
    type: "heading",
    level: 2,
    titleKey: "features.selfServiceSignup.validationTitle",
    id: "subdomain-validation",
  },
  { type: "paragraph", contentKey: "features.selfServiceSignup.validationIntro" },
  {
    type: "table",
    headers: [
      "features.selfServiceSignup.tableConstraint",
      "features.selfServiceSignup.tableRule",
      "features.selfServiceSignup.tableReason",
    ],
    rows: [
      [
        "Subdomain Format",
        "lowercase alphanumeric, hyphens allowed, length 3-63 chars",
        "Standard DNS routing compliance",
      ],
      [
        "Reserved Subdomains",
        "api, admin, portal, studio, dev, system, auth, scripe, blog",
        "Prevents phishing and routing conflicts",
      ],
      [
        "Database Uniqueness",
        "Case-insensitive check against Tenant.Code (subdomain in uppercase)",
        "Ensures absolute isolation and distinct workspaces",
      ],
    ],
  },

  // Section 4: Email Verification Ticket Validation
  {
    type: "heading",
    level: 2,
    titleKey: "features.selfServiceSignup.emailVerificationTitle",
    id: "email-verification",
  },
  { type: "paragraph", contentKey: "features.selfServiceSignup.emailVerificationIntro" },
  {
    type: "code",
    language: "csharp",
    code: `// HMAC-SHA256 Token Signature Validation
public static bool ValidateVerificationToken(string token, string email, string secret)
{
    if (string.IsNullOrEmpty(token) || !token.Contains('.')) return false;
    var parts = token.Split('.');
    if (parts.Length != 3) return false;

    var payload = parts[0]; // base64url(email + ":" + expires)
    var signature = parts[1]; // base64url(HMAC-SHA256)

    // Verify token expiry (TTL 15 minutes)
    var decodedPayload = Encoding.UTF8.GetString(Base64UrlDecode(payload));
    var payloadParts = decodedPayload.Split(':');
    if (payloadParts.Length != 2 || payloadParts[0] != email) return false;

    if (!long.TryParse(payloadParts[1], out var expiryTicks) || DateTime.UtcNow.Ticks > expiryTicks)
    {
        return false; // Expired
    }

    // Verify cryptographic signature integrity
    var expectedSig = GenerateHmacSignature(payload, secret);
    return CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(signature),
        Encoding.UTF8.GetBytes(expectedSig)
    );
}`,
  },

  // Section 5: Phase 2 — Entitlements & Stripe Checkout Compensation
  {
    type: "heading",
    level: 2,
    titleKey: "features.selfServiceSignup.phase2Title",
    id: "phase2-entitlements",
  },
  { type: "paragraph", contentKey: "features.selfServiceSignup.phase2Intro" },
  {
    type: "info",
    variant: "warning",
    contentKey: "features.selfServiceSignup.compensationWarning",
  },
];

registerPage({
  slug: "features/self-service-signup",
  titleKey: "features.selfServiceSignup.title",
  descriptionKey: "features.selfServiceSignup.description",
  category: "features",
  order: 22,
  sections,
  relatedSlugs: [
    "features/authentication",
    "features/multi-tenancy",
    "modules/entitlements/entitlements-overview",
  ],
  lastUpdated: "2026-06-28",
});
