"use client";

/**
 * ProfileDossierView
 *
 * Primary Executive Dossier view.
 * Displays executive profile details, coaching badges, sports accreditations,
 * tactical philosophy manifesto, profile avatar uploader, and organizational affiliation.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { useProfileDossierViewModel } from "../viewmodels/useProfileDossierViewModel";
import { AvatarUpload } from "../components/AvatarUpload";
import { ProfileInfoForm } from "../components/ProfileInfoForm";
import {
  Building2,
  Sparkles,
  User,
  Briefcase,
  Award,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

/**
 * ProfileDossierView Component
 *
 * Renders the executive dossier view for personal profile, sports credentials, and tactical philosophy.
 */
export function ProfileDossierView() {
  const { t } = useI18n();
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

  if (isLoading || !profile) {
    return (
      <div className="space-y-4">
        <div className="h-44 rounded-xl bg-nx-surface border border-nx-line animate-pulse" />
        <div className="h-96 rounded-xl bg-nx-surface border border-nx-line animate-pulse" />
      </div>
    );
  }

  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "SC";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">
          {t("profile.dossier.title")}
        </h1>
        <p className="text-xs text-nx-ink-3 mt-1">
          {t("profile.dossier.description")}
        </p>
      </div>

      {/* Avatar & Executive Profile Section */}
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

      {/* Personal & Professional Details */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.general.personalInfo")}
              </CardTitle>
            </div>
            <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px] font-mono">
              {profile.staffCode || "#SCR-ADM"}
            </Badge>
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

      {/* ── Sports Accreditations & Coaching Verification Vault ──────────── */}
      {profile.coachingLicenses && profile.coachingLicenses.length > 0 && (
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.coaching.sectionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">
              {t("profile.coaching.sectionDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.coachingLicenses.map((lic) => (
                <div
                  key={lic.id}
                  className="p-3.5 rounded-lg border border-nx-line bg-nx-raised flex flex-col justify-between gap-3 hover:border-nx-line-hi transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold border-nx-accent/40 text-nx-accent bg-nx-accent-wash/30">
                          {lic.organization}
                        </Badge>
                        <span className="font-semibold text-xs text-nx-ink">{lic.licenseLevel}</span>
                      </div>
                      <p className="text-[11px] font-mono text-nx-ink-3">
                        {t("profile.coaching.certificate")}: {lic.certificateNumber}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className="border-success/30 text-success bg-success/10 gap-1 text-[10px] shrink-0"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{t("profile.coaching.verifiedBadge")}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-nx-ink-3 border-t border-nx-line/50 pt-2">
                    <Calendar className="h-3 w-3 text-nx-accent" />
                    <span>
                      {t("profile.coaching.validUntil")}: {new Date(lic.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tactical Philosophy & Football Methodology Dossier ────────── */}
      {profile.tacticalPhilosophy && (
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.philosophy.sectionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">
              {t("profile.philosophy.sectionDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
                <span className="text-[10px] text-nx-ink-3">{t("profile.philosophy.formation")}</span>
                <p className="font-semibold text-nx-ink mt-0.5">{profile.tacticalPhilosophy.preferredFormation}</p>
              </div>

              <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
                <span className="text-[10px] text-nx-ink-3">{t("profile.philosophy.pressing")}</span>
                <p className="font-semibold text-nx-ink mt-0.5">{profile.tacticalPhilosophy.pressingIntensity}</p>
              </div>

              <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
                <span className="text-[10px] text-nx-ink-3">{t("profile.philosophy.buildup")}</span>
                <p className="font-semibold text-nx-ink mt-0.5">{profile.tacticalPhilosophy.buildUpStyle}</p>
              </div>
            </div>

            {/* Tactical Manifesto */}
            <div className="p-3.5 rounded-lg border border-nx-line bg-nx-raised text-xs space-y-1.5 border-s-2 border-s-nx-accent">
              <span className="text-[10px] font-semibold text-nx-accent uppercase tracking-wider">
                {t("profile.philosophy.manifesto")}
              </span>
              <p className="text-nx-ink-2 italic leading-relaxed">
                &ldquo;{profile.tacticalPhilosophy.manifesto}&rdquo;
              </p>
            </div>

            {/* Assigned Squad Portfolios */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-nx-ink font-semibold">
                <Layers className="h-3.5 w-3.5 text-nx-accent" />
                <span>{t("profile.philosophy.squads")}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {profile.tacticalPhilosophy.assignedAgeGroups.map((squad, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-nx-line bg-nx-surface text-nx-ink-2">
                    {squad}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Club Context & Roles Card */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
              <span className="text-[10px] text-nx-ink-3">{t("profile.dossier.clubName")}</span>
              <p className="font-semibold text-nx-ink mt-0.5">{profile.clubAffiliation}</p>
            </div>

            <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
              <span className="text-[10px] text-nx-ink-3">{t("profile.dossier.activeBranch")}</span>
              <p className="font-semibold text-nx-ink mt-0.5">{profile.activeBranchName}</p>
            </div>

            <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
              <span className="text-[10px] text-nx-ink-3">{t("profile.dossier.assignedRoles")}</span>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {profile.roles?.map((r, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-nx-accent/30 text-nx-accent bg-nx-accent-wash/30">
                    {r.roleName || r.roleCode || "Administrator"}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-nx-line bg-nx-raised">
              <span className="text-[10px] text-nx-ink-3">{t("profile.dossier.platformTier")}</span>
              <div className="flex items-center gap-1 text-nx-accent font-semibold mt-0.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{profile.editionName}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
