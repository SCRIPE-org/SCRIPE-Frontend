// FILE-EXCEPTION: file length
import React, { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import {
  Fingerprint,
  Plus,
  AlertTriangle,
  Pencil,
  Trash2,
  Check,
  X,
  ShieldCheck,
  Smartphone,
  KeyRound,
  QrCode,
} from "lucide-react";

import { TwoFactorSetupDialog } from "./TwoFactorSetupDialog";
import { TwoFactorDisableDialog } from "./TwoFactorDisableDialog";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { BackupCodesDialog } from "./BackupCodesDialog";
import type { AdminProfile } from "../../domain/entities/AdminProfile";

interface ProfileSecurityTabProps {
  profile: AdminProfile;
  linkedMobileDevices: any[];
  sessionsVm: {
    revokeSession: (tokenId: string) => Promise<unknown>;
    isRevoking: boolean;
  };
  securityVm: {
    showSetupDialog: boolean;
    setShowSetupDialog: (show: boolean) => void;
    setupData: any;
    confirm2FA: (code: string) => Promise<unknown>;
    isConfirming2FA: boolean;
    confirmError: string | null;
    showDisableDialog: boolean;
    setShowDisableDialog: (show: boolean) => void;
    disable2FA: (password: string, code: string) => Promise<unknown>;
    isDisabling2FA: boolean;
    disableError: string | null;
    backupCodesSuccess: boolean;
    backupCodes: string[] | null;
    isRegenerating: boolean;
    regenerateError: string | null;
    regenerateBackupCodes: (password: string) => Promise<unknown>;
    clearBackupCodes: () => void;
    changePassword: (data: any) => Promise<unknown>;
    isChangingPassword: boolean;
    passwordError: string | null;
    passwordSuccess: boolean;
    openSetupDialog: () => Promise<unknown>;
    isEnabling2FA: boolean;
    enableError: string | null;
  };
  passkeyVm: {
    isWebAuthnSupported: boolean;
    isLoading: boolean;
    passkeys: any[];
    renamingId: string | null;
    renameValue: string;
    setRenameValue: (val: string) => void;
    confirmRename: () => unknown;
    cancelRename: () => void;
    startRename: (key: any) => void;
    deletePasskey: (id: string) => unknown;
    registerPasskey: (name: string) => Promise<unknown>;
    isRegistering: boolean;
    registrationError: string | null;
    clearRegistrationError: () => void;
  };
}

/**
 * React presentation component representing the profile security tab UI element.
 */
export function ProfileSecurityTab({
  profile,
  linkedMobileDevices,
  sessionsVm,
  securityVm,
  passkeyVm,
}: ProfileSecurityTabProps) {
  const { t } = useI18n();

  // Local state for dialog triggers
  const [showPasskeyRegister, setShowPasskeyRegister] = useState(false);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [deletePasskeyConfirmId, setDeletePasskeyConfirmId] = useState<string | null>(null);
  const [showLinkDevice, setShowLinkDevice] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  return (
    <div className="space-y-6">
      {/* Passkeys Block */}
      <div className="rounded-xl border border-border/80 bg-card/45 p-6 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-violet-500/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                {t("profile.security.passkeys.sectionTitle")}
                <span className="rounded-full border border-violet-500/35 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-300">
                  {t("profile.security.passkeys.recommended")}
                </span>
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("profile.security.passkeys.sectionDesc")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 self-start border-border text-foreground hover:bg-violet-600/10"
            onClick={() => {
              setNewPasskeyName("");
              setShowPasskeyRegister(true);
            }}
            disabled={!passkeyVm.isWebAuthnSupported}
          >
            <Plus className="h-4 w-4" />
            {t("profile.security.passkeys.add")}
          </Button>
        </div>

        {/* Passkeys List */}
        <div className="mt-5 space-y-2.5">
          {!passkeyVm.isWebAuthnSupported && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 text-xs text-amber-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <strong>{t("profile.security.passkeys.biometricNotSupported")}</strong>{" "}
                {t("profile.security.passkeys.notSupportedDesc")}
              </div>
            </div>
          )}

          {passkeyVm.isLoading && (
            <div className="flex justify-center py-4">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          )}

          {!passkeyVm.isLoading &&
            passkeyVm.passkeys.length === 0 &&
            passkeyVm.isWebAuthnSupported && (
              <div className="rounded-lg border border-dashed border-white/5 p-6 text-center text-xs text-muted-foreground">
                {t("profile.security.passkeys.noKeys")}
              </div>
            )}

          {!passkeyVm.isLoading &&
            passkeyVm.passkeys.map((key) => (
              <div
                key={key.id}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 transition-all duration-200 hover:border-violet-500/20"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
                  <div className="min-w-0">
                    {passkeyVm.renamingId === key.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={passkeyVm.renameValue}
                          onChange={(e) => passkeyVm.setRenameValue(e.target.value)}
                          className="h-8 text-xs font-semibold"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") passkeyVm.confirmRename();
                            if (e.key === "Escape") passkeyVm.cancelRename();
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-emerald-400"
                          onClick={passkeyVm.confirmRename}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-rose-400"
                          onClick={passkeyVm.cancelRename}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="truncate text-xs font-bold text-foreground">
                          {key.deviceName}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {t("profile.security.lastChanged")}: {key.displayCreatedDate}{" "}
                          {key.displayLastUsedDate &&
                            ` · ${t("auth.passkey.lastUsed")}: ${key.displayLastUsedDate}`}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {passkeyVm.renamingId !== key.id && (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                      onClick={() => passkeyVm.startRename(key)}
                      title={t("auth.passkey.rename") || "Rename"}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                      onClick={() => setDeletePasskeyConfirmId(key.id)}
                      title={t("auth.passkey.delete") || "Delete"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Authenticator App (2FA) Block */}
      <div className="rounded-xl border border-border/80 bg-card/45 p-6 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-violet-500/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                profile.isTwoFactorEnabled
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-slate-500/30 bg-slate-500/10 text-slate-500 dark:text-slate-400"
              )}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                {t("profile.security.totp.title")}
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                    profile.isTwoFactorEnabled
                      ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-500/35 bg-slate-500/10 text-slate-700 dark:text-slate-300"
                  )}
                >
                  {profile.isTwoFactorEnabled
                    ? t("profile.security.totp.enabled")
                    : t("profile.security.totp.disabled")}
                </span>
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("profile.security.totp.desc")}
              </p>
            </div>
          </div>
          {profile.isTwoFactorEnabled ? (
            <Button
              variant="outline"
              size="sm"
              className="self-start border-rose-500/20 bg-rose-500/5 text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10"
              onClick={() => securityVm.setShowDisableDialog(true)}
            >
              {t("profile.security.totp.disable")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 self-start border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={securityVm.openSetupDialog}
              loading={securityVm.isEnabling2FA}
            >
              {t("profile.security.totp.enable")}
            </Button>
          )}
        </div>

        {profile.isTwoFactorEnabled && (
          <div className="mt-5 flex flex-col gap-4 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="relative h-4 w-4">
                <svg className="h-full w-full -rotate-90">
                  <circle cx="8" cy="8" r="6" className="fill-none stroke-white/5 stroke-[1.5]" />
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    className="animate-totp-timer fill-none stroke-emerald-400 stroke-[1.5]"
                    strokeDasharray="37.7"
                    strokeDashoffset="9.4"
                  />
                </svg>
              </div>
              {t("profile.security.totp.helpText")}
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              {t("profile.security.totp.backupHint")}
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-border hover:bg-muted"
                onClick={() => setShowBackupCodes(true)}
              >
                {t("profile.security.totp.regenerateBackup")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Cross-Device QR Sign-in Block */}
      <div className="rounded-xl border border-border/80 bg-card/45 p-6 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-violet-500/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                {t("profile.security.qr.title")}
                {linkedMobileDevices.length > 0 && (
                  <span className="rounded-full border border-violet-500/35 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-300">
                    {t("profile.security.qr.paired")}
                  </span>
                )}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("profile.security.qr.desc")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start border-border text-foreground hover:bg-muted"
            onClick={() => setShowLinkDevice(true)}
          >
            {t("profile.security.qr.link")}
          </Button>
        </div>

        {/* Paired Mobile Devices list */}
        <div className="mt-5 space-y-2">
          {linkedMobileDevices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/5 p-6 text-center text-xs text-muted-foreground">
              {t("profile.security.qr.pairedMobileDesc")}
            </div>
          ) : (
            linkedMobileDevices.map((device) => (
              <div
                key={device.tokenId}
                className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 transition-all duration-200 hover:border-violet-500/20"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
                  <Smartphone className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {device.deviceInfo} ({t("profile.security.qr.paired")})
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      IP: {device.ipAddress} · {t("auth.passkey.createdAt")}{" "}
                      {device.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 border-rose-500/15 bg-rose-500/5 text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10"
                  onClick={() => sessionsVm.revokeSession(device.tokenId)}
                  loading={sessionsVm.isRevoking}
                >
                  {t("profile.security.qr.unlink")}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Password update trigger card */}
      <div className="rounded-xl border border-border/80 bg-card/45 p-6 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-violet-500/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-500/30 bg-slate-500/10 text-slate-500 dark:text-slate-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {t("profile.security.password.title")}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("profile.security.password.desc")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-muted"
            onClick={() => setShowPasswordChange(true)}
          >
            {t("profile.security.password.update")}
          </Button>
        </div>
      </div>

      {/* ── Passkey Registration Dialog ── */}
      <Dialog open={showPasskeyRegister} onOpenChange={setShowPasskeyRegister}>
        <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.security.passkeys.registerTitle")}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("profile.security.passkeys.registerDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="passkey-name" className="text-foreground">
                {t("profile.security.passkeys.deviceName")}
              </Label>
              <Input
                id="passkey-name"
                placeholder={
                  t("profile.security.passkeys.deviceNamePlaceholder") ||
                  "e.g. MacBook Pro, YubiKey Key"
                }
                value={newPasskeyName}
                onChange={(e) => setNewPasskeyName(e.target.value)}
                maxLength={64}
                className="border-border bg-background text-foreground"
              />
            </div>
            {passkeyVm.registrationError && (
              <div className="rounded-lg border border-rose-500/15 bg-rose-500/5 p-3 text-xs text-rose-400">
                {passkeyVm.registrationError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-border hover:bg-muted"
              onClick={() => {
                setShowPasskeyRegister(false);
                passkeyVm.clearRegistrationError();
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="bg-violet-600 text-white hover:bg-violet-500"
              disabled={!newPasskeyName.trim() || passkeyVm.isRegistering}
              onClick={async () => {
                const success = await passkeyVm.registerPasskey(newPasskeyName.trim());
                if (success) {
                  setShowPasskeyRegister(false);
                  setNewPasskeyName("");
                }
              }}
            >
              {passkeyVm.isRegistering
                ? t("auth.passkey.registering")
                : t("profile.security.passkeys.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Passkey Delete Confirm Dialog ── */}
      <Dialog
        open={!!deletePasskeyConfirmId}
        onOpenChange={(open) => {
          if (!open) setDeletePasskeyConfirmId(null);
        }}
      >
        <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.security.passkeys.removeTitle")}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("profile.security.passkeys.removeDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-border hover:bg-muted"
              onClick={() => setDeletePasskeyConfirmId(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletePasskeyConfirmId) {
                  passkeyVm.deletePasskey(deletePasskeyConfirmId);
                  setDeletePasskeyConfirmId(null);
                }
              }}
            >
              {t("profile.security.passkeys.removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Two-Factor Authentication Setup Dialog ── */}
      <TwoFactorSetupDialog
        open={securityVm.showSetupDialog}
        onOpenChange={securityVm.setShowSetupDialog}
        setupData={securityVm.setupData}
        onConfirm={securityVm.confirm2FA}
        isConfirming={securityVm.isConfirming2FA}
        confirmError={securityVm.confirmError}
      />

      {/* ── Two-Factor Authentication Disable Dialog ── */}
      <TwoFactorDisableDialog
        open={securityVm.showDisableDialog}
        onOpenChange={securityVm.setShowDisableDialog}
        onDisable={securityVm.disable2FA}
        isDisabling={securityVm.isDisabling2FA}
        disableError={securityVm.disableError}
      />

      {/* ── Backup Codes Regeneration Display Dialog ── */}
      <BackupCodesDialog
        isOpen={showBackupCodes || securityVm.backupCodesSuccess}
        codes={securityVm.backupCodes}
        isRegenerating={securityVm.isRegenerating}
        regenerateError={securityVm.regenerateError}
        onRegenerate={securityVm.regenerateBackupCodes}
        onClose={() => {
          setShowBackupCodes(false);
          securityVm.clearBackupCodes();
        }}
      />

      {/* ── Change Password Modal Dialog ── */}
      <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.security.password.modalTitle")}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("profile.security.password.modalDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PasswordChangeForm
              isTwoFactorEnabled={profile.isTwoFactorEnabled}
              onSubmit={async (data) => {
                await securityVm.changePassword(data);
                if (!securityVm.passwordError) {
                  setShowPasswordChange(false);
                }
              }}
              isSubmitting={securityVm.isChangingPassword}
              submitError={securityVm.passwordError}
              success={securityVm.passwordSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Link New Device Pairing Guide Modal ── */}
      <Dialog open={showLinkDevice} onOpenChange={setShowLinkDevice}>
        <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-violet-500" />
              <DialogTitle>{t("profile.security.qr.modalTitle")}</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              {t("profile.security.qr.modalDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-muted-foreground">
            <ol className="list-decimal space-y-2.5 ps-4">
              <li>{t("profile.security.qr.step1")}</li>
              <li>{t("profile.security.qr.step2")}</li>
              <li>{t("profile.security.qr.step3")}</li>
            </ol>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-violet-600 text-white hover:bg-violet-500"
              onClick={() => setShowLinkDevice(false)}
            >
              {t("profile.security.qr.modalCta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
