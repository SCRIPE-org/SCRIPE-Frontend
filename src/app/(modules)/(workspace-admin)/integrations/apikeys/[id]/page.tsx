import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ApiKeyDetailView = dynamic(() =>
  import("@modules/integrations/apikeys").then((m) => ({ default: m.ApiKeyDetailView }))
);

export const metadata: Metadata = {
  title: "API Key Details",
  description: "View API key details, usage, and security settings",
};

interface ApiKeyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApiKeyDetailPage({ params }: ApiKeyDetailPageProps) {
  // ApiKeyDetailView is itself a client component and reads the dynamic
  // segment via useParams() internally (it takes no id prop), so there is
  // nothing to forward here — awaiting still honors the standard Next.js
  // async-params contract used by every other dynamic route in the app,
  // instead of a client page discarding an unused use(params) resolution.
  await params;

  return (
    <div className="flex h-full w-full flex-col">
      <ModuleErrorBoundary moduleName="apikeys.detailTitle">
        <ApiKeyDetailView />
      </ModuleErrorBoundary>
    </div>
  );
}
