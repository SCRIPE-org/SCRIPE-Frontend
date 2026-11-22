"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { AvatarUpload } from "../../components/AvatarUpload";
import { ProfileInfoForm } from "../../components/ProfileInfoForm";
import type { AdminCustomFieldItem, AdminProfile } from "../../../domain/entities/AdminProfile";
import type { UpdateProfileRequest } from "../../../domain/interfaces/IProfileRepository";
import { User } from "lucide-react";

/**
 * Props for DossierIdentityCardsSection.
 */
export interface DossierIdentityCardsSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  profile: AdminProfile;
  initials: string;
  isEmailVerified: boolean;
  isUpdating: boolean;
  updateError: string | null;
  isUploadingAvatar: boolean;
  isRemovingAvatar: boolean;
  isSendingVerification: boolean;
  verificationSent: boolean;
  customFields: AdminCustomFieldItem[];
  customFieldValues: Record<string, string>;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<unknown>;
  onSendEmailVerification: () => Promise<unknown>;
  onChangeCustomField: (key: string, val: string) => void;
  onOpenIdentityModal: (mode: "email" | "username") => void;
}

/**
 * Avatar upload and verified personal/enterprise profile information cards for /account/dossier.
 */
export function DossierIdentityCardsSection({
  t,
  profile,
  initials,
  isEmailVerified,
  isUpdating,
  updateError,
  isUploadingAvatar,
  isRemovingAvatar,
  isSendingVerification,
  verificationSent,
  customFields,
  customFieldValues,
  onUploadAvatar,
  onRemoveAvatar,
  onUpdateProfile,
  onSendEmailVerification,
  onChangeCustomField,
  onOpenIdentityModal,
}: DossierIdentityCardsSectionProps) {
  return (
    <>
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("profile.avatar.sectionTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.avatar.sectionDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentImageUrl={profile.profileImageUrl}
            initials={initials}
            onUpload={onUploadAvatar}
            onRemove={onRemoveAvatar}
            isUploading={isUploadingAvatar}
            isRemoving={isRemovingAvatar}
          />
        </CardContent>
      </Card>

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
            onSubmit={onUpdateProfile}
            isSubmitting={isUpdating}
            error={updateError}
            onSendEmailVerification={onSendEmailVerification}
            isSendingVerification={isSendingVerification}
            verificationSent={verificationSent}
            customFields={customFields}
            customFieldValues={customFieldValues}
            onChangeCustomField={onChangeCustomField}
            onOpenIdentityModal={onOpenIdentityModal}
          />
        </CardContent>
      </Card>
    </>
  );
}
