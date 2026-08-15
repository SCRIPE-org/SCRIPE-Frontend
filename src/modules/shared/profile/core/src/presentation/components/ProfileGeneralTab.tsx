import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
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
    updateProfile: (data: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
    }) => Promise<unknown>;
    isUpdating: boolean;
    updateError: string | null;
    profileSuccess: boolean;
  };
}

/**
 * Presentation UI component rendering the profile general tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ProfileGeneralTab({
  profile,
  initials,
  avatarVm,
  profileVm,
}: ProfileGeneralTabProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.general.profilePicture")}</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.general.personalInfo")}</CardTitle>
          <CardDescription>{t("profile.general.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileInfoForm
            profile={profile}
            onSubmit={profileVm.updateProfile}
            isSubmitting={profileVm.isUpdating}
            submitError={profileVm.updateError}
            success={profileVm.profileSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}
