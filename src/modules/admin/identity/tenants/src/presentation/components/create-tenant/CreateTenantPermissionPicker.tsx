/**
 * CreateTenantPermissionPicker — Granular permission selection for new tenants
 *
 * Extracted from CreateTenantStep3 to respect Clean Architecture < 200 lines per file.
 *
 * @module tenants/presentation/components
 */
"use client";

import React, { useMemo, useCallback } from "react";
import { Checkbox } from "@core/ui/checkbox";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";

interface CreateTenantPermissionPickerProps {
  vm: CreateTenantVM;
  t: (key: string) => string;
}

export function CreateTenantPermissionPicker({ vm, t }: CreateTenantPermissionPickerProps) {
  const selected = new Set(vm.form.availablePermissionIds);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof vm.creationPermissions>();
    for (const p of vm.creationPermissions) {
      const key = p.module || p.category || t("tenant.other");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [vm.creationPermissions, t]);

  const toggle = useCallback(
    (permId: string) => {
      const next = new Set(selected);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      vm.updateField("availablePermissionIds", Array.from(next));
    },
    [selected, vm]
  );

  const toggleAll = useCallback(() => {
    if (selected.size === vm.creationPermissions.length) {
      vm.updateField("availablePermissionIds", []);
    } else {
      vm.updateField(
        "availablePermissionIds",
        vm.creationPermissions.map((p) => p.id)
      );
    }
  }, [selected, vm]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-nx-ink-2">
          {selected.size > 0
            ? `${selected.size} / ${vm.creationPermissions.length} ${t("tenant.permissionsSelected")}`
            : t("tenant.allPermissionsAllowed")}
        </p>
        <button
          type="button"
          className="text-xs text-nx-accent underline-offset-2 hover:underline"
          onClick={toggleAll}
        >
          {selected.size === vm.creationPermissions.length
            ? t("common.deselectAll")
            : t("common.selectAll")}
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-nx-md border border-nx-line bg-nx-raised p-2">
        {grouped.map(([group, perms]) => (
          <div key={group} className="mb-3 last:mb-0">
            <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-nx-ink-2">
              {group}
            </p>
            <div className="space-y-1">
              {perms.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded-nx-sm px-2 py-1.5 text-sm hover:bg-nx-raised"
                >
                  <Checkbox
                    checked={selected.has(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                    id={`perm-${p.id}`}
                  />
                  <span className="flex-1">{p.getLocalizedName()}</span>
                  <span className="font-mono text-[11px] text-nx-ink-2">{p.code}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
