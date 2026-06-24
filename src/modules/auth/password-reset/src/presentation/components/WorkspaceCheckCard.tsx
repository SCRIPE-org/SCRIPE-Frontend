// UI-EXCEPTION: compact studio layout
"use client";

import * as React from "react";
import { Building2, Check } from "lucide-react";
import { resolveFileUrl } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { WorkspaceOption } from "../viewmodels/useForgotPasswordViewModel";

interface WorkspaceCheckCardProps {
  workspace: WorkspaceOption;
  isSelected: boolean;
  onToggle: (w: WorkspaceOption) => void;
}

export function WorkspaceCheckCard({ workspace, isSelected, onToggle }: WorkspaceCheckCardProps) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => onToggle(workspace)}
      className="flex w-full items-center gap-3.5 rounded-2xl border p-4 text-start transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: isSelected ? "var(--sx-accent-soft)" : "var(--sx-chip-bg)",
        borderColor: isSelected ? "var(--sx-accent-text)" : "var(--sx-chip-border)",
        boxShadow: isSelected ? "0 0 0 2px var(--sx-accent-ring, rgba(139,92,246,.15))" : "none",
      }}
    >
      {/* Checkbox */}
      <div
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all"
        style={{
          background: isSelected ? "var(--sx-accent-text)" : "transparent",
          borderColor: isSelected ? "var(--sx-accent-text)" : "var(--sx-chip-border)",
        }}
      >
        {isSelected && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
      </div>

      {/* Logo / Icon */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{
          background: "var(--sx-accent-soft)",
          border: "1px solid var(--sx-accent-soft-border)",
        }}
      >
        {workspace.logoUrl ? (
          <img
            src={resolveFileUrl(workspace.logoUrl)}
            alt={workspace.tenantName}
            className="h-full w-full object-cover"
          />
        ) : (
          <Building2 className="h-4 w-4" style={{ color: "var(--sx-accent-text)" }} />
        )}
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold" style={{ color: "var(--sx-text)" }}>
          {workspace.tenantName}
        </p>
        {workspace.isPlatformAdmin && (
          <p className="text-[11px]" style={{ color: "var(--sx-text-mute)" }}>
            {t("auth.workspaceSelection.platform")}
          </p>
        )}
      </div>
    </button>
  );
}
