// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
/**
 * WellKnownProviderGallery — Pre-configured provider templates gallery
 *
 * Shown in create mode above the form to allow quick selection
 * of popular identity providers. Selecting a template pre-fills
 * all known configuration fields (authority, scopes, claim mappings, etc.)
 *
 * Extended to 16 templates with detailed setup guides.
 */
"use client";

import type { IdentityProviderFormState } from "../viewmodels/useIdentityProviderDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import { HelpCircle } from "lucide-react";
import { BrandIcon } from "@core/ui/brand-icons";

// ─── Template definitions ──────────────────────────────────────────────────

interface ProviderTemplate {
  id: string;
  name: string;
  description: string;
  protocol: "oidc" | "oauth2" | "saml";
  /** Hex color for the logo background ring */
  color: string;
  /** Pre-filled form values */
  preset: Partial<IdentityProviderFormState>;
  /** Step-by-step setup instructions */
  setupSteps: string[];
}

const PROVIDER_TEMPLATES: ProviderTemplate[] = [
  {
    id: "google",
    name: "Google Workspace",
    description: "Sign in with Google / Google Workspace accounts",
    protocol: "oidc",
    color: "#4285F4",
    preset: {
      protocol: "oidc",
      authority: "https://accounts.google.com",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      buttonLabel: "Continue with Google",
      displayOrder: 1,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "given_name",
        lastName: "family_name",
        picture: "picture",
      }),
    },
    setupSteps: [
      "Go to the Google Cloud Console (https://console.cloud.google.com).",
      "Create a project, then navigate to 'APIs & Services' > 'OAuth consent screen'. Set user type to External or Internal as needed.",
      "Go to the 'Credentials' tab, click '+ Create Credentials' and select 'OAuth client ID'. Select application type 'Web application'.",
      "Add your SCRIPE authorization callback URL to the 'Authorized redirect URIs' section.",
      "Copy the generated 'Client ID' and 'Client Secret' and paste them into the configuration form below.",
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft Entra ID",
    description: "Azure Active Directory / Microsoft 365 accounts",
    protocol: "oidc",
    color: "#0078D4",
    preset: {
      protocol: "oidc",
      authority: "https://login.microsoftonline.com/{tenant-id}/v2.0",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile offline_access",
      buttonLabel: "Continue with Microsoft",
      displayOrder: 2,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "given_name",
        lastName: "family_name",
      }),
    },
    setupSteps: [
      "Log in to the Azure Portal (https://portal.azure.com) and search for 'Microsoft Entra ID' (Azure Active Directory).",
      "Navigate to 'App registrations' in the sidebar and click '+ New registration'.",
      "Enter a name, choose supported account types, select redirect platform 'Web', and enter your SCRIPE callback URL.",
      "Under 'Certificates & secrets', click '+ New client secret', configure expiry, and copy the secret 'Value' immediately.",
      "Replace the '{tenant-id}' placeholder in the Authority URL with your Active Directory Tenant ID or use 'common' for multi-tenant.",
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Sign in with GitHub developer accounts",
    protocol: "oauth2",
    color: "#24292E",
    preset: {
      protocol: "oauth2",
      authority: "https://github.com",
      clientId: "",
      clientSecret: "",
      scopes: "user:email read:user",
      buttonLabel: "Continue with GitHub",
      displayOrder: 3,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "name",
      }),
    },
    setupSteps: [
      "Go to your GitHub Settings > 'Developer settings' > 'OAuth Apps'.",
      "Click 'Register a new application' and provide a name and homepage URL.",
      "Enter the SCRIPE callback URL in the 'Authorization callback URL' field.",
      "Click 'Register application' then copy the 'Client ID' and click 'Generate a new client secret' to paste them below.",
    ],
  },
  {
    id: "okta",
    name: "Okta",
    description: "Enterprise identity with Okta Workforce Identity",
    protocol: "oidc",
    color: "#007DC1",
    preset: {
      protocol: "oidc",
      authority: "https://{your-domain}.okta.com",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile groups",
      buttonLabel: "Continue with Okta",
      displayOrder: 4,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "given_name",
        lastName: "family_name",
        groups: "groups",
      }),
    },
    setupSteps: [
      "Sign in to your Okta Admin Console.",
      "Go to 'Applications' > 'Applications' and click 'Create App Integration'.",
      "Choose 'OIDC - OpenID Connect' as the Sign-in method, and 'Web Application' as the Application type.",
      "Configure your Sign-in redirect URIs with the SCRIPE callback URL.",
      "Copy the Client ID, Client Secret, and your Okta Domain (to replace `{your-domain}` in the Authority URL).",
    ],
  },
  {
    id: "auth0",
    name: "Auth0",
    description: "Universal identity platform for any app",
    protocol: "oidc",
    color: "#EB5424",
    preset: {
      protocol: "oidc",
      authority: "https://{your-tenant}.auth0.com",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      buttonLabel: "Continue with Auth0",
      displayOrder: 5,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "given_name",
        lastName: "family_name",
        picture: "picture",
      }),
    },
    setupSteps: [
      "Log in to your Auth0 Dashboard and navigate to 'Applications' > 'Applications'.",
      "Click '+ Create Application', give it a name, and select 'Regular Web Applications'.",
      "In the 'Settings' tab, add your SCRIPE callback URL to the 'Allowed Callback URLs' field.",
      "Copy the Domain, Client ID, and Client Secret. Pre-fill the Domain in the Authority URL field below.",
    ],
  },
  {
    id: "azure-ad-b2c",
    name: "Azure AD B2C",
    description: "Microsoft customer identity & access management",
    protocol: "oidc",
    color: "#0078D4",
    preset: {
      protocol: "oidc",
      authority: "https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com/{policy}/v2.0",
      clientId: "",
      clientSecret: "",
      scopes: "openid offline_access",
      buttonLabel: "Sign in with AD B2C",
      displayOrder: 6,
      isActive: true,
    },
    setupSteps: [
      "Access Azure portal and open your Azure AD B2C tenant directory.",
      "Create a new 'App registration', enabling access to redirect uri 'Web' with the SCRIPE callback URL.",
      "Generate a client secret in 'Certificates & secrets' and save its value.",
      "Replace `{tenant}` with your B2C tenant name and `{policy}` with your User Flow policy name (e.g. `B2C_1_signupsignin`).",
    ],
  },
  {
    id: "keycloak",
    name: "Keycloak",
    description: "Open source identity and access management",
    protocol: "oidc",
    color: "#4D4D4D",
    preset: {
      protocol: "oidc",
      authority: "http://{your-server}/realms/{realm}",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile roles",
      buttonLabel: "Continue with Keycloak",
      displayOrder: 7,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "given_name",
        lastName: "family_name",
        roles: "realm_access.roles",
      }),
    },
    setupSteps: [
      "Open your Keycloak Administration Console.",
      "Select your target Realm and go to the 'Clients' page.",
      "Click 'Create client', set Client ID, protocol 'openid-connect', and click Next.",
      "Enable 'Client authentication' (Client Secret) and add your SCRIPE callback URL under 'Valid redirect URIs'.",
      "Copy the Client Secret from the 'Credentials' tab and paste it along with Client ID below.",
    ],
  },
  {
    id: "ping",
    name: "Ping Identity",
    description: "Enterprise-grade identity security platform",
    protocol: "oidc",
    color: "#E91E63",
    preset: {
      protocol: "oidc",
      authority: "https://auth.pingone.com/{env-id}/as",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      buttonLabel: "Continue with Ping",
      displayOrder: 8,
      isActive: true,
    },
    setupSteps: [
      "Log in to the PingOne Admin Console.",
      "Navigate to 'Connections' > 'Applications' and click '+ Add Application'.",
      "Select 'Web App' > 'OIDC', configure a redirect URI mapping to SCRIPE callback, and save.",
      "Copy the Application Client ID and Client Secret, and configure the Environment ID in the Authority URL.",
    ],
  },
  {
    id: "aws-cognito",
    name: "AWS Cognito",
    description: "Secure customer identity pool management on AWS",
    protocol: "oidc",
    color: "#FF9900",
    preset: {
      protocol: "oidc",
      authority: "https://cognito-idp.{region}.amazonaws.com/{userPoolId}",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      buttonLabel: "Continue with AWS Cognito",
      displayOrder: 9,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "given_name",
        lastName: "family_name",
      }),
    },
    setupSteps: [
      "Open AWS Console and go to 'Amazon Cognito'. Select your User Pool.",
      "Go to 'App integration' and select or create an App Client.",
      "Enable 'Cognito User Pool' as an Identity Provider, check Authorization code grant, and add SCRIPE callback URL.",
      "Paste your User Pool region and ID in place of `{region}` and `{userPoolId}` in the Authority URL.",
    ],
  },
  {
    id: "onelogin",
    name: "OneLogin",
    description: "Enterprise SSO and access management with OneLogin",
    protocol: "oidc",
    color: "#E41F35",
    preset: {
      protocol: "oidc",
      authority: "https://{your-subdomain}.onelogin.com/oidc/2",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      buttonLabel: "Continue with OneLogin",
      displayOrder: 10,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "given_name",
        lastName: "family_name",
      }),
    },
    setupSteps: [
      "Log in to OneLogin Admin Panel.",
      "Go to 'Applications' > 'Applications' and click 'Add App'.",
      "Search for 'OIDC' or 'OpenID Connect' and select 'OpenID Connect (OIDC)'.",
      "In the app configurations, enter the SCRIPE callback URL in the 'Redirect URI' field.",
      "Under 'SSO', copy Client ID and Client Secret, and update your subdomain in the Authority URL.",
    ],
  },
  {
    id: "jumpcloud",
    name: "JumpCloud",
    description: "Cloud directory services and single sign-on",
    protocol: "oidc",
    color: "#00A3E0",
    preset: {
      protocol: "oidc",
      authority: "https://oauth.id.jumpcloud.com/oauth2",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      buttonLabel: "Continue with JumpCloud",
      displayOrder: 11,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "given_name",
        lastName: "family_name",
      }),
    },
    setupSteps: [
      "Open your JumpCloud Admin Portal.",
      "Go to 'SSO' > 'Applications' and click '+ Add New Application'.",
      "Select 'Custom OIDC App', configure redirect URIs with SCRIPE callback, and save.",
      "Retrieve your Client ID and Client Secret from the app parameters tab.",
    ],
  },
  {
    id: "duo",
    name: "Duo Security",
    description: "Multi-factor authentication and access security",
    protocol: "oidc",
    color: "#4AA23A",
    preset: {
      protocol: "oidc",
      authority: "https://api-{your-subdomain}.duosecurity.com",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      buttonLabel: "Continue with Duo",
      displayOrder: 12,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "name",
      }),
    },
    setupSteps: [
      "Log in to the Duo Admin Panel.",
      "Go to 'Applications' and click 'Protect an Application'.",
      "Search for 'OpenID Connect' and click 'Protect'.",
      "Configure your App integration redirect URL, and fetch Integration Key (Client ID) and Secret Key.",
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare Access",
    description: "Zero Trust access control with Cloudflare Access",
    protocol: "oidc",
    color: "#F38020",
    preset: {
      protocol: "oidc",
      authority: "https://{your-subdomain}.cloudflareaccess.com",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      buttonLabel: "Continue with Cloudflare",
      displayOrder: 13,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "name",
      }),
    },
    setupSteps: [
      "Log in to the Cloudflare Zero Trust Dashboard.",
      "Go to 'Settings' > 'Authentication' and add a new identity provider.",
      "Select 'OIDC', paste the redirect URI, and configure the application.",
      "Provide Domain, Client ID, and Client Secret. Copy them into the form below.",
    ],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "SSO and authentication using Salesforce CRM identity",
    protocol: "oidc",
    color: "#009DDC",
    preset: {
      protocol: "oidc",
      authority: "https://login.salesforce.com",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      buttonLabel: "Continue with Salesforce",
      displayOrder: 14,
      isActive: true,
      claimMappingJson: JSON.stringify({
        email: "email",
        firstName: "given_name",
        lastName: "family_name",
      }),
    },
    setupSteps: [
      "Log in to Salesforce, open Setup and search for 'App Manager'.",
      "Click 'New Connected App', check 'Enable OAuth Settings'.",
      "Add SCRIPE callback URL to 'Callback URL', check 'Access unique user identifiers (openid)' and 'Access basic profile', and save.",
      "Copy Customer Key (Client ID) and Customer Secret (Client Secret) from the app management page.",
    ],
  },
  {
    id: "generic-oidc",
    name: "Generic OIDC",
    description: "Any OpenID Connect 1.0 compliant identity provider",
    protocol: "oidc",
    color: "#3F4347",
    preset: {
      protocol: "oidc",
      authority: "",
      clientId: "",
      clientSecret: "",
      scopes: "openid email profile",
      buttonLabel: "Sign in with SSO",
      displayOrder: 15,
      isActive: true,
    },
    setupSteps: [
      "Verify that your identity provider supports OpenID Connect 1.0.",
      "Register a client application with your provider and copy Client ID and Secret.",
      "Configure your provider's client redirect URI to point to the SCRIPE callback URL.",
      "Locate the Issuer/Authority URL (which hosts the OIDC discovery document `.well-known/openid-configuration`) and enter it below.",
    ],
  },
  {
    id: "generic-saml",
    name: "Generic SAML 2.0",
    description: "Any SAML 2.0 compatible identity provider",
    protocol: "saml",
    color: "#F59E0B",
    preset: {
      protocol: "saml",
      authority: "",
      buttonLabel: "Sign in with SAML",
      displayOrder: 16,
      isActive: true,
    },
    setupSteps: [
      "Ensure your SAML identity provider (IdP) is active and supports SAML 2.0 Web Browser SSO profile.",
      "Register SCRIPE as a Service Provider (SP) in your IdP console.",
      "Retrieve the IdP Entity ID, SSO URL, and public Certificate from your provider.",
      "Enter these values below to enable SAML federation.",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface WellKnownProviderGalleryProps {
  /** Called when a template is selected, passing the preset values to apply */
  onSelect: (template: Partial<IdentityProviderFormState>) => void;
  /** If a provider template is already selected (by id) — to show active state */
  selectedId?: string;
}

/**
 * Presentation UI component rendering the well known provider gallery.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WellKnownProviderGallery({ onSelect, selectedId }: WellKnownProviderGalleryProps) {
  const { t } = useI18n();

  const activeTemplate = PROVIDER_TEMPLATES.find((tpl) => tpl.id === selectedId);

  const protocolBadgeVariant = (p: string) => {
    if (p === "oidc") return "default";
    if (p === "saml") return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          {t("identityProviders.galleryTitle")}
        </h2>
        <p className="mt-0.5 text-xs text-nx-ink-3">{t("identityProviders.gallerySubtitle")}</p>
      </div>

      {/* Provider grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {PROVIDER_TEMPLATES.map((tpl) => {
          const isSelected = selectedId === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                onSelect({
                  ...tpl.preset,
                  name: tpl.name,
                  slug: tpl.id,
                  buttonLabel: t(`identityProviders.gallery.${tpl.id}.buttonLabel`),
                  buttonColor: tpl.color,
                });
              }}
              className={cn(
                "group relative flex cursor-pointer flex-col items-center gap-2.5 rounded-nx-md border p-4 text-center transition-[border-color,background-color,box-shadow] duration-nx-micro motion-reduce:transition-none",
                isSelected
                  ? "border-nx-accent bg-nx-accent-wash"
                  : "border-nx-line hover:border-[color:color-mix(in_srgb,var(--nx-accent)_40%,transparent)] hover:bg-nx-accent-wash"
              )}
              aria-pressed={isSelected}
              title={t(`identityProviders.gallery.${tpl.id}.description`)}
            >
              {/* Logo — tinted to the vendor's own brand colour so the tile
                  reads at a glance in a 16-item picker grid, same rationale as
                  brand-icons.tsx and the button-colour swatches in
                  IdentityProviderFormSections.tsx. Selection state below is
                  workspace accent, not brand colour — this is our own control
                  chrome, not a representation of the vendor. */}
              <div
                className="flex h-11 w-11 items-center justify-center rounded-nx-md p-2"
                style={{
                  background: `${tpl.color}18`,
                  border: `1px solid ${tpl.color}30`,
                }}
              >
                <BrandIcon
                  slug={tpl.id}
                  name={tpl.name}
                  protocol={tpl.protocol}
                  className="h-5 w-5 shrink-0"
                />
              </div>

              {/* Name */}
              <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-nx-ink">
                {tpl.name}
              </span>

              {/* Protocol badge */}
              <Badge
                variant={protocolBadgeVariant(tpl.protocol)}
                className="h-4 px-1.5 text-[8.5px] font-semibold uppercase tracking-wider"
              >
                {tpl.protocol}
              </Badge>

              {/* Selected checkmark — workspace accent, matching every other
                  selection affordance in the app (Table row, Card, etc.),
                  not the per-vendor brand colour. */}
              {isSelected && (
                <div className="absolute end-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-nx-accent shadow-nx-sm">
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-nx-on-fill"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Inline Setup Guide for selected template */}
      {activeTemplate && activeTemplate.setupSteps && (
        <Card className="border border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash duration-nx-standard ease-nx-enter animate-in fade-in slide-in-from-top-1 motion-reduce:transition-none">
          <CardContent className="space-y-3 p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-nx-accent">
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              {t("identityProviders.setupGuide", { name: activeTemplate.name })}
            </h4>
            <ul className="space-y-2 text-xs">
              {activeTemplate.setupSteps.map((_step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed text-nx-ink-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nx-accent-wash text-[10px] font-bold text-nx-accent">
                    {idx + 1}
                  </span>
                  <p className="mt-0.5">
                    {t(`identityProviders.gallery.${activeTemplate.id}.step${idx + 1}`)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-nx-line" />
        <span className="text-xs font-semibold uppercase tracking-widest text-nx-ink-3">
          {t("identityProviders.galleryOrCustomize")}
        </span>
        <div className="h-px flex-1 bg-nx-line" />
      </div>
    </div>
  );
}

// Export the template list for use in the parent
export { PROVIDER_TEMPLATES };
/**
 * Exported type in the identity/identity-providers module.
 */
export type { ProviderTemplate };
