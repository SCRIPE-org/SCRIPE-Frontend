import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
      { type: "paragraph", contentKey: "security.dataProtection.intro" },

      // ─── Tenant Isolation ─────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.dataProtection.tenantIsolationTitle", id: "tenant-isolation",
      },
      { type: "paragraph", contentKey: "security.dataProtection.tenantIsolationIntro" },
      {
            type: "flowchart",
            title: "Multi-Layer Tenant Isolation",
            direction: "vertical",
            nodes: [
                  { id: "req", label: "Incoming Request", type: "primary" },
                  { id: "jwt", label: "JWT tenant_id Claim", type: "info", description: "Extracted by TenantContextMiddleware" },
                  { id: "scope", label: "IDataScopeService", type: "warning", description: "Sets current tenant context" },
                  { id: "filter", label: "EF Global Query Filter", type: "success", description: "WHERE TenantId = @currentTenantId" },
                  { id: "data", label: "Tenant-Scoped Data Only", type: "success" },
            ],
            connections: [
                  { from: "req", to: "jwt" },
                  { from: "jwt", to: "scope" },
                  { from: "scope", to: "filter" },
                  { from: "filter", to: "data" },
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "TenantContextMiddleware.cs",
            code: `/// <summary>
/// Extracts tenant_id from JWT claims and sets it in IDataScopeService.
/// All subsequent DB queries are automatically scoped to this tenant.
/// </summary>
public class TenantContextMiddleware
{
    public async Task InvokeAsync(HttpContext context, IDataScopeService dataScopeService)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantClaim = context.User.FindFirst("tenant_id");
            if (tenantClaim != null && Guid.TryParse(tenantClaim.Value, out var tenantId))
            {
                dataScopeService.SetCurrentTenant(tenantId);
            }
        }

        await _next(context);
    }
}`,
            highlightLines: [11, 12, 13, 14],
      },
      {
            type: "code",
            language: "csharp",
            filename: "DataScopeService — Scoping Mechanism",
            code: `public class DataScopeService : IDataScopeService
{
    private Guid? _currentTenantId;

    public Guid? CurrentTenantId => _currentTenantId;

    public void SetCurrentTenant(Guid tenantId)
        => _currentTenantId = tenantId;

    // Used by EF Core global query filter
    public Expression<Func<T, bool>> GetTenantFilter<T>()
        where T : ITenantAwareEntity
    {
        var tenantId = _currentTenantId
            ?? throw new UnauthorizedAccessException("No tenant context");
        return entity => entity.TenantId == tenantId;
    }
}`,
            highlightLines: [10, 11, 12, 13, 14, 15],
      },
      {
            type: "info",
            variant: "danger",
            contentKey: "security.dataProtection.bypassWarning",
      },

      // ─── ID Encryption ────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.dataProtection.idEncryptionTitle", id: "id-encryption",
      },
      { type: "paragraph", contentKey: "security.dataProtection.idEncryptionIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "IdEncryptionService.cs",
            code: `/// <summary>
/// Obfuscates internal Guid IDs for external API responses.
/// Prevents enumeration attacks (incrementing IDs to discover resources).
/// Uses AES encryption with a per-tenant key.
/// </summary>
public class IdEncryptionService : IIdEncryptionService
{
    public string Encrypt(Guid id)
    {
        var bytes = id.ToByteArray();
        var encrypted = _aes.Encrypt(bytes);
        return Base64UrlEncoder.Encode(encrypted);
        // Output: "dGhpcyBpcyBhIHRlc3Q" (URL-safe, no padding)
    }

    public Guid Decrypt(string encryptedId)
    {
        var bytes = Base64UrlEncoder.Decode(encryptedId);
        var decrypted = _aes.Decrypt(bytes);
        return new Guid(decrypted);
    }
}`,
      },

      // ─── Restricted Fields ────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.dataProtection.restrictedFieldsTitle", id: "restricted-fields",
      },
      { type: "paragraph", contentKey: "security.dataProtection.restrictedFieldsIntro" },
      {
            type: "code",
            language: "csharp",
            filename: "RestrictedFieldsAuthorizationFilter.cs",
            code: `/// <summary>
/// ASP.NET Core authorization filter that checks if the current user's role
/// has permission to view specific fields in the response.
/// Fields are configured per-role in the RolePermission entity.
/// </summary>
public class RestrictedFieldsAuthorizationFilter : IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var roleId = context.HttpContext.User.FindFirst("role_id")?.Value;
        if (roleId is null) return;

        var restrictedFields = await _rolePermRepo
            .GetRestrictedFieldsAsync(Guid.Parse(roleId));

        if (restrictedFields.Any())
        {
            // Store in HttpContext.Items for response serializer
            context.HttpContext.Items["RestrictedFields"] = restrictedFields;
        }
    }
}

// In response serialization:
// Fields listed in RestrictedFields are replaced with "***" or omitted`,
      },

      // ─── Tenant Security Services ─────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.dataProtection.tenantServicesTitle", id: "tenant-services",
      },
      { type: "paragraph", contentKey: "security.dataProtection.tenantServicesIntro" },
      {
            type: "table",
            headers: ["Service", "Purpose", "Key Methods"],
            rows: [
                  ["ITenantGuardianService", "Validates tenant hierarchy operations", "ValidateHierarchy(), CanAccessChild(), CanCreateSubTenant()"],
                  ["ITenantQuotaService", "Enforces resource limits per tenant", "CheckAdminQuota(), CheckUserQuota(), CheckStorageQuota()"],
                  ["ITenantPasswordValidator", "Tenant-level password policy enforcement", "ValidateAsync() — checks min length, complexity, history"],
                  ["IAdminSecurityService", "Protected admin operations", "IsProtected(), CanTransfer(), ValidateTransfer()"],
            ],
      },
      {
            type: "code",
            language: "csharp",
            filename: "TenantGuardianService — Hierarchy Validation",
            code: `public class TenantGuardianService : ITenantGuardianService
{
    /// <summary>
    /// Validates that a tenant operation doesn't violate hierarchy rules:
    /// - Cannot create circular parent references
    /// - Cannot delete a tenant with active children
    /// - Cannot move a tenant under its own descendant
    /// </summary>
    public async Task<Result> ValidateHierarchy(
        Guid tenantId, Guid? newParentId, CancellationToken ct)
    {
        if (newParentId is null) return Result.Success();

        // Check for circular reference
        var ancestors = await GetAllAncestorsAsync(newParentId.Value, ct);
        if (ancestors.Contains(tenantId))
            return Result.Failure(new AppError(
                "Tenant.CircularReference",
                "Cannot set a descendant as parent — circular reference"
            ));

        return Result.Success();
    }
}`,
            highlightLines: [15, 16, 17, 18, 19],
      },

      // ─── Data at Rest ─────────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.dataProtection.dataAtRestTitle", id: "data-at-rest",
      },
      { type: "paragraph", contentKey: "security.dataProtection.dataAtRestIntro" },
      {
            type: "table",
            headers: ["Data Type", "Protection", "Where"],
            rows: [
                  ["Passwords", "BCrypt (work factor 12)", "Database"],
                  ["OTP Codes", "BCrypt hashed (never stored plaintext)", "Database"],
                  ["Refresh Tokens", "SHA-256 hashed", "Database"],
                  ["2FA Secrets", "AES-256 encrypted", "Database"],
                  ["Backup Codes", "BCrypt hashed individually", "Database"],
                  ["JWT Signing Key", "HMAC-SHA256 or RSA key", "appsettings (env var in prod)"],
                  ["Connection Strings", "DPAPI or Azure Key Vault", "appsettings / env vars"],
                  ["File Uploads", "Tenant-scoped paths + ACL", "Blob Storage"],
            ],
      },

      // ─── Data in Transit ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.dataProtection.dataInTransitTitle", id: "data-in-transit",
      },
      { type: "paragraph", contentKey: "security.dataProtection.dataInTransitIntro" },
      {
            type: "list",
            variant: "unordered",
            items: [
                  "HTTPS enforced via HSTS (Strict-Transport-Security: max-age=31536000)",
                  "TLS 1.2+ required — older protocols rejected",
                  "Certificate pinning supported for mobile clients",
                  "SignalR WebSocket connections use WSS (encrypted WebSocket)",
                  "Inter-service communication uses mTLS in Kubernetes",
                  "Cookie attributes: Secure, HttpOnly, SameSite=Strict",
            ],
      },

      // ─── GDPR Compliance ──────────────────────────────────────
      {
            type: "heading", level: 2,
            titleKey: "security.dataProtection.gdprTitle", id: "gdpr",
      },
      { type: "paragraph", contentKey: "security.dataProtection.gdprIntro" },
      {
            type: "feature-grid",
            columns: 3,
            items: [
                  { icon: "🗑️", titleKey: "security.dataProtection.rightToDeleteTitle", descriptionKey: "security.dataProtection.rightToDeleteDesc" },
                  { icon: "📋", titleKey: "security.dataProtection.dataPortabilityTitle", descriptionKey: "security.dataProtection.dataPortabilityDesc" },
                  { icon: "🔒", titleKey: "security.dataProtection.consentTitle", descriptionKey: "security.dataProtection.consentDesc" },
                  { icon: "📊", titleKey: "security.dataProtection.auditTrailTitle", descriptionKey: "security.dataProtection.auditTrailDesc" },
                  { icon: "🏢", titleKey: "security.dataProtection.tenantScopingTitle", descriptionKey: "security.dataProtection.tenantScopingDesc" },
                  { icon: "⏰", titleKey: "security.dataProtection.retentionTitle", descriptionKey: "security.dataProtection.retentionDesc" },
            ],
      },
];

registerPage({
      slug: "security/data-protection",
      titleKey: "security.dataProtection.title",
      descriptionKey: "security.dataProtection.description",
      category: "security",
      order: 3,
      sections,
      relatedSlugs: ["security/overview", "security/authentication-deep", "security/audit-compliance"],
      lastUpdated: "2026-02-20",
});
