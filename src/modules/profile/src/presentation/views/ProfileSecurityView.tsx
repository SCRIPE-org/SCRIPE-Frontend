"use client";

/**
 * ProfileSecurityView — Security settings page
 *
 * Sections: Password Expiry Banner + Change Password + 2FA Status + Dialogs
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useProfilePageViewModel } from "../viewmodels/useProfilePageViewModel";
import { useSecurityViewModel } from "../viewmodels/useSecurityViewModel";
import { PasswordExpiryBanner } from "../components/PasswordExpiryBanner";
import { PasswordChangeForm } from "../components/PasswordChangeForm";
import { TwoFactorStatus } from "../components/TwoFactorStatus";
import { BackupCodesDialog } from "../components/BackupCodesDialog";
import { TwoFactorSetupDialog } from "../components/TwoFactorSetupDialog";
import { TwoFactorDisableDialog } from "../components/TwoFactorDisableDialog";
import { Loader2 } from "lucide-react";

export function ProfileSecurityView() {
  const { t } = useI18n();
  const { profile, isLoading, error } = useProfilePageViewModel();
  const security = useSecurityViewModel();
  const [showBackupDialog, setShowBackupDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-20 text-center text-destructive">{error || "Failed to load profile"}</div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold">{t("profile.security.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.security.description")}</p>
      </div>

      {/* Password Expiry Banner */}
      <PasswordExpiryBanner
        isExpired={profile.isPasswordExpired}
        daysRemaining={profile.daysUntilPasswordExpiry}
        passwordLastChanged={profile.passwordLastChanged}
      />

      {/* Change Password Section */}
      <section className="space-y-4 rounded-xl border border-border/40 bg-card/50 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("profile.security.changePassword")}
        </h3>
        <PasswordChangeForm
          isTwoFactorEnabled={profile.isTwoFactorEnabled}
          onSubmit={security.changePassword}
          isSubmitting={security.isChangingPassword}
          submitError={security.passwordError}
          success={security.passwordSuccess}
        />

        {profile.passwordLastChanged && (
          <p className="border-t border-border/40 pt-3 text-xs text-muted-foreground">
            {t("profile.security.lastChanged")}: {profile.passwordLastChanged.toLocaleDateString()}
          </p>
        )}
      </section>

      {/* 2FA Status Section */}
      <section className="space-y-4 rounded-xl border border-border/40 bg-card/50 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("profile.security.twoFactor.sectionTitle")}
        </h3>
        <TwoFactorStatus
          isEnabled={profile.isTwoFactorEnabled}
          backupCodesRemaining={profile.backupCodesRemaining}
          onRegenerateBackupCodes={() => setShowBackupDialog(true)}
          onEnable={() => security.openSetupDialog()}
          onDisable={() => security.setShowDisableDialog(true)}
          isEnabling={security.isEnabling2FA}
        />
      </section>

      {/* Backup Codes Dialog */}
      <BackupCodesDialog
        isOpen={showBackupDialog}
        codes={security.backupCodes}
        isRegenerating={security.isRegenerating}
        regenerateError={security.regenerateError}
        onRegenerate={security.regenerateBackupCodes}
        onClose={() => {
          setShowBackupDialog(false);
          security.clearBackupCodes();
        }}
      />

      {/* 2FA Setup Dialog */}
      <TwoFactorSetupDialog
        open={security.showSetupDialog}
        onOpenChange={security.setShowSetupDialog}
        setupData={security.setupData}
        onConfirm={security.confirm2FA}
        isConfirming={security.isConfirming2FA}
        confirmError={security.confirmError}
      />

      {/* 2FA Disable Dialog */}
      <TwoFactorDisableDialog
        open={security.showDisableDialog}
        onOpenChange={security.setShowDisableDialog}
        onDisable={security.disable2FA}
        isDisabling={security.isDisabling2FA}
        disableError={security.disableError}
      />
    </div>
  );
}
