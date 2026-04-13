/**
 * CreateTenantView — Premium Multi-Step Wizard
 *
 * A dedicated stepper page for creating a new tenant with:
 * Step 1: Organization info (name, code, description)
 * Step 2: Administrator setup (email, username)
 * Step 3: Plan & billing (edition, subscription type, promo code, skip payment)
 *
 * After successful creation, auto-navigates to the tenant detail page.
 *
 * Clean Architecture: View → ViewModel → Repository
 *
 * @module tenants
 */
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { cn } from "@core/common/utils";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { GenericSelect } from "@core/crud/components/generic-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@core/ui/tooltip";
import {
  Building2,
  UserPlus,
  CreditCard,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Mail,
  Copy,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
  Shield,
} from "lucide-react";

import {
  useCreateTenantViewModel,
  STEPS,
  type StepId,
} from "../viewmodels/useCreateTenantViewModel";

// ─────────────────────────────────────────
// Step Icons
// ─────────────────────────────────────────

const STEP_ICONS = {
  1: Building2,
  2: UserPlus,
  3: CreditCard,
};

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export function CreateTenantView() {
  useModuleLocales(() => import("../../../locales"), "tenants");

  const searchParams = useSearchParams();
  const parentId = searchParams.get("parentId") || undefined;
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";
  const vm = useCreateTenantViewModel({ defaultParentId: parentId });

  // ── Success state ──
  if (vm.result) {
    return <SuccessScreen vm={vm} t={t} direction={direction} />;
  }

  return (
    <div className="mx-auto max-w-3xl py-6 px-4" dir={direction}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("tenant.createTitle") || "Create New Tenant"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("tenant.createSubtitle") || "Set up a new organization with an administrator and subscription plan."}
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={vm.currentStep}
        isStepValid={vm.isStepValid}
        goToStep={vm.goToStep}
        t={t}
        isRtl={isRtl}
      />

      {/* Step Content */}
      <div className="mt-8 rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {vm.currentStep === 1 && <Step1Organization vm={vm} t={t} />}
          {vm.currentStep === 2 && <Step2Administrator vm={vm} t={t} />}
          {vm.currentStep === 3 && <Step3Plan vm={vm} t={t} />}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-6 py-4 md:px-8">
          <Button
            variant="ghost"
            onClick={vm.goBack}
            disabled={vm.currentStep === 1}
            className="gap-2"
          >
            {isRtl ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            {t("common.back") || "Back"}
          </Button>

          {vm.currentStep < 3 ? (
            <Button
              onClick={vm.goNext}
              disabled={!vm.canProceed}
              className="gap-2"
            >
              {t("common.next") || "Next"}
              {isRtl ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button
              onClick={vm.handleSubmit}
              disabled={vm.isSubmitting || !vm.canProceed}
              className="gap-2 min-w-[160px]"
            >
              {vm.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.creating") || "Creating..."}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {t("tenant.createTenant") || "Create Tenant"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────

function StepIndicator({
  currentStep,
  isStepValid,
  goToStep,
  t,
  isRtl,
}: {
  currentStep: StepId;
  isStepValid: (step: StepId) => boolean;
  goToStep: (step: StepId) => void;
  t: (key: string) => string;
  isRtl: boolean;
}) {
  const stepLabels: Record<number, string> = {
    1: t("tenant.stepOrganization") || "Organization",
    2: t("tenant.stepAdministrator") || "Administrator",
    3: t("tenant.stepPlan") || "Plan & Billing",
  };

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const Icon = STEP_ICONS[step.id];
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep || (step.id < 3 && isStepValid(step.id));
        const isClickable = step.id <= currentStep || isStepValid((step.id - 1) as StepId);

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && goToStep(step.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 cursor-pointer group",
                isActive && "bg-primary/10 ring-1 ring-primary/30 shadow-sm",
                !isActive && isCompleted && "hover:bg-muted/60",
                !isActive && !isCompleted && "opacity-50 cursor-not-allowed"
              )}
              disabled={!isClickable}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
                  isActive && "bg-primary text-primary-foreground shadow-md",
                  isCompleted && !isActive && "bg-green-500/15 text-green-600",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="hidden sm:block text-start">
                <p
                  className={cn(
                    "text-xs font-medium uppercase tracking-wider",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {t("common.step") || "Step"} {step.id}
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {stepLabels[step.id]}
                </p>
              </div>
            </button>

            {idx < STEPS.length - 1 && (
              <div className="hidden sm:flex flex-1 items-center px-2">
                <div
                  className={cn(
                    "h-px flex-1 transition-colors duration-500",
                    step.id < currentStep
                      ? "bg-green-500/50"
                      : "bg-border/50"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// Step 1: Organization
// ─────────────────────────────────────────

function Step1Organization({ vm, t }: { vm: ReturnType<typeof useCreateTenantViewModel>; t: (key: string) => string }) {
  const touched = vm.stepTouched[1];
  const errors = vm.stepErrors[1];
  const nameError = touched && errors.includes("name");
  const codeError = touched && errors.includes("code");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t("tenant.stepOrganization") || "Organization"}</h2>
          <p className="text-sm text-muted-foreground">
            {t("tenant.stepOrganizationDesc") || "Basic information about the new tenant."}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tenant-name" className="text-sm font-medium">
            {t("tenant.name") || "Tenant Name"} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tenant-name"
            value={vm.form.name}
            onChange={(e) => vm.updateField("name", e.target.value)}
            placeholder={t("tenant.namePlaceholder") || "e.g. Acme Corporation"}
            className={cn("h-11", nameError && "border-destructive")}
            autoFocus
          />
          {nameError && (
            <p className="text-xs text-destructive">{t("validation.invalidName") || "Tenant name is required."}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenant-code" className="text-sm font-medium">
            {t("tenant.code") || "Tenant Code"} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tenant-code"
            value={vm.form.code}
            onChange={(e) => vm.updateField("code", e.target.value.toUpperCase())}
            placeholder={t("tenant.codePlaceholder") || "Auto-generated from name"}
            className={cn("h-11 font-mono uppercase", codeError && "border-destructive")}
            maxLength={50}
          />
          {codeError ? (
            <p className="text-xs text-destructive">{t("validation.invalidCode") || "Tenant code is required."}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("tenant.codeHint") || "Unique identifier. Auto-generated from name."}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant-description" className="text-sm font-medium">
          {t("tenant.description") || "Description"}
        </Label>
        <Textarea
          id="tenant-description"
          value={vm.form.description}
          onChange={(e) => vm.updateField("description", e.target.value)}
          placeholder={t("tenant.descriptionPlaceholder") || "Brief description of the organization..."}
          className="min-h-[80px] resize-none"
          maxLength={500}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Step 2: Administrator
// ─────────────────────────────────────────

function Step2Administrator({ vm, t }: { vm: ReturnType<typeof useCreateTenantViewModel>; t: (key: string) => string }) {
  const touched = vm.stepTouched[2];
  const errors = vm.stepErrors[2];
  const emailEmpty = touched && errors.includes("adminEmail");
  const emailFormatError = errors.includes("adminEmailFormat");
  const emailError = emailEmpty || emailFormatError;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
          <UserPlus className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t("tenant.stepAdministrator") || "Administrator"}</h2>
          <p className="text-sm text-muted-foreground">
            {t("tenant.stepAdministratorDesc") || "Set up the initial admin account for this tenant."}
          </p>
        </div>
      </div>

      {/* Info callout */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-500/5 border border-blue-500/20 p-4">
        <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            {t("tenant.secureOnboarding") || "Secure Onboarding"}
          </p>
          {t("tenant.secureOnboardingDesc") ||
            "The admin will receive a secure email with a one-time link to set their password. The account remains locked until they complete the setup."}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admin-email" className="text-sm font-medium">
            {t("tenant.adminEmail") || "Admin Email"} <span className="text-destructive">*</span>
          </Label>
          <div className="relative" dir="ltr">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="admin-email"
              type="email"
              value={vm.form.adminEmail}
              onChange={(e) => vm.updateField("adminEmail", e.target.value)}
              placeholder="admin@company.com"
              className={cn("h-11 pl-10 text-left", emailError && "border-destructive")}
              dir="ltr"
              autoFocus
            />
          </div>
          {emailEmpty && (
            <p className="text-xs text-destructive">
              {t("validation.invalidAdminEmail") || "Admin email is required."}
            </p>
          )}
          {emailFormatError && (
            <p className="text-xs text-destructive">
              {t("validation.invalidEmail") || "Please enter a valid email address."}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-username" className="text-sm font-medium">
            {t("tenant.adminUsername") || "Admin Username"}
          </Label>
          <Input
            id="admin-username"
            value={vm.form.adminUsername}
            onChange={(e) => vm.updateField("adminUsername", e.target.value)}
            placeholder={t("tenant.autoGenerated") || "Auto-generated from code"}
            className="h-11 font-mono text-left"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">
            {t("tenant.usernameHint") || "Leave blank to auto-generate from tenant code."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Step 3: Plan & Billing
// ─────────────────────────────────────────

function Step3Plan({ vm, t }: { vm: ReturnType<typeof useCreateTenantViewModel>; t: (key: string) => string }) {
  const isFreeEdition = vm.selectedEdition && (vm.selectedEdition as any).isFree;

  // Server-side search handler for GenericSelect
  const handleServerSearch = React.useCallback(
    async (query: string) => {
      const results = await vm.handleSearchEditions(query);
      return results.map((r) => ({ value: r.value, label: r.label }));
    },
    [vm.handleSearchEditions]
  );

  // Build initial options from cached editions
  const editionOptions = React.useMemo(
    () => vm.cachedEditions.map((ed) => ({ value: ed.id, label: ed.name })),
    [vm.cachedEditions]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <CreditCard className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t("tenant.stepPlan") || "Plan & Billing"}</h2>
          <p className="text-sm text-muted-foreground">
            {t("tenant.stepPlanDesc") || "Choose an edition and configure billing. This step is optional."}
          </p>
        </div>
      </div>

      {/* Edition — searchable GenericSelect with server search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t("tenant.edition") || "Edition"}</Label>
        <GenericSelect
          type="searchable"
          searchType="server"
          options={editionOptions}
          value={vm.form.editionId}
          onValueChange={(v: string | string[]) => vm.updateField("editionId", v as string)}
          onServerSearch={handleServerSearch}
          placeholder={t("tenant.searchEditions") || "Search editions..."}
          searchPlaceholder={t("tenant.searchEditions") || "Search editions..."}
          noResultsText={t("common.noResults") || "No editions found"}
        />
      </div>

      {/* Subscription Type & Currency */}
      {vm.form.editionId && (
        <div className="grid gap-5 sm:grid-cols-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("tenant.subscriptionType") || "Subscription Type"}</Label>
            <Select
              value={vm.form.subscriptionType}
              onValueChange={(v) => vm.updateField("subscriptionType", v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">{t("tenant.subscriptionTypes.monthly") || "Monthly"}</SelectItem>
                <SelectItem value="Yearly">{t("tenant.subscriptionTypes.yearly") || "Yearly"}</SelectItem>
                <SelectItem value="Lifetime">{t("tenant.subscriptionTypes.lifetime") || "Lifetime"}</SelectItem>
                <SelectItem value="Trial">{t("tenant.subscriptionTypes.trial") || "Trial"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("tenant.currency") || "Currency"}</Label>
            <Select
              value={vm.form.currency}
              onValueChange={(v) => vm.updateField("currency", v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="EGP">EGP (E£)</SelectItem>
                <SelectItem value="SAR">SAR (﷼)</SelectItem>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
                <SelectItem value="CNY">CNY (¥)</SelectItem>
                <SelectItem value="TRY">TRY (₺)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="BRL">BRL (R$)</SelectItem>
                <SelectItem value="KWD">KWD (د.ك)</SelectItem>
                <SelectItem value="QAR">QAR (ر.ق)</SelectItem>
                <SelectItem value="BHD">BHD (د.ب)</SelectItem>
                <SelectItem value="OMR">OMR (ر.ع)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Promo Code */}
      {vm.form.editionId && (
        <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <Label className="text-sm font-medium">{t("tenant.promoCode") || "Promo Code"}</Label>
          <Input
            value={vm.form.promoCode}
            onChange={(e) => vm.updateField("promoCode", e.target.value)}
            placeholder={t("tenant.promoCodePlaceholder") || "Enter promotional code (optional)"}
            className="h-11 font-mono uppercase"
          />
          {vm.availablePromotions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {vm.availablePromotions.map((promo) => (
                <Badge
                  key={promo.id}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => vm.updateField("promotionId", promo.id)}
                >
                  {promo.name} ({promo.type === "Percentage" ? `${promo.discountValue}%` : `$${promo.discountValue}`})
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skip Payment Toggle */}
      {vm.form.editionId && !isFreeEdition && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  {t("tenant.skipPayment") || "Skip Payment"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("tenant.skipPaymentDesc") || "Activates the subscription without payment processing. Use for demos or manual billing."}
                </p>
              </div>
            </div>
            <Switch
              checked={vm.form.skipPayment}
              onCheckedChange={(checked) => vm.updateField("skipPayment", checked)}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {vm.form.editionId && (
        <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-2 animate-in fade-in-0 duration-300">
          <h4 className="text-sm font-semibold mb-3">{t("tenant.summary") || "Summary"}</h4>
          <SummaryRow label={t("tenant.edition") || "Edition"} value={vm.selectedEdition?.name || "-"} />
          <SummaryRow label={t("tenant.subscriptionType") || "Billing"} value={vm.form.subscriptionType} />
          <SummaryRow label={t("tenant.currency") || "Currency"} value={vm.form.currency} />
          {vm.form.skipPayment && (
            <SummaryRow
              label={t("tenant.payment") || "Payment"}
              value={t("tenant.skipped") || "Skipped (Admin Override)"}
              highlight
            />
          )}
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", highlight && "text-amber-500")}>
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────
// Success Screen
// ─────────────────────────────────────────

function SuccessScreen({
  vm,
  t,
  direction,
}: {
  vm: ReturnType<typeof useCreateTenantViewModel>;
  t: (key: string) => string;
  direction: string;
}) {
  const result = vm.result!;

  return (
    <div className="mx-auto max-w-lg py-12 px-4" dir={direction}>
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 animate-in zoom-in-50 duration-500">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-100">
          {t("tenant.created") || "Tenant Created Successfully!"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-200">
          {t("tenant.setupEmailSent") || "An account setup email has been sent to the admin."}
        </p>
      </div>

      <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
        {/* Admin details card */}
        <div className="rounded-xl bg-card border border-border/60 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{t("tenant.adminEmail") || "Email"}:</span>
            <span className="font-medium">{result.adminEmail}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{t("tenant.adminUsername") || "Username"}:</span>
            <span className="font-medium font-mono">{result.adminUsername}</span>
          </div>
        </div>

        {/* Setup URL card */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-5">
          <p className="text-xs text-muted-foreground mb-2.5">
            {t("tenant.setupUrlLabel") || "Account Setup Link (valid 24 hours):"}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs truncate bg-muted/50 rounded-lg px-3 py-2 border border-border/50 font-mono">
              {result.accountSetupUrl}
            </code>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    onClick={() => navigator.clipboard.writeText(result.accountSetupUrl)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("common.copy") || "Copy"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="icon" className="shrink-0 h-9 w-9" asChild>
              <a href={result.accountSetupUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Navigate to detail button */}
        <Button className="w-full h-12 gap-2 text-base" onClick={vm.navigateToDetail}>
          {t("tenant.viewTenantDetails") || "View Tenant Details"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
