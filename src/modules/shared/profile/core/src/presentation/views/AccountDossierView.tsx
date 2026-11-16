"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { useProfileDossierViewModel } from "../viewmodels/useProfileDossierViewModel";
import {
  useAccountContextSliceViewModel,
  useAccountDossierSliceViewModel,
} from "../viewmodels/useSovereignAccountSlicesViewModel";
import { IdentityChangeVerificationModal } from "../components/IdentityChangeVerificationModal";
import { AccountLifecycleCard } from "../components/AccountLifecycleCard";
import { DossierPageSkeleton } from "../components/AccountSkeletons";
import { DossierAuthoritySection } from "../sections/dossier/DossierAuthoritySection";
import { DossierIdentityCardsSection } from "../sections/dossier/DossierIdentityCardsSection";
import { MailCheck } from "lucide-react";

/**
 * Identity dossier view (/account/dossier) presenting avatar, verified personal/enterprise
 * attributes, principal authority or club memberships, and lifecycle portability actions.
 */
export function AccountDossierView() {
  const { t } = useI18n();
  const {
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    updateError,
    uploadAvatar,
    isUploadingAvatar,
    removeAvatar,
    isRemovingAvatar,
  } = useProfileDossierViewModel();

  const { principalContext } = useAccountContextSliceViewModel();

  const {
    dossier,
    sendEmailVerification,
    isSendingVerification,
    verificationSent,
    exportAccountData,
    deactivateAccount,
  } = useAccountDossierSliceViewModel();

  const rawDefs = dossier?.customFields ?? profile?.customFields ?? [];
  const customFieldDefs = rawDefs;
  const [customDrafts, setCustomDrafts] = useState<Record<string, string>>({});
  const [identityModalMode, setIdentityModalMode] = useState<"email" | "username" | null>(null);

  const customValues: Record<string, string> = {};
  for (const cf of customFieldDefs) {
    customValues[cf.key] =
      customDrafts[cf.key] ?? (cf.currentValue != null ? String(cf.currentValue) : "");
  }

  if (isLoading || !profile) {
    return <DossierPageSkeleton />;
  }

  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
  const memberships = dossier?.clubMemberships ?? [];
  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";
  const isEmailVerified = dossier?.isEmailVerified ?? profile.isEmailVerified ?? true;
  const isSolePrimaryOwner =
    principalContext?.isSolePrimaryOwner ??
    (memberships.length > 0 ? memberships.some((m) => m.isPrimary) : false);
  const staffBadgeText =
    profile.staffCode || (isPlatformAdmin ? principalContext?.controlPlaneLabel : "") || "";

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">{t("profile.dossier.title")}</h1>
          <p className="text-xs text-nx-ink-3 mt-1">{t("profile.dossier.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          {staffBadgeText && (
            <Badge variant="outline" className="font-mono text-xs border-nx-line text-nx-ink-2">
              <bdi dir="ltr">{staffBadgeText}</bdi>
            </Badge>
          )}
          {isEmailVerified && (
            <Badge className="bg-success/15 text-success border border-success/30 text-xs flex items-center gap-1">
              <MailCheck className="h-3 w-3" style={{ minWidth: 12, minHeight: 12 }} />
              <span>{t("profile.verified")}</span>
            </Badge>
          )}
        </div>
      </div>

      <DossierIdentityCardsSection
        t={t}
        profile={profile}
        initials={initials}
        isEmailVerified={isEmailVerified}
        isUpdating={isUpdating}
        updateError={updateError}
        isUploadingAvatar={isUploadingAvatar}
        isRemovingAvatar={isRemovingAvatar}
        isSendingVerification={isSendingVerification}
        verificationSent={verificationSent}
        customFields={customFieldDefs}
        customFieldValues={customValues}
        onUploadAvatar={async (file) => {
          await uploadAvatar(file);
        }}
        onRemoveAvatar={async () => {
          await removeAvatar();
        }}
        onUpdateProfile={(data) =>
          updateProfile({
            ...data,
            customFields: customValues,
            rowVersion: data.rowVersion ?? profile.rowVersion ?? dossier?.rowVersion,
          })
        }
        onSendEmailVerification={sendEmailVerification}
        onChangeCustomField={(key, val) => setCustomDrafts((prev) => ({ ...prev, [key]: val }))}
        onOpenIdentityModal={setIdentityModalMode}
      />

      <DossierAuthoritySection
        t={t}
        isPlatformAdmin={isPlatformAdmin}
        isSolePrimaryOwner={isSolePrimaryOwner}
        controlPlaneLabel={principalContext?.controlPlaneLabel}
        adminTypeName={profile.adminTypeName}
        editionName={profile.editionName}
        memberships={memberships}
      />

      <AccountLifecycleCard
        profile={profile}
        customFields={customFieldDefs}
        isSolePrimaryOwner={isSolePrimaryOwner}
        primaryOrgName={
          isPlatformAdmin
            ? (principalContext?.controlPlaneLabel ?? "")
            : (profile.clubAffiliation ?? "")
        }
        onExportData={exportAccountData}
        onDeactivateAccount={deactivateAccount}
      />

      <IdentityChangeVerificationModal
        open={identityModalMode !== null}
        mode={identityModalMode ?? "email"}
        currentValue={identityModalMode === "username" ? `@${profile.username}` : profile.email}
        onOpenChange={(open) => {
          if (!open) setIdentityModalMode(null);
        }}
        onSendOtp={sendEmailVerification}
        onCommitChange={async (mode, newValue) => {
          await updateProfile({
            firstName: profile.firstName,
            lastName: profile.lastName,
            phoneNumber: profile.phoneNumber,
            bio: profile.bio,
            customFields: customValues,
            rowVersion: profile.rowVersion ?? dossier?.rowVersion,
            ...(mode === "email" ? { email: newValue } : { username: newValue.replace(/^@/, "") }),
          });
        }}
      />
    </div>
  );
}
