"use client";

import * as React from "react";
import { Button } from "@core/ui/button";
import { Building2, Check } from "lucide-react";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import { useI18n } from "@core/providers/i18n-provider";
import type { WorkspaceOption } from "../viewmodels/usePasswordRecoveryViewModel";
import Image from "next/image";

interface WorkspaceCheckCardProps {
  workspace: WorkspaceOption;
  isSelected: boolean;
  onToggle: (w: WorkspaceOption) => void;
}

/**
 * Selectable workspace card used in multi-tenant password recovery.
 */
export function WorkspaceCheckCard({ workspace, isSelected, onToggle }: WorkspaceCheckCardProps) {
  const { t } = useI18n();
  const resolvedLogoUrl = useResolvedFileUrl(workspace.logoUrl);
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onToggle(workspace)}
      className="flex h-auto w-full items-center justify-start gap-3.5 whitespace-normal rounded-2xl border p-4 text-start transition-all hover:scale-[1.01] hover:bg-transparent active:scale-[0.99]"
      style={{
        background: isSelected ? "var(--sx-accent-soft)" : "var(--sx-chip-bg)",
        borderColor: isSelected ? "var(--sx-accent-text)" : "var(--sx-chip-border)",
        boxShadow: isSelected ? "0 0 0 2px var(--sx-accent-ring, rgba(198,255,0,.18))" : "none",
      }}
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${isSelected ? "border-nx-accent bg-nx-accent" : "bg-transparent"}`}
        style={isSelected ? undefined : { borderColor: "var(--sx-chip-border)" }}
      >
        {isSelected && <Check className="h-3 w-3 text-nx-on-fill" aria-hidden="true" />}
      </div>

      <div
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl"
        style={{
          background: "var(--sx-accent-soft)",
          border: "1px solid var(--sx-accent-soft-border)",
        }}
      >
        {workspace.logoUrl && resolvedLogoUrl ? (
          <Image src={resolvedLogoUrl} alt={workspace.tenantName} fill className="object-cover" />
        ) : (
          <Building2 className="h-4 w-4" style={{ color: "var(--sx-accent-text)" }} />
        )}
      </div>

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
    </Button>
  );
}
