"use client";

/**
 * ProfileInfoForm — Personal information editing form
 *
 * Two-column layout with firstName, lastName, phoneNumber (editable)
 * and username (read-only).
 */
import { useState } from "react";
import { Input } from "@core/ui/input";
import { PhoneInput, isValidPhoneNumber } from "@core/ui/phone-input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { Lock, CheckCircle2 } from "lucide-react";
import type { AdminProfile } from "../../../src/domain/entities/AdminProfile";
import type { UpdateProfileRequest } from "../../../src/domain/interfaces/IProfileRepository";

interface ProfileInfoFormProps {
  profile: AdminProfile;
  onSubmit: (data: UpdateProfileRequest) => Promise<unknown>;
  isSubmitting: boolean;
  submitError: string | null;
  success: boolean;
}

/**
 * Presentation UI component rendering the profile info form.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ProfileInfoForm({
  profile,
  onSubmit,
  isSubmitting,
  submitError,
  success,
}: ProfileInfoFormProps) {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Reset form when profile data changes (render-time state sync)
  const [prevProfile, setPrevProfile] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phoneNumber: profile.phoneNumber,
  });
  if (
    profile.firstName !== prevProfile.firstName ||
    profile.lastName !== prevProfile.lastName ||
    profile.phoneNumber !== prevProfile.phoneNumber
  ) {
    setPrevProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
    });
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhoneNumber(profile.phoneNumber);
    setPhoneError(null);
  }

  const isDirty =
    firstName !== profile.firstName ||
    lastName !== profile.lastName ||
    phoneNumber !== profile.phoneNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    if (!isDirty) return;

    if (phoneNumber.trim() && !isValidPhoneNumber(phoneNumber)) {
      setPhoneError(t("profile.errors.phoneInvalid") || "Please enter a valid phone number.");
      return;
    }

    onSubmit({ firstName, lastName, phoneNumber });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("profile.fields.firstName")}</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={t("profile.fields.firstName")}
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("profile.fields.lastName")}</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t("profile.fields.lastName")}
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">{t("profile.fields.phoneNumber")}</Label>
          <PhoneInput
            id="phoneNumber"
            value={phoneNumber}
            onChange={setPhoneNumber}
            error={phoneError || undefined}
          />
          {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
        </div>

        {/* Email Address (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("profile.fields.email") || "Email Address"}</Label>
          <div className="relative">
            <Input id="email" value={profile.email} disabled className="bg-nx-raised pe-10" />
            <Lock className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3" />
          </div>
        </div>

        {/* Username (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="username">{t("profile.fields.username")}</Label>
          <div className="relative">
            <Input id="username" value={profile.username} disabled className="bg-nx-raised pe-10" />
            <Lock className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3" />
          </div>
          <p className="text-xs text-nx-ink-2">{t("profile.fields.usernameHint")}</p>
        </div>
      </div>

      {/* Role info strip */}
      <div className="flex items-center gap-4 rounded-nx-control border border-nx-line bg-nx-raised p-3 text-sm text-nx-ink-2">
        <span>
          <strong className="text-nx-ink">{t("profile.fields.role")}:</strong>{" "}
          {profile.adminTypeName || profile.roles?.[0]?.roleName || "Admin"}
        </span>
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      {success && (
        <div className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          {t("profile.general.saved")}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={!isDirty || isSubmitting}
          onClick={() => {
            setFirstName(profile.firstName);
            setLastName(profile.lastName);
            setPhoneNumber(profile.phoneNumber);
            setPhoneError(null);
          }}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}
