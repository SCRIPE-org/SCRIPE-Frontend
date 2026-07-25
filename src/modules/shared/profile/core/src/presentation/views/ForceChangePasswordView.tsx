// UI-EXCEPTION: compact studio layout
"use client";

/**
 * ForceChangePasswordView — Full-page password change enforced by MCP middleware
 *
 * Displayed when an admin logs in with mustChangePassword=true.
 * After a successful password change, clears the store flag and
 * redirects to the home page.
 *
 * Uses useForceChangePasswordViewModel to manage state and actions.
 */
import React from "react";
import { useForceChangePasswordViewModel } from "../viewmodels/useForceChangePasswordViewModel";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { cn } from "@core/common/utils";
import { Eye, EyeOff, ShieldAlert, LogOut } from "lucide-react";

/**
 * Presentation UI component rendering the force change password view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ForceChangePasswordView() {
  const {
    t,
    direction,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrent,
    setShowCurrent,
    showNew,
    setShowNew,
    isSubmitting,
    submitError,
    strengthItems,
    passwordsMatch,
    isValid,
    handleSubmit,
    handleLogout,
  } = useForceChangePasswordViewModel();

  return (
    <div className="flex min-h-screen items-center justify-center bg-nx-ground p-4" dir={direction}>
      <div className="w-full max-w-md space-y-6">
        {/* Header Card */}
        <Card className="p-8 shadow-nx-modal">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-warning/30 bg-warning/10">
              <ShieldAlert className="h-8 w-8 text-warning" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-nx-ink">
              {t("profile.security.changePassword")}
            </h1>
            <p className="mt-2 max-w-xs text-sm text-nx-ink-2">
              {t("admin.forceChangePassword.description")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="force-current-password">
                {t("profile.security.currentPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="force-current-password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pe-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  aria-label={
                    showCurrent
                      ? t("profile.security.hidePassword")
                      : t("profile.security.showPassword")
                  }
                  className={cn(
                    "absolute end-3 top-1/2 -translate-y-1/2 text-nx-ink-3 hover:text-nx-ink",
                    "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:shadow-nx-focus"
                  )}
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="force-new-password">{t("profile.security.newPassword")}</Label>
              <div className="relative">
                <Input
                  id="force-new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  aria-label={
                    showNew ? t("profile.security.hidePassword") : t("profile.security.showPassword")
                  }
                  className={cn(
                    "absolute end-3 top-1/2 -translate-y-1/2 text-nx-ink-3 hover:text-nx-ink",
                    "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:shadow-nx-focus"
                  )}
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {strengthItems.map((item) => (
                    <span
                      key={item.label}
                      className={cn(
                        "flex items-center gap-1 text-xs transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                        item.met ? "text-success" : "text-nx-ink-3"
                      )}
                    >
                      <span aria-hidden="true">{item.met ? "✓" : "○"}</span> {item.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="force-confirm-password">
                {t("profile.security.confirmPassword")}
              </Label>
              <Input
                id="force-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">{t("profile.security.passwordMismatch")}</p>
              )}
            </div>

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <Button type="submit" loading={isSubmitting} disabled={!isValid} className="w-full">
              {t("profile.security.updatePassword")}
            </Button>
          </form>

          {/* Logout option */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-2 text-sm text-nx-ink-3 hover:text-nx-ink",
                "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:shadow-nx-focus"
              )}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t("common.logout")}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
