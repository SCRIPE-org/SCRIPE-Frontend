"use client";

/**
 * AccountDossierView
 *
 * Page 1 (/account/dossier):
 * Read-Only by default Personal & Enterprise Profile (with seamless required/optional B2B fields),
 * 3-Step Verified Email & Username Change Modals, Avatar Upload + Remove Photo,
 * Organization Memberships, and Account Data Portability & Deactivation Lifecycle.
 */
import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { useProfileDossierViewModel } from "../viewmodels/useProfileDossierViewModel";
import { useAccountDossierSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { AvatarUpload } from "../components/AvatarUpload";
import { ProfileInfoForm } from "../components/ProfileInfoForm";
import { IdentityChangeVerificationModal } from "../components/IdentityChangeVerificationModal";
import { AccountLifecycleCard } from "../components/AccountLifecycleCard";
import type { AdminCustomFieldItem } from "../../domain/entities/AdminProfile";
import { Building2, ShieldCheck, User, Briefcase, MailCheck } from "lucide-react";

const FALLBACK_B2B_FIELDS: AdminCustomFieldItem[] = [
  { key: "employee_badge_number", labelEn: "Corporate Employee Badge ID", labelAr: "رقم البطاقة الوظيفية المؤسسية", placeholderEn: "e.g. EMP-AHLY-1042", placeholderAr: "مثال: EMP-AHLY-1042", valueType: "Text", isRequired: true, currentValue: "EMP-AHLY-1042" },
  { key: "executive_department", labelEn: "Executive Division / Cost Center", labelAr: "القطاع التنفيذي / مركز التكلفة", placeholderEn: "e.g. Executive Commercial & Venue Operations", placeholderAr: "مثال: العمليات التجارية والتنفيذية للمنشآت", valueType: "Text", isRequired: true, currentValue: "Executive Commercial & Venue Operations" },
  { key: "office_location", labelEn: "Primary Office / Desk Location", labelAr: "المقر الرئيسي / موقع المكتب", placeholderEn: "e.g. Cairo HQ — Tower A, Floor 4", placeholderAr: "مثال: المقر الرئيسي بالقاهرة — برج أ، الطابق الرابع", valueType: "Text", isRequired: false, currentValue: "Cairo HQ — Tower A, Floor 4" },
  { key: "emergency_contact", labelEn: "Emergency Contact (Name & Phone)", labelAr: "جهة الاتصال في حالات الطوارئ (الاسم والهاتف)", placeholderEn: "e.g. Nadia Morgan (+20 100 555 8899)", placeholderAr: "مثال: نادية مورغان (+20 100 555 8899)", valueType: "Text", isRequired: false, currentValue: "Nadia Morgan (+20 100 555 8899)" },
];

export function AccountDossierView() {
  const { t } = useI18n();
  const {
    profile, isLoading, updateProfile, isUpdating, updateError,
    uploadAvatar, isUploadingAvatar, removeAvatar, isRemovingAvatar,
  } = useProfileDossierViewModel();

  const {
    dossier, sendEmailVerification, isSendingVerification, verificationSent,
    exportAccountData, deactivateAccount,
  } = useAccountDossierSliceViewModel();

  const rawDefs = dossier?.customFields ?? profile?.customFields ?? [];
  const customFieldDefs = rawDefs.length > 0 ? rawDefs : FALLBACK_B2B_FIELDS;
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [identityModalMode, setIdentityModalMode] = useState<"email" | "username" | null>(null);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const cf of customFieldDefs) {
      next[cf.key] = cf.currentValue != null ? String(cf.currentValue) : "";
    }
    setCustomValues(next);
  }, [rawDefs.length]);

  if (isLoading || !profile) {
    return (
      <div className="space-y-4">
        <div className="h-44 rounded-xl bg-nx-surface border border-nx-line animate-pulse" />
        <div className="h-96 rounded-xl bg-nx-surface border border-nx-line animate-pulse" />
      </div>
    );
  }

  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
  const memberships = dossier?.clubMemberships ?? [];
  const isEmailVerified = dossier?.isEmailVerified ?? profile.isEmailVerified ?? true;
  const isSolePrimaryOwner = memberships.length > 0 ? memberships.some((m) => m.isPrimary) : true;

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">{t("profile.dossier.title")}</h1>
          <p className="text-xs text-nx-ink-3 mt-1">{t("profile.dossier.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs border-nx-line text-nx-ink-2">
            {profile.staffCode || "#SCR-ADMIN"}
          </Badge>
          {isEmailVerified && (
            <Badge className="bg-success/15 text-success border border-success/30 text-xs flex items-center gap-1">
              <MailCheck className="h-3 w-3" style={{ minWidth: 12, minHeight: 12 }} />
              <span>{t("profile.verified")}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Avatar & Identity Card */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-base font-bold text-nx-ink">{t("profile.avatar.sectionTitle")}</CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">{t("profile.avatar.sectionDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentImageUrl={profile.profileImageUrl}
            initials={initials}
            onUpload={async (file) => { await uploadAvatar(file); }}
            onRemove={async () => { await removeAvatar(); }}
            isUploading={isUploadingAvatar}
            isRemoving={isRemovingAvatar}
          />
        </CardContent>
      </Card>

      {/* Unified Personal & Enterprise Information (Read-Only by default -> Edit Profile) */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-nx-ink">
            {t("profile.personalInfo")}
          </CardTitle>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.personalInfoDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileInfoForm
            profile={{ ...profile, isEmailVerified }}
            onSubmit={(data) =>
              updateProfile({
                ...data,
                customFields: customValues,
                rowVersion: data.rowVersion ?? profile.rowVersion ?? dossier?.rowVersion,
              })
            }
            isSubmitting={isUpdating}
            error={updateError}
            onSendEmailVerification={sendEmailVerification}
            isSendingVerification={isSendingVerification}
            verificationSent={verificationSent}
            customFields={customFieldDefs}
            customFieldValues={customValues}
            onChangeCustomField={(key, val) =>
              setCustomValues((prev) => ({ ...prev, [key]: val }))
            }
            onOpenIdentityModal={(mode) => setIdentityModalMode(mode)}
          />
        </CardContent>
      </Card>

      {/* Multi-Tenant / Branch Memberships */}
      <Card
        data-testid="dossier-club-memberships-card"
        className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("profile.dossier.membershipsTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.dossier.membershipsSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 min-w-0">
            {(memberships.length > 0
              ? memberships
              : [
                  {
                    tenantId: "t-ahly",
                    clubName: profile.clubAffiliation || "Al-Ahly Sporting Club",
                    branchName: profile.activeBranchName || "Cairo HQ — Main Stadium",
                    roleName: "SuperAdmin",
                    status: "Active",
                  },
                ]
            ).map((m) => (
              <div
                key={`${m.tenantId}-${m.branchName}`}
                className="p-3.5 rounded-xl border border-nx-line bg-nx-ground flex flex-wrap sm:flex-nowrap items-start justify-between gap-3 min-w-0"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-nx-ink">{m.clubName}</span>
                    <Badge className="bg-nx-accent-wash text-nx-accent border border-nx-accent/30 text-[10px] py-0 px-1.5 flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" style={{ minWidth: 10, minHeight: 10 }} />
                      <span>{profile.editionName || "Enterprise Ultra"}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-nx-ink-2 flex items-center gap-1.5 min-w-0">
                    <Briefcase className="h-3 w-3 text-nx-ink-3 shrink-0" style={{ minWidth: 12, minHeight: 12 }} />
                    <span className="truncate">{m.branchName}</span>
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-2 shrink-0">
                  {m.roleName}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Data Portability & Deactivation Lifecycle */}
      <AccountLifecycleCard
        profile={profile}
        customFields={customFieldDefs}
        isSolePrimaryOwner={isSolePrimaryOwner}
        primaryOrgName={profile.clubAffiliation || "Al-Ahly Sporting Club"}
        onExportData={exportAccountData}
        onDeactivateAccount={deactivateAccount}
      />

      {/* 3-Step Email / Username Verification Modal */}
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
