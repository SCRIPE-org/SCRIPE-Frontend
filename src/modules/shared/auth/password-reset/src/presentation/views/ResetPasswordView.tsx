/**
 * ResetPasswordView — Route wrapper for `/reset-password` callback links.
 * Delegates rendering, fragment/query extraction, URL scrubbing, and state to `PasswordRecoveryView`.
 *
 * @module auth/password-reset/presentation/views
 */
"use client";

import { Suspense } from "react";
import { PasswordRecoveryView } from "./PasswordRecoveryView";

export function ResetPasswordView() {
  return (
    <Suspense>
      <PasswordRecoveryView mode="reset" />
    </Suspense>
  );
}
