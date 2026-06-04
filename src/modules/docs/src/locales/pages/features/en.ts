/**
 * Docs page locale — EN
 */
export const en = {
  features: {
    auditSystem: {
      adminEventsTitle: "Admin Management Events",
      architectureTitle: "Audit Architecture",
      authEventsTitle: "Authentication Events",
      bulkEventsTitle: "Bulk Operation Events",
      description:
        "4-source pipeline, 35+ event types, 7 Guardian events, real-time SignalR, and CSV/PDF export.",
      endpointsTitle: "Audit API Endpoints",
      eventTypesTitle: "Event Types (35+ Categories)",
      exportIntro:
        "The AuditExportService supports CSV and PDF export of filtered audit logs. Exports respect tenant scoping  admins can only export logs from their own tenant and child tenants.",
      exportTitle: "Audit Export",
      guardianIntro:
        "Guardian events are audit records created when the system BLOCKS a dangerous operation. These are the safety net that prevents catastrophic actions like deleting the last super admin in a tenant.",
      guardianTitle: "Guardian Protection Events",
      intro:
        "SCRIPE captures every significant action in the audit log through a 4-source pipeline: AstraFlow mediator behaviors (CQRS commands), EF Core interceptors (entity changes), middleware (HTTP requests), and explicit service calls (security events). All events are broadcasted in real-time via SignalR to tenant-scoped groups.",
      rbacEventsTitle: "RBAC Events",
      realTimeIntro:
        "Every audit event is broadcast in real-time via SignalR. Connected clients receive events scoped to their tenant, enabling live audit dashboards and instant security alerts. Events are sent to both the tenant group and a global group (for super admins).",
      realTimeTitle: "Real-Time Broadcasting",
      retentionTip:
        "Audit logs are retained per-tenant via TenantSettings.AuditRetentionDays. Set to 0 for indefinite retention. A background job automatically purges expired records.",
      serviceMethodsIntro:
        "The IAuditService interface exposes 5 specialized logging methods, each capturing different metadata. All methods are async and fire-and-forget  they never block the main request pipeline.",
      serviceMethodsTitle: "AuditService Methods",
      sessionEventsTitle: "Session Events",
      tenantEventsTitle: "Tenant Events",
      title: "Audit System",
      twoFactorEventsTitle: "Two-Factor Events",
    },
    authentication: {
      adminEntityIntro:
        "The Admin entity has several security-critical fields that control account behavior and protection.",
      adminEntityTitle: "Admin Entity (Security Features)",
      description:
        "Dual auth (Admin + User), multi-workspace routing, JWT tokens, 2FA with backup codes, password expiry enforcement, SSO suspension gate, and tenant-scoped password policy.",
      dualAuthIntro:
        "SCRIPE has two separate authentication pipelines. Admin auth (AdminAuthController) issues JWTs with admin-specific claims (TenantId, IsSuperAdmin, Roles). User auth (UserAuthController) issues JWTs with user-specific claims (NationalId, Gender, Country). Each has its own login, register, and token refresh endpoints.",
      dualAuthTitle: "Dual Authentication (Admin & User)",
      endpointsAdminTitle: "Admin Auth Endpoints",
      endpointsTitle: "Authentication API Endpoints",
      endpointsUserTitle: "User Auth Endpoints",
      flowTitle: "Authentication Flow",
      intro:
        "SCRIPE provides a secure authentication system with JWT access tokens, refresh token rotation, optional two-factor authentication, multi-workspace login discovery, password expiry enforcement, and comprehensive rate limiting. The system supports separate Admin and User authentication flows with different JWT claims and permissions.",
      jwtIntro:
        "The system uses short-lived access tokens (15 minutes) with long-lived refresh tokens (7 days). Refresh tokens are rotated on each use to prevent reuse attacks.",
      jwtTitle: "JWT Token Configuration",
      lockoutWarning:
        "After 5 failed login attempts, the account is locked for 15 minutes. The lockout counter resets after a successful login. Admins can manually unlock accounts from the admin panel.",
      passwordExpiryIntro:
        "During login, after BCrypt verification and lockout checks, the handler invokes ITenantPasswordValidator to check if the admin's password has exceeded the tenant's PasswordExpiryDays setting. If expired, the response includes MustChangePassword = true, forcing the frontend to redirect the admin to the change-password page. The admin receives a valid JWT but cannot access the dashboard until the password is updated.",
      passwordExpiryTitle: "Password Expiry Enforcement",
      passwordPolicyIntro:
        "Password requirements are configurable per-tenant via TenantSettings. Each tenant can set minimum length, uppercase requirements, numbers, special characters, and expiry duration. The PasswordLastChanged field on the Admin entity is checked against the tenant's PasswordExpiryDays to enforce password rotation.",
      passwordPolicyTitle: "Tenant-Scoped Password Policy",
      rateLimitingIntro:
        "Authentication endpoints are protected by multiple rate limiting policies to prevent brute-force attacks and abuse.",
      rateLimitingTitle: "Rate Limiting",
      ssoSuspensionIntro:
        "The ExternalLoginCommandHandler includes a tenant suspension security gate. After SSO token validation and account linking, the handler checks the admin's tenant status. If the tenant is Suspended or Cancelled, login is rejected with a localized error — preventing deactivated users from bypassing standard login checks via SSO providers like Google or Azure AD.",
      ssoSuspensionTitle: "SSO Tenant Suspension Gate",
      ssoSuspensionWarning:
        "Without this gate, SSO users could authenticate via an external identity provider and receive a valid SCRIPE JWT even if their tenant has been suspended. All SSO login paths now enforce the same tenant status checks as the standard password login.",
      title: "Authentication",
      twoFactorIntro:
        "2FA is implemented with TOTP (Time-based One-Time Password) using a per-admin TwoFactorSecret. Backup codes are hashed and stored in BackupCodesJson. Anti-replay protection ensures the same code cannot be used twice via LastTwoFactorCodeUsed and LastTwoFactorCodeUsedAt timestamps.",
      twoFactorTitle: "Two-Factor Authentication (Deep)",
      workspaceIntro:
        "When an admin logs in from the platform domain (no pre-resolved tenant), the backend executes a 3-case routing algorithm. Case A uses a provided tenantId for strict domain isolation. Case A' triggers when the isPlatformAdmin flag is set — this directly looks up the platform admin (TenantId = null) and bypasses workspace discovery entirely, preventing an infinite loop. Case B performs workspace discovery: it first checks for a platform admin, then searches all tenants by email — returning a workspace picker if multiple matches are found.",
      workspaceNote:
        "The isPlatformAdmin flag was introduced to solve a critical loop: when a platform admin selected 'Platform Administration' from the workspace picker, it would re-trigger workspace discovery (since there is no tenantId for the platform). The flag now signals the backend to skip discovery and authenticate directly against the platform-level admin record.",
      workspaceTitle: "Multi-Workspace Login Discovery",
    },
    dashboardBuilder: {
      archIntro:
        "The Dashboard Builder is implemented across 7 files in the core layer, following SCRIPE's provider-based architecture pattern. The sync hook and providers handle all state management, while the layout component serves as the entry point.",
      archTip:
        "To add a new setting, add the property to the Settings interface and defaultSettings in settings-provider.tsx, then add the setter in the context. The merge engine, sync hook, and persistence all work automatically with the new field.",
      archTitle: "Architecture & File Map",
      description:
        "Server-synced admin preferences with 4-layer merge engine, 61 customizable settings, FOUC prevention, 409 conflict resolution, and edition-based feature gating.",
      edgeCasesIntro:
        "The sync system handles 5 critical edge cases that are common in real-world enterprise deployments where admins work across multiple devices, close tabs without saving, and occasionally have network interruptions.",
      edgeCasesTitle: "Edge Case Protections",
      edgeCasesWarning:
        "The PENDING_SETTINGS_FLUSH key intentionally survives logout — it is NOT included in AUTH_STORAGE_KEYS_TO_CLEAR. This ensures settings are flushed on the next login even if the JWT expired during the previous session.",
      intro:
        "The Dashboard Builder is SCRIPE's enterprise-grade admin preference system that syncs 61 customizable dashboard settings between the browser and server. It uses a 4-layer merge engine (Platform → Tenant → Admin → Runtime) to resolve settings with tenant-level override control, cross-device persistence via AdminSettingsJson, and 5 edge case protections including FOUC prevention, tab-close keepalive, and field-level 409 conflict resolution.",
      mergeEngineIntro:
        "Settings follow a strict 4-layer precedence chain. Each layer can override the previous, with optional path-level access control at the tenant layer. This architecture enables white-label deployments where tenant administrators enforce brand standards while still allowing individual admins to personalize their workspace within allowed boundaries.",
      mergeEngineNote:
        "Layer 2 (Edition Constraints) is handled server-side via the FeatureCheckBehavior pipeline. The frontend never renders controls for features the edition does not support.",
      mergeEngineTitle: "4-Layer Merge Engine",
      overrideControlIntro:
        "Tenant administrators can control which settings individual admins are allowed to customize. When AllowAdminThemeOverride is true, the AllowedAdminSettingsJson field contains a JSON whitelist of setting paths that admins can modify. Settings not in the whitelist are rendered as read-only with a lock indicator.",
      overrideControlTitle: "Admin Override Control",
      overviewIntro:
        "The Dashboard Builder provides a complete admin preference lifecycle — from immediate cache-first rendering to background server reconciliation. Every admin gets 61 customizable settings covering layout, colors, typography, component styles, and accessibility, all persisted to the server and synced across devices.",
      overviewTip:
        "Settings are rendered instantly from localStorage cache on page load. The server fetch happens silently in the background — users never see a loading spinner unless it is their first-ever login on a new device.",
      overviewTitle: "System Overview",
      securityIntro:
        "The Dashboard Builder implements defense-in-depth security to prevent cross-admin data leakage, payload overflow, and unauthorized settings modification.",
      securityTitle: "Security Model",
      settingsRefIntro:
        "All 61 settings are organized into 9 sections. Each setting has a defined type, default value, DOM data-attribute for CSS theming, and an optional edition gate that controls which subscription tier can access it.",
      settingsRefTitle: "Settings Reference (61 Settings)",
      syncHookIntro:
        "The useAdminSettingsSync hook manages the complete lifecycle of admin settings: initial load from cache, deferred flush of pending changes from previous sessions, background server fetch, silent reconciliation, debounced save on changes, and tab-close protection. The hook is wired in DashboardLayout — the root client component for all authenticated pages.",
      syncHookTitle: "Server Sync Hook",
      title: "Dashboard Builder",
    },
    dashboardHub: {
      archIntro:
        "The Dashboard Hub uses a Hub-and-Spoke pattern where the main DashboardView serves as the central hub rendering a tab strip, and each tab lazy-loads an independent domain-specific view (spoke). The Overview tab is inlined for instant rendering. Audit, Security, and Analytics tabs are loaded on-demand via React.lazy with Suspense fallbacks, keeping the initial bundle lean.",
      archTip:
        "Sub-views are lazy-loaded only when their tab is first activated. This reduces the initial dashboard bundle by ~60% compared to eager-loading all four views.",
      archTitle: "Hub-and-Spoke Architecture",
      cachingIntro:
        "All TanStack Query keys across the hub include the current tenantId as a partition key. This ensures that when a SuperAdmin uses the 'Enter Tenant World' drill-down, switching tenants automatically invalidates and re-fetches all dashboard data for the new tenant context. Without tenant-partitioned keys, stale data from a previously viewed tenant could persist in the cache.",
      cachingTitle: "Tenant-Aware Caching",
      compatIntro:
        "To prevent build breaks during the migration, DashboardEntities.ts retains deprecated type aliases that re-export types from the new domain-specific modules. Components that still import from the dashboard module's entities file will continue to work, but will receive TypeScript deprecation warnings guiding developers toward the canonical import paths.",
      compatTitle: "Backward Compatibility",
      compatWarning:
        "Deprecated aliases should be removed in a future cleanup pass once all consuming components have been migrated to import from their respective domain module (audit/security/analytics).",
      description:
        "Modular tabbed dashboard with domain-segregated sub-modules (Audit, Security, Analytics), 6-layer clean architecture per module, ISP-compliant interfaces, lazy loading, and permission-gated tab visibility.",
      diIntro:
        "All three new modules are registered in the SystemContainer (modules/system/di.ts). Each module wire follows the pattern: Service (takes IApiService) → Repository (takes Service) → SystemContainer interface declaration → lazy getter export. ViewModels consume repositories exclusively through the DI container — never instantiating services directly.",
      diTip:
        "Lazy getters in the systemContainer accessor ensure that services and repositories are only instantiated when first accessed, preventing unnecessary network overhead for tabs that are never opened.",
      diTitle: "DI Container Wiring",
      domainIntro:
        "Previously, all dashboard data flowed through a single DashboardRepository (God Interface) with 8+ methods spanning audit, security, and analytics concerns. The refactored architecture extracts each domain into an independent module with its own repository interface, eliminating monolithic coupling and adhering to the Interface Segregation Principle (ISP).",
      domainNote:
        "Backward-compatible type aliases are maintained in DashboardEntities.ts for legacy components that have not yet migrated to the new domain-specific imports. These aliases are marked @deprecated to guide future cleanup.",
      domainTitle: "Domain Segregation (Interface Segregation Principle)",
      hubIntro:
        "The DashboardView component serves as the hub, rendering a TabsList with 4 TabsTrigger elements (Overview, Audit, Security, Analytics). Audit and Security tabs are conditionally rendered based on the current admin's permissions using the usePermission hook. Each tab's content is wrapped in a Suspense boundary with a Skeleton fallback that matches the expected layout, preventing layout shifts during lazy loading.",
      hubNote:
        "Tab visibility is permission-gated on the frontend for UX purposes (hide tabs the user cannot access). Backend endpoints enforce the actual security boundary — frontend checks are supplementary, not authoritative.",
      hubTitle: "Tabbed Hub Implementation",
      intro:
        "The Dashboard Hub is SCRIPE's central operational command center — a tabbed interface that aggregates four domain-specific views (Overview, Audit, Security, Analytics) into a unified hub. Each domain module follows a strict 6-layer clean architecture (Models → Entities → Interfaces → Services → Repositories → Mappers) with dedicated DI registration. Sub-views are lazy-loaded via React.lazy and permission-gated to ensure users only see tabs they are authorized to access.",
      layersIntro:
        "Each extracted module (Audit, Security, Analytics) implements the full SCRIPE frontend clean architecture stack. The 6 layers ensure strict separation of concerns: Models hold raw API response shapes, Entities are rich domain objects with computed properties, Interfaces define contracts, Services handle HTTP calls via IApiService, Repositories orchestrate services and mappers to return domain entities, and Mappers perform DTO-to-entity conversion with null coalescing.",
      layersTitle: "6-Layer Clean Architecture",
      sourceIntro:
        "The refactored Dashboard Hub spans 4 modules (dashboard, audit, security, analytics), each with its own complete 6-layer stack. The DI container (di.ts) is the single integration point where all modules are wired together.",
      sourceTitle: "Source File Reference",
      title: "Dashboard Hub (Hub-and-Spoke)",
      viewmodelIntro:
        "Each ViewModel hook now imports its dedicated repository from the DI container instead of sharing a single dashboard repository. This eliminates cross-domain coupling: useAuditViewModel consumes only auditRepository, useSecurityDashboardViewModel consumes only securityRepository, and useTenantAnalyticsViewModel consumes only analyticsRepository. The slimmed useDashboardViewModel retains only 4 methods for the Overview tab.",
      viewmodelTitle: "ViewModel Decoupling",
    },
    downloadExport: {
      architectureIntro:
        "The Download System supports two modes: authenticated downloads (JWT required) and session-based downloads (temporary URL, no auth). Both support resumable downloads via HTTP Range headers and cache validation via ETags.",
      architectureTitle: "Download Architecture",
      description:
        "Authenticated and session-based downloads with Range support, ETag caching, and path traversal prevention.",
      endpointsTitle: "Download Endpoints",
      etagNote:
        "ETags are generated from file path, size, and last modified time. When a client sends If-None-Match with a matching ETag, the server returns 304 Not Modified without transferring the file, saving bandwidth.",
      etagTitle: "ETag Caching",
      pathTraversalNote:
        "All file paths are sanitized by removing '..' sequences and normalizing slashes. The resolved path is validated to ensure it stays within the configured storage directory, preventing directory traversal attacks.",
      pathTraversalTitle: "Path Traversal Prevention",
      resumableIntro:
        "The system supports HTTP Range headers for resumable downloads. Clients can request specific byte ranges (e.g., bytes=1024-2048) and receive partial content with a 206 status code.",
      resumableTitle: "Resumable Downloads (Range Headers)",
      sessionIntro:
        "Session-based downloads allow sharing temporary download URLs without requiring authentication. A session is created with an expiration time, and the URL can be shared with external users.",
      sessionTitle: "Session-Based Downloads",
      sessionWarning:
        "Download sessions expire after the configured duration (default: 1 hour). After expiration, the session URL returns 404. Sessions cannot be renewed  create a new session instead.",
      streamConfigTitle: "FileStream Configuration",
      title: "Download & Export System",
    },
    emailSystem: {
      architectureIntro:
        "The Email System follows a pipeline architecture: Controller †’ EmailService †’ Queue †’ Sender †’ SMTP. The queue strategy is pluggable  InMemoryQueue for development and a background queue (e.g., Hangfire) for production.",
      architectureTitle: "Email Pipeline Architecture",
      backgroundIntro:
        "The background queue creates a job for each email. The job is processed by a worker that picks up emails from the queue, renders the template, and sends via the configured sender strategy.",
      backgroundTitle: "Background Worker Pattern",
      description:
        "Pluggable email delivery pipeline with queue strategies, background processing, and HTML sanitization.",
      endpointsTitle: "Email Controller Endpoints",
      errorIntro:
        "Emails are sanitized before sending to prevent XSS via HTML email bodies. Failed sends are retried using the background provider's retry mechanism with exponential backoff.",
      errorTitle: "Error Handling & Sanitization",
      queueIntro:
        "The queue strategy determines how emails are processed. In development, emails are sent immediately via InMemoryQueue. In production, they are enqueued to a background provider (e.g., Hangfire) for reliable processing.",
      queueTitle: "Queue Implementations",
      senderIntro:
        "The sender strategy determines how the email is actually delivered. SmtpSender uses System.Net.Mail for real delivery. ConsoleSender logs the email to the console for development.",
      senderTitle: "Sender Strategies",
      title: "Email System",
    },
    fileUpload: {
      architectureIntro:
        "SCRIPE has two upload paths: ImageUploadController for profile photos and logos (with resize/crop/format processing), and UploadsController for general files (documents, attachments). Both validate file types and sizes before delegating to IBlobStorage.",
      architectureTitle: "Upload Architecture",
      description:
        "Dual upload pipeline for images and documents with validation, processing, and tenant-scoped storage.",
      generalTitle: "General File Upload",
      imagePipelineTitle: "Image Upload Pipeline",
      servingNote:
        "Uploaded files are served through ASP.NET Core's StaticFileMiddleware. The /uploads request path maps to the physical storage directory. Unknown file types return application/octet-stream to prevent MIME sniffing attacks.",
      servingTitle: "Static File Serving",
      tenantScopedTitle: "Tenant-Scoped Storage",
      title: "File Upload System",
      validationTitle: "File Validation Rules",
    },
    loginCustomizer: {
      a11yAuditIntro:
        "The useAccessibilityChecker hook runs 4 automated checks in real-time against the current draft settings: Contrast Ratio validation (4.5:1 for text, 3:1 for large text), Touch Target sizing (minimum 44×44px), Overlay Readability (checks overlay opacity doesn't obscure content), and Motion settings (validates reduced-motion configuration). Each check returns pass/warn/fail severity with actionable messages.",
      a11yAuditTitle: "Real-Time WCAG Audit Engine",
      a11yAutoFixIntro:
        "The audit engine includes an autoFix function that automatically resolves failing checks by adjusting the draft settings to WCAG AA compliance. For example, if contrast ratio fails, it adjusts the text color; if touch targets are too small, it increases button height to 44px.",
      a11yAutoFixTitle: "Auto-Fix Mechanism",
      a11yCat1:
        "Focus Indicators — Custom focus ring color, width (1–5px), offset, and style for all interactive elements.",
      a11yCat2:
        "High Contrast — Toggle high-contrast mode with configurable text/background contrast overrides.",
      a11yCat3:
        "Text Readability — Font size scaling (80–200%), line height adjustment (1.0–2.5), letter spacing, and word spacing controls.",
      a11yCat4:
        "Motion & Animation — Respect prefers-reduced-motion, control transition durations, and disable decorative animations independently.",
      a11yCat5:
        "Touch Targets — Enforce minimum button and input heights (44px WCAG minimum), adjust interactive element padding.",
      a11yCat6:
        "Color & Vision — Colorblind-safe mode, custom link colors, underline-always for links, and icon labeling.",
      a11yCat7:
        "Screen Reader — ARIA landmark injection, live region announcements, skip-navigation links, and form label enhancement.",
      a11yCat8:
        "Reading Assistance — Configurable reading guide overlay, line highlighting, text mask, and dyslexia-friendly font toggle.",
      a11yCategoriesTitle: "8 Settings Categories",
      a11yCssIntro:
        "The useLoginBrandingTokens hook emits 23+ accessibility-specific CSS rules via a single <style> tag injection. Rules include focus ring styling (--login-focus-ring-*), high-contrast overrides, font scaling, touch target minimums, reading guide overlays, and reduced-motion media query overrides. All accessibility CSS cascades correctly over base branding styles.",
      a11yCssTitle: "CSS Injection Pipeline",
      a11yIntro:
        "The Accessibility tab provides a comprehensive suite of 32 settings across 8 categories, designed to make the login page fully WCAG AA compliant. All settings are stored in the StudioDraft entity and injected into the live page via the CSS token pipeline. The suite includes real-time validation, one-click profiles, and an automated WCAG audit engine.",
      a11yPreviewIntro:
        "The LoginPreviewShell displays accessibility features in real-time: reading guide/mask overlays render visually in the preview iframe, and an accessibility badge shows the count of active accessibility features. The preview is fully isolated from the authentication system.",
      a11yPreviewTitle: "Preview Integration",
      a11yProfile1:
        "WCAG AA Baseline — Applies minimum WCAG AA requirements: 4.5:1 contrast, 44px touch targets, visible focus rings.",
      a11yProfile2:
        "Low Vision — Large fonts (140%), high contrast, bold text, extra spacing, thick focus indicators.",
      a11yProfile3:
        "Motor Impairment — Oversized touch targets (56px), extra padding, no animations, keyboard-optimized navigation.",
      a11yProfile4:
        "Cognitive — Simplified layout, reduced motion, increased spacing, reading guide, clear focus indicators.",
      a11yProfile5:
        "Screen Reader Optimized — Enhanced ARIA landmarks, live regions, form labels, skip-nav links, semantic heading structure.",
      a11yProfile6:
        "Reset to Defaults — Restores all accessibility settings to their WCAG AA default values.",
      a11yProfilesIntro:
        "Pre-configured accessibility profiles apply batch settings instantly. Each profile targets a specific user need and can be further customized after application.",
      a11yProfilesTitle: "6 One-Click Profiles",
      a11yTitle: "Accessibility Suite (WCAG AA)",
      accessIntro:
        "Login customization follows SCRIPE's role-based access control model. Opening the Customizer Studio requires the branding.manage permission. System Admins and Tenant Admins with the appropriate permission can edit and publish. Regular admins can only toggle personal preferences like dark/light mode. Safe mode activation is restricted to System Admins only.",
      accessTitle: "Access Control",
      archIntro:
        "The Login Customizer follows SCRIPE's standard modular clean architecture with domain, data, and presentation layers. The presentation layer contains the StylePanel component (configuration UI), LoginPreviewShell (iframe management), the AccessibilityPanel (WCAG settings and profiles), and the useLoginBrandingTokens hook (token-to-CSS pipeline). Components are extracted to module-level to prevent React re-render focus loss issues.",
      archTip:
        "The BgControls and PresetDots components are intentionally defined at module level (not inline) to prevent React from unmounting/remounting input fields during re-renders, which would cause focus loss on every keystroke.",
      archTitle: "Module Architecture",
      bgOverlayIntro:
        "Background and overlay controls adapt based on the selected layout type. Full-page layouts apply backgrounds and overlays to the wrapper container, while Split layouts scope backgrounds to the branding panel with independent form-section overlays. Overlay controls include color, opacity (0–100%), and blur (0–20px).",
      bgOverlayTitle: "Background & Overlay Controls",
      bgOverlayWarning:
        "For split layouts, the overlay is scoped to the form section and branding panel independently. CSS variables with a value of 0 (e.g., opacity) are correctly emitted — the system uses != null checks rather than truthiness checks to prevent dropping valid zero values.",
      brandingIntro:
        "The Branding Panel (visible in split layouts) provides dedicated controls for the branding side of the login page. It supports custom logo, company name, headline text, subtitle, and independent background/overlay controls. The branding panel overlay uses its own set of CSS variables (--login-panel-overlay-*) for granular control separate from the form section.",
      brandingTitle: "Branding Panel",
      description:
        "Visual login page customization with 22 layouts, design tokens, overlay/blur controls, light/dark themes, WCAG AA accessibility suite, and a sandboxed live preview — all with zero code.",
      draftIntro:
        "The studio implements a safe Draft → Preview → Publish workflow using optimistic concurrency control. All changes are saved as drafts (DraftBrandingJson) until the admin explicitly publishes. Publishing increments the SettingsVersion counter — concurrent publishes from other admins are rejected with a 409 Conflict. Any previously published version can be rolled back from the audit log snapshots.",
      draftNote:
        "Optimistic concurrency prevents data loss from concurrent editing. If another admin publishes while you're editing, your publish will be rejected (409), and you'll need to refresh and merge your changes.",
      draftTitle: "Draft / Publish / Rollback",
      intro:
        "SCRIPE's Login Customizer Studio is a powerful visual editor that allows tenant administrators to fully customize the login page experience without writing any code. The studio provides a split-pane interface with configuration panels on the left and a sandboxed iframe preview on the right, enabling real-time visual feedback as changes are made. The studio includes 8 configuration tabs: Appearance, Colors, Typography, Background, Overlay, Branding Panel, Accessibility, and Advanced. All modifications are draft-based, requiring explicit publish before going live.",
      layoutsIntro:
        "SCRIPE ships with 22 production-ready login layouts organized into four tiers: T1 Split layouts (6) feature a dedicated branding panel alongside the login form, T2 Full-page layouts (8) use the entire viewport for immersive login experiences, T3 Centered layouts (4) use compact, card-based designs, and T4 Special layouts (4) provide cinematic and artistic treatments. Each layout supports independent background, overlay, and accessibility controls.",
      layoutsNote:
        "Split layouts render the LoginBranding component with independent overlay/blur controls on the branding panel. Full-page layouts apply background and overlay to the entire wrapper. Centered and Special layouts each have their own rendering strategies. Switching layouts preserves all configuration — only the rendering structure changes.",
      layoutsTitle: "22 Login Layouts",
      relatedBuilder:
        "Login Page Builder — Drag-and-drop visual canvas for building custom login page layouts with 14 component types.",
      relatedIntro:
        "The Login Customizer Studio is part of a larger customization ecosystem. See these companion features for complete coverage:",
      relatedMarketplace:
        "Theme Marketplace — Browse, preview, and apply 40 premium branding packages with per-page overrides.",
      relatedMultiPage:
        "Multi-Page Branding — Configure independent branding for Login, Forgot Password, and Reset Password pages.",
      relatedTitle: "Related Features",
      safeModeIntro:
        "Safe Mode is an emergency fallback that bypasses all tenant branding and restores platform defaults for the login page. When IsSafeMode is set to true on TenantSettings, the login page renders with the default SCRIPE theme regardless of any customization. This ensures a guaranteed working login experience even if branding configuration becomes corrupted.",
      safeModeTitle: "Safe Mode",
      studioIntro:
        "The Customizer Studio uses a split-pane architecture: the left panel contains 8 tabbed configuration sections (Appearance, Colors, Typography, Background, Overlay, Branding Panel, Accessibility, Advanced) while the right panel provides a sandboxed iframe that renders the login page with live CSS variable injection via postMessage. Device toggles allow previewing across desktop, tablet, and mobile breakpoints.",
      studioTip:
        "All studio changes operate in draft mode. The live login page is never affected until you explicitly click Publish. You can safely experiment with any combination of settings.",
      studioTitle: "Studio Overview",
      themeIntro:
        "The Login Customizer supports independent light and dark mode configurations. When dark mode is enabled, a separate set of CSS variables is emitted for the dark panel (--login-dark-*), controlling form background, text color, input styling, and overlay. The dark mode toggle in the Appearance panel allows complete control over the dark theme without affecting the light configuration.",
      themeTitle: "Light/Dark Theme Architecture",
      title: "Login Customizer Studio",
      tokensIntro:
        "The customization system is built on a comprehensive design token pipeline. Tenant settings stored as JSON are transformed into semantic design tokens, which are then emitted as CSS custom properties and injected into the live DOM. This architecture ensures consistent, type-safe styling across all 22 layouts, including 23+ accessibility-specific CSS rules.",
      tokensTitle: "Design Tokens Pipeline",
    },
    loginPageBuilder: {
      archIntro:
        "The Login Page Builder follows SCRIPE's standard modular clean architecture. The builder/ directory contains: BuilderCanvas.tsx (main canvas), ComponentPalette.tsx (sidebar palette), PropertiesPanel.tsx (property editor), GridOverlay.tsx (grid visualization), and BuilderToolbar.tsx (mode switcher, undo/redo, zoom controls). State management uses the useBuilderState hook integrated into useStudioViewModel.",
      archTip:
        "The builder components are intentionally defined as stable, memoized React components to prevent re-renders during drag operations. Each canvas component is wrapped in React.memo with custom equality checks on position and properties.",
      archTitle: "Module Architecture",
      bundleComponentsIntro:
        "BundleGalleryTab (5.6KB) — Gallery tab with type filters (Login, Dashboard, Complete), search, grid, pagination. BundleCard (12.8KB) — Card with accent preview, pricing tier, metadata. BundleDetailModal (8.5KB) — Full detail with apply button. SaveBundleDialog (7.6KB) — Dialog for saving current studio state as a new bundle.",
      bundleComponentsTitle: "Bundle Components",
      bundleIntro:
        "The Bundle Marketplace allows tenants to save their complete studio configuration (login theme + builder layout + dashboard settings + per-page overrides) as a named bundle, and browse/apply bundles created by other tenants or the system. Bundles are displayed in a dedicated tab within the Theme Gallery.",
      bundleTitle: "Bundle Marketplace (Related Feature)",
      bundleTypesIntro:
        "Login Bundle — Contains only login branding (theme tokens + builder layout). Dashboard Bundle — Contains only dashboard settings. Complete Bundle — Contains everything: login branding, builder layout, per-page overrides, dashboard settings, and accessibility configuration. Complete bundles provide one-click full-workspace setup.",
      bundleTypesTitle: "Bundle Types",
      compBadge:
        "Badge — Small label/tag element. Properties: text, variant (default, success, warning, destructive), size.",
      compButton:
        "Button — Clickable action button. Properties: text, variant (primary, secondary, outline, ghost), size, width (auto, full), icon, link URL, border radius.",
      compCard:
        "Card — Container with background, border, and shadow. Properties: background color, border radius, shadow, padding. Can contain other components (nested layout).",
      compDivider:
        "Divider — Visual separator line. Properties: color, thickness, width, margin, style (solid, dashed, dotted, gradient).",
      compFooter:
        "Footer — Page footer with links and copyright text. Properties: links array, copyright text, alignment, font size, color.",
      compForm:
        "Form — The login form component containing email/password inputs and submit button. Properties: show labels, show placeholders, input style, button text, remember me checkbox, forgot password link.",
      compHeading:
        "Heading — Large display text for page titles and headlines. Properties: text content, font size, font weight, color, alignment, HTML tag (h1–h6). Supports dynamic variables ({tenantName}).",
      compIcon:
        "Icon — SVG icon from the built-in icon library. Properties: icon name, size, color, rotation, link URL.",
      compImage:
        "Image — Display any image on the canvas. Properties: src (URL), alt text, width, height, object-fit, border radius, shadow. Supports all web image formats.",
      compLogo:
        "Logo — Displays the tenant's logo image. Properties: src (URL), alt text, width, height, alignment, link URL. Supports SVG, PNG, and WebP formats.",
      compSocialLogin:
        "Social Login — Pre-built social authentication buttons (Google, Microsoft, Apple, GitHub). Properties: providers (multi-select), layout (horizontal, vertical, icon-only), separator text.",
      compSpacer:
        "Spacer — Invisible spacing element. Properties: height (in px). Used to create vertical gaps between components without manual positioning.",
      compTermsLink:
        "Terms & Privacy — Pre-built links to Terms of Service and Privacy Policy pages. Properties: terms URL, privacy URL, text template, font size, color.",
      compText:
        "Text — General-purpose paragraph text. Properties: content, font size, color, line height, alignment, max width. Supports rich text with bold, italic, and links.",
      dashboardColorsIntro:
        "Default, Zinc, Slate, Stone, Neutral, Red, Rose, Orange, Green, Blue, Violet, and Yellow. Each color theme defines the dashboard's accent color palette applied to the sidebar, headers, buttons, and active states.",
      dashboardColorsTitle: "12 Color Themes",
      dashboardIntro:
        "The Dashboard Theming panel in the Customizer Studio allows tenants to configure their admin dashboard's visual defaults. Settings include layout template (8 options), color theme (12 options), theme mode (light/dark/system), default language, and sidebar default state. Dashboard theming uses the same draft/publish workflow as login branding.",
      dashboardLayoutsIntro:
        "Default, Navigation, Classic, Compact, Elegant, Floating, Modern, and Minimal. Each template defines the dashboard shell structure: sidebar position, header style, content width, and navigation pattern.",
      dashboardLayoutsTitle: "8 Layout Templates",
      dashboardStorageIntro:
        "Dashboard settings are stored in the dashboardThemeJson field of DraftBrandingJson as a JSON object: { layoutTemplate, colorTheme, mode, language, sidebarDefaultState }. On publish, the settings are promoted to the tenant's live configuration.",
      dashboardStorageTitle: "Storage Format",
      dashboardTitle: "Dashboard Theming (Related Feature)",
      description:
        "No-code drag-and-drop visual canvas with 3 design modes (Freeform, Grid, Builder), 14 component types, a 12-column responsive grid system, real-time preview sync, and JSON serialization.",
      dndIntro:
        "The builder uses @dnd-kit/core (not react-beautiful-dnd) for drag-and-drop interactions. Components are dragged from the palette sidebar and dropped onto the canvas. The DragOverlay renders a ghost preview of the component during drag. Drop zones are highlighted with blue outlines when a draggable component hovers over them.",
      dndPaletteIntro:
        "1. User drags a component type from the palette sidebar. 2. @dnd-kit creates a DragOverlay with a preview of the component. 3. The canvas renders drop zone indicators (grid cells in Grid mode, free areas in Freeform mode). 4. On drop, a new component instance is created with default properties and added to the builder state. 5. The component is rendered on the canvas at the drop position.",
      dndPaletteTitle: "Palette → Canvas Flow",
      dndReorderIntro:
        "Existing components on the canvas can be reordered by dragging. In Grid mode, components snap to grid cells. In Builder mode, components reorder within their section (header/body/footer). In Freeform mode, components move to the exact drop coordinates.",
      dndReorderTitle: "Canvas Reordering",
      dndSelectIntro:
        "Clicking a component on the canvas selects it, displaying a blue selection border and resize handles. The Properties Panel on the right sidebar loads the selected component's editable properties. Pressing Delete/Backspace removes the selected component. Escape deselects.",
      dndSelectTitle: "Component Selection",
      dndTitle: "Drag-and-Drop Architecture",
      gridGapIntro:
        "The grid gap (spacing between cells) is configurable globally: columnGap and rowGap properties, each accepting pixel values (default: 16px). This ensures consistent spacing across all grid items without manual padding on individual components.",
      gridGapTitle: "Gap Configuration",
      gridIntro:
        "The Grid Mode uses a responsive 12-column CSS grid layout. Each component occupies a configurable number of columns (1–12) and rows. The grid supports gap spacing, column alignment (start, center, end, stretch), and row alignment. The grid is fully responsive — column spans can be configured independently for desktop (lg), tablet (md), and mobile (sm) breakpoints.",
      gridPropsIntro:
        "Each component in Grid mode has additional grid-specific properties: colSpan (1–12 columns), rowSpan (number of rows), colStart (starting column), rowStart (starting row), alignment (start/center/end/stretch), and responsive overrides (sm/md/lg column spans). These properties are configured via the Properties Panel.",
      gridPropsTitle: "Grid Component Properties",
      gridResponsiveIntro:
        "The grid supports 3 breakpoints: Desktop (lg, ≥1024px), Tablet (md, 768–1023px), and Mobile (sm, <768px). Each component can have independent column spans per breakpoint. For example, a logo might span 4 columns on desktop but 12 columns (full width) on mobile. The preview iframe respects these breakpoints when device toggles are used.",
      gridResponsiveTitle: "Responsive Breakpoints",
      gridTitle: "12-Column Grid System",
      intro:
        "The Login Page Builder is SCRIPE's most advanced customization tool — a fully visual, drag-and-drop canvas that allows tenant administrators to build custom login page layouts without writing any code. The builder provides 3 design modes (Freeform, Grid, and Builder), a palette of 14 pre-built component types (from logos and headings to social login buttons and footer links), a responsive 12-column CSS grid system, real-time two-way sync with the preview iframe, and full JSON serialization for persistence. The builder integrates seamlessly with the Login Customizer Studio's design token pipeline, ensuring that builder-created layouts inherit all theme colors, typography, and accessibility settings.",
      modeBuilderIntro:
        "Structured block-based layout with predefined sections. Components are organized into vertical sections (header, body, footer) with automatic stacking and reordering via drag-and-drop. Best for quick layout assembly with predictable, clean results. Builder mode enforces structural constraints — components snap to section boundaries and maintain consistent spacing.",
      modeBuilderTitle: "Builder Mode",
      modeFreeformIntro:
        "Absolute positioning with pixel-level control. Components can be placed anywhere on the canvas and dragged to exact coordinates. Best for creative, non-standard layouts where design freedom is paramount. Components have x/y position, width, height, and z-index properties.",
      modeFreeformTitle: "Freeform Mode",
      modeGridIntro:
        "Responsive 12-column CSS grid layout. Components are placed into grid cells with configurable column span (1–12), row positioning, alignment, and gap spacing. The grid ensures consistent, responsive layouts that adapt to desktop, tablet, and mobile breakpoints. This is the recommended mode for enterprise deployments where cross-device consistency is critical.",
      modeGridTitle: "Grid Mode (12-Column)",
      modesIntro:
        "The builder offers three distinct canvas modes, each providing a different level of control over layout positioning. Users can switch between modes at any time — components are preserved during mode switches.",
      modesNote:
        "Grid mode is the default for new configurations. It provides the best balance between design flexibility and responsive consistency. Freeform mode is intended for advanced users who need pixel-perfect control.",
      modesTitle: "3 Canvas Modes",
      paletteIntro:
        "The component palette provides 14 pre-built, configurable UI components that can be dragged onto the canvas. Each component has a set of editable properties (text content, styling, behavior) accessible via the Properties Panel when selected.",
      paletteTitle: "14 Component Types",
      previewIntro:
        "Every canvas change is immediately reflected in the sandboxed preview iframe. The builder emits postMessage events containing the current component array and canvas mode. The preview page receives these events, reconstructs the layout, and renders the components with live CSS variable injection from the active theme.",
      previewSyncIntro:
        "The sync is bidirectional: canvas changes propagate to preview (via postMessage), and device toggle changes in the preview header propagate back to the builder (updating responsive breakpoint indicators). This ensures the builder canvas accurately reflects how the layout will appear at each breakpoint.",
      previewSyncTitle: "Two-Way Sync",
      previewTitle: "Real-Time Preview Sync",
      propsContentIntro:
        "Text inputs for content: headline text, paragraph text, button labels, URLs, alt text. Supports variable interpolation with {variableName} syntax for dynamic tenant data.",
      propsContentTitle: "Content Properties",
      propsGridIntro:
        "Grid-specific layout controls (Grid mode only): column span slider (1–12), row span, column start, row start, alignment select, and responsive breakpoint overrides. A visual grid preview shows the component's position within the 12-column grid.",
      propsGridTitle: "Grid Properties",
      propsIntro:
        "The Properties Panel is a contextual sidebar that appears when a component is selected on the canvas. It displays all editable properties for the selected component type, organized into sections: Content (text, URLs), Layout (width, height, alignment), Style (colors, borders, shadows), and Grid (column span, row span, responsive breakpoints). Changes in the Properties Panel update the canvas in real-time.",
      propsStyleIntro:
        "Visual styling controls: color pickers, border radius sliders, shadow toggles, opacity controls, font size selectors. Style properties that overlap with theme tokens (e.g., primaryColor) can be set to 'inherit from theme' to maintain consistency.",
      propsStyleTitle: "Style Properties",
      propsTitle: "Properties Panel",
      securityIframeIntro:
        "The preview iframe uses the sandbox attribute with restricted permissions: allow-scripts (for CSS variable injection), allow-same-origin (for postMessage). Forms are non-functional — the preview renders visual-only representations of auth components.",
      securityIframeTitle: "Iframe Sandboxing",
      securityIntro:
        "The Login Page Builder enforces strict security constraints on user-generated content. All text content is HTML-sanitized before rendering (no script injection). Image URLs are validated to prevent SSRF. The builder canvas runs in a sandboxed iframe with restrictive CSP headers. Custom CSS injection is not supported — styling is controlled exclusively through the design token pipeline.",
      securitySanitizeIntro:
        "All text properties (headings, paragraphs, button labels) are sanitized using DOMPurify before rendering in the preview. HTML tags are stripped — only plain text is stored. URLs are validated against a whitelist of allowed protocols (https, http) to prevent javascript: and data: injection.",
      securitySanitizeTitle: "Input Sanitization",
      securityTitle: "Security Constraints",
      serializationIntro:
        "The builder state is serialized as a JSON array and stored in the builderComponentsJson field of the tenant's DraftBrandingJson. The canvasMode (freeform/grid/builder) is stored as a separate field. On publish, the builder state is promoted to LiveBrandingJson alongside all other branding tokens.",
      serializationSchemaIntro:
        "The stored JSON follows this structure: { canvasMode: 'freeform' | 'grid' | 'builder', gridConfig: { columns: 12, columnGap: 16, rowGap: 16 }, components: [ { id, type, props, position, gridPosition, section, order, responsive } ] }. The schema is versioned for forward compatibility.",
      serializationSchemaTitle: "Serialized Schema",
      serializationSizeIntro:
        "Default property values are NOT stored — only properties that differ from the component type's defaults are serialized. This keeps the JSON payload compact (typically 2–5KB for a complex layout with 10+ components).",
      serializationSizeTitle: "Storage Optimization",
      serializationTitle: "JSON Serialization & Persistence",
      stateComponentIntro:
        "Each BuilderComponent is a serializable object: { id: string, type: ComponentType, props: Record<string, unknown>, position: { x: number, y: number }, gridPosition: { colSpan: number, rowSpan: number, colStart: number, rowStart: number }, section: 'header' | 'body' | 'footer', order: number, responsive: { sm: GridOverride, md: GridOverride } }.",
      stateComponentTitle: "BuilderComponent Schema",
      stateIntro:
        "The builder maintains a flat array of BuilderComponent objects in the StudioDraft. Each component has: id (unique UUID), type (one of 14 types), properties (key-value map), position (x, y for Freeform), gridPosition (col, row, colSpan, rowSpan for Grid), and section (header/body/footer for Builder mode). The entire array is serialized as JSON in the builderComponentsJson field of DraftBrandingJson.",
      stateTitle: "Canvas State Management",
      stateUndoIntro:
        "The builder maintains a history stack for undo/redo operations. Each action (add, move, resize, delete, property change) pushes a snapshot to the stack. Ctrl+Z undoes the last action, Ctrl+Shift+Z redoes. The history stack has a configurable depth limit (default: 50 actions).",
      stateUndoTitle: "Undo/Redo Support",
      title: "Login Page Builder",
    },
    menuSystem: {
      architectureIntro:
        "The Menu System uses a self-referencing tree structure. Each MenuItem can have children via ParentMenuItemId. Menus are filtered through a 6-step pipeline before reaching the admin's browser.",
      architectureTitle: "Menu Architecture",
      description:
        "Dynamic menu tree with permission filtering, tenant scoping, role visibility, and drag-drop reordering.",
      endpointsTitle: "Menu API Endpoints",
      entityTitle: "MenuItem Entity",
      filteringIntro:
        "When an admin requests their menu (/menus/my), the system applies 6 sequential filters before building the tree structure. This ensures admins only see menu items they have access to.",
      filteringTitle: "Menu Filtering Pipeline",
      overrideNote:
        "When both User and Tenant overrides exist, User overrides take precedence. This allows individual admins to customize their sidebar while still respecting tenant-level configurations.",
      overrideTitle: "Override System",
      reorderTitle: "Drag-Drop Reorder",
      title: "Menu System",
    },
    messageTemplates: {
      architectureIntro:
        "The Message Templates system provides a centralized way to manage email, notification, and webhook message content. Templates use the Scriban engine (Liquid-like syntax) for variable substitution, conditionals, and loops.",
      architectureTitle: "Template Architecture",
      builtInTitle: "Built-in Templates",
      description:
        "Scriban-powered bilingual message templates with preview, built-in templates, and placeholder schemas.",
      endpointsTitle: "Template API Endpoints",
      entityTitle: "MessageTemplate Entity",
      previewIntro:
        "The preview endpoint renders a template with sample data, allowing admins to see exactly how the email or notification will look before sending. This is invaluable for testing templates and catching formatting issues.",
      previewTitle: "Preview Feature",
      rendererTitle: "Template Renderer",
      syntaxTitle: "Scriban Template Syntax",
      title: "Message Templates",
    },
    multiPageBranding: {
      conflictIntro:
        "Multi-Page Branding includes safeguards to prevent visual inconsistency. When the global design changes (e.g., a new font family), all pages that inherit from the global automatically update — only explicitly overridden tokens remain unchanged. The studio displays a 'Customized' badge on page tabs that have overrides, making it clear which pages have independent configurations.",
      conflictTitle: "Conflict Prevention & Consistency",
      conflictWarning:
        "When a global token is changed (e.g., primaryColor), pages with overrides that include the same token will NOT update — the override takes precedence. This is intentional. To propagate a global change to overridden pages, use the 'Reset to Global' action on those pages first.",
      description:
        "Independent visual customization for Login, Forgot Password, and Reset Password pages — shared design tokens with per-page overrides, isolated preview, and theme integration.",
      intro:
        "Multi-Page Branding extends SCRIPE's Login Customizer Studio to support independent visual configurations for all three authentication pages: Login, Forgot Password, and Reset Password. Instead of forcing a single visual identity across all auth flows, Multi-Page Branding allows tenants to present context-appropriate messaging, layouts, and visual treatments for each page. A shared global design provides consistency, while per-page overrides enable targeted differentiation — all managed through the same zero-code studio interface.",
      pageForgot:
        "Forgot Password Page — The password recovery entry point. Users enter their email to receive a reset link. This page benefits from reassuring messaging ('We'll help you get back in') and softer visual treatments that convey trust and care.",
      pageLogin:
        "Login Page — The primary authentication entry point. Users enter their credentials (email + password) to access the platform. This page receives the most visual attention as it creates the first impression of the tenant's brand.",
      pageReset:
        "Reset Password Page — The password change confirmation page. Users set a new password using the link from their email. This page benefits from action-oriented messaging ('Create your new password') and clear, focused layouts that minimize distraction.",
      pagesIntro:
        "SCRIPE's authentication system exposes three distinct pages, each serving a different user intent. Multi-Page Branding allows independent customization of all three while maintaining visual consistency through shared design tokens.",
      pagesNote:
        "Each page can independently configure: layout, headline, subtitle, background, overlay, and any design token. Tokens not explicitly overridden inherit from the global configuration — enabling 'configure once, override selectively' workflow.",
      pagesTitle: "Supported Authentication Pages",
      previewIntro:
        "Each auth page is previewed in the same sandboxed iframe used by the Login Customizer Studio. When the user switches to a different page tab, the preview URL changes to the corresponding auth route, and new CSS variables (merged from global + page override) are injected via postMessage. The preview supports desktop, tablet, and mobile breakpoints for all three pages.",
      previewIsolationIntro:
        "The preview iframe runs in a completely isolated context — separate from the admin panel's authentication state. This prevents the preview from triggering real login/logout actions. The preview pages are purpose-built components that render the auth UI with injected CSS variables but no authentication logic.",
      previewIsolationTitle: "Preview Isolation",
      previewTitle: "Sandboxed Preview Architecture",
      serializationIntro:
        "Per-page overrides are stored in the tenant's DraftBrandingJson alongside the global configuration. The JSON structure contains a top-level 'pageOverrides' object with 'login', 'forgotPassword', and 'resetPassword' keys. Each key maps to a flat token object. On publish, the entire structure (global + pageOverrides) is promoted to LiveBrandingJson.",
      serializationSchemaIntro:
        "The DraftBrandingJson stores: { selectedLayout, primaryColor, ...(all global tokens), pageOverrides: { login: { panelHeadline, panelSubtitle, ... }, forgotPassword: { selectedLayout, panelHeadline, overlayColor, ... }, resetPassword: { selectedLayout, panelHeadline, ... } } }. Only non-null override tokens are persisted — empty pages are not stored to save space.",
      serializationSchemaTitle: "Stored JSON Schema",
      serializationTitle: "Data Serialization & Persistence",
      sourceComponents:
        "Components: AuthPageTabs.tsx (tab strip), StylePanel.tsx (sidebar with per-page routing)",
      sourceSeeder:
        "Backend: LoginThemeSeeder.cs (PageOverrideDesign records, BuildFullThemeJson pages serialization)",
      sourceStudio: "Studio: useStudioViewModel.ts (page state, merge logic, previewTheme())",
      sourceTitle: "Source File Reference",
      sourceTypes:
        "Types: StudioDraft.ts (pageOverrides interface), ThemeTypes.ts (page override type definitions)",
      stateGlobalIntro:
        "The global layer contains all 50+ design tokens: colors, typography, spacing, overlay, dark mode, and branding panel settings. These tokens apply to ALL auth pages by default. The global layer is always defined — it is never empty.",
      stateGlobalTitle: "Global Layer (Shared Tokens)",
      stateIntro:
        "Multi-Page Branding uses a layered state model. The global StudioDraft contains the base configuration for all pages. Each page has an optional override object (pageOverrides.login, pageOverrides.forgotPassword, pageOverrides.resetPassword) that stores only the tokens that differ from the global. This minimizes storage and simplifies diff tracking.",
      stateMergeIntro:
        "When the studio switches to a specific page tab, the effective configuration is computed as: effectiveConfig = { ...globalDraft, ...pageOverrides[currentPage] }. This spread-merge ensures that page-specific overrides take precedence while all unspecified tokens fall through to the global values. The merge is performed in the previewTheme() function and in the CSS token emission pipeline.",
      stateMergeNote:
        "The merge is a shallow spread — nested objects (like darkColors or overlay) are replaced entirely, not deep-merged. This is intentional: if a page overrides the overlay, it should control the complete overlay configuration, not inherit partial values from the global.",
      stateMergeTitle: "Runtime Merge Strategy",
      stateOverrideIntro:
        "Each page's override layer contains ONLY the tokens that differ from the global configuration. For example, if the Forgot Password page has a different headline and subtitle but shares all colors and typography, only panelHeadline and panelSubtitle are stored in the override. Empty fields inherit from the global layer.",
      stateOverrideTitle: "Page Override Layer (Per-Page Tokens)",
      stateTitle: "State Isolation Model",
      studioEditIntro:
        "When a user modifies a setting while a non-login page is active (e.g., Forgot Password), the change is saved to pageOverrides.forgotPassword — not to the global draft. The studio tracks which page is active and routes edits accordingly. This ensures that changing the forgot-password headline does not affect the login page's headline.",
      studioEditTitle: "Per-Page Editing",
      studioIntro:
        "The Customizer Studio sidebar includes a page tab strip (AuthPageTabs component) that allows switching between Login, Forgot Password, and Reset Password. When the active tab changes, the studio loads the corresponding page override (if any) and merges it with the global draft for preview. The preview iframe navigates to the selected auth page route.",
      studioResetIntro:
        "Each page tab includes a 'Reset to Global' action that removes all per-page overrides for that page, reverting it to the global configuration. This is useful when a tenant wants to undo page-specific customizations and restore visual consistency across all auth pages.",
      studioResetTitle: "Reset to Global",
      studioSwitchIntro:
        "When a user switches tabs: 1. The activePage state is updated to 'login', 'forgotPassword', or 'resetPassword'. 2. The sidebar panels reload with merged values (global + page override). 3. The preview iframe receives an updated postMessage with the merged CSS variables. 4. The iframe URL changes to the corresponding auth route (e.g., /login-preview, /forgot-password-preview, /reset-password-preview). 5. Any changes made in the sidebar are saved to the page override, not the global draft.",
      studioSwitchTitle: "Tab Switching Flow",
      studioTabsIntro:
        "The AuthPageTabs component renders a horizontal tab bar with 3 tabs (Login, Forgot Password, Reset Password). Each tab displays the page name and an optional 'Customized' badge if per-page overrides exist. Clicking a tab updates the activePage state in the studio, triggers a preview refresh, and loads the page-specific sidebar panel settings.",
      studioTabsTitle: "AuthPageTabs Component",
      studioTitle: "Studio Integration — Page Tabs",
      themeCompatIntro:
        "Themes without a 'pages' block are fully backward-compatible. The absence of page overrides means all three auth pages use the global design — the same behavior as themes created before the Multi-Page Branding feature. No migration is required for existing themes.",
      themeCompatTitle: "Backward Compatibility",
      themeImportIntro:
        "The previewTheme() function checks for the 'pages' key in the theme's ThemeDataJson. If found, it extracts the forgotPassword and resetPassword objects and stores them as pageOverrides. If the theme does not include page overrides, the existing pageOverrides are preserved (or cleared, depending on the apply mode).",
      themeImportTitle: "Page Override Import",
      themeIntro:
        "When a marketplace theme includes per-page overrides (pages.forgotPassword, pages.resetPassword), the previewTheme() function in useStudioViewModel.ts automatically imports those overrides into the studio's pageOverrides state. This means applying a theme with per-page branding instantly populates all three auth pages with the theme's intended visual treatment.",
      themeTitle: "Theme Marketplace Integration",
      title: "Multi-Page Branding",
    },
    multiTenancy: {
      architectureTitle: "Architecture",
      auditGroup: "Audit Configuration",
      autoRoleIntro:
        "When a new tenant is created via POST /tenants, the system automatically creates two roles: {CODE}_SUPER_ADMIN (with all granted permissions, IsTenantSuperAdmin=true, IsPermissionLocked=true) and {CODE}_DEFAULT (with basic read permissions, IsDefaultRole=true). The creating admin is automatically assigned the super admin role.",
      autoRoleTitle: "Auto-Role Creation",
      brandingGroup: "Branding",
      cascadeDeleteIntro:
        "Deleting a tenant is a dangerous operation. The system provides a GET /tenants/{id}/descendant-count endpoint that returns the count of all descendants (sub-tenants, admins, users, roles) that would be affected. Cascade delete requires the special tenants.cascade_delete permission and is fully audited.",
      cascadeDeleteTitle: "Cascade Delete Protection",
      description:
        "Row-level data isolation, hierarchical tenants, per-tenant settings, branding, and scoping architecture.",
      domainArchIntro:
        "When a request arrives, the system resolves the tenant by looking up the hostname in the TenantDomain table. Auto-generated domains (e.g. sofa.scripe.com) are always verified and resolve immediately. Custom domains must pass DNS verification first. A fallback mechanism using the ?code= query parameter is available for development environments where DNS is not configured.",
      domainArchTitle: "Domain Resolution Architecture",
      domainConfigIntro:
        "Every domain-related value is configurable via the Tenancy section in appsettings.json. This means you can rebrand the entire platform — changing the base domain, CNAME target, verification prefix, and token prefix — by editing a single configuration block. Zero code changes required. The backend injects TenancySettings via IOptions<T>, and the frontend receives the CNAME target and verification prefix from the GET /domains API response.",
      domainConfigTip:
        "To deploy on a completely different domain (e.g. myplatform.io instead of scripe.com), simply update the 4 values in appsettings.json. All auto-generated subdomains, DNS instructions, and verification tokens will automatically use the new values.",
      domainConfigTitle: "Configurable Platform Domain",
      domainDnsIntro:
        "Custom domains require DNS verification to prove ownership. When an admin adds a custom domain, the system generates a unique verification token. The admin then configures two DNS records: a CNAME record pointing the domain to the platform's CnameTarget, and a TXT record at {VerificationPrefix}.{domain} containing the verification token. Once configured, clicking 'Verify' triggers a DNS lookup to confirm both records are present.",
      domainDnsNote:
        "DNS verification is currently a UI-driven process where the admin clicks 'Verify' to trigger the check. The backend placeholder is ready for full DNS resolution integration. Auto-generated domains skip verification entirely — they are always trusted.",
      domainDnsTitle: "DNS Verification Flow",
      domainEndpointsTitle: "Domain API Endpoints",
      domainIntro:
        "Each tenant can have multiple domains — one auto-generated subdomain created at tenant creation, plus optional custom domains added by administrators. The system supports DNS-based domain verification to prove ownership of custom domains before they become active. All domain-related configuration is fully externalized to appsettings.json, enabling seamless rebranding and multi-deployment setups.",
      domainTitle: "Domain Management",
      domainTypesTitle: "Domain Types",
      endpointsCrudTitle: "CRUD Endpoints",
      endpointsDrilldownTitle: "Drill-Down Endpoints",
      endpointsHierarchyTitle: "Hierarchy Endpoints",
      endpointsPermissionsTitle: "Permission Endpoints",
      endpointsSettingsTitle: "Settings Endpoints",
      endpointsTitle: "Tenant API Endpoints",
      featureBranding: "Custom Branding",
      featureBrandingDesc:
        "Upload tenant logos, set primary color, and customize the company name for each tenant's UI.",
      featureDataScoping: "Data Scoping",
      featureDataScopingDesc:
        "All business data is automatically scoped to the tenant. No risk of cross-tenant data leaks.",
      featureIsolation: "Data Isolation",
      featureIsolationDesc:
        "Row-level isolation via EF Core global query filters. Each query automatically includes WHERE TenantId = @CurrentTenant.",
      featureRoleScoping: "Role Scoping",
      featureRoleScopingDesc:
        "Roles are scoped to tenants. Each tenant can create custom roles with different permission sets.",
      featureSettings: "Per-Tenant Settings",
      featureSettingsDesc:
        "Each tenant has independent configuration: quotas (MaxAdmins/MaxRoles/MaxSubTenants), security policies, audit settings, and branding.",
      featuresTitle: "Tenant Features",
      featureUserScoping: "User Scoping",
      featureUserScopingDesc:
        "Users belong to a single tenant. Tenant admins can only see and manage their own users.",
      hierarchyIntro:
        "Tenants form a tree structure via ParentTenantId. Each tenant has a HierarchyLevel (depth counter) and HierarchyPath (materialized path like /root/company/branch/). This enables organizational structures with parent companies, branches, and departments.",
      hierarchyTitle: "Tenant Hierarchy",
      intro:
        "SCRIPE supports full multi-tenancy with row-level data isolation using EF Core's global query filters. Every entity with a TenantId column is automatically filtered based on the current user's tenant, ensuring complete data separation between tenants.",
      logoTip:
        "Tenant logos are served via a static file middleware at /storage/tenants/{tenantId}/logo.{ext}. The frontend uses absolute URLs for logo display.",
      permissionInheritanceIntro:
        "When creating a child tenant, the parent can only grant permissions that it already has. This creates a cascading security model  a child tenant can never have more permissions than its parent. The GET /tenants/creation-permissions endpoint returns the available permission pool filtered by the current user's tenant.",
      permissionInheritanceTitle: "Permission Inheritance",
      quotaGroup: "Quota Settings",
      securityGroup: "Security Policy",
      settingsIntro:
        "Each tenant has a 1:1 TenantSettings entity with 4 configuration groups. Values of -1 mean unlimited.",
      settingsTitle: "Tenant Settings (Per-Tenant Configuration)",
      title: "Multi-Tenancy",
    },
    notificationSystem: {
      architectureIntro:
        "The Notification System uses SignalR for real-time push delivery. When a backend service calls NotificationService, the notification is persisted to the database and simultaneously pushed to the user's browser via the NotificationHub.",
      architectureTitle: "Notification Architecture",
      autoJoinTitle: "Auto-Join Pattern",
      clientInterfaceTitle: "Hub Client Interface",
      description:
        "Real-time notification delivery via SignalR with auto-join groups, unread count tracking, and paginated history.",
      endpointsTitle: "Notification API Endpoints",
      hubIntro:
        "The NotificationHub is a strongly-typed SignalR hub that auto-joins users to their personal group (user_{userId}) on connection. It also pushes the initial unread count immediately.",
      hubTitle: "NotificationHub",
      serviceTitle: "NotificationService Methods",
      title: "Notification System",
    },
    recycleBin: {
      cascadeIntro:
        "When restoring a tenant, all child entities (admins, users, roles, permissions) must also be restored. SCRIPE uses ExecuteUpdateAsync for bulk restoration  a single SQL UPDATE statement instead of loading all entities into memory.",
      cascadeTitle: "Cascade Restore",
      description:
        "Soft-delete management with cascade restore, bulk operations, and permanent purge capabilities.",
      endpointsTitle: "Recycle Bin Endpoints",
      executeUpdateTitle: "ExecuteUpdateAsync vs Traditional EF",
      ignoreFiltersTitle: "IgnoreQueryFilters Pattern",
      ignoreFiltersWarning:
        "IgnoreQueryFilters() bypasses ALL global query filters, including the tenant filter. Always add an explicit .Where(t => t.TenantId == currentTenantId) when using this method to prevent cross-tenant data leaks.",
      interceptorNote:
        "ExecuteUpdateAsync bypasses EF Core change tracker and interceptors. This means audit logs are NOT generated for bulk restore operations. A manual audit entry is created in the controller action instead.",
      purgeVsRestoreTitle: "Purge vs Restore",
      purgeWarning:
        "Purge is a destructive, irreversible operation. It permanently removes the record from the database using a hard DELETE. Use this only for GDPR compliance or when absolutely certain the data is no longer needed.",
      softDeleteIntro:
        "All entities in SCRIPE use soft-delete. When an admin deletes a record, IsDeleted is set to true and the record is hidden from normal queries via EF Core global query filters. The record remains in the database and can be restored from the Recycle Bin.",
      softDeleteTitle: "How Soft-Delete Works",
      title: "Recycle Bin",
    },
    rolePermissions: {
      authPipelineIntro:
        "SCRIPE uses a 4-attribute authorization system. The PermissionRequired attribute supports an optional scope parameter. The DynamicPermissionPolicyProvider creates ASP.NET Core authorization policies on-the-fly from these attributes. The PermissionChecker service resolves the effective scope and checks tenant hierarchy access.",
      authPipelineTitle: "Authorization Pipeline",
      cloneRoleIntro:
        "The CloneRole endpoint creates a copy of an existing role with a new name. Crucially, it implements anti-privilege-escalation: the cloned role only receives permissions that the cloning admin also has. This prevents a lower-privileged admin from cloning a higher-privileged role to gain access.",
      cloneRoleTitle: "Clone Role (Anti-Escalation)",
      description:
        "RBAC system with scope override, field-level restrictions, anti-escalation, and tenant-scoped roles.",
      endpointsMyTenantTitle: "My Tenant Endpoints",
      endpointsPermissionsTitle: "Permission Endpoints",
      endpointsTitle: "Role API Endpoints",
      hierarchyTitle: "Permission Hierarchy",
      intro:
        "SCRIPE implements a comprehensive RBAC (Role-Based Access Control) system with category-based permissions, scope overrides, field-level restrictions, and tenant scoping. Permissions are cached server-side for performance  changes take effect immediately without token refresh.",
      restrictedFieldsIntro:
        "Beyond standard CRUD permissions, roles can have field-level restrictions. The RestrictedFieldsJson column stores a JSON array of field names that should be hidden from API responses for that role. This means a role might have 'users.read' permission but with certain fields (like salary or SSN) nullified.",
      restrictedFieldsTitle: "Field-Level Restrictions",
      rolePropertiesIntro:
        "Each role has several system flags that control its behavior and protection level.",
      rolePropertiesTitle: "Role Entity Properties",
      scopeOverrideIntro:
        "Each RolePermission can override the default scope of a permission. This controls how much data a role can access for a given permission. The scope override is stored in the RolePermission junction table, allowing fine-grained control per role.",
      scopeOverrideTitle: "Scope Override (Data Access Control)",
      systemIntro:
        "Permissions are organized into categories, each containing multiple granular permissions. The naming convention follows the pattern: {resource}.{action}.",
      systemTitle: "Permission System",
      tenantScopingNote:
        "Roles are automatically scoped to the current user's tenant. A tenant admin can only see and manage roles within their own tenant. Super admins can see all roles across all tenants.",
      title: "Roles & Permissions",
      userGroupEndpointsTitle: "User Groups API Endpoints",
      userGroupsIntro:
        "User Groups enable batch assignment of roles and field-level restrictions to multiple administrators at once. Each group is tenant-scoped, contains members (admins), assigned roles, and per-permission field restrictions. When an admin logs in, roles and restrictions from all their groups are merged with direct role assignments to produce the final JWT claims.",
      userGroupsNote:
        "User groups are additive — an admin's effective permissions are the UNION of their direct roles plus all group-inherited roles. Group restrictions are also merged additively. Removing an admin from a group immediately revokes the inherited roles and restrictions on next login.",
      userGroupsTitle: "User Groups",
    },
    ssoOauth: {
      config1Content:
        "Navigate to `/settings/identity-providers`. Enter the Discovery/Authority URL, Client ID, and Secret from Azure AD or Google. You can mark this provider as 'Global' (all tenants) or bind it to your specific Tenant.",
      config1Title: "1. Bind an External Identity Provider (Client Mode)",
      config2Content:
        "Configure requested scopes (openid, profile, email). SCRIPE automatically maps external JWT claims (like `preferred_username`, `picture`, `given_name`) to internal Admin/User profiles, enabling Just-In-Time (JIT) provisioning instantly.",
      config2Title: "2. Automatic Claim Mapping",
      config3Content:
        "Decide whether the provider is for Admins (back-office) or Users (front-office). Identity bindings are strictly typed—preventing an external User from escalating into an Admin session.",
      config3Title: "3. Enforce IAM Policies",
      config4Content:
        "Navigate to `/settings/oauth-apps` to make SCRIPE the SSO provider for external software (e.g., your custom mobile app). Define Public (SPA) or Confidential (Backend) profiles entirely via the UI.",
      config4Title: "4. Register Third-Party Apps (Server Mode)",
      config5Content:
        "External applications simply point their Authority to `https://your-scripe-instance.com`. SCRIPE automatically serves the `/.well-known/openid-configuration` and `/.well-known/jwks` discovery endpoints.",
      config5Title: "5. Jwks Uri & Discovery",
      configContent: "Configuring SCRIPE as your primary authentication gateway via the Admin UI:",
      configTitle: "IAM Setup Guide (Admin Panel)",
      description:
        "Enterprise-grade Authentication Server capable of replacing Keycloak, Okta, and Auth0. Native OIDC Identity Providers, OAuth Application registration, PKCE enforcement, and isolated tenant federations.",
      feat1Desc:
        "Federate instantly with external OIDC/OAuth2 providers (Google, Azure AD, Okta, AWS Cognito). SuperAdmins can configure Global providers for all users, while Tenant Admins can bind their own isolated Corporate Azure AD or Workspace directly from the Admin Panel, enabling zero-code B2B SSO setups.",
      feat1Title: "Global & Per-Tenant External Identity Providers",
      feat2Desc:
        "Replace Keycloak entirely. Register third-party business systems, mobile apps, and external dashboards directly into SCRIPE via the Admin Panel. Issue Client IDs and Secrets, control scopes, and generate enterprise-grade JWTs backed by SCRIPE's identity store.",
      feat2Title: "SCRIPE as the Identity Server",
      feat3Desc:
        "The deprecated Implicit Flow is eradicated. All authentication is strictly enforced via Proof Key for Code Exchange (PKCE). Easily toggle integrations on or off, define claim mapping rules, and manage secrets without touching a single line of backend code.",
      feat3Title: "Strict PKCE & Zero-Code Config",
      feat4Desc:
        "Every tenant is an isolated IAM realm. If Tenant A connects to their Corporate Azure AD, Tenant B has absolutely no visibility. Tenant A issues credentials to its own OAuth apps without polluting the global root infrastructure.",
      feat4Title: "Multi-Tenant Realm Isolation",
      intro:
        "SCRIPE is built as a complete Enterprise Identity and Access Management (IAM) Server relying on OpenIddict. It handles both sides of the SSO equation: First, as a federated Identity Provider (Client) connecting to Google/Azure AD, and Second, as an OAuth2/OIDC Authorization Server replacing Keycloak.",
      loginFlowContent:
        "SCRIPE cleanly separates the protocol handshake from the UI login form. When acting as a Relying Party to Azure AD, SCRIPE redirects the user, accepts the callback, validates the external JWT, and then issues its OWN internal JWT, completely decoupling internal authorization from the external provider.",
      loginFlowTitle: "The Decoupled OIDC Architecture",
      managementContent:
        "The Admin Panel provides two dedicated control centers for IAM: Identity Providers (for inbound federation) and OAuth Applications (for outbound authorization server capabilities).",
      managementTitle: "IAM Control Center Settings",
      overviewTitle: "Massive IAM Capabilities",
      scopingContent:
        "SCRIPE matches Keycloak's Realm concept perfectly through Tenant Partitions. Identity Providers and OAuth Applications are strictly bound to their TenantId. SuperAdmins manage all realms via the 'Enter Tenant World' capability.",
      scopingTip:
        "A B2B SaaS super-power: Your customers can bring their own Identity Provider. A tenant admin can log into the SCRIPE Admin Panel, configure their corporate Azure AD, and immediately their employees can SSO into their tenant. Zero code required.",
      scopingTitle: "Realm (Tenant) Partitioning",
      title: "Enterprise SSO Architecture (Federation & Keycloak Alternative)",
    },
    themeMarketplace: {
      applyIntro:
        "Applying a marketplace theme follows a 5-step pipeline: 1. User clicks Apply on a theme. 2. Frontend reads the theme's ThemeDataJson. 3. previewTheme() in useStudioViewModel merges the design tokens (including per-page overrides) into the current StudioDraft. 4. The merged draft is saved to the tenant's DraftBrandingJson via PUT /tenants/{id}/settings. 5. Admin publishes the draft to make it live.",
      applyTitle: "Theme Application Flow",
      archDataFlowIntro:
        "1. LoginThemeSeeder.cs seeds 40 themes at application startup (upsert-safe). 2. ThemesController exposes GET /themes (list), GET /themes/{id} (detail), POST /themes/{id}/apply (apply). 3. Frontend ThemeMarketplaceService calls the API via IApiService. 4. ThemeMarketplaceMapper converts DTOs to domain entities. 5. ThemeMarketplaceRepository orchestrates services + mappers. 6. useThemeMarketplace hook provides ViewModel state. 7. ThemeGalleryView renders the marketplace UI.",
      archDataFlowTitle: "Data Flow Pipeline",
      archIntro:
        "The Theme Marketplace follows a pipeline architecture: backend seeder populates the LoginTheme table with 40 records → API exposes paginated list, detail, and apply endpoints → frontend gallery renders themes with advanced filtering → apply action snapshots the ThemeDataJson into tenant's DraftBrandingJson → publish propagates to LiveBrandingJson. Each layer is fully decoupled.",
      archLayersIntro:
        "The marketplace follows SCRIPE's standard 3-layer module structure: Domain layer (ThemeDetail entity, IThemeMarketplaceRepository, IThemeMarketplaceService interfaces), Data layer (ThemeMarketplaceService, ThemeMarketplaceRepository, ThemeMarketplaceMapper, ThemeMarketplaceTypes models), and Presentation layer (ThemeGalleryView, ThemeManagementView, ThemeDetailModal, ThemeCard, useThemeMarketplace hook).",
      archLayersTitle: "Clean Architecture Layers",
      archTitle: "Marketplace Architecture",
      catalogDiversityIntro:
        "The 40-theme catalog achieves maximum diversity across multiple axes: each theme uses a unique Google Font pairing, no two themes share the same color palette, all 7 categories are represented, and the layout distribution covers T1 Split (16), T2 Full-Page (12), T3 Centered (6), and T4 Special (6). This ensures every tenant can find a theme that matches their brand identity.",
      catalogDiversityTitle: "Design Diversity Matrix",
      catalogIntro:
        "SCRIPE ships with 40 meticulously designed branding packages. Each theme is a unique visual identity crafted for a specific market segment or brand aesthetic. Themes span 7 categories, use 30+ different Google Fonts, cover all 22 layouts, and include per-page branding overrides for Login, Forgot Password, and Reset Password.",
      catalogTitle: "40-Theme Catalog Overview",
      catCorporate:
        "Corporate — Professional business identity. Clean lines, serif/sans-serif font pairs, subtle gradients, blue/navy/gray palettes. Designed for financial services, consulting, law firms.",
      catCreative:
        "Creative — Bold, expressive identity. Vibrant colors, playful typography (Poppins, Quicksand), animated gradients, modern card layouts. Designed for agencies, startups, tech companies.",
      catDark:
        "Dark — Sophisticated dark-mode-first identity. Deep backgrounds (slate, zinc, charcoal), accent-driven highlights (cyan, amber, rose), premium glass effects. Designed for developer tools, media, gaming.",
      categoriesIntro:
        "Every theme belongs to exactly one category. Categories enable intuitive gallery browsing and filtering. The distribution ensures broad coverage: Corporate (8), Creative (6), Dark (6), Minimal (5), Elegant (5), Luxury (5), Nature (5).",
      categoriesTitle: "7 Theme Categories",
      catElegant:
        "Elegant — Refined, luxurious identity. Rose gold, champagne, pearl gradients, serif typography (Playfair Display, Cormorant), delicate overlays. Designed for beauty, fashion, hospitality.",
      catLuxury:
        "Luxury — Ultra-premium brand identity. Black/gold/platinum palettes, display typography (Italiana, Cinzel Decorative), full-bleed imagery, art-directed layouts. Designed for high-end brands, private banking, exclusive services.",
      catMinimal:
        "Minimal — Reductive, content-focused identity. Monochromatic palettes, generous whitespace, thin borders, system-optimized typography. Designed for productivity tools, documentation, SaaS platforms.",
      catNature:
        "Nature — Organic, earth-inspired identity. Forest greens, terracotta, ocean blues, botanical accents, rounded shapes, warm serif typography. Designed for sustainability, wellness, organic brands.",
      compDetailModal:
        "ThemeDetailModal (28KB) — Richly detailed theme preview modal. Contains: full-size preview image, design token summary (colors, fonts, spacing), feature matrix (dark mode, per-page, overlay), category/tier badges, Apply button with confirmation dialog, and like/favorite toggles.",
      compGalleryView:
        "ThemeGalleryView (26KB) — Full-page marketplace with animated hero section, category filter chips, search bar, grid/list view toggle, tier filter tabs, sort controls (popular/newest/name), infinite scroll pagination, and a responsive 3-column grid of ThemeCard components.",
      compManagementView:
        "ThemeManagementView (12KB) — Admin CRUD page for managing system themes. DataTable with columns: thumbnail, name, category, tier, status, likes, applies, actions. Supports create, edit, activate/deactivate, and bulk operations.",
      compMarketplacePanel:
        "ThemeMarketplacePanel — Inline panel within the Customizer Studio sidebar. Shows a compact gallery of themes with quick-apply functionality. Allows browsing and applying themes without leaving the studio.",
      componentsIntro:
        "The Theme Marketplace frontend consists of 8 purpose-built components spanning 3 pages and 1 modal. Each component follows SCRIPE's presentation-layer patterns using domain entities (never DTOs) and consuming data exclusively through the DI container.",
      componentsTitle: "Frontend Component Inventory",
      compThemeCard:
        "ThemeCard — Gallery grid item. Displays: thumbnail, name, category badge, tier badge, color palette strip (5 primary colors), font family name, like count, apply count, and hover-to-preview animation.",
      copyOnApplyIntro:
        "When a theme is applied, the ThemeDataJson is COPIED into the tenant's DraftBrandingJson — not linked. This means the tenant's branding is permanently isolated from future marketplace updates. If the theme is updated in v2.0, existing tenants who applied v1.0 retain their v1.0 snapshot. This prevents unexpected visual changes to production login pages.",
      copyOnApplyNote:
        "Copy-on-apply is a deliberate architectural decision. It trades storage efficiency for deployment safety — a critical requirement for enterprise tenants who negotiate specific branding contracts.",
      copyOnApplyTitle: "Copy-on-Apply Snapshot Semantics",
      description:
        "40 premium branding packages, 7 categories, 5 pricing tiers, per-page overrides, copy-on-apply snapshot semantics, and a full clean-architecture data layer — all seeded and ready to browse.",
      endpointApply:
        "POST /api/v1/themes/{id}/apply — Apply theme to the current tenant's draft settings. Copies ThemeDataJson to DraftBrandingJson.",
      endpointDetail:
        "GET /api/v1/themes/{id} — Full theme detail including ThemeDataJson, metadata, and engagement counters.",
      endpointLike:
        "POST /api/v1/themes/{id}/like — Toggle like/favorite for the current admin. Increments/decrements LikesCount.",
      endpointList:
        "GET /api/v1/themes — Paginated list of active themes with category, tier, and search filters.",
      endpointManage:
        "POST/PUT/DELETE /api/v1/themes — System admin CRUD for managing theme catalog (create, update, deactivate).",
      endpointsIntro:
        "The theme marketplace exposes endpoints through the existing TenantSettings and Themes controllers. Theme data is served as part of the branding configuration pipeline.",
      endpointsTitle: "Theme API Endpoints",
      entityFieldApplied:
        "AppliedCount — Usage counter. Tracks how many tenants have applied this theme.",
      entityFieldAuthor: "Author — Creator identifier (e.g., 'SCRIPE Design Team').",
      entityFieldCategory:
        "Category — Classification tag (corporate, creative, dark, elegant, luxury, minimal, nature). Used for gallery filtering.",
      entityFieldDescription:
        "Description — Marketing-quality description of the theme's visual identity and design philosophy.",
      entityFieldIsActive:
        "IsActive — Boolean flag. Inactive themes are hidden from the gallery but preserved in the database.",
      entityFieldIsSystem:
        "IsSystemTheme — Boolean flag. System themes are seeded at startup and cannot be deleted by tenants.",
      entityFieldLikes:
        "LikesCount — Engagement counter. Tracks how many tenants have favorited this theme.",
      entityFieldName:
        "Name — Human-readable theme name (e.g., 'Midnight Aurora', 'Sakura Bloom'). Unique per system.",
      entityFieldPreviewUrl:
        "PreviewUrl — Optional full-size preview image URL for the detail modal.",
      entityFieldsTitle: "Entity Fields",
      entityFieldTag:
        "Tags — Optional comma-separated tags for search (e.g., 'gradient, glass, modern, dark').",
      entityFieldThemeData:
        "ThemeDataJson — JSON column containing the complete design specification (50+ tokens). This is the heart of each theme.",
      entityFieldThumbnail: "ThumbnailUrl — Optional preview image URL for gallery cards.",
      entityFieldTier:
        "Tier — Pricing/access tier (Free, Starter, Professional, Enterprise, StandaloneAddon). Controls edition-based access gating.",
      entityFieldVersion:
        "Version — Semantic version string (e.g., '1.0.0'). Incremented when the theme design is updated.",
      entityIntro:
        "Each marketplace theme is stored as a LoginTheme entity in the Identity module's database. The entity extends AuditableEntity, providing soft-delete, audit trail, and optimistic concurrency. The core data is stored in ThemeDataJson — a JSON column containing the full design specification.",
      entityTitle: "LoginTheme Entity",
      governanceEditionIntro:
        "Each theme's Tier field maps to an edition level. The frontend gallery marks themes above the tenant's edition with an 'Upgrade Required' badge and disables the Apply button. The backend apply endpoint verifies the tenant's active subscription against the theme's tier before allowing application.",
      governanceEditionTitle: "Edition-Based Tier Enforcement",
      governanceIntro:
        "Theme access is controlled by a combination of edition-based tier enforcement and permission-based administrative access. The marketplace respects SCRIPE's multi-tenancy model — themes are globally visible but apply operations are scoped to the current tenant.",
      governancePermissionIntro:
        "Browsing the marketplace requires the branding.view permission. Applying a theme requires branding.manage. Managing system themes (CRUD) requires the themes.manage permission, which is restricted to System Admins.",
      governancePermissionTitle: "Permission Requirements",
      governanceTenantIntro:
        "When a theme is applied, it modifies only the current tenant's DraftBrandingJson. The apply operation is scoped via the JWT tenant_id claim. SuperAdmins can apply themes on behalf of any tenant via the 'Enter Tenant World' drill-down capability.",
      governanceTenantTitle: "Tenant Isolation",
      governanceTitle: "Marketplace Governance",
      intro:
        "The Theme Marketplace is SCRIPE's curated catalog of 40 production-ready branding packages. Each theme is a comprehensive visual identity — not just a color swap — containing 50+ design tokens spanning colors, typography, spacing, overlay, dark mode, branding panel, and per-page overrides for Login, Forgot Password, and Reset Password pages. Themes are stored as structured JSON in the LoginTheme entity, browsable via a full-page gallery with rich filtering, and applied to tenant settings with copy-on-apply snapshot semantics that permanently isolate applied configurations from future marketplace updates.",
      perPageIntro:
        "Each theme can define independent visual overrides for three authentication pages: Login, Forgot Password, and Reset Password. The 'pages' block in ThemeDataJson contains page-specific layout, headline, subtitle, overlay, and background settings that are merged on top of the global design when that page is active. This enables a single theme to present different messaging and visual treatments for different auth flows.",
      perPageIsolationNote:
        "Each auth page can have its own layout, headline, subtitle, and overlay without affecting the other pages. The Login page might use a full-image corporate layout while Forgot Password uses a clean centered card — all within the same theme.",
      perPageIsolationTitle: "State Isolation",
      perPageMergeIntro:
        "When a tenant previews a theme's Forgot Password page, the frontend merges the global design tokens with the forgotPassword override using spread semantics: { ...globalTokens, ...pages.forgotPassword }. This means any token not specified in the page override inherits from the global design — only the explicitly overridden values change. The merge happens in the previewTheme() function in useStudioViewModel.ts.",
      perPageMergeTitle: "Merge Strategy",
      perPageStructIntro:
        "The 'pages' object in ThemeDataJson contains three optional keys: 'login', 'forgotPassword', and 'resetPassword'. Each key maps to a page override object with fields: selectedLayout, panelHeadline, panelSubtitle, overlayColor, overlayOpacity, backgroundType, backgroundValue, and any other token that should differ from the global configuration.",
      perPageStructTitle: "Pages Block Structure",
      perPageTitle: "Per-Page Branding Architecture",
      previewFlowIntro:
        "The previewTheme() function in useStudioViewModel.ts performs a non-destructive preview by temporarily injecting theme tokens into the draft state. The preview is displayed in the sandboxed iframe via postMessage CSS variable injection. The draft is NOT saved until the user explicitly confirms the application. Canceling the preview restores the previous draft state.",
      previewFlowTitle: "Preview Before Apply",
      schemaColorsIntro:
        "The colors section defines the complete light-mode palette: primaryColor (brand accent), secondaryColor (complementary), backgroundColor (page background), formBackground (form card), textColor (primary text), secondaryTextColor (muted text), inputBackground (form input fields), inputBorderColor, inputTextColor, buttonColor (primary CTA), buttonTextColor, buttonHoverColor, linkColor, linkHoverColor, borderColor (general borders), and accentColor (highlights/badges).",
      schemaColorsTitle: "Color System (16 Tokens)",
      schemaDarkIntro:
        "Independent dark-mode palette: darkEnabled (boolean toggle), darkFormBackground, darkTextColor, darkInputBackground, darkInputBorderColor, darkInputTextColor, darkButtonColor, darkButtonTextColor, darkSecondaryTextColor, and darkBorderColor. These tokens are emitted as --login-dark-* CSS variables and activated via the [data-theme='dark'] selector.",
      schemaDarkTitle: "Dark Mode Color System (10 Tokens)",
      schemaIntro:
        "The ThemeDataJson column stores a comprehensive JSON object containing every visual parameter needed to fully render a branded login page. The schema is versioned and contains 7 major sections: layout, colors, dark mode colors, typography, spacing, overlay, and branding panel. Each token maps directly to a CSS custom property via the useLoginBrandingTokens pipeline.",
      schemaLayoutIntro:
        "Controls the page structure: selectedLayout (one of 22 layout identifiers), loginPosition (left/center/right), formWidth, formMaxWidth, containerPadding, and formAlignment. Layout selection determines which rendering strategy the LoginPage component uses.",
      schemaLayoutTitle: "Layout Configuration",
      schemaOverlayIntro:
        "Controls visual effects layered on backgrounds: overlayColor (RGBA), overlayOpacity (0–100%), overlayBlur (0–20px in Gaussian blur), backgroundType ('color', 'gradient', 'image'), backgroundValue (CSS gradient string or image URL), backgroundSize, backgroundPosition, and backgroundRepeat. Overlay settings can be scoped to the form section or branding panel independently.",
      schemaOverlayTitle: "Overlay & Effects (8 Tokens)",
      schemaPanelIntro:
        "Controls the branding side of split layouts: panelLogo (URL), panelHeadline (heading text), panelSubtitle (subheading text), panelHeadlineColor, panelSubtitleColor, panelBackgroundType, panelBackgroundValue, panelOverlayColor, panelOverlayOpacity, panelOverlayBlur, panelLogoSize (small/medium/large), and panelAlignment (left/center/right). These tokens are only rendered in T1 Split layouts.",
      schemaPanelTitle: "Branding Panel Configuration (12 Tokens)",
      schemaSpacingIntro:
        "Controls layout geometry: borderRadius (global border-radius in px), inputBorderRadius, buttonBorderRadius, inputHeight (in px), buttonHeight, and gap (spacing between form elements). These values are emitted as CSS custom properties and applied uniformly across all 22 layouts.",
      schemaSpacingTitle: "Spacing & Dimensions (6 Tokens)",
      schemaTitle: "ThemeDataJson Schema (50+ Design Tokens)",
      schemaTypographyIntro:
        "Controls all text rendering: fontFamily (Google Fonts name, e.g., 'Playfair Display'), headingFontFamily (optional separate heading font), fontSize (base size in px), headingSize, labelSize, inputFontSize, fontWeight (normal/medium/semibold/bold), and letterSpacing. Fonts are loaded dynamically via the Google Fonts CDN.",
      schemaTypographyTitle: "Typography Configuration (8 Tokens)",
      schemaVersionIntro:
        "The root 'version' field tracks the JSON schema version. Current version is '2.0'. The frontend handles backward compatibility — older schemas are normalized at read time.",
      schemaVersionTitle: "Schema Version",
      seedHelperIntro:
        "The seeder uses a fluent Build() helper with ThemeMeta and ThemeDesign records for clean theme definition. ThemeMeta contains name, category, tier, description, author, version, and tags. ThemeDesign contains all 50+ design tokens plus per-page overrides (PageOverrideDesign records for ForgotPassword and ResetPassword). The BuildFullThemeJson() method serializes the ThemeDesign record into the JSON format expected by the frontend.",
      seedHelperTitle: "Build() Helper Architecture",
      seedingIntro:
        "All 40 themes are seeded at application startup by LoginThemeSeeder.cs. The seeder uses an upsert-safe strategy: it checks for existing themes by Name and only inserts new ones — existing themes are never overwritten. This ensures idempotent deployment across environments.",
      seedingTitle: "Backend Seeding Architecture",
      seedUpsertIntro:
        "The seeder queries all existing theme names before processing. For each of the 40 themes, it checks the existing set — if the name exists, the theme is skipped. New themes are added to the DbContext in a single batch and saved with one SaveChangesAsync call. This makes the seeder safe to run repeatedly without duplicating themes or losing manual edits.",
      seedUpsertTitle: "Upsert-Safe Strategy",
      sourceBackend:
        "Backend: LoginThemeSeeder.cs (seeder), LoginTheme.cs (entity), ThemeConfiguration.cs (EF config)",
      sourceData:
        "Data Layer: ThemeMarketplaceService.ts, ThemeMarketplaceRepository.ts, ThemeMarketplaceMapper.ts, ThemeMarketplaceTypes.ts",
      sourceDomain:
        "Domain Layer: ThemeDetail.ts (entity), IThemeMarketplaceService.ts, IThemeMarketplaceRepository.ts",
      sourceFrontend:
        "Frontend: ThemeGalleryView.tsx, ThemeManagementView.tsx, ThemeDetailModal.tsx, ThemeCard.tsx",
      sourceTitle: "Source File Reference",
      sourceViewModel:
        "ViewModel: useThemeMarketplace.ts (gallery state), useStudioViewModel.ts (preview/apply integration)",
      tierEnterpriseIntro:
        "Premium branding packages for Enterprise-edition tenants. Ultra-premium designs with cinematic layouts, luxury typography (Cormorant Garamond, Italiana, Cinzel Decorative), and exclusive dark-mode treatments.",
      tierEnterpriseTitle: "Enterprise Tier (8 Themes)",
      tierFreeIntro:
        "Essential branding packages available to all tenants regardless of edition. Clean, professional designs suitable for quick deployment. Includes Starter themes across corporate, minimal, and creative categories.",
      tierFreeTitle: "Free Tier (8 Themes)",
      tierIntro:
        "Themes are organized into 5 pricing tiers that align with SCRIPE's edition system. Each tier provides increasing design sophistication and customization depth. Tier enforcement is handled by the theme marketplace frontend — themes from higher tiers display an 'Upgrade Required' badge and disable the Apply button for tenants on lower editions.",
      tierProIntro:
        "Advanced branding packages for Professional-edition tenants. Sophisticated visual treatments with glass-morphism effects, editorial typography, and multi-tone overlays. Includes the most diverse category coverage.",
      tierProTitle: "Professional Tier (10 Themes)",
      tierStandaloneIntro:
        "Ultra-exclusive standalone branding packages available as individual add-on purchases. These represent the most unique and specialized designs — botanical illustrations, art deco, brutalist, vaporwave, and zen-inspired themes that make a bold brand statement.",
      tierStandaloneTitle: "Standalone Add-on Tier (6 Themes)",
      tierStarterIntro:
        "Enhanced branding packages for Starter-edition tenants. Richer color palettes, premium font pairings, and gradient backgrounds. Includes Starter-exclusive designs across corporate, dark, and elegant categories.",
      tierStarterTitle: "Starter Tier (8 Themes)",
      tierTitle: "5-Tier Pricing Model",
      title: "Theme Marketplace",
    },
    userGroups: {
      architectureIntro:
        "Each UserGroup belongs to a single tenant and contains three collections: Members (AdminUserGroup junction), Roles (UserGroupRole), and Restrictions (UserGroupRestriction). The group inherits from AuditableEntity for soft-delete support and implements ITenantAwareEntity for automatic tenant scoping.",
      architectureTitle: "Architecture",
      cascadeIntro:
        "User Groups support massive bulk operations and cascading soft-deletes. When a UserGroup is deactivated or deleted, an administrator can optionally trigger a cascade operation to also deactivate or soft-delete all Administrators exclusively belonging to that group.",
      cascadeNote:
        "Cascade operations automatically skip Protected Admins (like the tenant creator). This ensures that a massive group deletion cannot accidentally wipe out the tenant's primary recovery account.",
      cascadeTitle: "Cascade Operations",
      description:
        "Group-based role and restriction assignment with tenant scoping, member management, and additive merge at login.",
      domainModelIntro:
        "The User Groups feature adds 4 entities to the Identity domain. UserGroup is the aggregate root. AdminUserGroup is the many-to-many junction between Admin and UserGroup. UserGroupRole assigns a role to all group members. UserGroupRestriction defines per-permission field restrictions.",
      domainModelTitle: "Domain Model",
      endpointsTitle: "API Endpoints (12)",
      frontendIntro:
        "The frontend module follows the standard SCRIPE module structure with domain, data, and presentation layers. The list page uses GenericCrudView for standard CRUD operations. The detail page provides 3 tabs for managing members, roles, and restrictions independently.",
      frontendTitle: "Frontend Module",
      howItWorksIntro:
        "When an admin logs in, the AdminSecurityService loads their direct roles AND all groups they belong to. For each group, it collects the group's roles and restrictions. The final set of permissions is the UNION of direct roles and all group-inherited roles. Restrictions are merged additively — if any source restricts a field, it is restricted in the effective claim set.",
      howItWorksTitle: "How It Works at Login",
      intro:
        "User Groups provide a scalable way to assign roles and field-level restrictions to large numbers of administrators. Instead of assigning roles individually to each admin, you create a group, add roles and restrictions to it, then add admins as members. All members automatically inherit the group's roles and restrictions on their next login.",
      memberManagementIntro:
        "Adding members is idempotent — posting an admin ID that is already a member silently succeeds. Removing a member removes the junction record; the admin retains all directly-assigned roles. The member list is queryable with admin metadata (name, email, status).",
      memberManagementTitle: "Member Management",
      mergeNote:
        "Group roles and restrictions are additive — they can only EXPAND an admin's effective restrictions, never remove direct role assignments. This matches the 'deny wins' security principle.",
      restrictionsIntro:
        "Group restrictions follow the same model as role-level RestrictedFields. Each restriction targets a specific permission code and lists the fields to hide. At login, the system takes the UNION of all restricted fields across direct roles and all group memberships — if any source restricts 'salary', it's restricted regardless of other assignments.",
      restrictionsTitle: "Field Restrictions",
      roleAssignmentIntro:
        "Group roles use a nuke-and-pave pattern (PUT replaces all). This ensures the database always matches the UI state. Each role must belong to the same tenant as the group. Roles assigned via groups appear alongside directly-assigned roles in the admin's effective permission set.",
      roleAssignmentTitle: "Role Assignment",
      securityNote:
        "User Groups are tenant-scoped. SuperAdmins see all groups across tenants. Tenant admins can only manage groups within their own tenant. All mutations are audited and require the user_groups.* permission set.",
      title: "User Groups",
    },
    userManagement: {
      accountOpsTitle: "Account Operations",
      adminVsUserIntro:
        "SCRIPE separates admins and users as distinct entities. Admins manage the platform and have full RBAC with assigned roles. Users are end-users of the tenant's application with limited, self-service capabilities.",
      adminVsUserTitle: "Admin vs User Model",
      bulkOpsTitle: "Bulk Operations",
      crudTitle: "AdminsController  CRUD Endpoints",
      description:
        "Complete admin/user lifecycle with 27 endpoints, bulk operations, impersonation, and protected admin rules.",
      enterpriseOpsTitle: "Enterprise Operations",
      nukePaveTip:
        "Use Nuke & Pave (PUT /admins/{id}/roles/sync) instead of individual add/remove when assigning roles from a UI checklist. It eliminates race conditions and ensures the database always matches the UI state exactly.",
      nukePaveTitle: "Nuke & Pave Pattern",
      protectedIntro:
        "Each tenant has exactly one protected admin  the super admin who created the tenant. The protected flag prevents accidental deletion or deactivation of the tenant's primary administrator.",
      protectedTitle: "Protected Admin Rules",
      roleMgmtTitle: "Role Management Endpoints",
      title: "User Management",
    },
    webhookSystem: {
      architectureIntro:
        "The Webhook System enables external integrations by delivering event payloads to subscriber URLs. Each payload is HMAC-signed for verification, and failed deliveries are retried with exponential backoff.",
      architectureTitle: "Webhook Architecture",
      circuitBreakerIntro:
        "Each subscription has a MaxConsecutiveFailures threshold. When reached, the subscription is automatically disabled (IsActive = false) to avoid hammering failing endpoints. An AuditLog entry is created and the admin is notified.",
      circuitBreakerTitle: "Circuit Breaker (Auto-Disable)",
      deliveryLogsIntro:
        "Every delivery attempt is recorded in the WebhookDeliveryLog table with status code, response body, duration, and attempt number. Failed deliveries include error details for debugging.",
      deliveryLogsTitle: "Delivery Logs",
      description:
        "Event-driven webhooks with HMAC rotation (24h grace), tenant hierarchy subscriptions, circuit breaker, and delivery logs.",
      endpointsManagementTitle: "Subscription Management",
      endpointsOperationsTitle: "Operations & Monitoring",
      endpointsTitle: "Webhook API Endpoints",
      entityTitle: "WebhookSubscription Entity",
      eventsTitle: "Webhook Event Types",
      hmacIntro:
        "Every webhook payload is signed with HMAC-SHA256 using the subscription's secret key. The receiver can verify the signature by computing the HMAC of the raw request body and comparing it to the X-Webhook-Signature header.",
      hmacTitle: "HMAC Signing",
      includeChildrenIntro:
        "When IncludeChildren is enabled on a subscription, the webhook receives events from the subscribing tenant AND all child tenants in the hierarchy. This is perfect for parent companies that need to monitor branch activity.",
      includeChildrenTitle: "Tenant Hierarchy Subscriptions",
      retryIntro:
        "Failed webhook deliveries are retried with exponential backoff. The system tracks the last attempt time and response status to determine when to retry.",
      retryTitle: "Retry Policy",
      secretRotationIntro:
        "The RotateSecret endpoint generates a new HMAC secret while keeping the old one valid for 24 hours. This prevents missed deliveries during migration  the system signs payloads with the new secret and includes the old signature in X-Webhook-Signature-Old header.",
      secretRotationTitle: "Secret Rotation (24h Grace Period)",
      title: "Webhook System",
    },
  },
};
