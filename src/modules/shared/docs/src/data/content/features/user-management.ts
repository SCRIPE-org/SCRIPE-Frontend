// FILE-EXCEPTION: file length
import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  //  Admin vs User
  {
    type: "heading",
    level: 2,
    titleKey: "features.userManagement.adminVsUserTitle",
    id: "admin-vs-user",
  },
  { type: "paragraph", contentKey: "features.userManagement.adminVsUserIntro" },
  {
    type: "table",
    headers: ["Aspect", "Admin", "User"],
    rows: [
      ["Entity", "Admin (extends AuditableEntity)", "User (extends AuditableEntity)"],
      ["Auth Prefix", "/api/auth/admin/*", "/api/auth/user/*"],
      ["Permissions", "Full RBAC, assigned roles", "Limited, self-service"],
      ["Can Manage Others", "Yes (CRUD admins/users)", "No"],
      ["Tenant Scoped", "Yes", "Yes"],
      ["Has Roles", "Yes (many-to-many AdminRole)", "No"],
      ["Protected Flag", "IsProtected on super admin", "No"],
      ["Controller", "AdminsController (27 endpoints)", "UsersController"],
    ],
  },

  // € RegisterUserCommand Validation
  {
    type: "heading",
    level: 2,
    titleKey: "features.userManagement.registerValidationTitle",
    id: "register-validation",
  },
  { type: "paragraph", contentKey: "features.userManagement.registerValidationIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "RegisterUserCommandValidator.cs",
    code: `public sealed class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().MaximumLength(100)
            .Matches("^[a-zA-Z0-9_]+$");

        RuleFor(x => x.Password)
            .NotEmpty().MinimumLength(6);

        RuleFor(x => x.Email)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.TenantCode)
            .NotEmpty().MaximumLength(100).WithMessage("TenantCode is required.");
    }
}`,
  },

  // € User Invitations & Setup Tokens
  {
    type: "heading",
    level: 2,
    titleKey: "features.userManagement.invitationTitle",
    id: "invitations",
  },
  { type: "paragraph", contentKey: "features.userManagement.invitationIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    title: "User Invitation & Activation Flow",
    nodes: [
      {
        id: "invite",
        label: "Admin Invites User (CreateAdminCommand, SendSetupEmail=true)",
        type: "default",
      },
      {
        id: "generate",
        label: "Generate 256-bit Secure Token (RandomNumberGenerator)",
        type: "info",
      },
      { id: "hash", label: "Hash Token (SHA256) & Set 24-Hour Expiry", type: "info" },
      { id: "save", label: "Save Inactive User with Token Hash", type: "warning" },
      { id: "url", label: "Resolve URL (Tenant Custom Domain or Platform URL)", type: "info" },
      { id: "email", label: "Send Activation Email (Scriban Template & SMTP)", type: "success" },
      { id: "click", label: "User clicks link, submits new password", type: "primary" },
      { id: "verify", label: "Verify Token Hash & Check Expiry", type: "info" },
      { id: "validate", label: "Validate Password against Tenant Password Policy", type: "info" },
      {
        id: "active",
        label: "Hash Password, Set IsAccountActivated=true, Clear Token",
        type: "success",
      },
    ],
    connections: [
      { from: "invite", to: "generate" },
      { from: "generate", to: "hash" },
      { from: "hash", to: "save" },
      { from: "save", to: "url" },
      { from: "url", to: "email" },
      { from: "email", to: "click" },
      { from: "click", to: "verify" },
      { from: "verify", to: "validate" },
      { from: "validate", to: "active" },
    ],
  },

  // € AdminsController CRUD
  { type: "heading", level: 2, titleKey: "features.userManagement.crudTitle", id: "crud" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/admins",
        descriptionKey: "Paginated list (data-scope aware)",
        auth: "JWT",
        permission: "admins.view",
      },
      {
        method: "GET",
        path: "/admins/{id}",
        descriptionKey: "Single admin detail",
        auth: "JWT",
        permission: "admins.view",
      },
      {
        method: "GET",
        path: "/admins/tenant/{tenantId}",
        descriptionKey: "Admins by specific tenant",
        auth: "JWT",
        permission: "admins.view",
      },
      {
        method: "GET",
        path: "/admins/my-tenant",
        descriptionKey: "Admins in caller's tenant",
        auth: "JWT",
        permission: "admins.view",
      },
      {
        method: "POST",
        path: "/admins",
        descriptionKey: "Create with explicit TenantId",
        auth: "JWT",
        permission: "admins.create",
      },
      {
        method: "POST",
        path: "/admins/my-tenant",
        descriptionKey: "Create for caller's tenant (from JWT)",
        auth: "JWT",
        permission: "admins.create",
      },
      {
        method: "PUT",
        path: "/admins/{id}",
        descriptionKey: "Update admin",
        auth: "JWT",
        permission: "admins.edit",
      },
      {
        method: "DELETE",
        path: "/admins/{id}",
        descriptionKey: "Soft delete admin",
        auth: "JWT",
        permission: "admins.delete",
      },
    ],
  },

  //  Account Operations 
  {
    type: "heading",
    level: 2,
    titleKey: "features.userManagement.accountOpsTitle",
    id: "account-ops",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "PUT",
        path: "/admins/{id}/active",
        descriptionKey: "Activate/deactivate",
        auth: "JWT",
        permission: "admins.edit",
      },
      {
        method: "PUT",
        path: "/admins/{id}/change-password",
        descriptionKey: "Change own password",
        auth: "JWT (Self only)",
      },
      {
        method: "PUT",
        path: "/admins/{id}/reset-password",
        descriptionKey: "Super admin resets password",
        auth: "JWT",
        permission: "admins.edit",
      },
    ],
  },

  //  Role Management
  { type: "heading", level: 2, titleKey: "features.userManagement.roleMgmtTitle", id: "role-mgmt" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/admins/{id}/roles",
        descriptionKey: "Get assigned roles",
        auth: "JWT",
        permission: "admins.view",
      },
      {
        method: "POST",
        path: "/admins/{id}/roles/{roleId}",
        descriptionKey: "Assign single role",
        auth: "JWT",
        permission: "admins.edit",
      },
      {
        method: "DELETE",
        path: "/admins/{id}/roles/{roleId}",
        descriptionKey: "Remove single role",
        auth: "JWT",
        permission: "admins.edit",
      },
      {
        method: "PUT",
        path: "/admins/{id}/roles/sync",
        descriptionKey: "Nuke & Pave  replace all roles",
        auth: "JWT",
        permission: "admins.edit",
      },
    ],
  },

  //  Bulk Operations
  { type: "heading", level: 2, titleKey: "features.userManagement.bulkOpsTitle", id: "bulk-ops" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/admins/bulk/activate",
        descriptionKey: "Activate selected IDs",
        auth: "JWT",
        permission: "admins.edit",
      },
      {
        method: "POST",
        path: "/admins/bulk/deactivate",
        descriptionKey: "Deactivate selected IDs",
        auth: "JWT",
        permission: "admins.edit",
      },
      {
        method: "POST",
        path: "/admins/bulk/delete",
        descriptionKey: "Delete selected IDs",
        auth: "JWT",
        permission: "admins.delete",
      },
      {
        method: "POST",
        path: "/admins/bulk/activate-all",
        descriptionKey: "Activate ALL matching filter",
        auth: "JWT",
        permission: "admins.edit",
      },
      {
        method: "POST",
        path: "/admins/bulk/deactivate-all",
        descriptionKey: "Deactivate ALL matching filter",
        auth: "JWT",
        permission: "admins.edit",
      },
      {
        method: "POST",
        path: "/admins/bulk/delete-all",
        descriptionKey: "Delete ALL matching filter",
        auth: "JWT",
        permission: "admins.delete",
      },
    ],
  },

  //  Enterprise Operations
  {
    type: "heading",
    level: 2,
    titleKey: "features.userManagement.enterpriseOpsTitle",
    id: "enterprise-ops",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/admins/{id}/impersonate",
        descriptionKey: "Impersonate another admin",
        auth: "Super admin",
      },
      {
        method: "POST",
        path: "/admins/{id}/transfer",
        descriptionKey: "Move admin to different tenant",
        auth: "Super admin",
      },
      {
        method: "POST",
        path: "/admins/{id}/transfer-protection",
        descriptionKey: "Transfer 'protected' flag",
        auth: "Super admin",
      },
    ],
  },

  //  Protected Admin Rules
  {
    type: "heading",
    level: 2,
    titleKey: "features.userManagement.protectedTitle",
    id: "protected",
  },
  { type: "paragraph", contentKey: "features.userManagement.protectedIntro" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "Each tenant has exactly one protected admin (the super admin who created the tenant)",
      "Protected flag can be transferred to another admin via TransferProtection",
      "Protected admins cannot be deleted, deactivated, or have roles removed",
    ],
  },
  {
    type: "flowchart",
    direction: "vertical",
    title: "Protected Admin Rules",
    nodes: [
      { id: "pa", label: "Protected Admin", type: "primary" },
      { id: "del", label: "Cannot be Deleted", type: "danger" },
      { id: "deact", label: "Cannot be Deactivated", type: "danger" },
      { id: "xfer", label: "Cannot be Transferred (unless by another protected)", type: "warning" },
      { id: "sr", label: "Owns Protected Super Admin Role", type: "success" },
      { id: "all", label: "Gets All Tenant Permissions", type: "success" },
    ],
    connections: [
      { from: "pa", to: "del" },
      { from: "pa", to: "deact" },
      { from: "pa", to: "xfer" },
      { from: "pa", to: "sr" },
      { from: "sr", to: "all" },
    ],
  },

  //  Nuke & Pave Pattern
  { type: "heading", level: 2, titleKey: "features.userManagement.nukePaveTitle", id: "nuke-pave" },
  {
    type: "code",
    language: "csharp",
    filename: "AdminsController.cs",
    code: `// PUT /admins/{id}/roles/sync
// Replaces ALL existing roles with the provided list
// This is safer than individual add/remove in concurrent scenarios

[HttpPut("{id}/roles/sync")]
public async Task<IActionResult> SyncRoles(string id, [FromBody] SyncRolesCommand command)
{
    // Deletes all AdminRole entries for this admin
    // Re-creates entries for each role in the request
    // Single transaction  no partial states
}`,
  },
  { type: "info", variant: "tip", contentKey: "features.userManagement.nukePaveTip" },
];

registerPage({
  slug: "features/user-management",
  titleKey: "features.userManagement.title",
  descriptionKey: "features.userManagement.description",
  category: "features",
  order: 10,
  sections,
  relatedSlugs: ["features/role-permissions", "features/recycle-bin"],
  lastUpdated: "2026-02-20",
});
