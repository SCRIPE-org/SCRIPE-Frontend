import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.ssoOauth.intro" },

  // ── Feature Overview ──
  { type: "heading", level: 2, titleKey: "features.ssoOauth.overviewTitle", id: "overview" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "Fingerprint",
        titleKey: "features.ssoOauth.feat1Title",
        descriptionKey: "features.ssoOauth.feat1Desc",
      },
      {
        icon: "KeyRound",
        titleKey: "features.ssoOauth.feat2Title",
        descriptionKey: "features.ssoOauth.feat2Desc",
      },
      {
        icon: "Shield",
        titleKey: "features.ssoOauth.feat3Title",
        descriptionKey: "features.ssoOauth.feat3Desc",
      },
      {
        icon: "Building2",
        titleKey: "features.ssoOauth.feat4Title",
        descriptionKey: "features.ssoOauth.feat4Desc",
      },
    ],
  },

  // ── Configuration Guide ──
  { type: "heading", level: 2, titleKey: "features.ssoOauth.configTitle", id: "configuration" },
  { type: "paragraph", contentKey: "features.ssoOauth.configContent" },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "features.ssoOauth.config1Title",
        contentKey: "features.ssoOauth.config1Content",
      },
      {
        titleKey: "features.ssoOauth.config2Title",
        contentKey: "features.ssoOauth.config2Content",
      },
      {
        titleKey: "features.ssoOauth.config3Title",
        contentKey: "features.ssoOauth.config3Content",
      },
      {
        titleKey: "features.ssoOauth.config4Title",
        contentKey: "features.ssoOauth.config4Content",
      },
      {
        titleKey: "features.ssoOauth.config5Title",
        contentKey: "features.ssoOauth.config5Content",
      },
    ],
  },

  // ── Manager Pages ──
  { type: "heading", level: 2, titleKey: "features.ssoOauth.managementTitle", id: "management" },
  { type: "paragraph", contentKey: "features.ssoOauth.managementContent" },
  {
    type: "table",
    headers: ["Page", "URL", "Permission", "Purpose"],
    rows: [
      [
        "Identity Providers",
        "/settings/identity-providers",
        "identity_providers.view",
        "CRUD management of external IdPs (Azure AD, Google, Okta, etc.)",
      ],
      [
        "OAuth Applications",
        "/settings/oauth-apps",
        "oauth_apps.view",
        "Register third-party apps that login via NEXORA as OIDC server",
      ],
    ],
  },

  // ── Login Flow ──
  { type: "heading", level: 2, titleKey: "features.ssoOauth.loginFlowTitle", id: "login-flow" },
  { type: "paragraph", contentKey: "features.ssoOauth.loginFlowContent" },
  {
    type: "list",
    variant: "ordered",
    items: [
      "User navigates to /login — the login page automatically fetches available SSO providers",
      "If providers exist, branded SSO buttons appear below the sign-in form with an 'or continue with' divider",
      "User clicks a provider button → frontend calls POST /auth/oidc/challenge → gets authorization URL with PKCE parameters",
      "PKCE state (code_verifier, state, providerId) is stored in sessionStorage — frontend redirects to the IdP",
      "User authenticates at the external IdP (Azure AD, Google, etc.) and grants consent",
      "IdP redirects back to /sso/callback?code=...&state=...",
      "Callback page retrieves PKCE state from sessionStorage, validates state matches (CSRF protection)",
      "Frontend calls POST /auth/oidc/callback with code + codeVerifier → backend exchanges code for user info",
      "Backend finds the linked ExternalLogin record → returns the admin/user identity",
      "Frontend completes login: stores auth tokens, loads navigation, redirects to dashboard",
    ],
  },

  // ── Tenant Scoping ──
  { type: "heading", level: 2, titleKey: "features.ssoOauth.scopingTitle", id: "scoping" },
  { type: "paragraph", contentKey: "features.ssoOauth.scopingContent" },
  {
    type: "info",
    variant: "tip",
    contentKey: "features.ssoOauth.scopingTip",
  },
];

registerPage({
  slug: "features/sso-oauth",
  titleKey: "features.ssoOauth.title",
  descriptionKey: "features.ssoOauth.description",
  category: "features",
  order: 14,
  sections,
  relatedSlugs: ["security/sso-identity-providers", "features/authentication"],
  lastUpdated: "2026-03-07",
});
