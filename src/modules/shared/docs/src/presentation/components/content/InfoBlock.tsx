"use client";

import { useId } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";

type InfoVariant = "note" | "tip" | "warning" | "danger" | "info" | "success" | "caution";

interface InfoBlockProps {
  variant: InfoVariant;
  contentKey: string;
  titleKey?: string;
}

const variantIcons: Record<InfoVariant, React.ReactNode> = {
  note: (
    <svg
      className="docs-info-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  tip: (
    <svg
      className="docs-info-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2v1" />
      <path d="M15.5 21a1.85 1.85 0 0 1-3.5-.1V21h-1a2 2 0 0 1-2-2v-1h7v1a2 2 0 0 1-2 2Z" />
      <path d="M9.5 18h5" />
      <path d="M12 6a4 4 0 0 1 4 4 7 7 0 0 1-2 5H10a7 7 0 0 1-2-5 4 4 0 0 1 4-4Z" />
    </svg>
  ),
  warning: (
    <svg
      className="docs-info-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  danger: (
    <svg
      className="docs-info-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  ),
  info: (
    <svg
      className="docs-info-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
      <path d="M12 8h.01" />
      <path d="M11 12h1v4h1" />
    </svg>
  ),
  success: (
    <svg
      className="docs-info-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  ),
  caution: (
    <svg
      className="docs-info-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z" />
      <path d="M12 8v5" />
      <path d="m12 16-.01.01" />
    </svg>
  ),
};

/**
 * InfoBlock — Renders a callout/alert box with one of 7 semantic variants.
 * Supports: note, tip, warning, danger, info, success, caution.
 *
 * An <aside> rather than a <div>: a callout is a complementary aside to the
 * surrounding prose, and naming it with its own heading lets a screen-reader
 * user skip it or jump straight to it. It is deliberately NOT role="alert" —
 * the copy is static page content, not something that just happened.
 */
export function InfoBlock({ variant, contentKey, titleKey }: InfoBlockProps) {
  const { t } = useDocsI18n();
  const titleId = useId();

  return (
    <aside className="docs-info" data-variant={variant} aria-labelledby={titleId}>
      {variantIcons[variant]}
      <div>
        <p id={titleId} className="docs-info-title">
          {titleKey ? t(titleKey) : t(`info.${variant}`)}
        </p>
        <p className="docs-info-body">{t(contentKey)}</p>
      </div>
    </aside>
  );
}
