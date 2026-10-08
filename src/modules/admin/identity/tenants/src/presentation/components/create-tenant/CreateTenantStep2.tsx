/**
 * CreateTenantStep2 — Administrator Setup
 *
 * Collects: admin full name, email, username, and contact phone.
 * Automatically aligns phone dial code with the country selected in Step 1.
 *
 * @module tenants/presentation/components
 */
"use client";

import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { PhoneInput } from "@core/ui/phone-input";
import { Switch } from "@core/ui/switch";
import { UserPlus, Mail, Shield, User, Sliders, AlertCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import { CustomFieldsSection } from "@core/components/custom-fields";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";

interface CreateTenantStep2Props {
  vm: CreateTenantVM;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Documentation for module export
 */
export function CreateTenantStep2({ vm, t }: CreateTenantStep2Props) {
  const touched = vm.stepTouched[2];
  const errors = vm.stepErrors[2];
  const firstNameEmpty = touched && errors.includes("adminFirstName");
  const emailEmpty = touched && errors.includes("adminEmail");
  const emailFormatError = errors.includes("adminEmailFormat");
  const emailError = emailEmpty || emailFormatError;

  const deferAdminCustomFieldsToSetup = vm.deferAdminCustomFieldsToSetup;
  const adminFieldConfigs = vm.adminCustomFieldsQuery.fieldConfigs;
  const customFieldErrors = React.useMemo(() => {
    const errMap: Record<string, string> = {};
    if (!deferAdminCustomFieldsToSetup && touched) {
      for (const err of errors) {
        if (err.startsWith("customField_")) {
          const fieldName = err.replace("customField_", "");
          const config = adminFieldConfigs.find((c) => c.name === fieldName);
          const label = config?.label || fieldName;
          errMap[fieldName] = t("validation.requiredFieldNamed", { name: label });
        }
      }
    }
    return errMap;
  }, [errors, touched, adminFieldConfigs, deferAdminCustomFieldsToSetup, t]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-info/10">
          <UserPlus className="h-5 w-5 text-info" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t("tenant.stepAdministrator")}</h2>
          <p className="text-sm text-nx-ink-2">{t("tenant.stepAdministratorDesc")}</p>
        </div>
      </div>

      {/* Security Callout */}
      <div className="rounded-nx-md border border-info/20 bg-info/5 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <div className="text-sm text-nx-ink-2 space-y-1">
            <p className="font-semibold text-nx-ink">{t("tenant.secureOnboarding")}</p>
            <p>{t("tenant.secureOnboardingDesc")}</p>
          </div>
        </div>
      </div>

      {/* Validation Error Banner */}
      {touched && errors.length > 0 && (
        <div
          role="alert"
          className="rounded-nx-md border border-destructive/30 bg-destructive/10 p-3.5 text-destructive"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold">{t("validation.correctErrorsTitle")}</p>
              <ul className="list-disc ps-4 space-y-0.5 text-[11px] text-destructive/90">
                {firstNameEmpty && <li>{t("tenant.adminFirstNameRequired")}</li>}
                {emailEmpty && <li>{t("validation.invalidAdminEmail")}</li>}
                {emailFormatError && <li>{t("validation.invalidEmail")}</li>}
                {Object.values(customFieldErrors).map((errMsg, idx) => (
                  <li key={idx}>{errMsg}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Admin Name: First Name & Last Name */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admin-first-name">
            {t("tenant.adminFirstName")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-2"
              aria-hidden="true"
            />
            <Input
              id="admin-first-name"
              value={vm.form.adminFirstName}
              onChange={(e) => vm.updateField("adminFirstName", e.target.value)}
              placeholder={t("tenant.adminFirstNamePlaceholder")}
              className={cn("ps-10", firstNameEmpty && "border-destructive focus-visible:ring-destructive")}
              maxLength={100}
              aria-invalid={firstNameEmpty || undefined}
              aria-describedby={firstNameEmpty ? "tenant-admin-firstname-error" : undefined}
              autoFocus
            />
          </div>
          {firstNameEmpty && (
            <p id="tenant-admin-firstname-error" className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{t("tenant.adminFirstNameRequired")}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-last-name">{t("tenant.adminLastName")}</Label>
          <div className="relative">
            <User
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-2"
              aria-hidden="true"
            />
            <Input
              id="admin-last-name"
              value={vm.form.adminLastName}
              onChange={(e) => vm.updateField("adminLastName", e.target.value)}
              placeholder={t("tenant.adminLastNamePlaceholder")}
              className="ps-10"
              maxLength={100}
            />
          </div>
        </div>
      </div>

      {/* Admin Email & Username */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admin-email">
            {t("tenant.adminEmail")} <span className="text-destructive">*</span>
          </Label>
          <div className="relative" dir="ltr">
            <Mail
              className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-2"
              aria-hidden="true"
            />
            <Input
              id="admin-email"
              type="email"
              value={vm.form.adminEmail}
              onChange={(e) => vm.updateField("adminEmail", e.target.value)}
              placeholder={t("tenant.adminEmailPlaceholder")}
              className={cn("ps-10", emailError && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={emailError || undefined}
              aria-describedby={emailError ? "tenant-admin-email-error" : undefined}
              dir="ltr"
            />
          </div>
          {emailEmpty && (
            <p id="tenant-admin-email-error" className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{t("validation.invalidAdminEmail")}</span>
            </p>
          )}
          {emailFormatError && !emailEmpty && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{t("validation.invalidEmail")}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-username">{t("tenant.adminUsername")}</Label>
          <Input
            id="admin-username"
            value={vm.form.adminUsername}
            onChange={(e) => vm.updateField("adminUsername", e.target.value)}
            placeholder={t("tenant.autoGenerated")}
            className="font-mono"
            dir="ltr"
          />
          <p className="text-xs text-nx-ink-2">{t("tenant.usernameHint")}</p>
        </div>
      </div>

      {/* Phone Number */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admin-phone">{t("tenant.adminPhone")}</Label>
          <PhoneInput
            value={vm.form.adminPhone}
            onChange={(val) => vm.updateField("adminPhone", val)}
            defaultCountry={(vm.form.countryCode as any) || "SA"}
          />
        </div>
      </div>

      {/* Administrator Custom Fields */}
      {(vm.adminCustomFieldsQuery.isLoading || vm.adminCustomFieldsQuery.fieldConfigs.length > 0) && (
        <div className="space-y-4 border-t border-nx-line pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-info/10 text-info">
              <Sliders className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-nx-ink">
                {t("tenant.adminCustomFields")}
              </h3>
              <p className="text-xs text-nx-ink-2">
                {t("tenant.adminCustomFieldsDesc")}
              </p>
            </div>
          </div>

          {/* Defer Custom Fields to Setup Switch */}
          <div className="flex items-center justify-between gap-4 rounded-nx-md border border-nx-line bg-nx-surface p-3.5">
            <div className="space-y-0.5">
              <Label
                htmlFor="defer-admin-custom-fields"
                className="text-xs font-semibold text-nx-ink cursor-pointer"
              >
                {t("tenant.deferAdminCustomFieldsToSetup")}
              </Label>
              <p className="text-[11px] text-nx-ink-2">
                {t("tenant.deferAdminCustomFieldsToSetupDesc")}
              </p>
            </div>
            <Switch
              id="defer-admin-custom-fields"
              checked={vm.deferAdminCustomFieldsToSetup}
              onCheckedChange={vm.setDeferAdminCustomFieldsToSetup}
            />
          </div>

          {vm.deferAdminCustomFieldsToSetup ? (
            <div className="rounded-nx-md border border-info/20 bg-info/5 p-3 text-xs text-nx-ink-2">
              <p>{t("tenant.customFieldsDeferredNotice")}</p>
            </div>
          ) : (
            <CustomFieldsSection
              configs={vm.adminCustomFieldsQuery.fieldConfigs}
              values={vm.adminCustomFieldValues}
              onChange={vm.updateAdminCustomFieldValue}
              isLoading={vm.adminCustomFieldsQuery.isLoading}
              errors={customFieldErrors}
              touched={touched}
              emptyMessage={t("tenant.noAdminCustomFields")}
              entityTypeKey="identity.admin"
              entityDisplayName={t("tenant.administrator")}
              onFieldCreated={vm.adminCustomFieldsQuery.refetch}
              className="space-y-4"
            />
          )}
        </div>
      )}
    </div>
  );
}
