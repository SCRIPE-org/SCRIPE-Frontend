"use client";

import { useState } from "react";
import { Fingerprint, Plus, Pencil, Trash2, Shield, Check, X, AlertTriangle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@core/ui/dialog";
import { usePasskeyManagementViewModel } from "../viewmodels/usePasskeyManagementViewModel";

/**
 * PasskeyManagementView — Profile/Security page component for managing
 * registered passkeys.
 *
 * Features:
 * - List all passkeys with device name, creation date, last used
 * - Register new passkey via WebAuthn browser API
 * - Rename passkey device name
 * - Delete passkey with confirmation dialog
 * - WebAuthn browser support detection
 */
export function PasskeyManagementView() {
  const { t } = useI18n();
  const vm = usePasskeyManagementViewModel();
  const [newDeviceName, setNewDeviceName] = useState("");
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!newDeviceName.trim()) return;
    await vm.registerPasskey(newDeviceName.trim());
    if (!vm.registrationError) {
      setNewDeviceName("");
      setShowRegisterDialog(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      vm.deletePasskey(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // ── WebAuthn not supported ──────────────────────────────
  if (!vm.isWebAuthnSupported) {
    return (
      <div
        className="rounded-2xl border p-6"
        style={{
          background: "var(--sx-card-bg, var(--card))",
          borderColor: "var(--sx-card-border, var(--border))",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--sx-text, var(--foreground))" }}>
              {t("auth.passkey.notSupportedTitle") || "Passkeys Not Supported"}
            </h3>
            <p className="text-xs" style={{ color: "var(--sx-text-mute, var(--muted-foreground))" }}>
              {t("auth.passkey.notSupportedDesc") ||
                "Your browser doesn't support WebAuthn/Passkeys. Please use a modern browser."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(124,58,237,0.1) 100%)",
              border: "1px solid rgba(168,85,247,0.3)",
            }}
          >
            <Fingerprint className="h-5 w-5" style={{ color: "var(--sx-accent, #A855F7)" }} />
          </div>
          <div>
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--sx-text, var(--foreground))" }}
            >
              {t("auth.passkey.managementTitle") || "Passkeys"}
            </h3>
            <p
              className="text-xs"
              style={{ color: "var(--sx-text-mute, var(--muted-foreground))" }}
            >
              {t("auth.passkey.managementDesc") ||
                "Manage your registered passkeys for passwordless sign-in."}
            </p>
          </div>
        </div>

        {/* Register button */}
        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg"
              style={{
                borderColor: "var(--sx-field-border, var(--border))",
                color: "var(--sx-text, var(--foreground))",
              }}
            >
              <Plus className="h-4 w-4" />
              {t("auth.passkey.register") || "Add Passkey"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("auth.passkey.registerTitle") || "Register New Passkey"}</DialogTitle>
              <DialogDescription>
                {t("auth.passkey.registerDesc") ||
                  "Give your passkey a name to identify this device, then follow the browser prompt."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="passkey-device-name">
                  {t("auth.passkey.deviceNameLabel") || "Device Name"}
                </Label>
                <Input
                  id="passkey-device-name"
                  placeholder={t("auth.passkey.deviceNamePlaceholder") || "e.g. MacBook Pro, iPhone 15"}
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  maxLength={64}
                  autoFocus
                />
              </div>
              {vm.registrationError && (
                <div
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: "rgba(239,68,68,0.2)",
                    background: "rgba(239,68,68,0.05)",
                    color: "#EF4444",
                  }}
                >
                  {vm.registrationError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRegisterDialog(false);
                  setNewDeviceName("");
                  vm.clearRegistrationError();
                }}
              >
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button
                onClick={handleRegister}
                disabled={!newDeviceName.trim() || vm.isRegistering}
                style={{
                  background: "var(--sx-cta-gradient, var(--primary))",
                  color: "#fff",
                }}
              >
                {vm.isRegistering ? (
                  <span className="flex items-center gap-2">
                    <span className="sx-spin1 inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                    {t("auth.passkey.registering") || "Registering…"}
                  </span>
                ) : (
                  t("auth.passkey.registerCta") || "Register Passkey"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Loading state ──────────────────────────────────── */}
      {vm.isLoading && (
        <div className="flex items-center justify-center py-8">
          <span className="sx-spin1 inline-block h-6 w-6 rounded-full border-2 border-transparent border-t-current" style={{ color: "var(--sx-accent, #A855F7)" }} />
        </div>
      )}

      {/* ── Error state ────────────────────────────────────── */}
      {vm.listError && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: "rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.05)",
            color: "#EF4444",
          }}
          role="alert"
        >
          {vm.listError}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────── */}
      {!vm.isLoading && !vm.listError && vm.passkeys.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-8"
          style={{
            borderColor: "var(--sx-field-border, var(--border))",
            background: "var(--sx-card-bg, var(--card))",
          }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(124,58,237,0.05))",
              border: "1px solid rgba(168,85,247,0.2)",
            }}
          >
            <Shield className="h-7 w-7" style={{ color: "var(--sx-accent, #A855F7)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--sx-text, var(--foreground))" }}>
            {t("auth.passkey.emptyTitle") || "No passkeys registered"}
          </p>
          <p className="max-w-xs text-center text-xs" style={{ color: "var(--sx-text-mute, var(--muted-foreground))" }}>
            {t("auth.passkey.emptyDesc") ||
              "Add a passkey to enable fast, passwordless sign-in using your device's biometric or security key."}
          </p>
        </div>
      )}

      {/* ── Passkey list ───────────────────────────────────── */}
      {!vm.isLoading && vm.passkeys.length > 0 && (
        <div className="space-y-2">
          {vm.passkeys.map((passkey) => (
            <div
              key={passkey.id}
              className="group flex items-center gap-4 rounded-xl border px-4 py-3 transition-all hover:shadow-sm"
              style={{
                background: "var(--sx-card-bg, var(--card))",
                borderColor: "var(--sx-card-border, var(--border))",
              }}
            >
              {/* Icon */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: passkey.isDiscoverable
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(168,85,247,0.1)",
                  border: `1px solid ${passkey.isDiscoverable ? "rgba(34,197,94,0.2)" : "rgba(168,85,247,0.2)"}`,
                }}
              >
                <Fingerprint
                  className="h-4 w-4"
                  style={{
                    color: passkey.isDiscoverable ? "#22C55E" : "var(--sx-accent, #A855F7)",
                  }}
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                {vm.renamingId === passkey.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={vm.renameValue}
                      onChange={(e) => vm.setRenameValue(e.target.value)}
                      className="h-7 text-sm"
                      maxLength={64}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") vm.confirmRename();
                        if (e.key === "Escape") vm.cancelRename();
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={vm.confirmRename}
                      disabled={vm.isRenaming}
                      className="h-7 w-7 p-0"
                    >
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={vm.cancelRename}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: "var(--sx-text, var(--foreground))" }}
                    >
                      {passkey.deviceName}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--sx-text-mute, var(--muted-foreground))" }}
                    >
                      {t("auth.passkey.createdAt") || "Created"}{" "}
                      {passkey.displayCreatedDate}
                      {passkey.displayLastUsedDate && (
                        <>
                          {" · "}
                          {t("auth.passkey.lastUsed") || "Last used"}{" "}
                          {passkey.displayLastUsedDate}
                        </>
                      )}
                      {passkey.isNeverUsed && (
                        <span
                          className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            background: "rgba(234,179,8,0.1)",
                            color: "#EAB308",
                          }}
                        >
                          {t("auth.passkey.neverUsed") || "Never used"}
                        </span>
                      )}
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              {vm.renamingId !== passkey.id && (
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => vm.startRename(passkey)}
                    className="h-8 w-8 p-0"
                    title={t("auth.passkey.rename") || "Rename"}
                  >
                    <Pencil className="h-3.5 w-3.5" style={{ color: "var(--sx-text-mute)" }} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmId(passkey.id)}
                    className="h-8 w-8 p-0"
                    title={t("auth.passkey.delete") || "Delete"}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Delete confirmation dialog ─────────────────────── */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("auth.passkey.deleteTitle") || "Delete Passkey?"}</DialogTitle>
            <DialogDescription>
              {t("auth.passkey.deleteDesc") ||
                "This passkey will be permanently removed. You won't be able to use it for sign-in anymore."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={vm.isDeletingPasskey}
            >
              {vm.isDeletingPasskey
                ? (t("common.deleting") || "Deleting…")
                : (t("auth.passkey.deleteConfirm") || "Delete Passkey")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
