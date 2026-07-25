import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const ApiKeysView = dynamic(() =>
  import("@modules/integrations/apikeys").then((m) => ({ default: m.ApiKeysView }))
);

export const metadata: Metadata = {
  title: "API Keys",
  description: "Generate and manage API Keys for programmatic integration access",
};

export default function ApiKeysPage() {
  return (
    <ModuleErrorBoundary moduleName="apikeys.title">
      <ApiKeysView />
    </ModuleErrorBoundary>
  );
}
