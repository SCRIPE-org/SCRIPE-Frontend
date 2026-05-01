import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const IdentityProvidersView = dynamic(() =>
  import("@modules/identity/identity-providers").then((m) => ({
    default: m.IdentityProvidersView,
  }))
);

export const metadata: Metadata = {
  title: "Identity Providers | NEXORA",
  description: "Configure external SSO identity providers (OIDC, OAuth2, SAML)",
};

export default function IdentityProvidersPage() {
  return (
    <main>
      <ModuleErrorBoundary moduleName="Identity Providers">
        <IdentityProvidersView />
      </ModuleErrorBoundary>
    </main>
  );
}
