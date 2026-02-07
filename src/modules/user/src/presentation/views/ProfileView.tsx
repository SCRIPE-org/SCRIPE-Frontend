"use client";

/**
 * Profile View
 *
 * Pure UI composition - All logic is in useProfileViewModel.
 * SOLID Compliant: Single Responsibility - renders sections only.
 *
 * View → ViewModel only (~60 lines max)
 */

import React from "react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import { useProfileViewModel } from "../viewmodels/useUserViewModel";
import { ProfileHeaderSection } from "../components/ProfileHeaderSection";
import { ProfileInfoSection } from "../components/ProfileInfoSection";
import { PasswordSection } from "../components/PasswordSection";
import { useImpersonation } from "@modules/auth/hooks/useImpersonation";

export function ProfileView() {
  const vm = useProfileViewModel();

  // Loading state
  if (vm.profileLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (vm.profileError && !vm.profile) {
    return <ErrorMessage message={vm.profileError} onRetry={vm.fetchProfile} />;
  }

  // Check impersonation status
  const { isImpersonating } = useImpersonation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Impersonation Warning Banner */}
      {isImpersonating && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-full">
              <span className="text-xl">🎭</span>
            </div>
            <div>
              <h3 className="text-amber-500 font-semibold">Viewing as Impersonator</h3>
              <p className="text-amber-500/80 text-sm">
                To protect user privacy, sensitive information is hidden and editing is disabled.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Profile Header */}
      <ProfileHeaderSection profile={vm.profile} />

      {/* Profile Management Forms */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information Form */}
          {isImpersonating ? (
            <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Profile Information</h3>
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="p-4 rounded-full bg-muted/50">
                  <span className="text-2xl text-muted-foreground">🔒</span>
                </div>
                <h4 className="font-medium text-foreground">Hidden for Privacy</h4>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Personal details like email and phone are masked while impersonating.
                </p>
              </div>
            </div>
          ) : (
            <ProfileInfoSection
              formData={vm.profileFormData}
              isLoading={vm.profileUpdateLoading}
              isSuccess={vm.profileSuccess}
              error={vm.profileUpdateError}
              isFormValid={vm.isProfileFormValid}
              onFieldChange={vm.updateProfileField}
              onSubmit={vm.updateProfile}
            />
          )}

          {/* Password Change Form */}
          {isImpersonating ? (
            <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Security Settings</h3>
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="p-4 rounded-full bg-muted/50">
                  <span className="text-2xl text-muted-foreground">🛡️</span>
                </div>
                <h4 className="font-medium text-foreground">Actions Disabled</h4>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Changing passwords or security settings is disabled while impersonating.
                </p>
              </div>
            </div>
          ) : (
            <PasswordSection
              formData={vm.passwordFormData}
              isLoading={vm.passwordUpdateLoading}
              isSuccess={vm.passwordSuccess}
              error={vm.passwordError}
              isFormValid={vm.isPasswordFormValid}
              showPasswords={vm.showPasswords}
              onFieldChange={vm.updatePasswordField}
              onToggleVisibility={vm.togglePasswordVisibility}
              onSubmit={vm.changePassword}
            />
          )}
        </div>
      </div>
    </div>
  );
}