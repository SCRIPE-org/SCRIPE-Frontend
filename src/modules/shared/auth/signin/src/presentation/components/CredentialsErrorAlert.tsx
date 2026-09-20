"use client";

import React from "react";

export interface CredentialsErrorAlertProps {
  error: string;
  shakeKey: number;
  errorAnnounce?: boolean;
  t: (key: string) => string;
}

/**
 * Presentation error alert rendering credential/login failure feedback.
 * Includes animation shake-key support and assertive aria-live announcement.
 */
export function CredentialsErrorAlert({
  error,
  shakeKey,
  errorAnnounce = true,
  t,
}: CredentialsErrorAlertProps) {
  return (
    <div
      key={shakeKey}
      id="login-error"
      className="sx-shake flex items-start gap-2.5 rounded-xl p-3.5"
      role="alert"
      style={{
        background: "var(--sx-error-bg, rgba(248,113,113,.10))",
        border: "1px solid var(--sx-error-border, rgba(248,113,113,.30))",
        color: "var(--sx-error-text, #FCA5A5)",
      }}
      {...(errorAnnounce ? { "aria-live": "assertive" as const, "aria-atomic": "true" } : {})}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        ⚠
      </span>
      <p className="text-[13px] font-medium leading-snug">
        {error.startsWith("auth.") ? t(error) : error}
      </p>
    </div>
  );
}
