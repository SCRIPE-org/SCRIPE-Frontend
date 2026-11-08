"use client";

/**
 * AccountDossierView
 *
 * Sovereign Slice 1 (/account/dossier):
 * Executive Dossier, Avatar Upload, Personal Profile Form, Interactive SVG Tactical Identity Canvas,
 * Multi-Club Memberships & Pending Invitations, and B2B2C Guardian/Family Linked Athlete Profiles.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { useProfileDossierViewModel } from "../viewmodels/useProfileDossierViewModel";
import { useAccountDossierSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { AvatarUpload } from "../components/AvatarUpload";
import { ProfileInfoForm } from "../components/ProfileInfoForm";
import { TacticalIdentityCanvas } from "../components/TacticalIdentityCanvas";
import {
  Building2,
  Sparkles,
  User,
  Briefcase,
  Users,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export function AccountDossierView() {
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

  const { dossier } = useAccountDossierSliceViewModel();

  if (isLoading || !profile) {
    return (
      <div className="space-y-4">
        <div className="h-44 rounded-xl bg-nx-surface border border-nx-line animate-pulse" />
        <div className="h-96 rounded-xl bg-nx-surface border border-nx-line animate-pulse" />
      </div>
    );
  }

  const initials = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
  const tactical = profile.tacticalPhilosophy ?? dossier?.tacticalPhilosophy;
  const memberships = dossier?.clubMemberships ?? [];
  const linkedAthletes = dossier?.linkedAthleteProfiles ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">
          {t("profile.dossier.title")}
        </h1>
        <p className="text-xs text-nx-ink-3 mt-1">
          {t("profile.dossier.description")}
        </p>
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

      {/* 3. Interactive SVG Tactical Identity Canvas */}
      <TacticalIdentityCanvas
        preferredFormation={tactical?.preferredFormation}
        pressingIntensity={tactical?.pressingIntensity}
        buildUpStyle={tactical?.buildUpStyle}
        manifesto={tactical?.manifesto}
        assignedSquads={tactical?.assignedAgeGroups}
      />

      {/* 4. Multi-Club Memberships & Federation Affiliations */}
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

      {/* 5. B2B2C Guardian & Family Linked Athlete Profiles */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.dossier.linkedAthletesTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.dossier.linkedAthletesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkedAthletes.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.dossier.noLinkedAthletes")}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {linkedAthletes.map((ath) => (
                <div
                  key={ath.athleteId}
                  className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-nx-ink block">{ath.fullName}</span>
                    <span className="text-[11px] text-nx-ink-3">
                      {ath.ageGroup} &bull; {ath.position}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/10 gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{ath.medicalClearance}</span>
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
