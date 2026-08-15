"use client";

import { Skeleton } from "@core/ui/skeleton";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Route-level loading fallback for the workspace-admin group (tenants,
 * users, roles, audit, compliance, ...) — overwhelmingly list/table pages,
 * so the placeholder is a page-header shape over a stack of row slabs.
 * Static fill steps only; absence of data does not pulse.
 */
export default function WorkspaceAdminLoading() {
  const { t } = useI18n();

  return (
    <div
      className="flex flex-col gap-6 p-6"
      role="status"
      aria-busy="true"
      aria-label={t("common.loading")}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="h-12 w-12" />
          <div className="flex flex-col gap-2">
            <Skeleton shape="title" className="h-6 w-48" />
            <Skeleton shape="text" className="w-72" />
          </div>
        </div>
        <Skeleton shape="control" className="w-28" />
      </div>

      <div className="flex flex-col gap-2 rounded-nx-lg border border-nx-line bg-nx-surface p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-nx-md" />
        ))}
      </div>
    </div>
  );
}
