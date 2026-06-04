/**
 * Docs page locale — EN
 */
export const en = {
  apiReference: {
    adminApi: {
      actionsTitle: "Account Actions",
      activateDesc: "Activate a deactivated admin account.",
      blockDesc: "Block an admin account (immediate lockout).",
      bulkActivateDesc: "Activate multiple admin accounts by ID list.",
      bulkDeactivateDesc: "Deactivate multiple admin accounts by ID list.",
      bulkDeleteAllDesc: "Soft-delete all admins matching the current filter (with exclusions).",
      bulkDeleteDesc: "Soft-delete multiple admins by ID list.",
      bulkIntro:
        "Bulk operations accept either an array of specific IDs or a filter object that matches all records meeting criteria. The bulk-delete-all variant uses the current filter context to select records, with an optional excludeIds array to protect specific accounts.",
      bulkTitle: "Bulk Operations",
      createDesc: "Create a new admin account with email, role, and tenant assignment.",
      crudTitle: "Admin CRUD Endpoints",
      deactivateDesc: "Deactivate an admin account (prevents login).",
      deleteDesc: "Soft-delete an admin. Can be restored from the recycle bin.",
      description:
        "Full CRUD, account actions, bulk operations, impersonation, and query parameters for admin user management.",
      getByIdDesc: "Get a single admin by ID, including role details and last login.",
      impersonateDesc:
        "Start impersonating another admin. Receive their JWT with your audit trail attached.",
      impersonationTitle: "Impersonation",
      impersonationWarning:
        "Impersonation is a powerful feature restricted to SuperAdmins. All actions performed during impersonation are logged with both the impersonator's and the target's identity. The impersonation session is time-limited and automatically ends after 1 hour.",
      intro:
        "The Admin Management API provides full lifecycle management for admin accounts within a tenant. All endpoints require Bearer token authentication and appropriate permissions from the admins.* permission group.",
      listDesc: "List admins with pagination, search, sorting, and role/status filters.",
      protectDesc:
        "Toggle protection flag on an admin account (protected accounts cannot be deleted).",
      queryParamsTitle: "Query Parameters",
      resetPasswordDesc:
        "Force-reset an admin's password. Sends a new temporary password via email.",
      stopImpersonateDesc: "Stop impersonation and return to your original admin session.",
      title: "Admin Management API",
      transferDesc: "Transfer SuperAdmin role to another admin. You lose SuperAdmin privileges.",
      unblockDesc: "Unblock a blocked admin account.",
      unlockDesc: "Unlock a locked-out account (reset failed login attempts).",
      updateDesc: "Update an admin's name, phone, role, or active status.",
    },
    authApi: {
      changePasswordDesc: "Change password. Requires current password for verification.",
      configTitle: "Base Configuration",
      description:
        "Admin authentication endpoints — login, refresh, logout, 2FA, profile management, and security logs.",
      intro:
        "The Authentication API handles admin-panel authentication for dashboard users. Unlike the User Auth API, it includes two-factor authentication management, admin profile endpoints, and security log access. All endpoints use the /api/v1/auth base path.",
      loginDesc: "Authenticate admin with email/password. Returns JWT access + refresh tokens.",
      loginTitle: "Login",
      logoutDesc:
        "Revoke all refresh tokens for the authenticated user. Access token remains valid until expiry.",
      logoutTitle: "Logout",
      meDesc:
        "Get the full profile of the currently authenticated admin, including role, permissions, and tenant info.",
      profileTitle: "Profile Management",
      refreshDesc:
        "Exchange a valid refresh token for a new access + refresh token pair. Single-use rotation.",
      refreshTitle: "Refresh Token",
      removeAvatarDesc: "Remove the current avatar and revert to the default.",
      revokeSessionDesc:
        "Revoke a specific session by ID, forcing re-authentication on that device.",
      securityLogDesc:
        "View the admin's recent security events (logins, password changes, 2FA changes).",
      securityTip:
        "Security logs are retained for 90 days by default. Admins can only see their own security events; SuperAdmins can query the full audit log at /api/v1/audit.",
      securityTitle: "Security Endpoints",
      sessionsDesc: "List all active sessions with device info, IP address, and last activity.",
      tfaBackupDesc: "Regenerate a new set of 10 backup codes. Previous codes are invalidated.",
      tfaConfirmDesc: "Confirm 2FA setup by verifying the first TOTP code. Returns backup codes.",
      tfaDisableDesc: "Disable 2FA for the current admin account. Requires valid bearer token.",
      tfaEnableDesc: "Generate a TOTP secret and QR code URI for setup in an authenticator app.",
      tfaIntro:
        "SCRIPE supports TOTP-based 2FA using authenticator apps (Google Authenticator, Authy, Microsoft Authenticator). Once enabled, login returns a session token instead of access tokens — the client must verify the TOTP code to complete authentication.",
      tfaTitle: "Two-Factor Authentication",
      tfaVerifyDesc: "Complete login by verifying the TOTP code with the 2FA session token.",
      title: "Authentication API (Admin)",
      updateProfileDesc: "Update the current admin's name and phone number.",
      uploadAvatarDesc: "Upload a new avatar image (max 2 MB, jpg/png/webp).",
    },
    overview: {
      adminEndpointsTitle: "Admin Management Endpoints",
      authEndpointsTitle: "Authentication Endpoints",
      baseInfoTitle: "Base Information",
      description:
        "Complete REST API documentation with endpoints, request/response examples, authentication, and rate limiting.",
      intro:
        "The SCRIPE API is a RESTful JSON API. All endpoints use JWT Bearer-token authentication (unless marked public), standard HTTP status codes, and a consistent envelope response format. Swagger UI is available at /swagger for interactive testing.",
      otherEndpointsTitle: "Other Endpoints",
      responseFormatTitle: "Response Format",
      roleEndpointsTitle: "Role & Permission Endpoints",
      swaggerTip:
        "All API endpoints are also documented in the built-in Swagger UI at /swagger. You can authorize with a JWT token and try requests interactively.",
      tenantEndpointsTitle: "Tenant Management Endpoints",
      title: "API Reference",
      userEndpointsTitle: "User Management Endpoints",
    },
    rolePermissionApi: {
      assignPermDesc:
        "Replace all permissions for a role. Supports field-level restrictions per permission.",
      assignTitle: "Permission Assignment",
      availableForTenantDesc:
        "List permissions available for a specific tenant (for tenant creation/editing).",
      availablePermDesc: "List permissions available for assignment in the current tenant's scope.",
      categoriesDesc: "Get permission categories with all permissions in each.",
      cloneRoleDesc: "Clone an existing role with all its permissions and menu items.",
      createRoleDesc: "Create a new custom role with permissions and menu visibility.",
      deleteRoleDesc: "Delete a role. Fails if admins are still assigned to it.",
      description:
        "Role CRUD, permission assignment, tenant-scoped roles, and permission catalog for RBAC management.",
      getPermByIdDesc: "Get a single permission by ID with full details.",
      getPermDesc: "Get the current permissions assigned to a role.",
      getRoleDesc: "Get role details including permissions, menu items, and field restrictions.",
      intro:
        "The Role & Permission API manages the RBAC (Role-Based Access Control) system. Roles are tenant-scoped, meaning each tenant has its own set of roles. Permissions are seeded from the backend and are read-only. Roles compose permissions with optional field-level restrictions.",
      listPermissionsDesc: "List all permissions grouped by category.",
      listRolesDesc: "List all roles in the current tenant with admin counts.",
      myPermissionsDesc: "Get the current admin's effective permissions.",
      myTenantRolesDesc: "List roles available in the current admin's tenant.",
      permissionsIntro:
        "Permissions are seeded automatically from the backend. They cannot be created or modified through the API. Each permission belongs to a category and can have field-level restrictions when assigned to a role.",
      permissionsTitle: "Permissions (Read-Only)",
      rolesCrudTitle: "Role CRUD",
      seededNote:
        "Permissions are seeded from backend code during application startup. Adding new endpoints with [RequirePermission] attributes automatically creates new permissions on next deploy.",
      syncScopesDesc: "Sync permission scopes and restricted fields from the parent tenant.",
      tenantScopedIntro:
        "Each tenant has its own set of roles that can only use permissions available in the tenant's scope. The available permissions are controlled by the parent tenant's role assignment. Admins can only see and assign permissions their tenant is allowed to use.",
      tenantScopedTitle: "Tenant-Scoped Roles",
      title: "Role & Permission API",
      updateRoleDesc: "Update role name, description, and menu visibility.",
    },
    systemApi: {
      blockedIpsDesc: "Get the top blocked IP addresses with attempt counts.",
      createMenuDesc: "Create a new menu item with title, icon, path, and parent.",
      dashboardExportTitle: "Dashboard Export",
      dashboardIntro:
        "The dashboard endpoints provide real-time KPI summaries, login activity trends, security event monitoring, and audit event distribution. All data is tenant-scoped based on the authenticated admin's context.",
      dashboardTitle: "Dashboard Analytics",
      deleteFileDesc: "Delete an uploaded file from storage.",
      deleteMenuDesc: "Delete a menu item and all its children.",
      description:
        "Dashboard analytics, menu management, recycle bin, file management, system settings, and health checks.",
      downloadDesc: "Download or stream a file by ID.",
      eventDistDesc: "Get audit event type distribution for pie/bar charts.",
      exportAnalyticsDesc: "Export analytics data with optional chart images (PDF).",
      exportOverviewDesc: "Export the overview dashboard as CSV, Excel, or PDF.",
      exportSecurityDesc: "Export security event data for compliance reporting.",
      filesTitle: "File Management",
      getSettingsDesc:
        "Get global system settings (email config, security policies, feature flags).",
      intro:
        "The System API covers platform-level operations including dashboard analytics, dynamic menu management, soft-delete recycle bin, file uploads, system settings, and infrastructure health checks.",
      listDeletedDesc:
        "List soft-deleted entities with type, name, deleted date, and restore eligibility.",
      listMenusDesc: "List all menu items in tree structure.",
      loginActivityDesc: "Get login activity over time (successful vs failed logins per day).",
      menuTitle: "Menu Management",
      myMenuDesc:
        "Get the personalized menu tree for the current admin (filtered by role visibility).",
      myOverridesDesc: "Get the current tenant's menu overrides.",
      purgeDesc: "Permanently delete an entity from the recycle bin (irreversible).",
      readinessDesc: "Readiness probe — checks database, cache, blob storage, and background jobs.",
      recentChangesDesc: "Get recent entity changes across the system (creates, updates, deletes).",
      recycleBinTitle: "Recycle Bin",
      reorderMenuDesc: "Reorder menu items by providing an array of {id, order} pairs.",
      resetSettingsDesc: "Reset all settings to factory defaults.",
      restoreDesc: "Restore a soft-deleted entity back to active state.",
      roleVisibilityDesc: "Set which roles can see a specific menu item.",
      securityEventsDesc:
        "Get security events including brute-force attempts, locked accounts, and blocked IPs.",
      settingsTitle: "System Settings",
      summaryDesc:
        "Get KPI summary with admin/user/tenant counts, today's logins, and storage usage.",
      tenantOverrideDesc: "Override a menu item's visibility or order for a specific tenant.",
      title: "System API",
      updateMenuDesc: "Update a menu item's title, icon, path, or parent.",
      updateSettingsDesc: "Update system settings. Changes take effect immediately.",
      uploadDesc: "Upload a file (image, document). Returns file metadata with access URL.",
    },
    tenantApi: {
      adminsDesc: "List all admins belonging to a specific tenant.",
      childrenDesc: "List direct children of a specific tenant.",
      createDesc: "Create a new child tenant under the current admin's tenant.",
      crudTitle: "Tenant CRUD",
      deleteDesc: "Soft-delete a tenant. Active admins and users are deactivated.",
      description:
        "Tenant CRUD, hierarchy management, settings, and logo upload for multi-tenant operations.",
      getByIdDesc: "Get full tenant details including settings, statistics, and hierarchy info.",
      getSettingsDesc: "Get the full settings object for a tenant.",
      hierarchyDesc: "Get the full tenant hierarchy tree from the current admin's scope.",
      hierarchyIntro:
        "Tenants form a tree hierarchy where parent tenants can see and manage their children. The hierarchy endpoint returns the full tree structure, while other endpoints provide tenant-specific statistics and resource listings.",
      hierarchyTitle: "Hierarchy & Statistics",
      intro:
        "The Tenant Management API provides full lifecycle management for tenants in the multi-tenant hierarchy. Parent tenants can manage their children, and each tenant has isolated settings, branding, and resource limits.",
      listDesc: "List all tenants visible to the current admin's scope, with pagination.",
      myChildrenDesc: "List the current admin's tenant's direct children.",
      mySettingsDesc: "Update the current admin's own tenant settings (shortcut).",
      permissionsDesc: "List all permissions available in a specific tenant's scope.",
      rolesDesc: "List all roles belonging to a specific tenant.",
      settingsNote:
        "Tenant settings include password policies, registration controls, language defaults, and resource limits. Child tenants inherit parent settings by default but can override them.",
      settingsTitle: "Tenant Settings",
      statsDesc: "Get statistics for a tenant (admin count, user count, storage usage).",
      title: "Tenant Management API",
      updateDesc: "Update tenant name, slug, and basic information.",
      updateSettingsDesc:
        "Update tenant settings (registration policy, language, limits, password policy).",
      uploadLogoDesc: "Upload a tenant logo (max 5 MB, jpg/png/svg/webp).",
    },
    userAuthApi: {
      changePasswordDesc: "Change password. Requires current password verification.",
      configTitle: "Base Configuration",
      description:
        "User registration, email/phone verification, login, external OAuth, password reset, 2FA, and profile management.",
      diffNote:
        "The User Auth API (/user-auth) is separate from the Admin Auth API (/auth). Users authenticate at /user-auth/login, admins at /auth/login. Both issue JWT tokens in the same format but have different permission scopes and 2FA flows.",
      externalIntro:
        "SCRIPE supports OAuth authentication via Google, Facebook, Apple, or Microsoft. The client obtains a provider token and sends it to the external-login endpoint. SCRIPE validates the token, creates or links the account, and returns JWT tokens.",
      externalLoginDesc:
        "Authenticate via Google, Facebook, Apple, or Microsoft OAuth. Creates or links account.",
      externalTitle: "External Authentication",
      forgotPasswordDesc:
        "Request a password reset code. Always returns success to prevent email enumeration.",
      intro:
        "The User Authentication API handles self-service authentication for end-users. Unlike the Admin Auth API, it includes registration, email/phone verification, external OAuth login, and password reset flows.",
      loginDesc: "Authenticate user with email and password. Returns JWT access + refresh tokens.",
      loginTitle: "Login",
      logoutDesc: "Revoke all refresh tokens and end the session.",
      meDesc: "Get the authenticated user's profile, including tenant and verification status.",
      passwordResetTitle: "Password Reset",
      profileTitle: "User Profile",
      refreshDesc: "Exchange a valid refresh token for a new token pair. Single-use rotation.",
      registerDesc:
        "Register a new user account with email, password, and tenant. Sends verification email.",
      registerTitle: "Registration",
      resetPasswordDesc: "Reset password using the 6-digit code from forgot-password.",
      sendVerificationDesc:
        "Send (or resend) a verification code to email or phone. Rate limited to 5/hour.",
      summaryTitle: "Endpoint Summary",
      tfaBackupDesc: "Regenerate backup codes. All previous codes are invalidated.",
      tfaConfirmDesc: "Confirm 2FA by verifying the first TOTP code. Returns 10 backup codes.",
      tfaDisableDesc: "Disable 2FA for the current user. Requires valid bearer token.",
      tfaEnableDesc: "Generate TOTP secret and QR code for authenticator app setup.",
      tfaTitle: "User Two-Factor Authentication",
      tfaVerifyDesc: "Complete login by verifying the TOTP code with the 2FA session token.",
      title: "User Authentication API",
      tokenTitle: "Token Management",
      updateProfileDesc: "Update user name and phone number.",
      verificationTitle: "Email & Phone Verification",
      verifyEmailDesc: "Verify email address using a 6-digit OTP code sent to the user's email.",
      verifyPhoneDesc: "Verify phone number using a 6-digit OTP code sent via SMS.",
    },
    userGroupsApi: {
      addMembersDesc: "Append one or more AdminIds to the group. This operation is idempotent.",
      bulkActivateDesc:
        "Bulk set IsActive=true for multiple User Groups. Options to cascade activation to members.",
      bulkCascadeIntro:
        "Execute massive operational commands across thousands of records simultaneously, optionally cascading the effects down to the associated member administrators.",
      bulkCascadeTitle: "Bulk & Cascade Operations",
      bulkDeactivateDesc:
        "Bulk set IsActive=false for multiple User Groups. Options to cascade deactivation to members.",
      bulkDeleteDesc:
        "Bulk soft-delete multiple User Groups. Options to cascade soft-delete to members.",
      cascadeWarningNode:
        "Cascade operations securely skip Protected Admins. If you attempt to cascade a delete onto the Tenant Owner, the group is deleted, but the Owner is completely spared.",
      createGroupDesc:
        "Create a new User Group, strictly validating that the provided RoleIds exist and belong to the target Tenant.",
      createGroupMyTenantDesc:
        "Create a new User Group automatically mapped to the JWT's TenantId context.",
      crudTitle: "User Groups CRUD",
      deleteGroupDesc:
        "Soft-delete a User Group (AdminUserGroup relations are automatically orphaned).",
      description:
        "Manage large fleets of administrators via unified User Groups. Supports bulk operations, cascading deletions, and additive role assignments.",
      getGroupDesc:
        "Fetch massive detail for a specific User Group, including all active members, roles, and JSON field restrictions.",
      groupMembersIntro: "Manage the administrators assigned to a specific User Group.",
      groupMembersTitle: "Group Members",
      groupRolesRestrictionsIntro:
        "Manage the exact role payloads and field-level serialization blocks inherited by the group's members.",
      groupRolesRestrictionsTitle: "Group Roles & Restrictions",
      groupsByTenantDesc: "SuperAdmin only. Fetch groups filtered directly by a specific TenantId.",
      intro:
        "The User Groups API manages bulk collections of roles and field restrictions assigned to administrators. Removing a group, restricting a permission, or cascading a deletion updates all attached administrators instantly at their next token refresh.",
      listGroupsDesc:
        "Retrieve a paginated list of all User Groups. SuperAdmins see global groups; Tenant Admins see only their tenant's.",
      myTenantGroupsDesc:
        "Quick-fetch essential group data for the authenticated user's active tenant (optimized for dropdowns).",
      removeMemberDesc:
        "Sever the link between an Admin and the Group. Does not affect the Admin's directly assigned roles.",
      setGroupRestrictionsDesc:
        "Perform a destructive, nuke-and-pave synchronization of all JSON field restrictions for the Group.",
      setGroupRolesDesc:
        "Perform a destructive, nuke-and-pave synchronization of all RoleIds assigned to the Group.",
      title: "User Groups API",
      updateGroupDesc:
        "Update core group metadata (Name, Description, Status) and perform a full nuke-and-pave synchronization of RoleIds.",
    },
    webhookEmailApi: {
      cancelEmailDesc: "Cancel a queued (not yet sent) email.",
      createTemplateDesc: "Create a new message template with HTML/text body and variables.",
      createWebhookDesc: "Create a new webhook subscription with URL, events, and HMAC secret.",
      deleteNotifDesc: "Delete a notification.",
      deleteTemplateDesc: "Delete a message template.",
      deleteWebhookDesc: "Delete a webhook subscription.",
      description:
        "Webhook subscriptions, email sending/bulk, message templates, and real-time notifications with SignalR.",
      emailIntro:
        "The email system supports individual and bulk email sending with template variable interpolation. Emails are queued via background services and processed asynchronously. The system supports scheduling, cancellation, and resending of failed emails.",
      emailStatsDesc: "Get email statistics (sent, failed, queued, bounce rate).",
      emailTitle: "Email System",
      getTemplateDesc: "Get a single template with full body content and variable definitions.",
      intro:
        "The Webhook, Email & Notification API provides event-driven integrations, transactional email delivery, template management, and real-time in-app notifications. Webhooks use HMAC signature verification for security.",
      listEmailsDesc: "List sent/queued/failed emails with pagination and status filters.",
      listNotificationsDesc: "List in-app notifications for the current user with pagination.",
      listTemplatesDesc: "List all message templates with category and status filters.",
      listWebhooksDesc: "List all webhook subscriptions for the current tenant.",
      markAllReadDesc: "Mark all notifications as read.",
      markReadDesc: "Mark a single notification as read.",
      notificationsTitle: "Notifications",
      previewTemplateDesc: "Preview a template with sample data (returns rendered HTML).",
      renderTemplateDesc: "Render a template with provided variables (returns final HTML + text).",
      resendEmailDesc: "Resend a failed email.",
      searchRecipientsDesc: "Search for valid email recipients (admins/users) by name or email.",
      searchTargetsDesc: "Search for notification targets (users/admins) by name or email.",
      sendBulkDesc: "Send bulk emails to multiple recipients or a filtered group.",
      sendEmailDesc: "Send a single email using a template with variable substitution.",
      signalrTip:
        "Real-time notifications are delivered via SignalR WebSocket at /hubs/notification. The client receives instant push notifications without polling. Connect with your JWT token for authenticated real-time updates.",
      templatesIntro:
        "Message templates use the Scriban engine (Liquid-compatible) for variable interpolation. Templates support HTML and plain-text bodies, with preview and render endpoints for testing before sending.",
      templatesTitle: "Message Templates",
      testWebhookDesc: "Send a test event to the webhook URL to verify connectivity.",
      title: "Webhook, Email & Notification API",
      unreadCountDesc: "Get the count of unread notifications.",
      updateTemplateDesc: "Update a template's content, subject, or variables.",
      updateWebhookDesc: "Update a webhook's URL, events, or active status.",
      webhooksIntro:
        "Webhooks allow external systems to subscribe to SCRIPE events. When an event occurs (admin created, user registered, etc.), SCRIPE sends an HTTP POST to the subscriber URL with a signed payload. Failed deliveries are retried up to 3 times with exponential backoff.",
      webhooksTitle: "Webhooks",
    },
  },
};
