"use client";

/**
 * AccountDossierView
 *
 * Page 1 (/account/dossier):
 * Personal B2B Enterprise Admin Profile, Avatar Upload, Email Verification Status & Trigger,
 * Multi-Tenant / Branch Memberships, and Dynamic Custom Fields (identity.admin).
 */
import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { useProfileDossierViewModel } from "../viewmodels/useProfileDossierViewModel";
import { useAccountDossierSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { AvatarUpload } from "../components/AvatarUpload";
import { ProfileInfoForm } from "../components/ProfileInfoForm";
import {
  Building2,
  Sparkles,
  User,
  Briefcase,
  CheckCircle2,
  MailCheck,
  Sliders,
} from "lucide-react";

export function AccountDossierView() {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const {
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    updateError,
    profileSuccess,
    uploadAvatar,
    isUploadingAvatar,
    removeAvatar,
    isRemovingAvatar,
  } = useProfileDossierViewModel();

  const {
    dossier,
    sendEmailVerification,
    isSendingVerification,
    verificationSent,
  } = useAccountDossierSliceViewModel();

  const customFieldDefs = dossier?.customFields ?? profile?.customFields ?? [];
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [customSaved, setCustomSaved] = useState(false);

  useEffect(() => {
    if (customFieldDefs.length > 0) {
      const next: Record<string, string> = {};
      for (const cf of customFieldDefs) {
        next[cf.key] = cf.currentValue != null ? String(cf.currentValue) : "";
      }
      setCustomValues(next);
    }
  }, [customFieldDefs.length]);

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

  const handleSaveCustomFields = async () => {
    await updateProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
      bio: profile.bio,
      customFields: customValues,
    });
    setCustomSaved(true);
    setTimeout(() => setCustomSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.dossier.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">
            {t("profile.dossier.description")}
          </p>
        </div>

        {/* Email Verification Status & Action */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              isEmailVerified
                ? "border-success/30 text-success bg-success/10 text-xs gap-1.5 py-1 px-2.5"
                : "border-warning/40 text-warning bg-warning/10 text-xs gap-1.5 py-1 px-2.5"
            }
          >
            <MailCheck className="h-3.5 w-3.5" />
            <span>
              {isEmailVerified
                ? t("profile.dossier.emailVerifiedBadge")
                : t("profile.dossier.emailUnverifiedBadge")}
            </span>
          </Badge>

          {!isEmailVerified && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSendingVerification || verificationSent}
              onClick={() => sendEmailVerification()}
              data-testid="send-email-verification-btn"
              className="h-8 text-xs font-semibold"
            >
              {verificationSent
                ? t("profile.dossier.verificationEmailSent")
                : t("profile.dossier.sendVerificationEmailBtn")}
            </Button>
          )}
        </div>
      </div>

      {/* 1. Avatar & Identity Portrait */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.general.profilePicture")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.avatar.clickOrDrag")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentImageUrl={profile.profileImageUrl}
            initials={initials}
            previewUrl={null}
            onFileSelect={(file) => file}
            onUpload={uploadAvatar}
            onRemove={removeAvatar}
            isUploading={isUploadingAvatar}
            isRemoving={isRemovingAvatar}
            error={null}
          />
        </CardContent>
      </Card>

      {/* 2. Personal & Professional Details */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.general.personalInfo")}
              </CardTitle>
            </div>
            {profile.staffCode && (
              <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px] font-mono">
                {profile.staffCode}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.general.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileInfoForm
            profile={profile}
            onSubmit={updateProfile}
            isSubmitting={isUpdating}
            submitError={updateError}
            success={profileSuccess}
          />
        </CardContent>
      </Card>

      {/* 3. Dynamic Enterprise Custom Fields (identity.admin) */}
      <Card
        data-testid="dossier-custom-fields-card"
        className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
      >
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.dossier.customFieldsTitle")}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-3">
                identity.admin
              </Badge>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.dossier.customFieldsDesc")}
            </CardDescription>
          </div>
          {customFieldDefs.length > 0 && (
            <div className="flex items-center gap-2">
              {customSaved && (
                <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t("profile.common.saved")}</span>
                </Badge>
              )}
              <Button
                type="button"
                size="sm"
                disabled={isUpdating}
                onClick={handleSaveCustomFields}
                data-testid="save-custom-fields-btn"
                className="h-8 text-xs font-semibold"
              >
                {t("profile.common.saveChanges")}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {customFieldDefs.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.dossier.noCustomFields")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {customFieldDefs.map((field) => {
                const label = isAr && field.labelAr ? field.labelAr : field.labelEn;
                const placeholder =
                  isAr && field.placeholderAr
                    ? field.placeholderAr
                    : field.placeholderEn ?? "";
                return (
                  <div
                    key={field.key}
                    className="p-3.5 rounded-xl border border-nx-line bg-nx-raised space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-nx-ink">{label}</span>
                      <div className="flex items-center gap-1.5">
                        {field.isRequired && (
                          <Badge variant="outline" className="text-[9px] border-warning/40 text-warning py-0 px-1.5">
                            {t("profile.dossier.requiredBadge")}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[9px] font-mono border-nx-line text-nx-ink-3 py-0 px-1.5">
                          {field.key}
                        </Badge>
                      </div>
                    </div>
                    <Input
                      value={customValues[field.key] ?? ""}
                      onChange={(e) =>
                        setCustomValues((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      placeholder={placeholder}
                      className="h-8 text-xs bg-nx-surface border-nx-line text-nx-ink"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Multi-Tenant & Organizational Branch Memberships */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.dossier.clubAffiliationTitle")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {memberships.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.dossier.noMemberships")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {memberships.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-nx-ink truncate">{m.clubName}</span>
                      <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/10 gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        <span>{m.status}</span>
                      </Badge>
                    </div>
                    <p className="text-[11px] text-nx-ink-2 mt-0.5 truncate">
                      {m.branchName} &bull; {m.roleName}
                    </p>
                  </div>
                  <Sparkles className="h-4 w-4 text-nx-accent shrink-0" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

