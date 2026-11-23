"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { PhoneInput } from "@core/ui/phone-input";
import { Textarea } from "@core/ui/textarea";
import { AlertCircle } from "lucide-react";
import type { AdminCustomFieldItem } from "../../domain/entities/AdminProfile";

/** Props for {@link ProfileInfoEditForm}. */
export interface ProfileInfoEditFormProps {
  /** Controlled first name field. */
  firstName: string;
  /** Controlled last name field. */
  lastName: string;
  /** Controlled phone number field. */
  phoneNumber: string;
  /** Read-only administrator role display name. */
  adminTypeName?: string | null;
  /** Controlled bio textarea value. */
  bio: string;
  /** Validation/server error message to display, if any. */
  error?: string | null;
  /** True while save mutation is in flight. */
  isSubmitting: boolean;
  /** Enterprise custom dossier field definitions. */
  customFields: AdminCustomFieldItem[];
  /** Controlled values for enterprise custom fields keyed by field key. */
  customFieldValues: Record<string, string>;
  /** Updates first name input. */
  onFirstNameChange: (value: string) => void;
  /** Updates last name input. */
  onLastNameChange: (value: string) => void;
  /** Updates phone number input. */
  onPhoneNumberChange: (value: string) => void;
  /** Updates bio input. */
  onBioChange: (value: string) => void;
  /** Updates an enterprise custom field value. */
  onChangeCustomField?: (key: string, value: string) => void;
  /** Cancels editing and restores initial values. */
  onCancel: () => void;
  /** Submits the personal info edit form. */
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Editable form body for personal identity details, phone contact, biography,
 * and enterprise custom dossier attributes.
 */
export function ProfileInfoEditForm({
  firstName,
  lastName,
  phoneNumber,
  adminTypeName,
  bio,
  error,
  isSubmitting,
  customFields,
  customFieldValues,
  onFirstNameChange,
  onLastNameChange,
  onPhoneNumberChange,
  onBioChange,
  onChangeCustomField,
  onCancel,
  onSubmit,
}: ProfileInfoEditFormProps) {
  const { t, language } = useI18n();
  const isAr = language === "ar";

  return (
    <form
      id="personal-info-form"
      data-testid="personal-info-edit-form"
      onSubmit={onSubmit}
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
            onChange={(e) => onFirstNameChange(e.target.value)}
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
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder={t("profile.lastNamePlaceholder")}
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber">{t("profile.phone")}</Label>
          <PhoneInput
            id="phoneNumber"
            value={phoneNumber}
            onChange={(v) => onPhoneNumberChange(v ?? "")}
            placeholder={t("profile.phonePlaceholder")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t("profile.role")}</Label>
          <div className="flex h-10 items-center">
            <Badge variant="secondary" className="text-xs font-semibold">
              {adminTypeName || t("profile.roleDefault")}
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
          onChange={(e) => onBioChange(e.target.value)}
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
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
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
  );
}
