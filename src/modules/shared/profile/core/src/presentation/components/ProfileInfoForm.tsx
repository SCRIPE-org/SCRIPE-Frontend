"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { PhoneInput } from "@core/ui/phone-input";
import { Textarea } from "@core/ui/textarea";
import {
  CheckCircle2,
  AlertCircle,
  Send,
  Pencil,
  Mail,
  AtSign,
  Check,
  X,
} from "lucide-react";
import type { AdminProfile, AdminCustomFieldItem } from "../../domain/entities/AdminProfile";
import type { UpdateProfileRequest } from "../../domain/interfaces/IProfileRepository";

interface ProfileInfoFormProps {
  profile: AdminProfile;
  onSubmit: (data: UpdateProfileRequest) => Promise<unknown>;
  isSubmitting: boolean;
  error?: string | null;
  onSendEmailVerification?: () => Promise<unknown>;
  isSendingVerification?: boolean;
  verificationSent?: boolean;
  customFields?: AdminCustomFieldItem[];
  customFieldValues?: Record<string, string>;
  onChangeCustomField?: (key: string, value: string) => void;
  onOpenIdentityModal?: (mode: "email" | "username") => void;
}

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
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhoneNumber(profile.phoneNumber ?? "");
    setBio(profile.bio ?? "");
  }, [profile.firstName, profile.lastName, profile.phoneNumber, profile.bio]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);
    await onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      bio: bio.trim() || undefined,
    });
    setSavedSuccess(true);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setPhoneNumber(profile.phoneNumber ?? "");
    setBio(profile.bio ?? "");
    setIsEditing(false);
  };

  return (
    <div className="space-y-5" data-testid="personal-info-section">
      {/* Header action bar for Read-Only vs Edit Mode */}
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

      {/* Verified Identity Identifiers Bar (Email & Username with 3-Step Change Modals) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="rounded-xl border border-nx-line bg-nx-ground p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-nx-accent shrink-0" style={{ minWidth: 14, minHeight: 14 }} />
              <span className="text-xs font-medium text-nx-ink-2">{t("profile.email")}</span>
              {profile.isEmailVerified ? (
                <Badge variant="outline" className="border-success/30 text-success text-[10px] py-0 px-1.5">
                  {t("profile.verified")}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-warning/30 text-warning text-[10px] py-0 px-1.5">
                  {t("profile.unverified")}
                </Badge>
              )}
            </div>
            <p className="text-sm font-mono font-semibold text-nx-ink truncate" data-testid="dossier-email-value">
              {profile.email}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {!profile.isEmailVerified && onSendEmailVerification && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void onSendEmailVerification()}
                loading={isSendingVerification}
                disabled={verificationSent}
                className="h-7 text-xs"
              >
                <Send className="me-1 h-3 w-3" />
                {verificationSent ? t("profile.verificationSent") : t("profile.verifyEmail")}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="open-change-email-btn"
              onClick={() => onOpenIdentityModal?.("email")}
              className="h-7 text-xs font-semibold"
            >
              {t("profile.changeEmailBtn")}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-nx-line bg-nx-ground p-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <AtSign className="h-3.5 w-3.5 text-nx-accent shrink-0" style={{ minWidth: 14, minHeight: 14 }} />
              <span className="text-xs font-medium text-nx-ink-2">{t("profile.username")}</span>
              <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px] py-0 px-1.5">
                {t("profile.stepUpProtectedBadge")}
              </Badge>
            </div>
            <p className="text-sm font-mono font-semibold text-nx-ink truncate" data-testid="dossier-username-value">
              @{profile.username}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="open-change-username-btn"
            onClick={() => onOpenIdentityModal?.("username")}
            className="h-7 text-xs font-semibold shrink-0"
          >
            {t("profile.changeUsernameBtn")}
          </Button>
        </div>
      </div>

      {/* Seamless Unified Personal & Enterprise Profile Fields */}
      {!isEditing ? (
        <div
          data-testid="personal-info-readonly-grid"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
        >
          {[
            { label: t("profile.firstName"), value: firstName || "—", required: true },
            { label: t("profile.lastName"), value: lastName || "—", required: true },
            { label: t("profile.phone"), value: phoneNumber || "—", mono: true, required: false },
            { label: t("profile.role"), value: profile.adminTypeName || "SuperAdmin", badge: true, required: false },
            ...customFields.map((field) => ({
              label: isAr && field.labelAr ? field.labelAr : field.labelEn,
              value:
                (customFieldValues[field.key] ??
                  (field.currentValue !== null && field.currentValue !== undefined
                    ? String(field.currentValue)
                    : "")) || "—",
              required: field.isRequired,
              mono: field.key === "employee_badge_number",
              badge: false,
            })),
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-nx-line bg-nx-ground p-3.5 flex flex-col justify-between gap-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-nx-ink-3">
                  {item.label}
                  {item.required && <span className="text-destructive ms-1">*</span>}
                </span>
                {item.required && (
                  <span className="text-[10px] font-medium text-nx-ink-3">
                    {t("profile.requiredFieldIndicator")}
                  </span>
                )}
              </div>
              {item.badge ? (
                <div>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {item.value}
                  </Badge>
                </div>
              ) : (
                <p
                  className={`text-sm font-semibold text-nx-ink ${
                    item.mono ? "font-mono" : ""
                  }`}
                >
                  {item.value}
                </p>
              )}
            </div>
          ))}

          <div className="sm:col-span-2 rounded-xl border border-nx-line bg-nx-ground p-3.5 space-y-1">
            <span className="text-xs font-medium text-nx-ink-3">{t("profile.bioLabel")}</span>
            <p className="text-sm text-nx-ink leading-relaxed">
              {bio || t("profile.bioEmptyFallback")}
            </p>
          </div>
        </div>
      ) : (
        <form
          id="personal-info-form"
          data-testid="personal-info-edit-form"
          onSubmit={handleSave}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">
                {t("profile.firstName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("profile.firstNamePlaceholder")}
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">
                {t("profile.lastName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t("profile.lastNamePlaceholder")}
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">{t("profile.phone")}</Label>
              <PhoneInput
                id="phoneNumber"
                value={phoneNumber}
                onChange={(v) => setPhoneNumber(v ?? "")}
                placeholder={t("profile.phonePlaceholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label>{t("profile.role")}</Label>
              <div className="flex h-10 items-center">
                <Badge variant="secondary" className="text-xs font-semibold">
                  {profile.adminTypeName || "SuperAdmin"}
                </Badge>
              </div>
            </div>

            {customFields.map((field) => {
              const label = isAr && field.labelAr ? field.labelAr : field.labelEn;
              const placeholder =
                (isAr && field.placeholderAr ? field.placeholderAr : field.placeholderEn) ?? "";
              return (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`cf-${field.key}`}>
                    {label}
                    {field.isRequired && <span className="text-destructive ms-1">*</span>}
                  </Label>
                  <Input
                    id={`cf-${field.key}`}
                    data-testid={`custom-field-input-${field.key}`}
                    value={customFieldValues[field.key] ?? ""}
                    onChange={(e) => onChangeCustomField?.(field.key, e.target.value)}
                    placeholder={placeholder}
                    required={field.isRequired}
                  />
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">{t("profile.bioLabel")}</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("profile.bioPlaceholder")}
              maxLength={1000}
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              {t("profile.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isSubmitting}
              className="bg-nx-accent-fill text-nx-on-fill font-semibold"
            >
              {t("profile.saveChanges")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
