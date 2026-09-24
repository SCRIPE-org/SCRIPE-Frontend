/**
 * CreateTenantPermissionsCard — Expandable permission restriction panel
 *
 * Extracted from CreateTenantStep3 to respect Clean Architecture < 200 lines per file.
 *
 * @module tenants/presentation/components
 */
"use client";

import React, { useState } from "react";
import { cn } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { ShieldCheck, ChevronDown } from "lucide-react";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";
import { CreateTenantPermissionPicker } from "./CreateTenantPermissionPicker";

interface CreateTenantPermissionsCardProps {
  vm: CreateTenantVM;
  t: (key: string) => string;
}

export function CreateTenantPermissionsCard({ vm, t }: CreateTenantPermissionsCardProps) {
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  return (
    <div className="rounded-nx-md border border-nx-line duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0">
      <button
        type="button"
        aria-expanded={isPermissionsOpen}
        className="flex w-full items-center justify-between rounded-nx-md p-4 text-start transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover focus-visible:outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none"
        onClick={() => setIsPermissionsOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-nx-ink-2" />
          <div>
            <p>{t("tenant.restrictPermissions")}</p>
            <p className="text-xs text-nx-ink-2">
              {t("tenant.restrictPermissionsDesc")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {vm.form.availablePermissionIds.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {vm.form.availablePermissionIds.length}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-nx-ink-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              isPermissionsOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {isPermissionsOpen && (
        <div className="border-t border-nx-line p-4">
          {vm.isLoadingPermissions ? (
            <p className="text-sm text-nx-ink-2">{t("common.loading")}</p>
          ) : vm.creationPermissions.length === 0 ? (
            <p className="text-sm text-nx-ink-2">
              {t("tenant.noPermissionsAvailable")}
            </p>
          ) : (
            <CreateTenantPermissionPicker vm={vm} t={t} />
          )}
        </div>
      )}
    </div>
  );
}
