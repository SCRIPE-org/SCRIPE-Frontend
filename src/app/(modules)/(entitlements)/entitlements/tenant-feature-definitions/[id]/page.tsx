"use client";

import { useParams } from "next/navigation";
import { FeatureDefinitionFormView } from "@modules/entitlements/tenant-plans";

export default function FeatureDefinitionViewPage() {
  const params = useParams<{ id: string }>();
  return <FeatureDefinitionFormView featureId={params.id} isViewMode={true} />;
}
