import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "security.sso.intro" },

  // ── How SSO Works ──
  { type: "heading", level: 2, titleKey: "security.sso.howItWorksTitle", id: "how-it-works" },
  { type: "paragraph", contentKey: "security.sso.howItWorksContent" },
  {
    type: "step-guide",
    steps: [
      { titleKey: "security.sso.step1Title", contentKey: "security.sso.step1Content" },
      { titleKey: "security.sso.step2Title", contentKey: "security.sso.step2Content" },
      { titleKey: "security.sso.step3Title", contentKey: "security.sso.step3Content" },
      { titleKey: "security.sso.step4Title", contentKey: "security.sso.step4Content" },
      { titleKey: "security.sso.step5Title", contentKey: "security.sso.step5Content" },
    ],
  },

  // ── PKCE Security ──
  { type: "heading", level: 2, titleKey: "security.sso.pkceTitle", id: "pkce" },
  { type: "paragraph", contentKey: "security.sso.pkceContent" },
  {
    type: "table",
    headers: ["Component", "Purpose"],
    rows: [
      ["code_verifier", "Cryptographically random string stored in sessionStorage"],
      ["code_challenge", "SHA-256 hash of the code_verifier sent to the IdP"],
      ["state", "CSRF protection — verified on callback"],
      ["Authorization Code", "One-time code from IdP, exchanged server-side"],
    ],
  },

  // ── Identity Provider Model ──
  { type: "heading", level: 2, titleKey: "security.sso.entityModelTitle", id: "entity-model" },
  { type: "paragraph", contentKey: "security.sso.entityModelContent" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Name", "string(100)", "Human-readable provider name (e.g., 'Corporate Azure AD')"],
      ["Slug", "string(50)", "URL-safe identifier, unique per tenant"],
      ["Protocol", "string(30)", "Authentication protocol: oidc, oauth2, saml (future)"],
      ["TenantId", "Guid?", "Null = system-wide; set = tenant-specific provider"],
      ["Authority", "string(500)", "OIDC issuer URL for discovery document"],
      ["ClientId", "string(200)", "OAuth2 client_id registered with the provider"],
      ["ClientSecretEncrypted", "string(500)", "AES-encrypted secret, never returned to frontend"],
      ["Scopes", "string(1000)", "OAuth2 scopes (default: openid profile email)"],
      ["ClaimMappingJson", "string(2000)", "JSON mapping external claims to SCRIPE claims"],
      ["EnabledForAdmins", "bool", "Show on admin login page"],
      ["EnabledForUsers", "bool", "Show on user login page"],
      ["ButtonColor", "string(50)", "CSS color for branded login button"],
      ["ButtonLabel", "string(200)", "Custom button text"],
      ["DisplayOrder", "int", "Sort order on the login page"],
    ],
  },

  // ── External Login Linking ──
  { type: "heading", level: 2, titleKey: "security.sso.linkingTitle", id: "linking" },
  { type: "paragraph", contentKey: "security.sso.linkingContent" },
  {
    type: "list",
    variant: "ordered",
    items: [
      "Admin signs in with username/password",
      "Navigates to Profile → Security → External Logins",
      "Clicks 'Link External Account' for the desired provider",
      "Completes OIDC authentication with the external IdP",
      "SCRIPE creates an ExternalLogin record linking the provider identity to the admin",
      "From now on, the admin can sign in using the SSO button on the login page",
    ],
  },

  // ── OAuth Applications ──
  { type: "heading", level: 2, titleKey: "security.sso.oauthAppsTitle", id: "oauth-apps" },
  { type: "paragraph", contentKey: "security.sso.oauthAppsContent" },
  {
    type: "table",
    headers: ["Field", "Description"],
    rows: [
      ["Application Name", "Display name for the third-party app"],
      ["Client ID", "Auto-generated unique identifier"],
      ["Client Secret", "Auto-generated secret (shown only once on creation)"],
      ["Client Type", "Confidential (server-side) or Public (SPA/mobile)"],
      ["Redirect URIs", "Allowed callback URLs"],
      ["Allowed Scopes", "openid, profile, email, roles (configurable)"],
      ["PKCE Required", "Enforce Proof Key for Code Exchange"],
    ],
  },

  // ── Claim Mapping ──
  { type: "heading", level: 2, titleKey: "security.sso.claimMappingTitle", id: "claim-mapping" },
  { type: "paragraph", contentKey: "security.sso.claimMappingContent" },
  {
    type: "code",
    language: "json",
    code: `{
  "sub": "oid",
  "email": "preferred_username",
  "name": "display_name",
  "given_name": "first_name",
  "family_name": "last_name"
}`,
  },

  // ── Tenant Scoping ──
  { type: "heading", level: 2, titleKey: "security.sso.tenantScopingTitle", id: "tenant-scoping" },
  { type: "paragraph", contentKey: "security.sso.tenantScopingContent" },
  {
    type: "info",
    variant: "note",
    contentKey: "security.sso.tenantScopingNote",
  },

  // ── API Endpoints ──
  { type: "heading", level: 2, titleKey: "security.sso.apiTitle", id: "api" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/auth/oidc/providers/admin",
        descriptionKey: "List SSO providers for admin login",
        auth: "Public",
      },
      {
        method: "GET",
        path: "/api/v1/auth/oidc/providers/user",
        descriptionKey: "List SSO providers for user login",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/oidc/challenge",
        descriptionKey: "Generate PKCE authorization URL",
        auth: "Public",
      },
      {
        method: "POST",
        path: "/api/v1/auth/oidc/callback",
        descriptionKey: "Exchange auth code for linked account",
        auth: "Public",
      },
      {
        method: "GET",
        path: "/api/v1/IdentityProviders",
        descriptionKey: "List identity providers (CRUD)",
        auth: "Required",
        permission: "identity_providers.view",
      },
      {
        method: "POST",
        path: "/api/v1/IdentityProviders",
        descriptionKey: "Create identity provider",
        auth: "Required",
        permission: "identity_providers.create",
      },
      {
        method: "PUT",
        path: "/api/v1/IdentityProviders/{id}",
        descriptionKey: "Update identity provider",
        auth: "Required",
        permission: "identity_providers.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/IdentityProviders/{id}",
        descriptionKey: "Delete identity provider",
        auth: "Required",
        permission: "identity_providers.delete",
      },
      {
        method: "POST",
        path: "/api/v1/IdentityProviders/{id}/test",
        descriptionKey: "Test OIDC connection",
        auth: "Required",
        permission: "identity_providers.update",
      },
      {
        method: "GET",
        path: "/api/v1/OAuthApplications",
        descriptionKey: "List OAuth applications (CRUD)",
        auth: "Required",
        permission: "oauth_apps.view",
      },
      {
        method: "POST",
        path: "/api/v1/OAuthApplications",
        descriptionKey: "Create OAuth application",
        auth: "Required",
        permission: "oauth_apps.create",
      },
      {
        method: "POST",
        path: "/api/v1/OAuthApplications/{id}/regenerate-secret",
        descriptionKey: "Regenerate client secret",
        auth: "Required",
        permission: "oauth_apps.update",
      },
    ],
  },
];

registerPage({
  slug: "security/sso-identity-providers",
  titleKey: "security.sso.title",
  descriptionKey: "security.sso.description",
  category: "security",
  order: 7,
  sections,
  relatedSlugs: ["security/authentication-deep", "security/api-security", "features/sso-oauth"],
  lastUpdated: "2026-06-28",
});
