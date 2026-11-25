/**
 * ForgotPasswordView — Route wrapper for `/forgot-password`.
 * Delegates rendering and state to the consolidated `PasswordRecoveryView`.
 *
 * @module auth/password-reset/presentation/views
 */
"use client";

import { Suspense } from "react";
import { PasswordRecoveryView } from "./PasswordRecoveryView";

export function ForgotPasswordView() {
  return (
    <Suspense>
      <PasswordRecoveryView mode="forgot" />
    </Suspense>
  );
}
