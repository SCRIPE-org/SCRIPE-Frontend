"use client";

import { ModulesLoadingSkeleton } from "@core/ui/layout/modules-loading-skeleton";

/** Loading skeleton for `/crm/pipelines`. */
export default function CrmPipelinesLoading() {
  return <ModulesLoadingSkeleton variant="crm" />;
}
