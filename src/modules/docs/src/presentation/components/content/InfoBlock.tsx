"use client";

import { useDocsI18n } from "../../providers/DocsI18nProvider";

interface InfoBlockProps {
  variant: "note" | "tip" | "warning" | "danger";
  contentKey: string;
  titleKey?: string;
}

const variantIcons: Record<string, React.ReactNode> = {
  note: (
    <svg
      className="docs-info-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  ),
};

/**
 * React presentation component representing the info block UI element.
 */
export function InfoBlock({ variant, contentKey, titleKey }: InfoBlockProps) {
  const { t } = useDocsI18n();

  return (
    <div className="docs-info" data-variant={variant}>
      {variantIcons[variant]}
      <div>
        <strong style={{ display: "block", marginBottom: "0.25rem" }}>
          {titleKey ? t(titleKey) : t(`info.${variant}`)}
        </strong>
        {t(contentKey)}
      </div>
    </div>
  );
}
