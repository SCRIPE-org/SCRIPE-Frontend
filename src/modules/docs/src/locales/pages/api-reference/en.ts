// FILE-EXCEPTION: file length
/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  apiReference: {
    overview: {
      title: "API Reference",
      description:
        "Complete REST API documentation with endpoints, request/response examples, authentication, and rate limiting.",
      intro:
        "The SCRIPE API is a RESTful JSON API. All endpoints use JWT Bearer-token authentication (unless marked public), standard HTTP status codes, and a consistent envelope response format. Swagger UI is available at /swagger for interactive testing.",
      baseInfoTitle: "Base Information",
      authEndpointsTitle: "Authentication Endpoints",
      adminEndpointsTitle: "Admin Management Endpoints",
      userEndpointsTitle: "User Management Endpoints",
      roleEndpointsTitle: "Role & Permission Endpoints",
      tenantEndpointsTitle: "Tenant Management Endpoints",
      otherEndpointsTitle: "Other Endpoints",
      responseFormatTitle: "Response Format",
      swaggerTip:
        "All API endpoints are also documented in the built-in Swagger UI at /swagger. You can authorize with a JWT token and try requests interactively.",
    },
    authApi: {
      title: "Authentication API (Admin)",
      description:
        "Admin authentication endpoints — login, refresh, logout, 2FA, profile management, and security logs.",
      intro:
        "The Authentication API handles admin-panel authentication for dashboard users. Unlike the User Auth API, it includes two-factor authentication management, admin profile endpoints, and security log access. All endpoints use the /api/v1/auth base path.",
      configTitle: "Base Configuration",
      loginTitle: "Login",
      loginDesc: "Authenticate admin with email/password. Returns JWT access + refresh tokens.",
      refreshTitle: "Refresh Token",
      refreshDesc:
        "Exchange a valid refresh token for a new access + refresh token pair. Single-use rotation.",
      logoutTitle: "Logout",
      logoutDesc:
        "Revoke all refresh tokens for the authenticated user. Access token remains valid until expiry.",
      tfaTitle: "Two-Factor Authentication",
      tfaIntro:
        "SCRIPE supports TOTP-based 2FA using authenticator apps (Google Authenticator, Authy, Microsoft Authenticator). Once enabled, login returns a session token instead of access tokens — the client must verify the TOTP code to complete authentication.",
      tfaEnableDesc: "Generate a TOTP secret and QR code URI for setup in an authenticator app.",
      tfaConfirmDesc: "Confirm 2FA setup by verifying the first TOTP code. Returns backup codes.",
      tfaVerifyDesc: "Complete login by verifying the TOTP code with the 2FA session token.",
      tfaDisableDesc: "Disable 2FA for the current admin account. Requires valid bearer token.",
      tfaBackupDesc: "Regenerate a new set of 10 backup codes. Previous codes are invalidated.",
      profileTitle: "Profile Management",
      meDesc:
        "Get the full profile of the currently authenticated admin, including role, permissions, and tenant info.",
      updateProfileDesc: "Update the current admin's name and phone number.",
      changePasswordDesc: "Change password. Requires current password for verification.",
      uploadAvatarDesc: "Upload a new avatar image (max 2 MB, jpg/png/webp).",
      removeAvatarDesc: "Remove the current avatar and revert to the default.",
      securityTitle: "Security Endpoints",
      securityLogDesc:
        "View the admin's recent security events (logins, password changes, 2FA changes).",
      sessionsDesc: "List all active sessions with device info, IP address, and last activity.",
      revokeSessionDesc:
        "Revoke a specific session by ID, forcing re-authentication on that device.",
      securityTip:
        "Security logs are retained for 90 days by default. Admins can only see their own security events; SuperAdmins can query the full audit log at /api/v1/audit.",
    },
    userAuthApi: {
      title: "User Authentication API",
      description:
        "User registration, email/phone verification, login, external OAuth, password reset, 2FA, and profile management.",
      intro:
        "The User Authentication API handles self-service authentication for end-users. Unlike the Admin Auth API, it includes registration, email/phone verification, external OAuth login, and password reset flows.",
      configTitle: "Base Configuration",
      registerTitle: "Registration",
      registerDesc:
        "Register a new user account with email, password, and tenant. Sends verification email.",
      loginTitle: "Login",
      loginDesc: "Authenticate user with email and password. Returns JWT access + refresh tokens.",
      externalTitle: "External Authentication",
      externalIntro:
        "SCRIPE supports OAuth authentication via Google, Facebook, Apple, or Microsoft. The client obtains a provider token and sends it to the external-login endpoint. SCRIPE validates the token, creates or links the account, and returns JWT tokens.",
      externalLoginDesc:
        "Authenticate via Google, Facebook, Apple, or Microsoft OAuth. Creates or links account.",
      verificationTitle: "Email & Phone Verification",
      verifyEmailDesc: "Verify email address using a 6-digit OTP code sent to the user's email.",
      verifyPhoneDesc: "Verify phone number using a 6-digit OTP code sent via SMS.",
      sendVerificationDesc:
        "Send (or resend) a verification code to email or phone. Rate limited to 5/hour.",
      passwordResetTitle: "Password Reset",
      forgotPasswordDesc:
        "Request a password reset code. Always returns success to prevent email enumeration.",
      resetPasswordDesc: "Reset password using the 6-digit code from forgot-password.",
      tokenTitle: "Token Management",
      refreshDesc: "Exchange a valid refresh token for a new token pair. Single-use rotation.",
      logoutDesc: "Revoke all refresh tokens and end the session.",
      tfaTitle: "User Two-Factor Authentication",
      tfaEnableDesc: "Generate TOTP secret and QR code for authenticator app setup.",
      tfaConfirmDesc: "Confirm 2FA by verifying the first TOTP code. Returns 10 backup codes.",
      tfaVerifyDesc: "Complete login by verifying the TOTP code with the 2FA session token.",
      tfaDisableDesc: "Disable 2FA for the current user. Requires valid bearer token.",
      tfaBackupDesc: "Regenerate backup codes. All previous codes are invalidated.",
      profileTitle: "User Profile",
      meDesc: "Get the authenticated user's profile, including tenant and verification status.",
      updateProfileDesc: "Update user name and phone number.",
      changePasswordDesc: "Change password. Requires current password verification.",
      summaryTitle: "Endpoint Summary",
      diffNote:
        "The User Auth API (/user-auth) is separate from the Admin Auth API (/auth). Users authenticate at /user-auth/login, admins at /auth/login. Both issue JWT tokens in the same format but have different permission scopes and 2FA flows.",
    },
    adminApi: {
      title: "Admin Management API",
      description:
        "Full CRUD, account actions, bulk operations, impersonation, and query parameters for admin user management.",
      intro:
        "The Admin Management API provides full lifecycle management for admin accounts within a tenant. All endpoints require Bearer token authentication and appropriate permissions from the admins.* permission group.",
      crudTitle: "Admin CRUD Endpoints",
      listDesc: "List admins with pagination, search, sorting, and role/status filters.",
      getByIdDesc: "Get a single admin by ID, including role details and last login.",
      createDesc: "Create a new admin account with email, role, and tenant assignment.",
      updateDesc: "Update an admin's name, phone, role, or active status.",
      deleteDesc: "Soft-delete an admin. Can be restored from the recycle bin.",
      actionsTitle: "Account Actions",
      activateDesc: "Activate a deactivated admin account.",
      deactivateDesc: "Deactivate an admin account (prevents login).",
      blockDesc: "Block an admin account (immediate lockout).",
      unblockDesc: "Unblock a blocked admin account.",
      unlockDesc: "Unlock a locked-out account (reset failed login attempts).",
      resetPasswordDesc:
        "Force-reset an admin's password. Sends a new temporary password via email.",
      bulkTitle: "Bulk Operations",
      bulkIntro:
        "Bulk operations accept either an array of specific IDs or a filter object that matches all records meeting criteria. The bulk-delete-all variant uses the current filter context to select records, with an optional excludeIds array to protect specific accounts.",
      bulkActivateDesc: "Activate multiple admin accounts by ID list.",
      bulkDeactivateDesc: "Deactivate multiple admin accounts by ID list.",
      bulkDeleteDesc: "Soft-delete multiple admins by ID list.",
      bulkDeleteAllDesc: "Soft-delete all admins matching the current filter (with exclusions).",
      impersonationTitle: "Impersonation",
      impersonateDesc:
        "Start impersonating another admin. Receive their JWT with your audit trail attached.",
      stopImpersonateDesc: "Stop impersonation and return to your original admin session.",
      transferDesc: "Transfer SuperAdmin role to another admin. You lose SuperAdmin privileges.",
      protectDesc:
        "Toggle protection flag on an admin account (protected accounts cannot be deleted).",
      impersonationWarning:
        "Impersonation is a powerful feature restricted to SuperAdmins. All actions performed during impersonation are logged with both the impersonator's and the target's identity. The impersonation session is time-limited and automatically ends after 1 hour.",
      queryParamsTitle: "Query Parameters",
    },
    tenantApi: {
      title: "Tenant Management API",
      description:
        "Tenant CRUD, hierarchy management, settings, and logo upload for multi-tenant operations.",
      intro:
        "The Tenant Management API provides full lifecycle management for tenants in the multi-tenant hierarchy. Parent tenants can manage their children, and each tenant has isolated settings, branding, and resource limits.",
      crudTitle: "Tenant CRUD",
      listDesc: "List all tenants visible to the current admin's scope, with pagination.",
      getByIdDesc: "Get full tenant details including settings, statistics, and hierarchy info.",
      createDesc: "Create a new child tenant under the current admin's tenant.",
      updateDesc: "Update tenant name, slug, and basic information.",
      deleteDesc: "Soft-delete a tenant. Active admins and users are deactivated.",
      hierarchyTitle: "Hierarchy & Statistics",
      hierarchyIntro:
        "Tenants form a tree hierarchy where parent tenants can see and manage their children. The hierarchy endpoint returns the full tree structure, while other endpoints provide tenant-specific statistics and resource listings.",
      hierarchyDesc: "Get the full tenant hierarchy tree from the current admin's scope.",
      childrenDesc: "List direct children of a specific tenant.",
      myChildrenDesc: "List the current admin's tenant's direct children.",
      statsDesc: "Get statistics for a tenant (admin count, user count, storage usage).",
      adminsDesc: "List all admins belonging to a specific tenant.",
      rolesDesc: "List all roles belonging to a specific tenant.",
      permissionsDesc: "List all permissions available in a specific tenant's scope.",
      settingsTitle: "Tenant Settings",
      getSettingsDesc: "Get the full settings object for a tenant.",
      updateSettingsDesc:
        "Update tenant settings (registration policy, language, limits, password policy).",
      mySettingsDesc: "Update the current admin's own tenant settings (shortcut).",
      uploadLogoDesc: "Upload a tenant logo (max 5 MB, jpg/png/svg/webp).",
      settingsNote:
        "Tenant settings include password policies, registration controls, language defaults, and resource limits. Child tenants inherit parent settings by default but can override them.",
    },
    rolePermissionApi: {
      title: "Role & Permission API",
      description:
        "Role CRUD, permission assignment, tenant-scoped roles, and permission catalog for RBAC management.",
      intro:
        "The Role & Permission API manages the RBAC (Role-Based Access Control) system. Roles are tenant-scoped, meaning each tenant has its own set of roles. Permissions are seeded from the backend and are read-only. Roles compose permissions with optional field-level restrictions.",
      rolesCrudTitle: "Role CRUD",
      listRolesDesc: "List all roles in the current tenant with admin counts.",
      getRoleDesc: "Get role details including permissions, menu items, and field restrictions.",
      createRoleDesc: "Create a new custom role with permissions and menu visibility.",
      updateRoleDesc: "Update role name, description, and menu visibility.",
      deleteRoleDesc: "Delete a role. Fails if admins are still assigned to it.",
      cloneRoleDesc: "Clone an existing role with all its permissions and menu items.",
      assignTitle: "Permission Assignment",
      assignPermDesc:
        "Replace all permissions for a role. Supports field-level restrictions per permission.",
      getPermDesc: "Get the current permissions assigned to a role.",
      syncScopesDesc: "Sync permission scopes and restricted fields from the parent tenant.",
      tenantScopedTitle: "Tenant-Scoped Roles",
      tenantScopedIntro:
        "Each tenant has its own set of roles that can only use permissions available in the tenant's scope. The available permissions are controlled by the parent tenant's role assignment. Admins can only see and assign permissions their tenant is allowed to use.",
      myTenantRolesDesc: "List roles available in the current admin's tenant.",
      availablePermDesc: "List permissions available for assignment in the current tenant's scope.",
      permissionsTitle: "Permissions (Read-Only)",
      permissionsIntro:
        "Permissions are seeded automatically from the backend. They cannot be created or modified through the API. Each permission belongs to a category and can have field-level restrictions when assigned to a role.",
      listPermissionsDesc: "List all permissions grouped by category.",
      myPermissionsDesc: "Get the current admin's effective permissions.",
      getPermByIdDesc: "Get a single permission by ID with full details.",
      categoriesDesc: "Get permission categories with all permissions in each.",
      availableForTenantDesc:
        "List permissions available for a specific tenant (for tenant creation/editing).",
      seededNote:
        "Permissions are seeded from backend code during application startup. Adding new endpoints with [RequirePermission] attributes automatically creates new permissions on next deploy.",
    },
    adminGroupsApi: {
      title: "User Groups API",
      description:
        "Manage large fleets of administrators via unified User Groups. Supports bulk operations, cascading deletions, and additive role assignments.",
      intro:
        "The User Groups API manages bulk collections of roles and field restrictions assigned to administrators. Removing a group, restricting a permission, or cascading a deletion updates all attached administrators instantly at their next token refresh.",
      crudTitle: "User Groups CRUD",
      listGroupsDesc:
        "Retrieve a paginated list of all User Groups. SuperAdmins see global groups; Tenant Admins see only their tenant's.",
      myTenantGroupsDesc:
        "Quick-fetch essential group data for the authenticated user's active tenant (optimized for dropdowns).",
      getGroupDesc:
        "Fetch massive detail for a specific User Group, including all active members, roles, and JSON field restrictions.",
      groupsByTenantDesc: "SuperAdmin only. Fetch groups filtered directly by a specific TenantId.",
      createGroupDesc:
        "Create a new User Group, strictly validating that the provided RoleIds exist and belong to the target Tenant.",
      createGroupMyTenantDesc:
        "Create a new User Group automatically mapped to the JWT's TenantId context.",
      updateGroupDesc:
        "Update core group metadata (Name, Description, Status) and perform a full nuke-and-pave synchronization of RoleIds.",
      deleteGroupDesc:
        "Soft-delete a User Group (AdminAdminGroup relations are automatically orphaned).",
      groupMembersTitle: "Group Members",
      groupMembersIntro: "Manage the administrators assigned to a specific User Group.",
      addMembersDesc: "Append one or more AdminIds to the group. This operation is idempotent.",
      removeMemberDesc:
        "Sever the link between an Admin and the Group. Does not affect the Admin's directly assigned roles.",
      groupRolesRestrictionsTitle: "Group Roles & Restrictions",
      groupRolesRestrictionsIntro:
        "Manage the exact role payloads and field-level serialization blocks inherited by the group's members.",
      setGroupRolesDesc:
        "Perform a destructive, nuke-and-pave synchronization of all RoleIds assigned to the Group.",
      setGroupRestrictionsDesc:
        "Perform a destructive, nuke-and-pave synchronization of all JSON field restrictions for the Group.",
      bulkCascadeTitle: "Bulk & Cascade Operations",
      bulkCascadeIntro:
        "Execute massive operational commands across thousands of records simultaneously, optionally cascading the effects down to the associated member administrators.",
      bulkActivateDesc:
        "Bulk set IsActive=true for multiple User Groups. Options to cascade activation to members.",
      bulkDeactivateDesc:
        "Bulk set IsActive=false for multiple User Groups. Options to cascade deactivation to members.",
      bulkDeleteDesc:
        "Bulk soft-delete multiple User Groups. Options to cascade soft-delete to members.",
      cascadeWarningNode:
        "Cascade operations securely skip Protected Admins. If you attempt to cascade a delete onto the Tenant Owner, the group is deleted, but the Owner is completely spared.",
    },
    webhookEmailApi: {
      title: "Webhook, Email & Notification API",
      description:
        "Webhook subscriptions, email sending/bulk, message templates, and real-time notifications with SignalR.",
      intro:
        "The Webhook, Email & Notification API provides event-driven integrations, transactional email delivery, template management, and real-time in-app notifications. Webhooks use HMAC signature verification for security.",
      webhooksTitle: "Webhooks",
      webhooksIntro:
        "Webhooks allow external systems to subscribe to SCRIPE events. When an event occurs (admin created, user registered, etc.), SCRIPE sends an HTTP POST to the subscriber URL with a signed payload. Failed deliveries are retried up to 3 times with exponential backoff.",
      listWebhooksDesc: "List all webhook subscriptions for the current tenant.",
      createWebhookDesc: "Create a new webhook subscription with URL, events, and HMAC secret.",
      updateWebhookDesc: "Update a webhook's URL, events, or active status.",
      deleteWebhookDesc: "Delete a webhook subscription.",
      testWebhookDesc: "Send a test event to the webhook URL to verify connectivity.",
      emailTitle: "Email System",
      emailIntro:
        "The email system supports individual and bulk email sending with template variable interpolation. Emails are queued via background services and processed asynchronously. The system supports scheduling, cancellation, and resending of failed emails.",
      listEmailsDesc: "List sent/queued/failed emails with pagination and status filters.",
      sendEmailDesc: "Send a single email using a template with variable substitution.",
      sendBulkDesc: "Send bulk emails to multiple recipients or a filtered group.",
      cancelEmailDesc: "Cancel a queued (not yet sent) email.",
      resendEmailDesc: "Resend a failed email.",
      emailStatsDesc: "Get email statistics (sent, failed, queued, bounce rate).",
      searchRecipientsDesc: "Search for valid email recipients (admins/users) by name or email.",
      templatesTitle: "Message Templates",
      templatesIntro:
        "Message templates use the Scriban engine (Liquid-compatible) for variable interpolation. Templates support HTML and plain-text bodies, with preview and render endpoints for testing before sending.",
      listTemplatesDesc: "List all message templates with category and status filters.",
      getTemplateDesc: "Get a single template with full body content and variable definitions.",
      createTemplateDesc: "Create a new message template with HTML/text body and variables.",
      updateTemplateDesc: "Update a template's content, subject, or variables.",
      deleteTemplateDesc: "Delete a message template.",
      previewTemplateDesc: "Preview a template with sample data (returns rendered HTML).",
      renderTemplateDesc: "Render a template with provided variables (returns final HTML + text).",
      notificationsTitle: "Notifications",
      listNotificationsDesc: "List in-app notifications for the current user with pagination.",
      unreadCountDesc: "Get the count of unread notifications.",
      markReadDesc: "Mark a single notification as read.",
      markAllReadDesc: "Mark all notifications as read.",
      deleteNotifDesc: "Delete a notification.",
      searchTargetsDesc: "Search for notification targets (users/admins) by name or email.",
      signalrTip:
        "Real-time notifications are delivered via SignalR WebSocket at /hubs/notification. The client receives instant push notifications without polling. Connect with your JWT token for authenticated real-time updates.",
    },
    systemApi: {
      title: "System API",
      description:
        "Dashboard analytics, menu management, recycle bin, file management, system settings, and health checks.",
      intro:
        "The System API covers platform-level operations including dashboard analytics, dynamic menu management, soft-delete recycle bin, file uploads, system settings, and infrastructure health checks.",
      dashboardTitle: "Dashboard Analytics",
      dashboardIntro:
        "The dashboard endpoints provide real-time KPI summaries, login activity trends, security event monitoring, and audit event distribution. All data is tenant-scoped based on the authenticated admin's context.",
      summaryDesc:
        "Get KPI summary with admin/user/tenant counts, today's logins, and storage usage.",
      loginActivityDesc: "Get login activity over time (successful vs failed logins per day).",
      recentChangesDesc: "Get recent entity changes across the system (creates, updates, deletes).",
      eventDistDesc: "Get audit event type distribution for pie/bar charts.",
      securityEventsDesc:
        "Get security events including brute-force attempts, locked accounts, and blocked IPs.",
      blockedIpsDesc: "Get the top blocked IP addresses with attempt counts.",
      dashboardExportTitle: "Dashboard Export",
      exportOverviewDesc: "Export the overview dashboard as CSV, Excel, or PDF.",
      exportAnalyticsDesc: "Export analytics data with optional chart images (PDF).",
      exportSecurityDesc: "Export security event data for compliance reporting.",
      menuTitle: "Menu Management",
      listMenusDesc: "List all menu items in tree structure.",
      myMenuDesc:
        "Get the personalized menu tree for the current admin (filtered by role visibility).",
      createMenuDesc: "Create a new menu item with title, icon, path, and parent.",
      updateMenuDesc: "Update a menu item's title, icon, path, or parent.",
      deleteMenuDesc: "Delete a menu item and all its children.",
      reorderMenuDesc: "Reorder menu items by providing an array of {id, order} pairs.",
      roleVisibilityDesc: "Set which roles can see a specific menu item.",
      tenantOverrideDesc: "Override a menu item's visibility or order for a specific tenant.",
      myOverridesDesc: "Get the current tenant's menu overrides.",
      recycleBinTitle: "Recycle Bin",
      listDeletedDesc:
        "List soft-deleted entities with type, name, deleted date, and restore eligibility.",
      restoreDesc: "Restore a soft-deleted entity back to active state.",
      purgeDesc: "Permanently delete an entity from the recycle bin (irreversible).",
      filesTitle: "File Management",
      uploadDesc: "Upload a file (image, document). Returns file metadata with access URL.",
      downloadDesc: "Download or stream a file by ID.",
      deleteFileDesc: "Delete an uploaded file from storage.",
      settingsTitle: "System Settings",
      getSettingsDesc:
        "Get global system settings (email config, security policies, feature flags).",
      updateSettingsDesc: "Update system settings. Changes take effect immediately.",
      resetSettingsDesc: "Reset all settings to factory defaults.",
      readinessDesc: "Readiness probe — checks database, cache, blob storage, and background jobs.",
    },
  },
};
