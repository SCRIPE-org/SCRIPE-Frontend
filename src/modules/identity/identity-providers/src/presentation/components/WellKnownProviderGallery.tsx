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
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import { HelpCircle } from "lucide-react";

// ─── Template definitions ──────────────────────────────────────────────────

interface ProviderTemplate {
  id: string;
  name: string;
  description: string;
  protocol: "oidc" | "oauth2" | "saml";
  /** Hex color for the logo background ring */
  color: string;
  /** Inline SVG path data for the logo */
  svgIcon: string;
  /** Pre-filled form values */
  preset: Partial<IdentityProviderFormState>;
  /** Step-by-step setup instructions */
  setupSteps: string[];
}

// SVG logos — brand-accurate, monochrome (colored via `color` prop)
const PROVIDER_TEMPLATES: ProviderTemplate[] = [
  {
    id: "google",
    name: "Google Workspace",
    description: "Sign in with Google / Google Workspace accounts",
    protocol: "oidc",
    color: "#4285F4",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>`,
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
      "Copy the generated 'Client ID' and 'Client Secret' and paste them into the configuration form below."
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft Entra ID",
    description: "Azure Active Directory / Microsoft 365 accounts",
    protocol: "oidc",
    color: "#0078D4",
    svgIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#F25022" d="M1 1h10v10H1z"/>
      <path fill="#7FBA00" d="M13 1h10v10H13z"/>
      <path fill="#00A4EF" d="M1 13h10v10H1z"/>
      <path fill="#FFB900" d="M13 13h10v10H13z"/>
    </svg>`,
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
      "Replace the '{tenant-id}' placeholder in the Authority URL with your Active Directory Tenant ID or use 'common' for multi-tenant."
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Sign in with GitHub developer accounts",
    protocol: "oauth2",
    color: "#24292E",
    svgIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>`,
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
      "Click 'Register application' then copy the 'Client ID' and click 'Generate a new client secret' to paste them below."
    ],
  },
  {
    id: "okta",
    name: "Okta",
    description: "Enterprise identity with Okta Workforce Identity",
    protocol: "oidc",
    color: "#007DC1",
    svgIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#007DC1" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 17.882a5.882 5.882 0 110-11.764 5.882 5.882 0 010 11.764z"/>
    </svg>`,
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
      "Copy the Client ID, Client Secret, and your Okta Domain (to replace `{your-domain}` in the Authority URL)."
    ],
  },
  {
    id: "auth0",
    name: "Auth0",
    description: "Universal identity platform for any app",
    protocol: "oidc",
    color: "#EB5424",
    svgIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EB5424" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.8 15.75l-4.8 1.567-4.8-1.567 1.567-4.822L12 6.683l3.233 4.245L16.8 15.75z"/>
    </svg>`,
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
      "Copy the Domain, Client ID, and Client Secret. Pre-fill the Domain in the Authority URL field below."
    ],
  },
  {
    id: "azure-ad-b2c",
    name: "Azure AD B2C",
    description: "Microsoft customer identity & access management",
    protocol: "oidc",
    color: "#0078D4",
    svgIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#0078D4" d="M12 2L2 7l2 12 8 3 8-3 2-12-10-5zm0 3.236L19.3 8.4l-1.6 9.6-5.7 2.138-5.7-2.138-1.6-9.6L12 5.236z"/>
    </svg>`,
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
      "Replace `{tenant}` with your B2C tenant name and `{policy}` with your User Flow policy name (e.g. `B2C_1_signupsignin`)."
    ],
  },
  {
    id: "keycloak",
    name: "Keycloak",
    description: "Open source identity and access management",
    protocol: "oidc",
    color: "#4D4D4D",
    svgIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4D4D4D" d="M11.987 0L0 6.955 3.76 9.1l8.227-4.698 8.228 4.698L24 6.955 11.987 0zM3.76 14.9l-3.76 2.145L11.987 24 24 17.045l-3.785-2.145-8.228 4.698L3.76 14.9zM0 9.6v4.8l3.76 2.145V11.77L0 9.6zm24 0l-3.785 2.17v4.775L24 14.4V9.6z"/>
    </svg>`,
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
      "Copy the Client Secret from the 'Credentials' tab and paste it along with Client ID below."
    ],
  },
  {
    id: "ping",
    name: "Ping Identity",
    description: "Enterprise-grade identity security platform",
    protocol: "oidc",
    color: "#E91E63",
    svgIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#E91E63" stroke-width="2"/>
      <circle cx="12" cy="12" r="5" fill="#E91E63"/>
    </svg>`,
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
      "Copy the Application Client ID and Client Secret, and configure the Environment ID in the Authority URL."
    ],
  },
  {
    id: "aws-cognito",
    name: "AWS Cognito",
    description: "Secure customer identity pool management on AWS",
    protocol: "oidc",
    color: "#FF9900",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#FF9900"/>
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FF9900" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
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
      "Paste your User Pool region and ID in place of `{region}` and `{userPoolId}` in the Authority URL."
    ],
  },
  {
    id: "onelogin",
    name: "OneLogin",
    description: "Enterprise SSO and access management with OneLogin",
    protocol: "oidc",
    color: "#E41F35",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#E41F35"/>
      <path d="M8 7v10h3v-7h2v7h3V7H8z" fill="white"/>
    </svg>`,
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
      "Under 'SSO', copy Client ID and Client Secret, and update your subdomain in the Authority URL."
    ],
  },
  {
    id: "jumpcloud",
    name: "JumpCloud",
    description: "Cloud directory services and single sign-on",
    protocol: "oidc",
    color: "#00A3E0",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#00A3E0" stroke-width="2.5"/>
      <path d="M7 11l5-5 5 5m-10 2l5 5 5-5" stroke="#00A3E0" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
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
      "Retrieve your Client ID and Client Secret from the app parameters tab."
    ],
  },
  {
    id: "duo",
    name: "Duo Security",
    description: "Multi-factor authentication and access security",
    protocol: "oidc",
    color: "#4AA23A",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#4AA23A"/>
      <path d="M8 8h4a4 4 0 010 8H8V8zm3 3v2h1a1 1 0 000-2h-1z" fill="white"/>
    </svg>`,
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
      "Configure your App integration redirect URL, and fetch Integration Key (Client ID) and Secret Key."
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare Access",
    description: "Zero Trust access control with Cloudflare Access",
    protocol: "oidc",
    color: "#F38020",
    svgIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.25 15.75a4.5 4.5 0 00-4.04-2.825A5.25 5.25 0 006 12.75a3 3 0 00-3 3 3 3 0 003 3h14.25a3 3 0 000-6z" fill="#F38020"/>
    </svg>`,
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
      "Provide Domain, Client ID, and Client Secret. Copy them into the form below."
    ],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "SSO and authentication using Salesforce CRM identity",
    protocol: "oidc",
    color: "#009DDC",
    svgIcon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#009DDC" d="M19.12 11.23a4 4 0 00-3.8-3.08 4 4 0 00-3.6 2.1 5.3 5.3 0 00-8.2 2.65 3.3 3.3 0 00.48 6.5h15.12a3.3 3.3 0 000-6.6l-.12-.57z"/>
    </svg>`,
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
      "Copy Customer Key (Client ID) and Customer Secret (Client Secret) from the app management page."
    ],
  },
  {
    id: "generic-oidc",
    name: "Generic OIDC",
    description: "Any OpenID Connect 1.0 compliant identity provider",
    protocol: "oidc",
    color: "#6366F1",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
    </svg>`,
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
      "Locate the Issuer/Authority URL (which hosts the OIDC discovery document `.well-known/openid-configuration`) and enter it below."
    ],
  },
  {
    id: "generic-saml",
    name: "Generic SAML 2.0",
    description: "Any SAML 2.0 compatible identity provider",
    protocol: "saml",
    color: "#F59E0B",
    svgIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
    </svg>`,
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
      "Enter these values below to enable SAML federation."
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
          {t("identityProviders.galleryTitle") || "Choose a Provider Template"}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("identityProviders.gallerySubtitle") ||
            "Select a pre-configured provider to pre-fill configuration. You can customize everything after."}
        </p>
      </div>

      {/* Provider grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {PROVIDER_TEMPLATES.map((tpl) => {
          const isSelected = selectedId === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect({ ...tpl.preset, name: tpl.name, slug: tpl.id })}
              className="group relative flex flex-col items-center gap-2.5 rounded-xl border p-4.5 text-center transition-all duration-200 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97] hover:shadow-md cursor-pointer"
              style={{
                borderColor: isSelected ? `${tpl.color}75` : "hsl(var(--border))",
                background: isSelected ? `${tpl.color}12` : undefined,
                boxShadow: isSelected ? `0 0 15px ${tpl.color}20` : undefined,
              }}
              aria-pressed={isSelected}
              title={tpl.description}
            >
              {/* Logo */}
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl p-2 transition-transform group-hover:scale-105"
                style={{
                  background: `${tpl.color}18`,
                  border: `1px solid ${tpl.color}30`,
                }}
                dangerouslySetInnerHTML={{ __html: tpl.svgIcon }}
              />

              {/* Name */}
              <span
                className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground"
              >
                {tpl.name}
              </span>

              {/* Protocol badge */}
              <Badge
                variant={protocolBadgeVariant(tpl.protocol)}
                className="h-4.5 px-1.5 text-[8.5px] uppercase tracking-wider font-semibold"
              >
                {tpl.protocol}
              </Badge>

              {/* Selected checkmark with brand background */}
              {isSelected && (
                <div
                  className="absolute right-2 top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full shadow"
                  style={{ background: tpl.color }}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
        <Card className="border border-purple-500/20 bg-purple-500/5 dark:bg-purple-950/10 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
          <CardContent className="p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              {t("identityProviders.setupGuide", { name: activeTemplate.name })}
            </h4>
            <ul className="space-y-2 text-xs">
              {activeTemplate.setupSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-muted-foreground leading-relaxed">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-[10px] font-bold text-purple-700 dark:text-purple-400">
                    {idx + 1}
                  </span>
                  <p className="mt-0.5">{step}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("identityProviders.galleryOrCustomize") || "or configure manually below"}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

// Export the template list for use in the parent
export { PROVIDER_TEMPLATES };
export type { ProviderTemplate };
