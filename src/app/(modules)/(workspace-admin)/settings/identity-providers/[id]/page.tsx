import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const IdentityProviderDetailView = dynamic(() =>
  import("@modules/identity/identity-providers").then((m) => ({
    default: m.IdentityProviderDetailView,
  }))
);

export const metadata: Metadata = {
  title: "Identity Provider Details",
  description: "View and configure identity provider settings",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function IdentityProviderDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="identityProviders.detailTitle">
      <IdentityProviderDetailView providerId={id} />
    </ModuleErrorBoundary>
  );
}
