import { registerPage } from '../../repositories/DocsRepository';
import type { DocPageData } from '../../../domain/entities/DocPage';

function securityPage(slug: string, key: string, order: number, sections: DocPageData['sections'], related: string[] = []): void {
      registerPage({
            slug: `security/${slug}`, titleKey: `security.${key}.title`, descriptionKey: `security.${key}.description`,
            category: 'security', order, relatedSlugs: related, sections,
      });
}

// ─── RBAC ──────────────
securityPage('rbac', 'rbac', 1, [
      { type: 'paragraph', contentKey: 'security.rbac.description' },
      {
            type: 'flowchart', title: 'Authorization Flow', direction: 'vertical',
            nodes: [
                  { id: 'req', label: 'API Request', type: 'default' },
                  { id: 'jwt', label: 'Validate JWT', type: 'info' },
                  { id: 'cache', label: 'Server-Side Permission Cache', type: 'warning' },
                  { id: 'check', label: 'Check Permission', type: 'danger' },
                  { id: 'allow', label: 'Allow / Deny', type: 'success' },
            ],
            connections: [
                  { from: 'req', to: 'jwt', label: 'Bearer Token' },
                  { from: 'jwt', to: 'cache', label: 'Extract UserId' },
                  { from: 'cache', to: 'check', label: 'Load Permissions' },
                  { from: 'check', to: 'allow', label: 'Permission.Check()' },
            ],
      },
      { type: 'info', variant: 'warning', contentKey: 'security.rbac.description' },
], ['features/permission-system', 'features/role-management']);

// ─── Field-Level Security ──────────────
securityPage('field-level', 'fieldLevel', 2, [
      { type: 'paragraph', contentKey: 'security.fieldLevel.description' },
      {
            type: 'code', language: 'csharp', filename: 'Field-Level Restriction', code: `// In Role Permission assignment
new RolePermission
{
    RoleId = roleId,
    PermissionId = permissionId,
    RestrictedFields = "[\"salary\", \"ssn\", \"bankAccount\"]",
}

// In Query Handler — filter restricted fields
var restrictedFields = currentUser.GetRestrictedFields(permission);
var dto = mapper.Map(entity, restrictedFields);` },
      { type: 'info', variant: 'note', contentKey: 'security.fieldLevel.description' },
], ['features/permission-system', 'security/rbac']);

// ─── ID Encryption ──────────────
securityPage('id-encryption', 'idEncryption', 3, [
      { type: 'paragraph', contentKey: 'security.idEncryption.description' },
      {
            type: 'table', headers: ['Feature', 'Details'],
            rows: [
                  ['Algorithm', 'AES-256-CBC'],
                  ['Key Source', 'Environment variable / configuration'],
                  ['Applied To', 'All entity IDs in API responses'],
                  ['Purpose', 'Prevent enumeration attacks'],
            ],
      },
      {
            type: 'code', language: 'csharp', filename: 'ID Encryption Service', code: `public class IdEncryptionService
{
    public string Encrypt(Guid id) => AesEncrypt(id.ToString());
    public Guid Decrypt(string encrypted) => Guid.Parse(AesDecrypt(encrypted));
}` },
], ['security/tokens']);

// ─── Tokens ──────────────
securityPage('tokens', 'tokens', 4, [
      { type: 'paragraph', contentKey: 'security.tokens.description' },
      {
            type: 'table', headers: ['Token', 'Claims', 'Lifetime'],
            rows: [
                  ['Access JWT', 'UserId, Email, TenantId', '15 min'],
                  ['Refresh Token', 'Hashed random GUID', '7 days'],
                  ['2FA Token', 'UserId, Purpose=TwoFactor', '5 min'],
            ],
      },
      { type: 'info', variant: 'warning', contentKey: 'security.tokens.description' },
], ['features/authentication', 'features/session-management']);
