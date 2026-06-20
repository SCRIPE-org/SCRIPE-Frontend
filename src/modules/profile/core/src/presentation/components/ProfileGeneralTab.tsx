import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { AvatarUpload } from "./AvatarUpload";
import { ProfileInfoForm } from "./ProfileInfoForm";
import type { AdminProfile } from "../../domain/entities/AdminProfile";

interface ProfileGeneralTabProps {
  profile: AdminProfile;
  initials: string;
  avatarVm: {
    previewUrl: string | null;
    upload: (file: File) => Promise<unknown>;
    remove: () => Promise<unknown>;
    handleFileSelect: (file: File) => File;
    isUploading: boolean;
    isRemoving: boolean;
    uploadError: string | null;
  };
  profileVm: {
    updateProfile: (data: { firstName: string; lastName: string; phoneNumber: string }) => Promise<unknown>;
    isUpdating: boolean;
    updateError: string | null;
    profileSuccess: boolean;
  };
}

export function ProfileGeneralTab({
  profile,
  initials,
  avatarVm,
  profileVm,
}: ProfileGeneralTabProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/80 bg-card/45 p-5 shadow-sm backdrop-blur-md">
        <h3 className="mb-4 text-base font-bold text-foreground">
          {t("profile.general.profilePicture")}
        </h3>
        <AvatarUpload
          currentImageUrl={profile.profileImageUrl}
          initials={initials}
          previewUrl={avatarVm.previewUrl}
          onFileSelect={avatarVm.handleFileSelect}
          onUpload={avatarVm.upload}
          onRemove={avatarVm.remove}
          isUploading={avatarVm.isUploading}
          isRemoving={avatarVm.isRemoving}
          error={avatarVm.uploadError}
        />
      </div>

      <div className="rounded-xl border border-border/80 bg-card/45 p-5 shadow-sm backdrop-blur-md">
        <h3 className="mb-4 text-base font-bold text-foreground">
          {t("profile.general.personalInfo")}
        </h3>
        <ProfileInfoForm
          profile={profile}
          onSubmit={profileVm.updateProfile}
          isSubmitting={profileVm.isUpdating}
          submitError={profileVm.updateError}
          success={profileVm.profileSuccess}
        />
      </div>
    </div>
  );
}
