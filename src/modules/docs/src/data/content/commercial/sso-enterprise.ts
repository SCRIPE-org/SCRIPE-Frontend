import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.ssoEnterprise.intro" },

  // ── Value Proposition ──
  { type: "heading", level: 2, titleKey: "commercial.ssoEnterprise.valueTitle", id: "value" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "ShieldCheck",
        titleKey: "commercial.ssoEnterprise.val1Title",
        descriptionKey: "commercial.ssoEnterprise.val1Desc",
      },
      {
        icon: "Users",
        titleKey: "commercial.ssoEnterprise.val2Title",
        descriptionKey: "commercial.ssoEnterprise.val2Desc",
      },
      {
        icon: "Zap",
        titleKey: "commercial.ssoEnterprise.val3Title",
        descriptionKey: "commercial.ssoEnterprise.val3Desc",
      },
      {
        icon: "Building2",
        titleKey: "commercial.ssoEnterprise.val4Title",
        descriptionKey: "commercial.ssoEnterprise.val4Desc",
      },
      {
        icon: "Palette",
        titleKey: "commercial.ssoEnterprise.val5Title",
        descriptionKey: "commercial.ssoEnterprise.val5Desc",
      },
      {
        icon: "Globe",
        titleKey: "commercial.ssoEnterprise.val6Title",
        descriptionKey: "commercial.ssoEnterprise.val6Desc",
      },
    ],
  },

  // ── Supported Protocols ──
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.ssoEnterprise.protocolsTitle",
    id: "protocols",
  },
  { type: "paragraph", contentKey: "commercial.ssoEnterprise.protocolsContent" },
  {
    type: "table",
    headers: ["Protocol", "Status", "Use Case"],
    rows: [
      [
        "OpenID Connect (OIDC)",
        "✅ Full Support",
        "Azure AD, Google, Okta, Auth0, AWS Cognito — industry standard",
      ],
      ["OAuth 2.0", "✅ Full Support", "Third-party app authorization, social logins"],
      ["SAML 2.0", "🔜 Planned", "Legacy enterprise IdPs, government systems"],
    ],
  },

  // ── Comparison ──
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.ssoEnterprise.comparisonTitle",
    id: "comparison",
  },
  {
    type: "table",
    headers: ["Capability", "NEXORA", "Azure AD B2C", "Keycloak"],
    rows: [
      [
        "Multi-tenant SSO",
        "✅ Native per-tenant",
        "⚠️ Requires separate B2C tenants",
        "⚠️ Realm-per-tenant",
      ],
      ["PKCE Flow", "✅ Built-in", "✅ Supported", "✅ Supported"],
      [
        "Tenant-scoped providers",
        "✅ Isolation by default",
        "❌ Manual config",
        "⚠️ Realm-level only",
      ],
      [
        "Branded login buttons",
        "✅ Per-provider colors/labels",
        "⚠️ Custom policies needed",
        "⚠️ Theme customization",
      ],
      [
        "Admin + User isolation",
        "✅ Separate enable flags",
        "❌ Single user pool",
        "⚠️ Roles-based split",
      ],
      ["Claim mapping", "✅ JSON-configurable", "⚠️ Policy-based", "✅ Mapper-based"],
      ["UI management", "✅ Full CRUD UI", "⚠️ Azure Portal only", "✅ Admin console"],
      ["Self-hosted", "✅ Full control", "❌ Cloud-only", "✅ Self-hosted"],
      [
        "Deployment complexity",
        "✅ Zero extra infra",
        "⚠️ Azure subscription",
        "⚠️ Separate server needed",
      ],
    ],
  },

  // ── Multi-IdP Per Tenant ──
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.ssoEnterprise.multiIdpTitle",
    id: "multi-idp",
  },
  { type: "paragraph", contentKey: "commercial.ssoEnterprise.multiIdpContent" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "Each tenant can configure unlimited identity providers independently",
      "System-wide providers (TenantId = null) are available to all tenants",
      "Tenant-specific providers are fully isolated — invisible to other tenants",
      "Host admins can manage any tenant's providers via 'Enter Tenant World'",
      "Multiple providers can be active simultaneously per tenant",
    ],
  },

  // ── Branded Login Experience ──
  { type: "heading", level: 2, titleKey: "commercial.ssoEnterprise.brandingTitle", id: "branding" },
  { type: "paragraph", contentKey: "commercial.ssoEnterprise.brandingContent" },
  {
    type: "table",
    headers: ["Customization", "Description"],
    rows: [
      ["Button Color", "Per-provider CSS color (e.g., #0078D4 for Microsoft blue)"],
      ["Button Label", "Custom text (e.g., 'Sign in with Corporate SSO')"],
      ["Provider Icon", "Custom icon URL or automatic protocol-based icon"],
      ["Display Order", "Sort order on the login page"],
      ["Divider Text", "Localized 'or continue with' separator"],
    ],
  },

  // ── PKCE Security ──
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.ssoEnterprise.securityModelTitle",
    id: "security",
  },
  { type: "paragraph", contentKey: "commercial.ssoEnterprise.securityModelContent" },
  {
    type: "list",
    variant: "unordered",
    items: [
      "PKCE (Proof Key for Code Exchange) — prevents authorization code interception attacks",
      "State parameter validation — prevents CSRF attacks during the redirect flow",
      "Client secrets are AES-encrypted at rest — never returned to the frontend",
      "Authorization codes are one-time use — exchanged server-side within seconds",
      "Discovery document caching — automatic OIDC configuration validation",
      "Session-scoped PKCE storage — code_verifier lives only during the login flow",
    ],
  },

  // ── OAuth Applications ──
  { type: "heading", level: 2, titleKey: "commercial.ssoEnterprise.oauthTitle", id: "oauth" },
  { type: "paragraph", contentKey: "commercial.ssoEnterprise.oauthContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "Server",
        titleKey: "commercial.ssoEnterprise.oauth1Title",
        descriptionKey: "commercial.ssoEnterprise.oauth1Desc",
      },
      {
        icon: "Smartphone",
        titleKey: "commercial.ssoEnterprise.oauth2Title",
        descriptionKey: "commercial.ssoEnterprise.oauth2Desc",
      },
    ],
  },
];

registerPage({
  slug: "commercial/sso-enterprise",
  titleKey: "commercial.ssoEnterprise.title",
  descriptionKey: "commercial.ssoEnterprise.description",
  category: "commercial-security",
  order: 6,
  sections,
  relatedSlugs: ["commercial/authentication-security", "commercial/security-overview"],
  lastUpdated: "2026-03-07",
});
