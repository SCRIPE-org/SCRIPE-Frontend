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
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4"
      dir={direction}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Header Card */}
        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 ring-2 ring-warning/20">
              <ShieldAlert className="h-8 w-8 text-warning" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("profile.security.changePassword")}
            </h1>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              {t("admin.forceChangePassword.description") ||
                "Your administrator requires you to change your password before continuing."}
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
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {strengthItems.map((item) => (
                    <span
                      key={item.label}
                      className={cn(
                        "flex items-center gap-1 text-xs transition-colors",
                        item.met ? "text-success" : "text-muted-foreground"
                      )}
                    >
                      {item.met ? "✓" : "○"} {item.label}
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
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {t("common.logout")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
