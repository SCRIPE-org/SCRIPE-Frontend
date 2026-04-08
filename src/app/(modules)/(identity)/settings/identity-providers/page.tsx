import { Metadata } from "next";
import { IdentityProvidersView } from "@/modules/identity/identity-providers";

export const metadata: Metadata = {
      title: "Identity Providers | NEXORA",
      description: "Configure external SSO identity providers (OIDC, OAuth2, SAML)",
};

export default function IdentityProvidersPage() {
      return (
            <main>
                  <IdentityProvidersView />
            </main>
      );
}
