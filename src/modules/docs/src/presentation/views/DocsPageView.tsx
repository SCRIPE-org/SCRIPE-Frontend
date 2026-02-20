"use client";

import { useDocsModeViewModel } from "../viewmodels/useDocsModeViewModel";
import { useDocsI18n } from "../providers/DocsI18nProvider";

// Commercial layout
import { CommercialDocsView } from "./CommercialDocsView";

// Technical layout
import { TechnicalDocsView } from "./TechnicalDocsView";

// ─── Content Registration ─────────────────────────────────────
// Import all content files so they self-register
import "../../data/content/registry";

interface DocsPageViewProps {
  slug: string;
}

/**
 * DocsPageView — Routes to Commercial or Technical view
 * based on the user's docs mode preference.
 *
 * DocsLayout (i18n + theme providers) is in (docs)/layout.tsx.
 * This view is a pure SOLID View with zero providers.
 */
export function DocsPageView({ slug }: DocsPageViewProps) {
  const docsMode = useDocsModeViewModel();

  if (docsMode.mode === "commercial") {
    return <CommercialDocsView slug={slug} />;
  }

  return <TechnicalDocsView slug={slug} docsMode={docsMode} />;
}
