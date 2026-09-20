/**
 * SetupAccountControls — Layout wrapper, credential inputs, steppers, and profile controls for account setup.
 *
 * Designed with SCRIPE Enterprise Design Standards:
 * - Clean design tokens (@core/ui/*)
 * - Zero "AI-slop" (no garish rainbow gradients, neon rings, or pulsing icons)
 * - Complete responsive adaptiveness for mobile, tablet, and desktop
 * - Full overflow protection with min-w-0 and truncation
 * - Real custom field controls (searchable select, multiselect, datepicker, textarea, etc.)
 */

"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { DatePicker } from "@core/ui/date-picker";
import { Textarea } from "@core/ui/textarea";
import { PhoneInput } from "@core/ui/phone-input";
import { GenericSelect } from "@core/crud/components/generic-select";
import {
  Eye,
  EyeOff,
  KeyRound,
  User,
  ShieldCheck,
  Sparkles,
  Camera,
  Trash2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Shield,
  Upload,
  AlertCircle,
  Check,
} from "lucide-react";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useI18n } from "@core/providers/i18n-provider";
import type { SetupStep } from "../viewmodels/useAccountSetupViewModel";
import { SetupCustomField } from "../../domain/entities";

/**
 * Props for displaying account attribute metadata rows with overflow protection.
 */
export interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm min-w-0 py-1">
      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        {icon}
        <span className="font-medium">{label}:</span>
      </div>
      <span className="font-medium text-foreground truncate min-w-0 text-end">
        {value || "—"}
      </span>
    </div>
  );
}

/**
 * Props for password input with reveal toggle.
 */
export interface PasswordFieldProps {
  id: string;
  value: string;
  show: boolean;
  placeholder: string;
  onChange: (v: string) => void;
  onToggle: () => void;
  autoFocus?: boolean;
}

export function PasswordField({
  id,
  value,
  show,
  placeholder,
  onChange,
  onToggle,
  autoFocus,
}: PasswordFieldProps) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pe-10 font-mono tracking-tight text-sm"
        autoFocus={autoFocus}
      />
      <Button
        variant="ghost"
        type="button"
        size="sm"
        onClick={onToggle}
        className="absolute end-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 text-muted-foreground transition-colors hover:text-foreground"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}

/**
 * Live Password Strength Bar and Label.
 */
