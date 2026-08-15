"use client";

import { useSignupContentViewModel } from "../viewmodels/useSignupContentViewModel";
import { WelcomeContentForm } from "../components/WelcomeContentForm";
import { ContentModeSection } from "../components/ContentModeSection";
import { TrustMarksSection } from "../components/TrustMarksSection";
import { CustomerLogosSection } from "../components/CustomerLogosSection";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { PageHeader } from "@core/ui/page-header";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import { useI18n } from "@core/providers/i18n-provider";
import { LayoutTemplate, Star } from "lucide-react";

/**
 * Presentation UI component rendering the signup content view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SignupContentView() {
  const vm = useSignupContentViewModel();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutTemplate}
        title={t("signupContent.title")}
        description={t("signupContent.subtitle")}
      />

      {vm.isLoading ? (
        <LoadingSpinner />
      ) : vm.error ? (
        <ErrorMessage message={t("signupContent.error.load")} onRetry={() => void vm.refetch()} />
      ) : (
        <>
          {/* Section A: Content Mode */}
          <ContentModeSection vm={vm} />

          {/* Section B: Welcome Content */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4 text-info" aria-hidden="true" />
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
        </>
      )}
    </div>
  );
}
