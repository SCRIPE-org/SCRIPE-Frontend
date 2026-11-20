"use client";

import { useForceChangePasswordViewModel } from "../viewmodels/useForceChangePasswordViewModel";
import { ForceChangePasswordCardSection } from "../sections/force-change/ForceChangePasswordCardSection";

/**
 * Focused first-login and mandatory password rotation view matching MMC UX parity.
 */
export function ForceChangePasswordView() {
  const vm = useForceChangePasswordViewModel();

  return (
    <div
      dir={vm.direction}
      className="min-h-[100dvh] w-full flex items-center justify-center bg-nx-ground px-4 py-10"
    >
      <div className="w-full max-w-md space-y-5">
        <ForceChangePasswordCardSection
          t={vm.t}
          username={vm.username}
          newPassword={vm.newPassword}
          onNewPasswordChange={vm.setNewPassword}
          confirmPassword={vm.confirmPassword}
          onConfirmPasswordChange={vm.setConfirmPassword}
          showNew={vm.showNew}
          onToggleShowNew={() => vm.setShowNew(!vm.showNew)}
          showConfirm={vm.showConfirm}
          onToggleShowConfirm={() => vm.setShowConfirm(!vm.showConfirm)}
          isSubmitting={vm.isSubmitting}
          submitError={vm.submitError}
          rules={vm.rules}
          showMismatch={vm.showMismatch}
          canSubmit={vm.canSubmit}
          onSubmit={vm.handleSubmit}
          onLogout={vm.handleLogout}
        />
      </div>
    </div>
  );
}
