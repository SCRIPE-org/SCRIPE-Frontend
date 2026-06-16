"use client";

/**
 * ProfileGeneralView — General profile page
 *
 * Sections: Profile Picture + Personal Information
 */
import { useI18n } from "@core/providers/i18n-provider";
import { useProfilePageViewModel } from "../viewmodels/useProfilePageViewModel";
import { useAvatarViewModel } from "../viewmodels/useAvatarViewModel";
import { AvatarUpload } from "../components/AvatarUpload";
import { ProfileInfoForm } from "../components/ProfileInfoForm";
import { Loader2 } from "lucide-react";

export function ProfileGeneralView() {
  const { t } = useI18n();
  const vm = useProfilePageViewModel();
  const avatar = useAvatarViewModel();

  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (vm.error || !vm.profile) {
    return (
      <div className="py-20 text-center text-destructive">
        {vm.error || "Failed to load profile"}
      </div>
    );
  }

  const initials =
    `${(vm.profile.firstName?.[0] ?? "").toUpperCase()}${(vm.profile.lastName?.[0] ?? "").toUpperCase()}` ||
    "U";

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold">{t("profile.general.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.general.description")}</p>
      </div>

      {/* Profile Picture Section */}
      <section className="space-y-4 rounded-xl border border-border/40 bg-card/50 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("profile.general.profilePicture")}
        </h3>
        <AvatarUpload
          currentImageUrl={vm.profile.profileImageUrl}
          initials={initials}
          previewUrl={avatar.previewUrl}
          onFileSelect={avatar.handleFileSelect}
          onUpload={avatar.upload}
          onRemove={avatar.remove}
          isUploading={avatar.isUploading}
          isRemoving={avatar.isRemoving}
          error={avatar.uploadError}
        />
      </section>

      {/* Personal Information Section */}
      <section className="space-y-4 rounded-xl border border-border/40 bg-card/50 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("profile.general.personalInfo")}
        </h3>
        <ProfileInfoForm
          profile={vm.profile}
          onSubmit={vm.updateProfile}
          isSubmitting={vm.isUpdating}
          submitError={vm.updateError}
          success={vm.profileSuccess}
        />
      </section>
    </div>
  );
}
