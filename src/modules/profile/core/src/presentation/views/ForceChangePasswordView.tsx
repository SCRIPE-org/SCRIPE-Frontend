"use client";

/**
 * ForceChangePasswordView — Full-page password change enforced by MCP middleware
 *
 * Displayed when an admin logs in with mustChangePassword=true.
 * After a successful password change, clears the store flag and
 * redirects to the home page.
 *
 * Uses the same PasswordChangeForm component from profile to maintain
 * consistency, but wraps it in a standalone centered layout.
 */
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { useServices } from "@core/providers/service-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { Eye, EyeOff, ShieldAlert, LogOut } from "lucide-react";

export function ForceChangePasswordView() {
  const { t, direction } = useI18n();
  const router = useRouter();
  const setMustChangePassword = useAppStore((state) => state.setMustChangePassword);
  const setAuth = useAppStore((state) => state.setAuth);
  const setSubscriptionInfo = useAppStore((state) => state.setSubscriptionInfo);
  const logout = useAppStore((state) => state.logout);
  const { operationSuccess, operationError } = useEnhancedToast();
  const queryClient = useQueryClient();
  const { profileRepository } = container;
  const { authRepository } = useServices();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Password strength
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isValid =
    hasMinLength &&
    hasUppercase &&
    hasNumber &&
    hasSpecial &&
    passwordsMatch &&
    currentPassword.length > 0;

  const strengthItems = [
    { met: hasMinLength, label: t("profile.security.strength.minLength") },
    { met: hasUppercase, label: t("profile.security.strength.uppercase") },
    { met: hasNumber, label: t("profile.security.strength.number") },
    { met: hasSpecial, label: t("profile.security.strength.special") },
  ];

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // Step 1: Change the password on the backend.
        // This clears MustChangePassword=false in the DB, but the current JWT still has mcp=true.
        await profileRepository.changePassword({
          currentPassword,
          newPassword,
        });

        // Step 2: Refresh the token to get a NEW JWT without the mcp=true claim.
        // This is critical — using the old token would still be blocked by the MCP middleware.
        const refreshResult = await authRepository.refreshToken();
        if (refreshResult.kind === "ok") {
          const refreshData = refreshResult.value;
          // Update subscription info from fresh token
          setSubscriptionInfo(
            refreshData.subscriptionStatus ?? null,
            refreshData.gracePhase ?? null,
            refreshData.editionName ?? null
          );

          // Step 3: Fetch current user state with the new token
          try {
            const user = await authRepository.getMe();
            if (user) {
              setAuth(user, user.permissions || [], []);
            }
          } catch {
            /* non-critical — store still updated */
          }
        }

        // Step 4: NOW clear MCP in the store — after the new token is in memory.
        // NavigationProvider will now fire /Menus/my with the clean token (no mcp claim).
        setMustChangePassword(false);

        operationSuccess(t("profile.security.passwordChanged"));

        // v2: NavigationProvider auto-fetches when mustChangePassword becomes false
        queryClient.invalidateQueries();

        // Step 6: Redirect to home
        router.replace("/");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Password change failed";
        setSubmitError(msg);
        operationError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isValid,
      currentPassword,
      newPassword,
      profileRepository,
      authRepository,
      setMustChangePassword,
      setAuth,
      setSubscriptionInfo,
      operationSuccess,
      operationError,
      router,
      t,
      queryClient,
    ]
  );

  const handleLogout = useCallback(() => {
    logout();
    router.replace("/login");
  }, [logout, router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4"
      dir={direction}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Header Card */}
        <div className="rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 ring-2 ring-amber-500/20">
              <ShieldAlert className="h-8 w-8 text-amber-500" />
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
                        item.met ? "text-emerald-600" : "text-muted-foreground"
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
