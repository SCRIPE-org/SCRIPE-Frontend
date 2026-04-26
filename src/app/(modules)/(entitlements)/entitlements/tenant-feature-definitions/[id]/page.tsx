import { FeatureDefinitionFormView } from "@modules/entitlements/tenant-plans";

export default function FeatureDefinitionViewPage({ params }: { params: { id: string } }) {
  return <FeatureDefinitionFormView featureId={params.id} isViewMode={true} />;
}
