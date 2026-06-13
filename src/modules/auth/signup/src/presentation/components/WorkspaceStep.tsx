"use client";

import { useCallback } from "react";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { ArrowLeft, ArrowRight, Globe, Loader2, Check, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";
import { BRAND } from "@core/config/branding";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";

interface WorkspaceStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
}

export function WorkspaceStep({ vm }: WorkspaceStepProps) {
  const { t, direction } = useI18n();
  const { subdomainResult, isCheckingSubdomain } = vm;

  // Auto-generate subdomain from workspace name
  const handleNameChange = useCallback(
    (name: string) => {
      vm.updateField("workspaceName", name);
      // Auto-derive subdomain: lowercase, replace spaces with hyphens, strip special chars
      const auto = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 63);
      if (auto) {
        vm.checkSubdomain(auto);
      }
    },
    [vm]
  );

  const subdomainStatus = (() => {
    if (isCheckingSubdomain) return "checking";
    if (!subdomainResult) return "idle";
    if (subdomainResult.available) return "available";
    return "unavailable";
  })();

  // a11y: icons are decorative here — the text messages below the input carry the meaning
  const subdomainStatusIcon = {
    idle: null,
    checking: (
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" style={{ color: "rgba(245,242,255,0.4)" }} />
    ),
    available: <Check className="h-4 w-4" aria-hidden="true" style={{ color: "#10B981" }} />,
    unavailable: <X className="h-4 w-4" aria-hidden="true" style={{ color: "#ef4444" }} />,
  }[subdomainStatus];

  return (
    <div dir={direction}>
      {/* Header */}
      <div className="mb-6 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(168,85,247,0.15) 0%, rgba(99,102,241,0.1) 100%)",
            border: "1px solid rgba(168,85,247,0.2)",
            animation: "sxPop 0.5s ease-out 0.15s both",
          }}
        >
          <Globe className="h-6 w-6" style={{ color: "#C4B5FD" }} />
        </div>

        <h1
          className="text-xl font-bold"
          style={{
            background: BRAND_TOKENS.gradient.heroText,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("signup.workspace.title") || "Set up your workspace"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
          {t("signup.workspace.subtitle") || "Your team's home on Scripe"}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          vm.submitWorkspace();
        }}
        className="space-y-4"
      >
        {/* Workspace Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signup-workspace"
            className="text-xs font-medium"
            style={{ color: "rgba(245,242,255,0.62)" }}
          >
            {t("signup.workspace.orgName") || "Organization name"}
          </Label>
          <Input
            id="signup-workspace"
            type="text"
            placeholder={t("signup.workspace.orgNamePlaceholder") || "Acme Inc."}
            value={vm.wizardData.workspaceName}
            onChange={(e) => handleNameChange(e.target.value)}
            autoFocus
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: BRAND_TOKENS.border.input,
              color: BRAND_TOKENS.text.primary,
            }}
          />
        </div>

        {/* Subdomain */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signup-subdomain"
            className="text-xs font-medium"
            style={{ color: BRAND_TOKENS.text.secondary }}
          >
            {t("signup.workspace.workspaceUrl") || "Workspace URL"}
          </Label>
          <div className="flex items-center gap-0" dir="ltr">
            <div className="relative flex-1">
              <Input
                id="signup-subdomain"
                type="text"
                placeholder={t("signup.workspace.subdomainPlaceholder") || "acme"}
                value={vm.wizardData.subdomain}
                onChange={(e) => vm.checkSubdomain(e.target.value.toLowerCase())}
                className="h-11 rounded-r-none pr-9"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor:
                    subdomainStatus === "available"
                      ? "rgba(16,185,129,0.4)"
                      : subdomainStatus === "unavailable"
                        ? "rgba(239,68,68,0.4)"
                        : BRAND_TOKENS.border.input,
                  color: BRAND_TOKENS.text.primary,
                  transition: "border-color 0.2s",
                }}
              />
              {/* Status icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">{subdomainStatusIcon}</div>
            </div>
            <div
              className="flex h-11 items-center rounded-r-lg border border-l-0 px-3 text-xs font-medium"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: BRAND_TOKENS.border.input,
                color: BRAND_TOKENS.text.tertiary,
              }}
            >
              {BRAND.domain}
            </div>
          </div>

          {/* Subdomain status message — role=alert so screen readers announce it immediately */}
          {subdomainResult && !subdomainResult.available && (
            <p
              role="alert"
              className="text-[11px] font-medium"
              style={{ color: "#fca5a5" }}
            >
              {subdomainResult.reason === "taken"
                ? t("signup.workspace.subdomainTaken") || "This subdomain is already taken."
                : subdomainResult.reason === "reserved"
                  ? t("signup.workspace.subdomainReserved") || "This subdomain is reserved."
                  : t("signup.workspace.subdomainInvalid") ||
                    "Invalid format. Use lowercase letters, numbers, and hyphens."}
              {subdomainResult.suggestion && (
                <Button
                  variant="link"
                  type="button"
                  onClick={() => vm.checkSubdomain(subdomainResult.suggestion!)}
                  className="mx-1 h-auto p-0 underline hover:no-underline"
                  style={{ color: "#C4B5FD" }}
                >
                  {t("signup.workspace.trySuggestion", { suggestion: subdomainResult.suggestion }) ||
                    `Try "${subdomainResult.suggestion}"?`}
                </Button>
              )}
            </p>
          )}
          {subdomainStatus === "available" && vm.wizardData.subdomain && (
            <p
              aria-live="polite"
              className="text-[11px] font-medium"
              style={{ color: "#10B981" }}
            >
              {/* a11y: ✓ is decorative — the text already conveys availability */}
              <span aria-hidden="true">✓ </span>
              {t("signup.workspace.subdomainAvailable", { subdomain: vm.wizardData.subdomain }) ||
                `${vm.wizardData.subdomain}.${BRAND.domain} is available!`}
            </p>
          )}
        </div>

        {/* Admin Username */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signup-username"
              className="text-xs font-medium"
              style={{ color: BRAND_TOKENS.text.secondary }}
            >
              {t("signup.workspace.adminUsername") || "Admin username"}
            </Label>
            <span className="text-[10px]" style={{ color: BRAND_TOKENS.text.tertiary }}>
              {t("signup.common.optional") || "Optional"}
            </span>
          </div>
          <Input
            id="signup-username"
            type="text"
            placeholder={t("signup.workspace.adminUsernamePlaceholder") || "admin"}
            value={vm.wizardData.username}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
              vm.updateField("username", val);
            }}
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: BRAND_TOKENS.border.input,
              color: BRAND_TOKENS.text.primary,
            }}
          />
          <p
            className="animate-sxRise text-[11px] font-medium leading-relaxed"
            style={{ color: "rgba(245,242,255,0.45)" }}
          >
            {t("signup.workspace.usernameHint") || "Your final login username will be: "}{" "}
            <span className="font-mono" style={{ color: "#D8B4FE" }}>
              {vm.wizardData.subdomain ? vm.wizardData.subdomain.toUpperCase() : "[subdomain]"}_
              {vm.wizardData.username ? vm.wizardData.username.toLowerCase() : "admin"}
            </span>
          </p>
        </div>

        {/* Error */}
        {vm.error && (
          <div
            className="rounded-lg px-3 py-2 text-xs font-medium"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#fca5a5",
              animation: "sxRise 0.3s ease-out",
            }}
          >
            {vm.error}
          </div>
        )}

        {/* Actions */}
        <Button
          type="submit"
          disabled={
            vm.isLoading ||
            !vm.wizardData.workspaceName.trim() ||
            vm.wizardData.subdomain.length < 3 ||
            (subdomainResult !== null && !subdomainResult.available)
          }
          aria-busy={vm.isLoading}
          className="relative h-12 w-full overflow-hidden rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60"
          style={{
            background: BRAND_TOKENS.gradient.cta,
            boxShadow: BRAND_TOKENS.shadow.cta,
          }}
        >
          {vm.isLoading ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="sr-only">{t("signup.common.loading") || "Loading…"}</span>
            </>
          ) : (
            <>
              {t("signup.workspace.createWorkspace") || "Create workspace"}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </>
          )}
        </Button>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            type="button"
            onClick={vm.goBack}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: "rgba(245,242,255,0.55)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            {t("signup.workspace.back") || "Back"}
          </Button>
        </div>
      </form>
    </div>
  );
}
