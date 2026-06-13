"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Building2 } from "lucide-react";
import { StepDots } from "./StepDots";
import { WorkspaceCheckCard } from "./WorkspaceCheckCard";
import type { useForgotPasswordViewModel } from "../viewmodels/useForgotPasswordViewModel";

interface WorkspacesStepProps {
  vm: ReturnType<typeof useForgotPasswordViewModel>;
  totalSteps: number;
}

export function WorkspacesStep({ vm, totalSteps }: WorkspacesStepProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "var(--sx-accent-soft)",
            border: "1px solid var(--sx-accent-soft-border)",
          }}
        >
          <Building2
            className="h-6 w-6"
            style={{ color: "var(--sx-accent-text)" }}
            aria-hidden="true"
          />
        </div>
        <h1
          className="text-[22px] font-semibold leading-tight tracking-[-0.025em]"
          style={{ color: "var(--sx-text)" }}
        >
          {t("auth.forgotPickWorkspaceTitle")}
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.forgotPickWorkspaceSubtitle")}
        </p>
      </div>

      <StepDots current={4} total={totalSteps} />

      {/* Select All toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[12px]" style={{ color: "var(--sx-text-mute)" }}>
          {vm.selectedWorkspaces.length} / {vm.workspaces.length} {t("auth.workspacesSelected")}
        </span>
        <button
          type="button"
          onClick={vm.allSelected ? vm.deselectAllWorkspaces : vm.selectAllWorkspaces}
          className="text-[12px] font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--sx-accent-text)" }}
        >
          {vm.allSelected ? t("auth.deselectAll") : t("auth.selectAll")}
        </button>
      </div>

      {/* Workspace checklist */}
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {vm.workspaces.map((w) => (
          <WorkspaceCheckCard
            key={w.tenantId}
            workspace={w}
            isSelected={vm.selectedWorkspaces.some((s) => s.tenantId === w.tenantId)}
            onToggle={vm.toggleWorkspace}
          />
        ))}
      </div>

      {/* Continue button */}
      <Button
        type="button"
        onClick={vm.confirmWorkspaceSelection}
        disabled={!vm.canConfirmWorkspaces || vm.isLoading}
        loading={vm.isLoading}
        className="flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
      >
        {vm.selectedWorkspaces.length === vm.workspaces.length
          ? t("auth.resetAllWorkspaces")
          : t("auth.resetSelectedWorkspaces").replace(
              "{{count}}",
              String(vm.selectedWorkspaces.length)
            )}
      </Button>
    </div>
  );
}
