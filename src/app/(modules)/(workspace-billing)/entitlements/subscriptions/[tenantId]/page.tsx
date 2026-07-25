import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const SubscriptionsView = dynamic(() =>
  import("@modules/entitlements/subscriptions").then((m) => ({ default: m.SubscriptionsView }))
);

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "Manage tenant edition subscriptions",
};

interface Props {
  params: Promise<{ tenantId: string }>;
}

export default async function SubscriptionsPage({ params }: Props) {
  const { tenantId } = await params;

  return (
    <ModuleErrorBoundary moduleName="entSubscriptions.title">
      <SubscriptionsView tenantId={tenantId} />
    </ModuleErrorBoundary>
  );
}
