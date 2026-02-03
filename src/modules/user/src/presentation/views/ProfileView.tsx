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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Hero Profile Header */}
      <ProfileHeaderSection profile={vm.profile} />

      {/* Profile Management Forms */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information Form */}
          <ProfileInfoSection
            formData={vm.profileFormData}
            isLoading={vm.profileUpdateLoading}
            isSuccess={vm.profileSuccess}
            error={vm.profileUpdateError}
            isFormValid={vm.isProfileFormValid}
            onFieldChange={vm.updateProfileField}
            onSubmit={vm.updateProfile}
          />

          {/* Password Change Form */}
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
        </div>
      </div>
    </div>
  );
}