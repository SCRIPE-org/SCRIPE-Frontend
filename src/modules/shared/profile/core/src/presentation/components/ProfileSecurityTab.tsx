/* eslint-disable @typescript-eslint/no-explicit-any */
// FILE-EXCEPTION: file length
import React, { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn, formatDateUtc } from "@core/common/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { LoadingSpinner } from "@core/ui/loading-spinner";
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
  Link2,
} from "lucide-react";

import { TwoFactorSetupDialog } from "./TwoFactorSetupDialog";
import { TwoFactorDisableDialog } from "./TwoFactorDisableDialog";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { BackupCodesDialog } from "./BackupCodesDialog";
import { PasswordExpiryBanner } from "./PasswordExpiryBanner";
import { ExternalLoginsSection } from "./ExternalLoginsSection";
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
 * Presentation UI component rendering the profile security tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
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
  const [unlinkDeviceId, setUnlinkDeviceId] = useState<string | null>(null);
  const [showLinkDevice, setShowLinkDevice] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  return (
    <div className="space-y-6">
      <PasswordExpiryBanner
        isExpired={profile.isPasswordExpired}
        daysRemaining={profile.daysUntilPasswordExpiry}
        passwordLastChanged={profile.passwordLastChanged}
      />

      {/* Passkeys Block */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-control border border-nx-accent bg-nx-accent-wash text-nx-accent">
                <Fingerprint className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="flex flex-wrap items-center gap-2 text-base font-bold text-nx-ink">
                  {t("profile.security.passkeys.sectionTitle")}
                  <Badge variant="default" className="text-[10px]">
                    {t("profile.security.passkeys.recommended")}
                  </Badge>
                </h3>
                <p className="mt-0.5 text-xs text-nx-ink-2">
                  {t("profile.security.passkeys.sectionDesc")}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 self-start"
              onClick={() => {
                setNewPasskeyName("");
                setShowPasskeyRegister(true);
              }}
              disabled={!passkeyVm.isWebAuthnSupported}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("profile.security.passkeys.add")}
            </Button>
          </div>

          {/* Passkeys List */}
          <div className="mt-5 space-y-2.5">
            {!passkeyVm.isWebAuthnSupported && (
              <div className="flex items-start gap-2.5 rounded-nx-control border border-warning/15 bg-warning/5 p-4 text-xs text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <strong>{t("profile.security.passkeys.biometricNotSupported")}</strong>{" "}
                  {t("profile.security.passkeys.notSupportedDesc")}
                </div>
              </div>
            )}

            {passkeyVm.isLoading && (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" showText={false} />
              </div>
            )}

            {!passkeyVm.isLoading &&
              passkeyVm.passkeys.length === 0 &&
              passkeyVm.isWebAuthnSupported && (
                <div className="rounded-nx-control border border-dashed border-nx-line p-6 text-center text-xs text-nx-ink-2">
                  {t("profile.security.passkeys.noKeys")}
                </div>
              )}

            {!passkeyVm.isLoading &&
              passkeyVm.passkeys.map((key) => (
                <div
                  key={key.id}
                  className="group flex items-center justify-between gap-4 rounded-nx-control border border-nx-line bg-nx-raised px-4 py-3 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-success shadow-[0_0_6px_0] shadow-success/50" />
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
                            className="h-8 w-8 p-0 text-success"
                            onClick={passkeyVm.confirmRename}
                            aria-label={t("common.confirm")}
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={passkeyVm.cancelRename}
                            aria-label={t("common.cancel")}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="truncate text-xs font-bold text-nx-ink">{key.deviceName}</p>
                          <p className="mt-0.5 text-[10px] text-nx-ink-2">
                            {t("profile.security.lastChanged")}: {key.displayCreatedDate}{" "}
                            {key.displayLastUsedDate &&
                              ` · ${t("auth.passkey.lastUsed")}: ${key.displayLastUsedDate}`}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {passkeyVm.renamingId !== key.id && (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity duration-nx-micro group-focus-within:opacity-100 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-nx-ink-2 hover:text-nx-ink"
                        onClick={() => passkeyVm.startRename(key)}
                        aria-label={t("auth.passkey.rename")}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeletePasskeyConfirmId(key.id)}
                        aria-label={t("auth.passkey.delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Password update trigger card */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-control border border-nx-line bg-nx-raised text-nx-ink-2">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-nx-ink">
                {t("profile.security.password.title")}
              </h3>
              <p className="mt-0.5 text-xs text-nx-ink-2">{t("profile.security.password.desc")}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowPasswordChange(true)}>
            {t("profile.security.password.update")}
          </Button>
        </CardContent>
      </Card>

      {/* Authenticator App (2FA) Block */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-control border",
                  profile.isTwoFactorEnabled
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-nx-line bg-nx-raised text-nx-ink-2"
                )}
              >
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="flex flex-wrap items-center gap-2 text-base font-bold text-nx-ink">
                  {t("profile.security.totp.title")}
                  <Badge
                    variant={profile.isTwoFactorEnabled ? "success" : "secondary"}
                    className="text-[10px]"
                  >
                    {profile.isTwoFactorEnabled
                      ? t("profile.security.totp.enabled")
                      : t("profile.security.totp.disabled")}
                  </Badge>
                </h3>
                <p className="mt-0.5 text-xs text-nx-ink-2">{t("profile.security.totp.desc")}</p>
              </div>
            </div>
            {profile.isTwoFactorEnabled ? (
              <Button
                variant="destructive"
                size="sm"
                className="self-start"
                onClick={() => securityVm.setShowDisableDialog(true)}
              >
                {t("profile.security.totp.disable")}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 self-start border-success/20 bg-success/5 text-success hover:border-success/30 hover:bg-success/10"
                onClick={securityVm.openSetupDialog}
                loading={securityVm.isEnabling2FA}
              >
                {t("profile.security.totp.enable")}
              </Button>
            )}
          </div>

          {profile.isTwoFactorEnabled && (
            <div className="mt-5 flex flex-col gap-4 border-t border-nx-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-nx-ink-2">{t("profile.security.totp.helpText")}</p>
              <div className="flex items-center gap-2.5 text-xs text-nx-ink-2">
                {t("profile.security.totp.backupHint")}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => setShowBackupCodes(true)}
                >
                  {t("profile.security.totp.regenerateBackup")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cross-Device QR Sign-in Block */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-control border border-nx-accent bg-nx-accent-wash text-nx-accent">
                <QrCode className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="flex flex-wrap items-center gap-2 text-base font-bold text-nx-ink">
                  {t("profile.security.qr.title")}
                  {linkedMobileDevices.length > 0 && (
                    <Badge variant="default" className="text-[10px]">
                      {t("profile.security.qr.paired")}
                    </Badge>
                  )}
                </h3>
                <p className="mt-0.5 text-xs text-nx-ink-2">{t("profile.security.qr.desc")}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setShowLinkDevice(true)}
            >
              {t("profile.security.qr.link")}
            </Button>
          </div>

          {/* Paired Mobile Devices list */}
          <div className="mt-5 space-y-2">
            {linkedMobileDevices.length === 0 ? (
              <div className="rounded-nx-control border border-dashed border-nx-line p-6 text-center text-xs text-nx-ink-2">
                {t("profile.security.qr.pairedMobileDesc")}
              </div>
            ) : (
              linkedMobileDevices.map((device) => (
                <div
                  key={device.tokenId}
                  className="flex items-center justify-between gap-4 rounded-nx-control border border-nx-line bg-nx-raised px-4 py-3 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-success shadow-[0_0_6px_0] shadow-success/50" />
                    <Smartphone className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-bold text-nx-ink">
                        {device.deviceInfo} ({t("profile.security.qr.paired")})
                      </p>
                      <p className="mt-0.5 text-[10px] text-nx-ink-2">
                        IP: {device.ipAddress} · {t("auth.passkey.createdAt")}{" "}
                        {device.createdAt ? formatDateUtc(device.createdAt) : "-"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 border-destructive/15 bg-destructive/5 text-destructive hover:border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setUnlinkDeviceId(device.tokenId)}
                  >
                    {t("profile.security.qr.unlink")}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts (SSO) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-control border border-nx-line bg-nx-raised text-nx-ink-2">
              <Link2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>{t("profile.security.connectedAccounts.title")}</CardTitle>
              <CardDescription>{t("profile.security.connectedAccounts.desc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ExternalLoginsSection />
        </CardContent>
      </Card>

      {/* ── Passkey Registration Dialog ── */}
      <Dialog open={showPasskeyRegister} onOpenChange={setShowPasskeyRegister}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.security.passkeys.registerTitle")}</DialogTitle>
            <DialogDescription>{t("profile.security.passkeys.registerDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="passkey-name">{t("profile.security.passkeys.deviceName")}</Label>
              <Input
                id="passkey-name"
                placeholder={t("profile.security.passkeys.deviceNamePlaceholder")}
                value={newPasskeyName}
                onChange={(e) => setNewPasskeyName(e.target.value)}
                maxLength={64}
              />
            </div>
            {passkeyVm.registrationError && (
              <div className="rounded-nx-control border border-destructive/15 bg-destructive/5 p-3 text-xs text-destructive">
                {passkeyVm.registrationError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasskeyRegister(false);
                passkeyVm.clearRegistrationError();
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              disabled={!newPasskeyName.trim() || passkeyVm.isRegistering}
              loading={passkeyVm.isRegistering}
              onClick={async () => {
                const success = await passkeyVm.registerPasskey(newPasskeyName.trim());
                if (success) {
                  setShowPasskeyRegister(false);
                  setNewPasskeyName("");
                }
              }}
            >
              {t("profile.security.passkeys.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Passkey Delete Confirmation ── */}
      <ConfirmationDialog
        open={!!deletePasskeyConfirmId}
        onOpenChange={(open) => {
          if (!open) setDeletePasskeyConfirmId(null);
        }}
        variant="destructive"
        title={t("profile.security.passkeys.removeTitle")}
        description={t("profile.security.passkeys.removeDesc")}
        confirmText={t("profile.security.passkeys.removeConfirm")}
        cancelText={t("common.cancel")}
        onConfirm={() => {
          if (deletePasskeyConfirmId) passkeyVm.deletePasskey(deletePasskeyConfirmId);
          setDeletePasskeyConfirmId(null);
        }}
      />

      {/* ── Unlink Device Confirmation ── */}
      <ConfirmationDialog
        open={!!unlinkDeviceId}
        onOpenChange={(open) => {
          if (!open) setUnlinkDeviceId(null);
        }}
        variant="destructive"
        title={t("profile.security.qr.unlinkConfirmTitle")}
        description={t("profile.security.qr.unlinkConfirmDesc")}
        confirmText={t("profile.security.qr.unlink")}
        cancelText={t("common.cancel")}
        isLoading={sessionsVm.isRevoking}
        onConfirm={async () => {
          if (unlinkDeviceId) await sessionsVm.revokeSession(unlinkDeviceId);
          setUnlinkDeviceId(null);
        }}
      />

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.security.password.modalTitle")}</DialogTitle>
            <DialogDescription>{t("profile.security.password.modalDesc")}</DialogDescription>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-nx-accent" aria-hidden="true" />
              <DialogTitle>{t("profile.security.qr.modalTitle")}</DialogTitle>
            </div>
            <DialogDescription>{t("profile.security.qr.modalDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-nx-ink-2">
            <ol className="list-decimal space-y-2.5 ps-4">
              <li>{t("profile.security.qr.step1")}</li>
              <li>{t("profile.security.qr.step2")}</li>
              <li>{t("profile.security.qr.step3")}</li>
            </ol>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowLinkDevice(false)}>
              {t("profile.security.qr.modalCta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