export function PasswordStrengthMeter({ score }: { score: number }) {
  const { t } = useI18n();

  const getStatus = () => {
    if (score < 40)
      return {
        label: t("auth.accountSetup.weak"),
        color: "bg-destructive",
        text: "text-destructive",
      };
    if (score < 80)
      return {
        label: t("auth.accountSetup.medium"),
        color: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
      };
    return {
      label: t("auth.accountSetup.strong"),
      color: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
    };
  };

  const status = getStatus();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{t("auth.accountSetup.passwordStrength")}</span>
        <span className={cn("font-semibold", status.text)}>{status.label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-300 rounded-full", status.color)}
          style={{ width: `${Math.max(score, 5)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Modern Responsive Stepper Progress Header.
 */
export interface StepProgressProps {
  currentStep: SetupStep;
  hasCustomFields: boolean;
  onStepClick?: (step: SetupStep) => void;
}

export function StepProgressIndicator({
  currentStep,
  hasCustomFields,
  onStepClick,
}: StepProgressProps) {
  const { t } = useI18n();

  const steps = [
    { id: 1 as SetupStep, title: t("auth.accountSetup.step1Security"), icon: KeyRound },
    { id: 2 as SetupStep, title: t("auth.accountSetup.step2Profile"), icon: User },
    ...(hasCustomFields
      ? [{ id: 3 as SetupStep, title: t("auth.accountSetup.step3Attributes"), icon: ShieldCheck }]
      : []),
    { id: 4 as SetupStep, title: t("auth.accountSetup.step4Celebration"), icon: Sparkles },
  ];

  const currentStepObj = steps.find((s) => s.id === currentStep) ?? steps[0];

  return (
    <nav aria-label="Setup Steps" className="w-full">
      {/* Mobile view (< sm): Step counter and clean progress bar */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("common.stepOfTotal", { current: currentStep, total: steps.length })}
          </span>
          <span className="font-semibold text-foreground">{currentStepObj.title}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop view (>= sm): Full stepper with icons and titles */}
      <ol className="hidden sm:flex items-center justify-between gap-2">
        {steps.map((step, idx) => {
          const isDone = currentStep > step.id || currentStep === 4;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <li className="flex flex-1 items-center">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => onStepClick?.(step.id)}
                  disabled={step.id > currentStep}
                  className={cn(
                    "group h-auto p-1.5 flex w-full flex-col items-center gap-1.5 text-center transition-colors hover:bg-transparent rounded-lg",
                    step.id > currentStep ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all shadow-xs",
                      isDone && !isCurrent
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCurrent
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "border-border bg-muted/30 text-muted-foreground"
                    )}
                  >
                    {isDone && !isCurrent ? (
                      <Check className="h-4 w-4 stroke-[2.5]" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs transition-colors",
                      isCurrent
                        ? "font-semibold text-foreground"
                        : isDone
                        ? "font-medium text-muted-foreground"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {step.title}
                  </span>
                </Button>
              </li>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors rounded-full mb-5",
                    currentStep > steps[idx + 1].id || (currentStep > step.id && currentStep !== 1)
                      ? "bg-primary"
                      : "bg-border/60"
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Avatar photo uploader with preview and file dropzone.
 */
export interface AvatarUploaderProps {
  profileImageUrl: string;
  name: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  error?: string | null;
}

export function AvatarUploader({
  profileImageUrl,
  name,
  onUpload,
  onRemove,
  error,
}: AvatarUploaderProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "AD";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-border bg-card/60 p-4">
      <div className="relative group shrink-0">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border border-border shadow-xs">
          {profileImageUrl ? (
            <AvatarImage src={profileImageUrl} alt={name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-base sm:text-lg font-bold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="ghost"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/50 hover:text-white"
          aria-label={t("auth.accountSetup.photoUpload")}
        >
          <Camera className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 text-center sm:text-start space-y-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground">
          {t("auth.accountSetup.photoUpload")}
        </h4>
        <p className="text-xs text-muted-foreground">{t("auth.accountSetup.photoHint")}</p>
        {error && (
          <p className="flex items-center gap-1 text-xs text-destructive font-medium">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs shadow-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{t("auth.accountSetup.photoUpload")}</span>
          </Button>
          {profileImageUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t("auth.accountSetup.photoRemove")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Dynamic Custom Field Input Control with Real Type Rendering & Searchable Options.
 */
export interface DynamicCustomFieldProps {
  field: SetupCustomField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  invalid?: boolean;
}

export function DynamicCustomField({
  field,
  value,
  onChange,
  error,
  invalid,
}: DynamicCustomFieldProps) {
  const { direction, t } = useI18n();
  const isAr = direction === "rtl";
  const label = field.label(isAr);
  const placeholder = field.placeholder(isAr);
  const isSensitive = field.isSensitive;

  const renderControl = () => {
    // 1. Boolean / Switch
    if (field.isBoolean) {
      return (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border border-border bg-card/40 p-3",
            invalid && "border-destructive/60"
          )}
        >
          <span className="text-sm font-medium text-foreground">{label}</span>
          <Switch
            id={field.key}
            checked={Boolean(value)}
            onCheckedChange={onChange}
            aria-invalid={invalid || undefined}
          />
        </div>
      );
    }

    // 2. Searchable Single Select
    if (field.isSelect) {
      const options = field.getOptions(isAr);
      return (
        <GenericSelect
          id={field.key}
          aria-label={label}
          options={options}
          value={value !== undefined && value !== null ? String(value) : ""}
          onValueChange={(val: string | string[]) => onChange(Array.isArray(val) ? val[0] : val)}
          placeholder={placeholder || t("components.select.placeholder")}
          type="searchable"
          searchable={true}
          required={field.isRequired}
          aria-invalid={invalid || undefined}
          className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
        />
      );
    }

    // 3. Searchable Multi Select
    if (field.isMultiSelect) {
      const options = field.getOptions(isAr);
      const multiValue = Array.isArray(value) ? value : value ? [String(value)] : [];
      return (
        <GenericSelect
          id={field.key}
          aria-label={label}
          options={options}
          value={multiValue}
          onValueChange={(val: string | string[]) => onChange(Array.isArray(val) ? val : [val])}
          placeholder={placeholder || t("components.multiSelect.placeholder")}
          type="multi"
          searchable={true}
          required={field.isRequired}
          aria-invalid={invalid || undefined}
          className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
        />
      );
    }

    // 4. Date Picker
    if (field.isDate) {
      return (
        <DatePicker
          id={field.key}
          type="date"
          value={typeof value === "string" ? value.split("T")[0] : ""}
          onChange={(v) => onChange(v)}
          placeholder={placeholder || label}
          required={field.isRequired}
          aria-invalid={invalid || undefined}
          className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
        />
      );
    }

    // 5. DateTime Picker
    if (field.isDateTime) {
      return (
        <DatePicker
          id={field.key}
          type="datetime-local"
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
          placeholder={placeholder || label}
          required={field.isRequired}
          aria-invalid={invalid || undefined}
          className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
        />
      );
    }

    // 6. Long Text / Textarea
    if (field.isTextarea) {
      return (
        <Textarea
          id={field.key}
          value={value !== undefined && value !== null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ""}
          rows={3}
          aria-invalid={invalid || undefined}
          className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
        />
      );
    }

    // 7. Phone Number Input
    if (field.isPhone) {
      return (
        <PhoneInput
          value={typeof value === "string" ? value : ""}
          onChange={(v) => onChange(v)}
          defaultCountry="SA"
        />
      );
    }

    // 8. Number Input
    if (field.isNumber) {
      return (
        <Input
          id={field.key}
          type="number"
          value={value !== undefined && value !== null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          placeholder={placeholder || ""}
          aria-invalid={invalid || undefined}
          className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
        />
      );
    }

    // 9. Email Input
    if (field.isEmail) {
      return (
        <Input
          id={field.key}
          type="email"
          value={value !== undefined && value !== null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ""}
          aria-invalid={invalid || undefined}
          className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
        />
      );
    }

    // 10. URL Input
    if (field.isUrl) {
      return (
        <Input
          id={field.key}
          type="url"
          value={value !== undefined && value !== null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://..."}
          aria-invalid={invalid || undefined}
          className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
        />
      );
    }

    // 11. Default Text Input
    return (
      <Input
        id={field.key}
        type="text"
        value={value !== undefined && value !== null ? String(value) : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        aria-invalid={invalid || undefined}
        className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
      />
    );
  };

  return (
    <div className={cn("space-y-1.5", field.isTextarea && "sm:col-span-2")}>
      {!field.isBoolean && (
        <div className="flex items-center justify-between">
          <Label htmlFor={field.key} className="flex items-center gap-1 text-xs font-medium">
            <span>{label}</span>
            {field.isRequired && <span className="text-destructive">*</span>}
          </Label>
          {isSensitive && (
            <Badge
              variant="secondary"
              className="gap-1 border border-border bg-muted/40 px-1.5 py-0 text-[10px] text-muted-foreground font-normal"
            >
              <Lock className="h-2.5 w-2.5" />
              <span>Encrypted</span>
            </Badge>
          )}
        </div>
      )}
      {renderControl()}
      {invalid && error && (
        <p className="flex items-center gap-1 text-xs text-destructive mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Launch Celebration Card (Stage 4) — Clean, enterprise-grade summary.
 */
export interface LaunchCelebrationCardProps {
  tenantName?: string;
  tenantCode?: string;
  adminUsername?: string;
  adminName: string;
  adminEmail?: string;
  profileImageUrl?: string;
}

export function LaunchCelebrationCard({
  tenantName,
  tenantCode,
  adminUsername,
  adminName,
  adminEmail,
  profileImageUrl,
}: LaunchCelebrationCardProps) {
  const { t } = useI18n();
  const router = useRouter();

  const initials =
    adminName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "SA";

  return (
    <Card className="w-full max-w-lg border border-border bg-card shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="text-center pb-2 pt-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          {t("auth.accountSetup.welcomeTitle", { tenant: tenantName || BRAND.name })}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          {t("auth.accountSetup.welcomeSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-2 pb-8 px-6 sm:px-8">
        {/* Administrator Credentials Summary Box */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar className="h-12 w-12 border border-border shadow-xs shrink-0">
              {profileImageUrl ? (
                <AvatarImage src={profileImageUrl} alt={adminName} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-foreground text-sm truncate">
                  {adminName || "Administrator"}
                </span>
                {adminUsername && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-mono px-1.5 py-0 shrink-0 max-w-[140px] truncate"
                  >
                    @{adminUsername}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs min-w-0">
            <div className="space-y-0.5 min-w-0">
              <span className="text-muted-foreground">{t("auth.accountSetup.organization")}</span>
              <p className="font-medium text-foreground truncate">{tenantName || "—"}</p>
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-muted-foreground">Assigned Role</span>
              <p className="font-medium text-foreground flex items-center gap-1 truncate">
                <Shield className="h-3 w-3 text-primary shrink-0" />
                <span className="truncate">{t("auth.accountSetup.superAdminRole")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-xs text-muted-foreground">
          {t("auth.accountSetup.securityNotice")}
        </p>

        {/* Launch Workspace CTA */}
        <Button
          size="lg"
          className="w-full gap-2 font-semibold shadow-xs"
          onClick={() => {
            const redirectUrl = adminEmail
              ? `/login?email=${encodeURIComponent(adminEmail)}`
              : "/login";
            router.push(redirectUrl);
          }}
        >
          <span>{t("auth.accountSetup.enterWorkspace")}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Full-screen branded page layout for onboarding and account activation screens.
 */
export interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-8 sm:py-12 selection:bg-primary/20">
      <div className="absolute end-4 sm:end-6 top-4 sm:top-6 z-20 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <Image
            src="/brand/app-logo-1024.png"
            alt={`${BRAND.name} Logo`}
            width={48}
            height={48}
            priority
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {BRAND.name} OS
        </span>
      </div>

      {children}

      <p className="mt-8 text-[11px] font-medium text-muted-foreground/50 text-center">
        © {new Date().getFullYear()} {BRAND.name} — Sports Operations OS
      </p>
    </div>
  );
}
