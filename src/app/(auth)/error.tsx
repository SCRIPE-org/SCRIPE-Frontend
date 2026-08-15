"use client";

import { useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";

/** Route-group error boundary for the (auth) surfaces — a Relay vault-styled
 * fallback so an unhandled error on login/signup/reset doesn't fall through
 * to the generic app error page (which carries the wrong visual identity for
 * an unauthenticated visitor). */
export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t, direction } = useI18n();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div
      className="scripe-auth-stage flex min-h-screen w-full flex-col items-center justify-center gap-5 p-6 text-center"
      dir={direction}
    >
      <div
        className="flex w-full max-w-sm flex-col gap-4 rounded-[20px] p-8"
        style={{
          background: "var(--sx-card-bg)",
          border: "1px solid var(--sx-card-border)",
          boxShadow: "var(--sx-card-shadow)",
        }}
      >
        <h1 className="text-lg font-semibold" style={{ color: "var(--sx-text)" }}>
          {t("errors.boundary.title") || "Something went wrong"}
        </h1>
        <p className="text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {t("errors.module.description") || "Please try again."}
        </p>
        <Button
          type="button"
          onClick={reset}
          className="w-full"
          style={{ background: "var(--scripe-signal, #C6FF00)", color: "var(--scripe-ink, #0D0D0E)" }}
        >
          {t("errors.boundary.retry") || "Try again"}
        </Button>
        {process.env.NODE_ENV === "development" && (
          <pre
            className="max-h-40 overflow-auto rounded-lg p-3 text-start text-xs"
            style={{ background: "var(--sx-field-bg)", color: "var(--sx-text-faint)" }}
          >
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
