"use client";

import { useParams } from "next/navigation";
import { FeatureDefinitionFormView } from "@modules/entitlements/tenant-plans";

export default function EditFeatureDefinitionPage() {
  const params = useParams<{ id: string }>();
  return <FeatureDefinitionFormView featureId={params.id} />;
}
