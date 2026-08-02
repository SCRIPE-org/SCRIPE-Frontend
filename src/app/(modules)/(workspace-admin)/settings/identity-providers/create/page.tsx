import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const IdentityProviderDetailView = dynamic(() =>
  import("@modules/identity/identity-providers").then((m) => ({
    default: m.IdentityProviderDetailView,
  }))
);

export const metadata: Metadata = {
  title: "Create Identity Provider",
  description: "Configure a new external identity provider for SSO",
};

export default function IdentityProviderCreatePage() {
  return (
    <ModuleErrorBoundary moduleName="identityProviders.createTitle">
      <IdentityProviderDetailView />
    </ModuleErrorBoundary>
  );
}
