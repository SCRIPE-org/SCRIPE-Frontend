"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { SectionInfoPopover } from "../../components/SectionInfoPopover";
import type { PasskeyCredential } from "../../../domain/entities/PasskeyCredential";
import { Clock, Fingerprint, KeyRound, Pencil, Plus, Trash2 } from "lucide-react";

/**
 * Props for PasskeyVaultSection.
 */
export interface PasskeyVaultSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  dateLocale: string;
  passkeys: PasskeyCredential[];
  isLoadingPasskeys: boolean;
  webAuthnSupported: boolean;
  isRemovingPasskey: boolean;
  detectDeviceBadge: (aaguid?: string) => { name: string };
  onOpenEnroll: () => void;
  onOpenRename: (passkey: PasskeyCredential) => void;
  onOpenDelete: (passkey: PasskeyCredential) => void;
}

/**
 * W3C WebAuthn L3 passkey and FIDO2 AAGUID vault list card with enroll, rename, and delete triggers.
 */
export function PasskeyVaultSection({
  t,
  dateLocale,
  passkeys,
  isLoadingPasskeys,
  webAuthnSupported,
  isRemovingPasskey,
  detectDeviceBadge,
  onOpenEnroll,
  onOpenRename,
  onOpenDelete,
}: PasskeyVaultSectionProps) {
  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.passkeys.sectionTitle")}
            </CardTitle>
            <SectionInfoPopover i18nPrefix="profile.infoPopover.passkeyVault" />
          </div>
          <CardDescription className="text-xs text-nx-ink-3 mt-1">
            {t("profile.passkeys.sectionDesc")}
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={onOpenEnroll}
          data-testid="open-enroll-passkey-btn"
          className="text-xs font-semibold gap-1.5 bg-nx-accent-fill text-nx-on-fill self-start sm:self-auto"
          disabled={!webAuthnSupported}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t("profile.passkeys.addPasskeyBtn")}</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoadingPasskeys ? (
          <div className="space-y-2.5">
            {Array.from({ length: 2 }, (_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl border border-nx-line bg-nx-raised"
              >
                <div className="space-y-1.5">
                  <Skeleton shape="text" className="h-4 w-44" />
                  <Skeleton shape="text" className="h-3 w-64" />
                </div>
                <Skeleton shape="control" className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : passkeys.length === 0 ? (
          <div className="p-6 rounded-xl border border-nx-line bg-nx-raised text-center space-y-2">
            <Fingerprint className="h-6 w-6 text-nx-accent mx-auto" />
            <p className="text-xs font-semibold text-nx-ink">
              {t("profile.passkeys.noPasskeysTitle")}
            </p>
            <p className="text-[11px] text-nx-ink-3 max-w-sm mx-auto">
              {t("profile.passkeys.noPasskeysDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {passkeys.map((pk) => {
              const badge = detectDeviceBadge(pk.aaguid || undefined);
              const transports = Array.isArray(pk.transports) ? pk.transports : [];
              return (
                <div
                  key={pk.id}
                  data-testid={`passkey-row-${pk.id}`}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-nx-line bg-nx-raised hover:border-nx-line-hi transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-nx-ink truncate">{pk.deviceName}</span>
                      <Badge
                        variant="outline"
                        className="border-nx-line text-nx-ink-2 text-[10px] py-0 px-1.5"
                      >
                        {pk.modelName || badge.name}
                      </Badge>
                      {typeof pk.isBackedUp === "boolean" && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 px-1.5 ${
                            pk.isBackedUp
                              ? "border-info/30 text-info bg-info/10"
                              : "border-nx-accent/30 text-nx-accent bg-nx-accent-wash"
                          }`}
                        >
                          {pk.isBackedUp
                            ? t("profile.passkeys.backedUpBadge")
                            : t("profile.passkeys.deviceBoundBadge")}
                        </Badge>
                      )}
                      {pk.attachmentMode && (
                        <Badge
                          variant="outline"
                          className="border-nx-line text-nx-ink-3 text-[10px] font-mono py-0 px-1.5"
                        >
                          {pk.attachmentMode}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[10px] text-nx-ink-3 font-mono">
                      <span dir="ltr">
                        <bdi>{pk.credentialIdMasked}</bdi>
                      </span>
                      <span>
                        {t("profile.passkeys.enrolledOn", {
                          date: pk.createdAt.toLocaleDateString(dateLocale),
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pk.lastUsedAt
                          ? `${t("profile.passkeys.lastUsed")}: ${pk.lastUsedAt.toLocaleDateString(dateLocale)}`
                          : t("profile.passkeys.neverUsed")}
                      </span>
                      {transports.length > 0 && (
                        <span>
                          {t("profile.passkeys.transportsLabel")}: {transports.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenRename(pk)}
                      data-testid={`rename-passkey-btn-${pk.id}`}
                      className="h-8 w-8 p-0 text-nx-ink-3 hover:text-nx-ink hover:bg-nx-surface"
                      aria-label={t("profile.passkeys.renamePasskeyAria")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenDelete(pk)}
                      disabled={isRemovingPasskey}
                      data-testid={`delete-passkey-btn-${pk.id}`}
                      className="h-8 w-8 p-0 text-nx-ink-3 hover:text-destructive hover:bg-destructive/10"
                      aria-label={t("profile.passkeys.removePasskeyAria")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
