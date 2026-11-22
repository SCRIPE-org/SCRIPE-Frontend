"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { CheckCircle2, Pencil, Check, X } from "lucide-react";
import { ProfileIdentityIdentifiersBar } from "./ProfileIdentityIdentifiersBar";
import { ProfileInfoReadonlyGrid } from "./ProfileInfoReadonlyGrid";
import { ProfileInfoEditForm } from "./ProfileInfoEditForm";
import type { AdminProfile, AdminCustomFieldItem } from "../../domain/entities/AdminProfile";
import type { UpdateProfileRequest } from "../../domain/interfaces/IProfileRepository";

/**
 * Props for {@link ProfileInfoForm}.
 */
export interface ProfileInfoFormProps {
  /** Administrator profile data rendered in the personal dossier. */
  profile: AdminProfile;
  /** Submit handler invoked when saving updated profile fields. */
  onSubmit: (data: UpdateProfileRequest) => Promise<unknown>;
  /** Indicates whether a profile save request is in flight. */
  isSubmitting: boolean;
  /** Validation or server error message to display below the form. */
  error?: string | null;
  /** Optional handler to dispatch a verification email. */
  onSendEmailVerification?: () => Promise<unknown>;
  /** Indicates whether an email verification dispatch is in flight. */
  isSendingVerification?: boolean;
  /** True when email verification has been sent in the current session. */
  verificationSent?: boolean;
  /** Enterprise custom dossier fields to render and edit. */
  customFields?: AdminCustomFieldItem[];
  /** Controlled values for enterprise custom fields keyed by field key. */
  customFieldValues?: Record<string, string>;
  /** Change handler for enterprise custom field inputs. */
  onChangeCustomField?: (key: string, value: string) => void;
  /** Opens the step-up identity modal for email or username changes. */
  onOpenIdentityModal?: (mode: "email" | "username") => void;
}

/**
 * Personal and enterprise profile dossier component supporting read-only review,
 * step-up identity identifier triggers, and inline edit mode.
 */
export function ProfileInfoForm({
  profile,
  onSubmit,
  isSubmitting,
  error,
  onSendEmailVerification,
  isSendingVerification,
  verificationSent,
  customFields = [],
  customFieldValues = {},
  onChangeCustomField,
  onOpenIdentityModal,
}: ProfileInfoFormProps) {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const profileKey = `${profile.firstName ?? ""}\0${profile.lastName ?? ""}\0${profile.phoneNumber ?? ""}\0${profile.bio ?? ""}`;
  const [prevProfileKey, setPrevProfileKey] = useState(profileKey);
  if (prevProfileKey !== profileKey) {
    setPrevProfileKey(profileKey);
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhoneNumber(profile.phoneNumber ?? "");
    setBio(profile.bio ?? "");
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);
    setLocalError(null);
    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      setSavedSuccess(true);
      setIsEditing(false);
    } catch (err: unknown) {
      setLocalError(
        err instanceof Error && err.message ? err.message : t("profile.common.saveFailed")
      );
    }
  };

  const handleCancel = () => {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhoneNumber(profile.phoneNumber ?? "");
    setBio(profile.bio ?? "");
    setLocalError(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-5" data-testid="personal-info-section">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-nx-line">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            data-testid="profile-mode-badge"
            className={
              isEditing
                ? "border-nx-accent text-nx-accent bg-nx-accent-wash text-[10px] font-semibold"
                : "border-nx-line text-nx-ink-2 text-[10px] font-semibold"
            }
          >
            {isEditing ? t("profile.editingModeBadge") : t("profile.readOnlyModeBadge")}
          </Badge>
          {savedSuccess && !isEditing && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
              {t("profile.saved")}
            </span>
          )}
        </div>

        {!isEditing ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            data-testid="edit-profile-btn"
            onClick={() => setIsEditing(true)}
            className="h-8 text-xs font-semibold gap-1.5 border-nx-accent/40 text-nx-accent hover:bg-nx-accent-wash"
          >
            <Pencil className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
            <span>{t("profile.editProfileBtn")}</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="cancel-edit-profile-btn"
              onClick={handleCancel}
              className="h-8 text-xs gap-1"
            >
              <X className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
              <span>{t("profile.cancel")}</span>
            </Button>
            <Button
              type="submit"
              form="personal-info-form"
              size="sm"
              data-testid="save-dossier-btn"
              loading={isSubmitting}
              className="h-8 text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1"
            >
              <Check className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
              <span>{t("profile.saveChanges")}</span>
            </Button>
          </div>
        )}
      </div>

      <ProfileIdentityIdentifiersBar
        profile={profile}
        onSendEmailVerification={onSendEmailVerification}
        isSendingVerification={isSendingVerification}
        verificationSent={verificationSent}
        onOpenIdentityModal={onOpenIdentityModal}
      />

      {!isEditing ? (
        <ProfileInfoReadonlyGrid
          firstName={firstName}
          lastName={lastName}
          phoneNumber={phoneNumber}
          adminTypeName={profile.adminTypeName}
          bio={bio}
          customFields={customFields}
          customFieldValues={customFieldValues}
        />
      ) : (
        <ProfileInfoEditForm
          firstName={firstName}
          lastName={lastName}
          phoneNumber={phoneNumber}
          adminTypeName={profile.adminTypeName}
          bio={bio}
          error={error || localError}
          isSubmitting={isSubmitting}
          customFields={customFields}
          customFieldValues={customFieldValues}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onPhoneNumberChange={setPhoneNumber}
          onBioChange={setBio}
          onChangeCustomField={onChangeCustomField}
          onCancel={handleCancel}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}
