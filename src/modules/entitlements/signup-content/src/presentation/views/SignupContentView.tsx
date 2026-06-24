"use client";

import { useSignupContentViewModel } from "../viewmodels/useSignupContentViewModel";
import { WelcomeContentForm } from "../components/WelcomeContentForm";
import { ContentModeSection } from "../components/ContentModeSection";
import { TrustMarksSection } from "../components/TrustMarksSection";
import { CustomerLogosSection } from "../components/CustomerLogosSection";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { Star } from "lucide-react";

/**
 * Presentation UI component rendering the signup content view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SignupContentView() {
  const vm = useSignupContentViewModel();
  const { t } = useI18n();

  if (vm.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-zinc-500">{t("signupContent.loading")}</p>
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-red-400">{t("signupContent.error.load")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">{t("signupContent.title")}</h1>
        <p className="mt-1 text-sm text-zinc-400">{t("signupContent.subtitle")}</p>
      </div>

      {/* Section A: Content Mode */}
      <ContentModeSection vm={vm} />

      {/* Section B: Welcome Content */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Star className="h-4 w-4 text-indigo-400" />
            {t("signupContent.welcome.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WelcomeContentForm
            welcome={vm.content?.welcomeContent ?? null}
            onSave={vm.handleUpdateWelcome}
            isSaving={vm.isUpdatingWelcome}
          />
        </CardContent>
      </Card>

      {/* Section C: Trust Marks */}
      <TrustMarksSection vm={vm} />

      {/* Section D: Customer Logos */}
      <CustomerLogosSection vm={vm} />
    </div>
  );
}
