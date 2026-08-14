"use client";

import Link from "next/link";

interface CredentialsFormFooterProps {
  isPlatformMode: boolean;
  arrow: string;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the credentials form footer.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CredentialsFormFooter({ isPlatformMode, arrow, t }: CredentialsFormFooterProps) {
  return (
    <div
      // Stacks below sm — one row at 390px wraps the signup link against the
      // status chip and reads as a layout accident.
      className="flex flex-col gap-2 border-t pt-[18px] sm:flex-row sm:items-center sm:justify-between"
      style={{
        marginTop: "var(--login-footer-margin, 22px)",
        borderColor: "var(--sx-divider, hsl(var(--border)))",
        fontSize: 12,
        color: "var(--sx-text-mute, hsl(var(--muted-foreground)))",
      }}
    >
      <span>
        {isPlatformMode ? (
          <>
            {t("auth.newHere") || "New here?"}{" "}
            <Link
              href="/signup"
              className="font-semibold transition-colors hover:opacity-80"
              style={{
                // The one conversion link on the form earns the accent duty.
                color: "var(--sx-accent-text, hsl(var(--foreground)))",
                textDecoration: "none",
              }}
            >
              {t("auth.createWorkspace")} {arrow}
            </Link>
          </>
        ) : (
          <span style={{ color: "var(--sx-text-faint)" }}>
            {t("auth.needAccount") || "Contact your workspace admin for access."}
          </span>
        )}
      </span>
      <span
        className="inline-flex shrink-0 items-center gap-1.5"
        style={{
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--sx-text-faint)",
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: "var(--sx-success-dot)",
            boxShadow: "0 0 6px var(--sx-success-dot)",
          }}
        />
        {t("auth.systemsOperational") || "systems · operational"}
      </span>
    </div>
  );
}
