import type { ExternalLogin } from "../../domain/entities/ExternalLogin";
import type { SsoProviderCatalogItem } from "../components/EnterpriseSsoConnectDialog";

/** Supported enterprise identity provider catalog entries for OIDC and SAML 2.0. */
export const ENTERPRISE_IDP_CATALOG: SsoProviderCatalogItem[] = [
  {
    key: "google",
    slug: "google",
    name: "Google Workspace",
    protocol: "OIDC",
    brandContainerClass: "bg-info/10 border-info/25",
    defaultConnected: false,
    emailPlaceholder: "operator@company.com",
  },
  {
    key: "microsoft",
    slug: "microsoft",
    name: "Microsoft Entra ID",
    protocol: "OIDC",
    brandContainerClass: "bg-primary/10 border-primary/25",
    defaultConnected: false,
    emailPlaceholder: "operator@company.com",
  },
  {
    key: "okta",
    slug: "okta",
    name: "Okta Workforce Identity",
    protocol: "SAML 2.0",
    brandContainerClass: "bg-nx-accent-wash border-nx-accent/30",
    defaultConnected: false,
    emailPlaceholder: "operator@company.com",
  },
  {
    key: "github",
    slug: "github",
    name: "GitHub Enterprise",
    protocol: "OIDC",
    brandContainerClass: "bg-nx-raised border-nx-line-hi",
    defaultConnected: false,
    emailPlaceholder: "operator@company.com",
  },
];

/**
 * Matches a persisted {@link ExternalLogin} record against an IdP catalog item.
 */
export function matchExternalLogin(
  externalLogins: ExternalLogin[],
  item: SsoProviderCatalogItem
): ExternalLogin | undefined {
  return externalLogins.find(
    (el) =>
      Boolean(el.providerName && el.providerName.toLowerCase().includes(item.key)) ||
      Boolean(el.providerKey && el.providerKey.toLowerCase().includes(item.key)) ||
      Boolean(
        (el as unknown as { providerDisplayName?: string }).providerDisplayName &&
          (el as unknown as { providerDisplayName?: string }).providerDisplayName
            ?.toLowerCase()
            .includes(item.key)
      )
  );
}

/**
 * Resolves the tenant's active federated provider ID matching an IdP catalog item, if configured.
 */
export function findFederatedProviderId(
  providers: Array<{ id?: string; name?: string; providerType?: string }> | undefined,
  item: SsoProviderCatalogItem
): string | null {
  if (!providers || !Array.isArray(providers)) return null;
  const match = providers.find(
    (p) =>
      Boolean(p.id && p.id.toLowerCase().includes(item.key)) ||
      Boolean(p.name && p.name.toLowerCase().includes(item.key)) ||
      Boolean(p.providerType && p.providerType.toLowerCase().includes(item.key))
  );
  return match ? (match.id ?? null) : null;
}
