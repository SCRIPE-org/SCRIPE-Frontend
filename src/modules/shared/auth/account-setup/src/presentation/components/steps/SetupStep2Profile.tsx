"use client";

import React from "react";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { PhoneInput } from "@core/ui/phone-input";
import { ArrowLeft, ArrowRight, Mail, Sparkles, User } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { AvatarUploader } from "../AvatarUploader";
import type { useAccountSetupViewModel } from "../../viewmodels/useAccountSetupViewModel";

/**
 * Documentation for module export
 */
export interface SetupStep2ProfileProps {
  vm: ReturnType<typeof useAccountSetupViewModel>;
  hasCustomFields: boolean;
  adminNameInitials: string;
}

/**
 * Step 2: Administrator Profile Details, Avatar & Contact.
 */
export function SetupStep2Profile({
  vm,
  hasCustomFields,
  adminNameInitials,
}: SetupStep2ProfileProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      {/* Avatar Uploader Dropzone */}
      <AvatarUploader
        profileImageUrl={vm.profileImageUrl}
        name={adminNameInitials}
        onUpload={vm.handleAvatarUpload}
        onRemove={vm.removeAvatar}
        error={vm.avatarError}
      />

      {/* Name Fields: First Name & Last Name */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admin-first-name" className="text-xs font-medium">
            {t("auth.accountSetup.firstName")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="admin-first-name"
            value={vm.firstName}
            onChange={(e) => vm.setFirstName(e.target.value)}
            placeholder={t("auth.accountSetup.firstNamePlaceholder")}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-last-name" className="text-xs font-medium">
            {t("auth.accountSetup.lastName")}
          </Label>
          <Input
            id="admin-last-name"
            value={vm.lastName}
            onChange={(e) => vm.setLastName(e.target.value)}
            placeholder={t("auth.accountSetup.lastNamePlaceholder")}
          />
        </div>
      </div>

      {/* Contact Phone */}
      <div className="space-y-2">
        <Label htmlFor="admin-phone" className="text-xs font-medium">
          {t("auth.accountSetup.phoneNumber")}
        </Label>
        <PhoneInput value={vm.phoneNumber} onChange={vm.setPhoneNumber} defaultCountry="SA" />
      </div>

      {/* Account Identity Credentials (Verified / Locked) */}
      <div className="grid min-w-0 gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs sm:grid-cols-2">
        <div className="min-w-0 space-y-1">
          <span className="text-muted-foreground">{t("auth.accountSetup.emailAddress")}</span>
          <div className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate">{vm.tokenData?.adminEmail}</span>
            <Badge
              variant="outline"
              className="shrink-0 border-emerald-500/40 px-1 py-0 text-[10px] text-emerald-600 dark:text-emerald-400"
            >
              {t("auth.accountSetup.verified")}
            </Badge>
          </div>
        </div>

        <div className="min-w-0 space-y-1">
          <span className="text-muted-foreground">{t("auth.accountSetup.username")}</span>
          <div className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate font-mono">@{vm.tokenData?.adminUsername}</span>
          </div>
        </div>
      </div>

      {/* Step 2 Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1 gap-1.5"
          onClick={vm.goToPrevStep}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("auth.accountSetup.back")}</span>
        </Button>

        <Button
          type="button"
          size="lg"
          className="flex-1 gap-1.5 font-semibold"
          disabled={!vm.isProfileValid}
          loading={vm.pageState === "activating"}
          onClick={vm.goToNextStep}
        >
          <span>
            {hasCustomFields ? t("auth.accountSetup.next") : t("auth.accountSetup.completeSetup")}
          </span>
          {hasCustomFields ? <ArrowRight className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
