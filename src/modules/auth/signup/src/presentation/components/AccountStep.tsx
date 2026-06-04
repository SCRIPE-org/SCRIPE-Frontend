"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";

interface AccountStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
}

const STRENGTH_LABELS = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

export function AccountStep({ vm }: AccountStepProps) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ animation: "sxScreenIn 0.4s ease-out" }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1
          className="text-2xl font-bold"
          style={{
            background: "linear-gradient(180deg, #F5F2FF 0%, #C7B8F0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Create your workspace
        </h1>
        <p className="mt-2 text-sm" style={{ color: "rgba(245,242,255,0.62)" }}>
          Get started with Scripe in under 2 minutes
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          vm.submitAccount();
        }}
        className="space-y-4"
      >
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signup-fullname"
            className="text-xs font-medium"
            style={{ color: "rgba(245,242,255,0.62)" }}
          >
            Full name
          </Label>
          <Input
            id="signup-fullname"
            type="text"
            placeholder="John Doe"
            value={vm.wizardData.fullName}
            onChange={(e) => vm.updateField("fullName", e.target.value)}
            autoComplete="name"
            autoFocus
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
              color: "#F5F2FF",
            }}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signup-email"
            className="text-xs font-medium"
            style={{ color: "rgba(245,242,255,0.62)" }}
          >
            Work email
          </Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@company.com"
            value={vm.wizardData.email}
            onChange={(e) => vm.updateField("email", e.target.value)}
            autoComplete="email"
            className="h-11"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
              color: "#F5F2FF",
            }}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signup-password"
            className="text-xs font-medium"
            style={{ color: "rgba(245,242,255,0.62)" }}
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 12 characters"
              value={vm.wizardData.password}
              onChange={(e) => vm.updatePassword(e.target.value)}
              autoComplete="new-password"
              className="h-11 pr-10"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "#F5F2FF",
              }}
            />
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 h-auto -translate-y-1/2 p-0 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {/* Password Strength Meter */}
          {vm.wizardData.password.length > 0 && (
            <div className="space-y-1" style={{ animation: "sxRise 0.3s ease-out" }}>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i < vm.passwordStrength
                          ? STRENGTH_COLORS[vm.passwordStrength - 1]
                          : "rgba(255,255,255,0.06)",
                    }}
                  />
                ))}
              </div>
              <p
                className="text-[10px] font-medium"
                style={{
                  color: STRENGTH_COLORS[vm.passwordStrength - 1] || "rgba(245,242,255,0.4)",
                }}
              >
                {vm.passwordStrength > 0 ? STRENGTH_LABELS[vm.passwordStrength - 1] : ""}
              </p>
            </div>
          )}
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer select-none items-start gap-2 pt-1">
          <div
            role="checkbox"
            aria-checked={vm.wizardData.acceptTerms}
            tabIndex={0}
            onClick={() =>
              !vm.isLoading && vm.updateField("acceptTerms", !vm.wizardData.acceptTerms)
            }
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                if (!vm.isLoading) vm.updateField("acceptTerms", !vm.wizardData.acceptTerms);
              }
            }}
            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded transition-all"
            style={{
              background: vm.wizardData.acceptTerms
                ? "linear-gradient(135deg, #A855F7, #3B82F6)"
                : "transparent",
              border: vm.wizardData.acceptTerms
                ? "1px solid transparent"
                : "1px solid rgba(255, 255, 255, 0.15)",
              cursor: vm.isLoading ? "default" : "pointer",
              opacity: vm.isLoading ? 0.5 : 1,
            }}
          >
            {vm.wizardData.acceptTerms && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <span className="text-xs leading-5" style={{ color: "rgba(245,242,255,0.55)" }}>
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline transition-colors hover:no-underline"
              style={{ color: "#C4B5FD" }}
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline transition-colors hover:no-underline"
              style={{ color: "#C4B5FD" }}
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </a>
          </span>
        </label>

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

        {/* Submit */}
        <Button
          type="submit"
          disabled={vm.isLoading}
          className="relative h-12 w-full overflow-hidden rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60"
          style={{
            background:
              "linear-gradient(180deg, #A855F7 0%, #7C3AED 40%, #4F46E5 75%, #3B82F6 100%)",
            boxShadow: "0 4px 15px -3px rgba(124,58,237,0.4)",
          }}
        >
          {vm.isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {/* Login link */}
        <p className="text-center text-xs" style={{ color: "rgba(245,242,255,0.55)" }}>
          Already have an account?{" "}
          <Button
            variant="link"
            type="button"
            onClick={vm.goToLogin}
            className="h-auto p-0 font-medium underline transition-colors hover:no-underline"
            style={{ color: "#C4B5FD" }}
          >
            Sign in
          </Button>
        </p>
      </form>
    </div>
  );
}
