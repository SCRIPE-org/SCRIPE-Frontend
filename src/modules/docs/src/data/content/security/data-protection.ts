import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "security/data-protection",
  titleKey: "security.dataProtection.title",
  category: "security",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.dataProtection.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_3_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    req([\"Incoming Request\"])\n    jwt([\"JWT tenant_id Claim\"])\n    %% jwt: Extracted by TenantContextMiddleware\n    scope{{\"IDataScopeService\"}}\n    %% scope: Sets current tenant context\n    filter([\"EF Global Query Filter\"])\n    %% filter: WHERE TenantId = @currentTenantId\n    data([\"Tenant-Scoped Data Only\"])\n    req --> jwt\n    jwt --> scope\n    scope --> filter\n    filter --> data",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_5_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Extracts tenant_id from JWT claims and sets it in IDataScopeService.\n/// All subsequent DB queries are automatically scoped to this tenant.\n/// </summary>\npublic class TenantContextMiddleware\n{\n    public async Task InvokeAsync(HttpContext context, IDataScopeService dataScopeService)\n    {\n        if (context.User.Identity?.IsAuthenticated == true)\n        {\n            var tenantClaim = context.User.FindFirst(\"tenant_id\");\n            if (tenantClaim != null && Guid.TryParse(tenantClaim.Value, out var tenantId))\n            {\n                dataScopeService.SetCurrentTenant(tenantId);\n            }\n        }\n\n        await _next(context);\n    }\n}",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_7_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class DataScopeService : IDataScopeService\n{\n    private Guid? _currentTenantId;\n\n    public Guid? CurrentTenantId => _currentTenantId;\n\n    public void SetCurrentTenant(Guid tenantId)\n        => _currentTenantId = tenantId;\n\n    // Used by EF Core global query filter\n    public Expression<Func<T, bool>> GetTenantFilter<T>()\n        where T : ITenantAwareEntity\n    {\n        var tenantId = _currentTenantId\n            ?? throw new UnauthorizedAccessException(\"No tenant context\");\n        return entity => entity.TenantId == tenantId;\n    }\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "danger",
    "titleKey": "security.dataProtection.section_9_title",
    "contentKey": "security.dataProtection.section_9_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.dataProtection.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_11_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_12_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// Obfuscates internal Guid IDs for external API responses.\n/// Prevents enumeration attacks (incrementing IDs to discover resources).\n/// Uses AES encryption with a per-tenant key.\n/// </summary>\npublic class IdEncryptionService : IIdEncryptionService\n{\n    public string Encrypt(Guid id)\n    {\n        var bytes = id.ToByteArray();\n        var encrypted = _aes.Encrypt(bytes);\n        return Base64UrlEncoder.Encode(encrypted);\n        // Output: \"dGhpcyBpcyBhIHRlc3Q\" (URL-safe, no padding)\n    }\n\n    public Guid Decrypt(string encryptedId)\n    {\n        var bytes = Base64UrlEncoder.Decode(encryptedId);\n        var decrypted = _aes.Decrypt(bytes);\n        return new Guid(decrypted);\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.dataProtection.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_15_content"
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_16_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "/// <summary>\n/// ASP.NET Core authorization filter that checks if the current user's role\n/// has permission to view specific fields in the response.\n/// Fields are configured per-role in the RolePermission entity.\n/// </summary>\npublic class RestrictedFieldsAuthorizationFilter : IAsyncAuthorizationFilter\n{\n    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)\n    {\n        var roleId = context.HttpContext.User.FindFirst(\"role_id\")?.Value;\n        if (roleId is null) return;\n\n        var restrictedFields = await _rolePermRepo\n            .GetRestrictedFieldsAsync(Guid.Parse(roleId));\n\n        if (restrictedFields.Any())\n        {\n            // Store in HttpContext.Items for response serializer\n            context.HttpContext.Items[\"RestrictedFields\"] = restrictedFields;\n        }\n    }\n}\n\n// In response serialization:\n// Fields listed in RestrictedFields are replaced with \"***\" or omitted",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.dataProtection.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_19_content"
  },
  {
    "type": "table",
    "headers": [
      "security.dataProtection.section_20_hdr_0",
      "security.dataProtection.section_20_hdr_1",
      "security.dataProtection.section_20_hdr_2"
    ],
    "rows": [
      [
        "security.dataProtection.section_20_cell_0_0",
        "security.dataProtection.section_20_cell_0_1",
        "security.dataProtection.section_20_cell_0_2"
      ],
      [
        "security.dataProtection.section_20_cell_1_0",
        "security.dataProtection.section_20_cell_1_1",
        "security.dataProtection.section_20_cell_1_2"
      ],
      [
        "security.dataProtection.section_20_cell_2_0",
        "security.dataProtection.section_20_cell_2_1",
        "security.dataProtection.section_20_cell_2_2"
      ],
      [
        "security.dataProtection.section_20_cell_3_0",
        "security.dataProtection.section_20_cell_3_1",
        "security.dataProtection.section_20_cell_3_2"
      ]
    ]
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_21_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class TenantGuardianService : ITenantGuardianService\n{\n    /// <summary>\n    /// Validates that a tenant operation doesn't violate hierarchy rules:\n    /// - Cannot create circular parent references\n    /// - Cannot delete a tenant with active children\n    /// - Cannot move a tenant under its own descendant\n    /// </summary>\n    public async Task<Result> ValidateHierarchy(\n        Guid tenantId, Guid? newParentId, CancellationToken ct)\n    {\n        if (newParentId is null) return Result.Success();\n\n        // Check for circular reference\n        var ancestors = await GetAllAncestorsAsync(newParentId.Value, ct);\n        if (ancestors.Contains(tenantId))\n            return Result.Failure(new AppError(\n                \"Tenant.CircularReference\",\n                \"Cannot set a descendant as parent — circular reference\"\n            ));\n\n        return Result.Success();\n    }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.dataProtection.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_24_content"
  },
  {
    "type": "table",
    "headers": [
      "security.dataProtection.section_25_hdr_0",
      "security.dataProtection.section_25_hdr_1",
      "security.dataProtection.section_25_hdr_2"
    ],
    "rows": [
      [
        "security.dataProtection.section_25_cell_0_0",
        "security.dataProtection.section_25_cell_0_1",
        "security.dataProtection.section_25_cell_0_2"
      ],
      [
        "security.dataProtection.section_25_cell_1_0",
        "security.dataProtection.section_25_cell_1_1",
        "security.dataProtection.section_25_cell_1_2"
      ],
      [
        "security.dataProtection.section_25_cell_2_0",
        "security.dataProtection.section_25_cell_2_1",
        "security.dataProtection.section_25_cell_2_2"
      ],
      [
        "security.dataProtection.section_25_cell_3_0",
        "security.dataProtection.section_25_cell_3_1",
        "security.dataProtection.section_25_cell_3_2"
      ],
      [
        "security.dataProtection.section_25_cell_4_0",
        "security.dataProtection.section_25_cell_4_1",
        "security.dataProtection.section_25_cell_4_2"
      ],
      [
        "security.dataProtection.section_25_cell_5_0",
        "security.dataProtection.section_25_cell_5_1",
        "security.dataProtection.section_25_cell_5_2"
      ],
      [
        "security.dataProtection.section_25_cell_6_0",
        "security.dataProtection.section_25_cell_6_1",
        "security.dataProtection.section_25_cell_6_2"
      ],
      [
        "security.dataProtection.section_25_cell_7_0",
        "security.dataProtection.section_25_cell_7_1",
        "security.dataProtection.section_25_cell_7_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.dataProtection.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_27_content"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "security.dataProtection.section_28_item_0",
      "security.dataProtection.section_28_item_1",
      "security.dataProtection.section_28_item_2",
      "security.dataProtection.section_28_item_3",
      "security.dataProtection.section_28_item_4",
      "security.dataProtection.section_28_item_5"
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.dataProtection.section_29_title",
    "id": "sec_29"
  },
  {
    "type": "paragraph",
    "contentKey": "security.dataProtection.section_30_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.dataProtection.section_31_title",
    "id": "sec_31"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.dataProtection.section_32_title",
    "id": "sec_32"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.dataProtection.section_33_title",
    "id": "sec_33"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.dataProtection.section_34_title",
    "id": "sec_34"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.dataProtection.section_35_title",
    "id": "sec_35"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "security.dataProtection.section_36_title",
    "id": "sec_36"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "security.dataProtection.section_37_title",
    "id": "sec_37"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "security.dataProtection.section_38_item_0",
      "security.dataProtection.section_38_item_1",
      "security.dataProtection.section_38_item_2"
    ]
  }
],
  relatedSlugs: [
  "security/overview",
  "security/authentication-deep",
  "security/audit-compliance"
],
  lastUpdated: "2026-06-09",
});
