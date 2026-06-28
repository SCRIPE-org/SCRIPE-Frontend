// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "security.dataProtection.intro" },

  // ─── Tenant Isolation ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.dataProtection.tenantIsolationTitle",
    id: "tenant-isolation",
  },
  { type: "paragraph", contentKey: "security.dataProtection.tenantIsolationIntro" },
  {
    type: "flowchart",
    title: "Multi-Layer Tenant Isolation",
    direction: "vertical",
    nodes: [
      { id: "req", label: "Incoming Request", type: "primary" },
      {
        id: "jwt",
        label: "JWT tenant_id Claim",
        type: "info",
        description: "Extracted by TenantContextMiddleware",
      },
      {
        id: "scope",
        label: "IDataScopeService",
        type: "warning",
        description: "Sets current tenant context",
      },
      {
        id: "filter",
        label: "EF Global Query Filter",
        type: "success",
        description: "WHERE TenantId = @currentTenantId",
      },
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
    type: "heading",
    level: 2,
    titleKey: "security.dataProtection.idEncryptionTitle",
    id: "id-encryption",
  },
  { type: "paragraph", contentKey: "security.dataProtection.idEncryptionIntro" },
  {
    type: "flowchart",
    title: "ID Encryption & Decryption Pipeline",
    direction: "horizontal",
    nodes: [
      { id: "guid", label: "Guid ID (16B)", type: "default" },
      {
        id: "enc",
        label: "IdEncryptionService",
        type: "primary",
        description: "AES-GCM Authenticated Encryption",
      },
      { id: "nonce", label: "Random Nonce (12B)", type: "info" },
      { id: "wire", label: "Wire Format: [Nonce 12B][Tag 16B][Ciphertext]", type: "warning" },
      { id: "b64", label: "Base64Url Encoding", type: "success" },
      { id: "ext", label: "URL-Safe String ID", type: "success" },
    ],
    connections: [
      { from: "guid", to: "enc" },
      { from: "nonce", to: "enc" },
      { from: "enc", to: "wire" },
      { from: "wire", to: "b64" },
      { from: "b64", to: "ext" },
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "IdEncryptionService.cs",
    code: `/// <summary>
/// AES-GCM authenticated encryption service for IDs.
/// Encrypts Guid and int IDs to URL-safe base64 strings.
///
/// Uses AES-GCM (Galois/Counter Mode) which provides both confidentiality
/// and integrity — immune to padding oracle attacks unlike AES-CBC.
///
/// Wire format: [Nonce 12B][Tag 16B][Ciphertext]
/// </summary>
public sealed class IdEncryptionService : IIdEncryptionService
{
    private const int NonceSize = 12; // AES-GCM standard nonce size
    private const int TagSize = 16;   // AES-GCM standard tag size
    private readonly byte[] _key;     // 32-byte key derived from config

    public IdEncryptionService(IOptions<IdEncryptionOptions> options, IHostEnvironment? environment = null)
    {
        var keyString = options.Value.Key;
        var minLength = options.Value.MinimumKeyLength; // Min 32 chars
        
        // Startup safety checks - fail-closed model
        if (string.IsNullOrWhiteSpace(keyString) || keyString.Length < minLength)
            throw new InvalidOperationException("Key is missing or too weak.");

        // Rejects placeholder keys ("change-this") in Production environments
        if (options.Value.RejectPlaceholderKeysInProduction && environment?.IsProduction() == true && IsPlaceholder(keyString))
            throw new InvalidOperationException("Do not use placeholders in production!");

        _key = Encoding.UTF8.GetBytes(keyString[..32]);
    }

    public string Encrypt(Guid id)
    {
        var plainBytes = id.ToByteArray();
        var nonce = new byte[NonceSize];
        RandomNumberGenerator.Fill(nonce);

        var ciphertext = new byte[plainBytes.Length];
        var tag = new byte[TagSize];

        using var aesGcm = new AesGcm(_key, TagSize);
        aesGcm.Encrypt(nonce, plainBytes, ciphertext, tag);

        // Combined wire format: [nonce][tag][ciphertext]
        var combined = new byte[NonceSize + TagSize + ciphertext.Length];
        Buffer.BlockCopy(nonce, 0, combined, 0, NonceSize);
        Buffer.BlockCopy(tag, 0, combined, NonceSize, TagSize);
        Buffer.BlockCopy(ciphertext, 0, combined, NonceSize + TagSize, ciphertext.Length);

        return Convert.ToBase64String(combined).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }

    public Guid Decrypt(string encryptedId)
    {
        var combined = Convert.FromBase64String(encryptedId.Replace('-', '+').Replace('_', '/') + GetPadding(encryptedId));
        if (combined.Length < NonceSize + TagSize)
            throw new CryptographicException("Ciphertext is too short.");

        var nonce = new byte[NonceSize];
        var tag = new byte[TagSize];
        var ciphertext = new byte[combined.Length - NonceSize - TagSize];

        Buffer.BlockCopy(combined, 0, nonce, 0, NonceSize);
        Buffer.BlockCopy(combined, NonceSize, tag, 0, TagSize);
        Buffer.BlockCopy(combined, NonceSize + TagSize, ciphertext, 0, ciphertext.Length);

        var plaintext = new byte[ciphertext.Length];
        using var aesGcm = new AesGcm(_key, TagSize);
        aesGcm.Decrypt(nonce, ciphertext, tag, plaintext);

        return new Guid(plaintext);
    }
}`,
  },

  // ─── Restricted Fields ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.dataProtection.restrictedFieldsTitle",
    id: "restricted-fields",
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
    type: "heading",
    level: 2,
    titleKey: "security.dataProtection.tenantServicesTitle",
    id: "tenant-services",
  },
  { type: "paragraph", contentKey: "security.dataProtection.tenantServicesIntro" },
  {
    type: "table",
    headers: ["Service", "Purpose", "Key Methods"],
    rows: [
      [
        "ITenantGuardianService",
        "Validates tenant hierarchy operations",
        "ValidateHierarchy(), CanAccessChild(), CanCreateSubTenant()",
      ],
      [
        "ITenantQuotaService",
        "Enforces resource limits per tenant",
        "CheckAdminQuota(), CheckUserQuota(), CheckStorageQuota()",
      ],
      [
        "ITenantPasswordValidator",
        "Tenant-level password policy enforcement",
        "ValidateAsync() — checks min length, complexity, history",
      ],
      [
        "IAdminSecurityService",
        "Protected admin operations",
        "IsProtected(), CanTransfer(), ValidateTransfer()",
      ],
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
    type: "heading",
    level: 2,
    titleKey: "security.dataProtection.dataAtRestTitle",
    id: "data-at-rest",
  },
  { type: "paragraph", contentKey: "security.dataProtection.dataAtRestIntro" },
  {
    type: "flowchart",
    title: "Database Column Level Encryption & Hashing Architecture",
    direction: "vertical",
    nodes: [
      { id: "inp", label: "Sensitive Inputs", type: "default" },
      { id: "pwd", label: "Passwords / Backup Codes", type: "info" },
      { id: "ref", label: "Refresh Tokens", type: "info" },
      { id: "secret", label: "OIDC Client Secrets", type: "info" },
      { id: "tfa", label: "2FA TOTP Secrets", type: "info" },
      { id: "pii", label: "GDPR Erasure PII", type: "info" },

      {
        id: "bcrypt",
        label: "BCrypt Hash",
        type: "warning",
        description: "Work Factor = 12 slow hash",
      },
      { id: "sha", label: "SHA-256 Hash", type: "warning", description: "One-way secure hashing" },
      {
        id: "aes",
        label: "AES-GCM Encrypted",
        type: "primary",
        description: "Symmetric key encryption",
      },
      { id: "aes256", label: "AES-256 Encrypted", type: "primary" },
      {
        id: "sha256_trunc",
        label: "SHA-256 Truncated (16 char)",
        type: "warning",
        description: "Stable anonymized token",
      },

      { id: "db", label: "Secure Database Store", type: "success" },
    ],
    connections: [
      { from: "inp", to: "pwd" },
      { from: "inp", to: "ref" },
      { from: "inp", to: "secret" },
      { from: "inp", to: "tfa" },
      { from: "inp", to: "pii" },

      { from: "pwd", to: "bcrypt" },
      { from: "ref", to: "sha" },
      { from: "secret", to: "aes" },
      { from: "tfa", to: "aes256" },
      { from: "pii", to: "sha256_trunc" },

      { from: "bcrypt", to: "db" },
      { from: "sha", to: "db" },
      { from: "aes", to: "db" },
      { from: "aes256", to: "db" },
      { from: "sha256_trunc", to: "db" },
    ],
  },
  {
    type: "table",
    headers: ["Data Type", "Protection Method", "Symmetric/Hash Algorithm", "Storage / Location"],
    rows: [
      [
        "Passwords",
        "One-Way Salting & Hashing",
        "BCrypt (Work Factor 12)",
        "Database (IdentityDb)",
      ],
      [
        "OTP Codes",
        "Eager One-Way Hashing",
        "BCrypt (never stored in plaintext)",
        "Database (IdentityDb)",
      ],
      ["Refresh Tokens", "One-Way Hashing", "SHA-256", "Database (IdentityDb)"],
      ["2FA Secrets", "Symmetric Encryption at Rest", "AES-256", "Database (IdentityDb)"],
      [
        "Backup Codes",
        "One-Way Salting & Hashing",
        "BCrypt (hashed individually)",
        "Database (IdentityDb)",
      ],
      [
        "OIDC Client Secrets",
        "Symmetric Encryption at Rest",
        "AES-GCM (IdEncryptionService)",
        "Database (IdentityDb)",
      ],
      [
        "JWT Signing Key",
        "HMAC Signature Verification",
        "HMAC-SHA256 or RSA key",
        "appsettings.json / Environment Variable",
      ],
      [
        "Connection Strings",
        "Symmetric Data Protection / Secret Vault",
        "DPAPI / Environment Variables",
        "appsettings.Production.json / Env vars",
      ],
      [
        "File Uploads",
        "Tenant Isolation + Strict ACLs",
        "Encrypted Blob Paths",
        "Blob Storage (S3 / Azure Blob)",
      ],
      [
        "GDPR Erasure PII",
        "Stable Irreversible Anonymization",
        "ANONYMIZED- + SHA-256 (first 16 chars)",
        "Database (Identifiable Fields)",
      ],
    ],
  },

  // ─── Data in Transit ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "security.dataProtection.dataInTransitTitle",
    id: "data-in-transit",
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
    type: "heading",
    level: 2,
    titleKey: "security.dataProtection.gdprTitle",
    id: "gdpr",
  },
  { type: "paragraph", contentKey: "security.dataProtection.gdprIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "🗑️",
        titleKey: "security.dataProtection.rightToDeleteTitle",
        descriptionKey: "security.dataProtection.rightToDeleteDesc",
      },
      {
        icon: "📋",
        titleKey: "security.dataProtection.dataPortabilityTitle",
        descriptionKey: "security.dataProtection.dataPortabilityDesc",
      },
      {
        icon: "🔒",
        titleKey: "security.dataProtection.consentTitle",
        descriptionKey: "security.dataProtection.consentDesc",
      },
      {
        icon: "📊",
        titleKey: "security.dataProtection.auditTrailTitle",
        descriptionKey: "security.dataProtection.auditTrailDesc",
      },
      {
        icon: "🏢",
        titleKey: "security.dataProtection.tenantScopingTitle",
        descriptionKey: "security.dataProtection.tenantScopingDesc",
      },
      {
        icon: "⏰",
        titleKey: "security.dataProtection.retentionTitle",
        descriptionKey: "security.dataProtection.retentionDesc",
      },
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
  lastUpdated: "2026-06-28",
});
