import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const OAuthAppDetailView = dynamic(() =>
  import("@modules/identity/oauth-apps").then((m) => ({ default: m.OAuthAppDetailView }))
);

export const metadata: Metadata = {
  title: "OAuth Application Details",
  description: "View and configure OAuth application settings",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OAuthAppDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <ModuleErrorBoundary moduleName="oauthApps.detailTitle">
      <OAuthAppDetailView appId={id} />
    </ModuleErrorBoundary>
  );
}
