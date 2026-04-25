"use client";

/**
 * ProfileInfoForm — Personal information editing form
 *
 * Two-column layout with firstName, lastName, phoneNumber (editable)
 * and username (read-only).
 */
import { useState, useEffect } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import type { AdminProfile } from "../../../src/domain/entities/AdminProfile";
import type { UpdateProfileRequest } from "../../../src/domain/interfaces/IProfileRepository";

interface ProfileInfoFormProps {
  profile: AdminProfile;
  onSubmit: (data: UpdateProfileRequest) => Promise<unknown>;
  isSubmitting: boolean;
  submitError: string | null;
  success: boolean;
}

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

  // Reset form when profile data changes (e.g., after successful update)
  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhoneNumber(profile.phoneNumber);
  }, [profile.firstName, profile.lastName, profile.phoneNumber]);

  const isDirty =
    firstName !== profile.firstName ||
    lastName !== profile.lastName ||
    phoneNumber !== profile.phoneNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
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
          <Input
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={t("profile.fields.phoneNumber")}
          />
        </div>

        {/* Username (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="username">{t("profile.fields.username")}</Label>
          <div className="relative">
            <Input id="username" value={profile.username} disabled className="bg-muted/50 pe-10" />
            <Lock className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">{t("profile.fields.usernameHint")}</p>
        </div>
      </div>

      {/* Role info badge */}
      <div className="flex items-center gap-4 rounded-lg border border-border/40 bg-muted/30 p-3 text-sm text-muted-foreground">
        <span>
          <strong>{t("profile.fields.role")}:</strong>{" "}
          {profile.adminTypeName || profile.roles?.[0]?.roleName || "Admin"}
        </span>
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
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
