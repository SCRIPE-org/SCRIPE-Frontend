"use client";

import React from "react";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { useI18n } from "@core/providers/i18n-provider";
import { UpgradeDialog } from "@core/ui/layout/nexus/nexus-app-launcher";
import { HubAppSquircle } from "./HubAppSquircle";

/** Props for {@link HubUnlockSection}. */
export interface HubUnlockSectionProps {
  /** Locked workspaces filtered by the current query (only passed when `canManageBilling` is true). */
  lockedWorkspaces: WorkspaceGroup[];
  /** Currently selected workspace pending upgrade/tenant-selection dialog, or null. */
  upgradeTargetWorkspace: WorkspaceGroup | null;
  /** Active UI language (`"en"` or `"ar"`). */
  language: string;
  /** True when a tenant organization context is currently active. */
  hasTenantContext: boolean;
  /** Invoked when a locked squircle is clicked. */
  onSelectLocked: (workspace: WorkspaceGroup) => void;
  /** Closes the upgrade/select-tenant dialog. */
  onCloseDialog: () => void;
  /** Confirms the upgrade or tenant-context selection action. */
  onConfirmUpgrade: (isNeedsTenant: boolean) => void;
}

/**
 * Billing-only locked workspace row (`Available to unlock`) and associated `UpgradeDialog`
 * rendered beneath a quiet hairline divider on `/hub` for subscription administrators.
 */
export function HubUnlockSection({
  lockedWorkspaces,
  upgradeTargetWorkspace,
  language,
  hasTenantContext,
  onSelectLocked,
  onCloseDialog,
  onConfirmUpgrade,
}: HubUnlockSectionProps) {
  const { t } = useI18n();
  const isNeedsTenant =
    !hasTenantContext && upgradeTargetWorkspace?.lockReason === "TenantContextRequired";

  return (
    <>
      {lockedWorkspaces.length > 0 && (
        <section
          aria-label={t("workspaceHub.launchpad.availableToUnlock")}
          className="mx-auto mt-10 w-full max-w-[760px] border-t border-nx-line/70 pt-8"
        >
          <h2 className="mb-6 text-center text-xs font-medium text-nx-ink-3">
            {t("workspaceHub.launchpad.availableToUnlock")}
          </h2>
          <div className="mx-auto flex max-w-[752px] flex-wrap justify-center gap-x-4 gap-y-6">
            {lockedWorkspaces.map((ws) => (
              <HubAppSquircle
                key={ws.workspaceKey}
                name={ws.getLocalizedName(language)}
                icon={ws.workspaceIcon}
                colorHue={ws.colorHue}
                colorChroma={ws.colorChroma}
                isLocked={true}
                isPinned={false}
                onClick={() => onSelectLocked(ws)}
                upgradeBadgeText={
                  ws.lockReason === "TenantContextRequired"
                    ? t("workspaceHub.needsTenant")
                    : t("workspaceHub.upgradeBadge")
                }
              />
            ))}
          </div>
        </section>
      )}

      {upgradeTargetWorkspace && (
        <UpgradeDialog
          workspaceName={upgradeTargetWorkspace.getLocalizedName(language)}
          isNeedsTenant={isNeedsTenant}
          onClose={onCloseDialog}
          onUpgrade={() => onConfirmUpgrade(isNeedsTenant)}
        />
      )}
    </>
  );
}
