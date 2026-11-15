"use client";

import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { useRouter } from "next/navigation";
// PageState type is used only as a prop type in the parent view.

interface StateViewProps {
  errorMessage?: string;
  tokenData?: { adminUsername?: string } | null;
  onRetry?: () => void;
}

/**
 * SetupAccountStateViews compiles a collection of localized state cards representing the status of admin registration.
 * Includes loading, validation error, successfully activated, and retry card views.
 * Extracted from SetupAccountView to preserve file size limits.
 */

/**
 * SetupLoadingView renders a centered card containing an animated spinner icon.
 * Used while validating the security token credentials from the activation URL payload.
 */
export function SetupLoadingView() {
  const { t } = useI18n();
  return (
    <Card className="w-full max-w-md border-nx-line bg-nx-surface">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="h-10 w-10 animate-spin text-nx-accent motion-reduce:animate-none" />
        <p className="text-sm text-nx-ink-2">{t("auth.accountSetup.validating")}</p>
      </CardContent>
    </Card>
  );
}

/**
 * SetupInvalidView renders a card view indicating that the setup token is invalid, expired, or used.
 * Provides details about the error message and an action button to redirect the user to the login page.
 *
 * @param props.errorMessage The validation error message to display.
 */
export function SetupInvalidView({ errorMessage }: StateViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <Card className="w-full max-w-md border-destructive/40 bg-nx-surface">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="rounded-full bg-destructive/10 p-4">
          <XCircle className="h-10 w-10 text-nx-danger" />
        </div>
        <h2 className="text-xl font-semibold text-nx-ink">
          {t("auth.accountSetup.invalidTitle")}
        </h2>
        <p className="max-w-xs text-center text-sm text-nx-ink-2">{errorMessage}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/login")}>
          {t("auth.goToLogin")}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * SetupSuccessView renders a card view indicating that the administrator account has been successfully set up.
 * Displays the verified username and provides an action button to navigate the user to the login screen.
 *
 * @param props.tokenData The validated token payload containing workspace/administrator information.
 */
export function SetupSuccessView({ tokenData }: StateViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <Card className="w-full max-w-md border-success/40 bg-nx-surface">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="rounded-full bg-success/10 p-4">
          <CheckCircle2 className="h-10 w-10 text-nx-success" />
        </div>
        <h2 className="text-xl font-semibold text-nx-ink">
          {t("auth.accountSetup.successTitle")}
        </h2>
        <p className="max-w-xs text-center text-sm text-nx-ink-2">
          {t("auth.accountSetup.successDescription")}
        </p>
        <div className="mt-2 rounded-lg border border-nx-line bg-nx-raised px-4 py-2 text-sm text-nx-ink-2">
          <span className="font-medium text-nx-ink">{tokenData?.adminUsername}</span>
        </div>
        <Button className="mt-4 w-full max-w-[200px]" onClick={() => router.push("/login")}>
          {t("auth.loginButton")}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * SetupErrorView renders a card view indicating that an error occurred during account activation.
 * Offers the specific activation error message and a retry button to trigger the activation process again.
 *
 * @param props.errorMessage The activation error message.
 * @param props.onRetry Callback function to retry the account setup activation submission.
 */
export function SetupErrorView({ errorMessage, onRetry }: StateViewProps) {
  const { t } = useI18n();
  return (
    <Card className="w-full max-w-md border-destructive/40 bg-nx-surface">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-10 w-10 text-nx-danger" />
        </div>
        <h2 className="text-xl font-semibold text-nx-ink">
          {t("auth.accountSetup.activationFailedTitle")}
        </h2>
        <p className="max-w-xs text-center text-sm text-nx-ink-2">{errorMessage}</p>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          {t("auth.accountSetup.tryAgain")}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * PasswordCheck displays a validation constraint checklist item for a password input field.
 * Uses a green checkmark icon when the rule is met, and an empty circle indicator otherwise.
 *
 * @param props.label The user-friendly rule description (e.g. "At least 8 characters").
 * @param props.ok Boolean indicating whether the constraint is successfully satisfied.
 */
export function PasswordCheck({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${ok ? "text-nx-success" : "text-nx-ink-2"}`}>
      {ok ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <div className="h-3 w-3 rounded-full border border-nx-line-hi" />
      )}
      {label}
    </div>
  );
}
