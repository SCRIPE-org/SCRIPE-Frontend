"use client";

import type React from "react";
import { DocsI18nProvider, type DocScope } from "../../providers/DocsI18nProvider";
import { ThemeProvider } from "@core/providers/theme-provider";
import "../../styles/docs.css";
import "../../styles/commercial.css";

interface DocsLayoutProps {
  children: React.ReactNode;
  scope?: DocScope;
}

/**
 * DocsLayout — Root layout wrapper for the documentation portal.
 * Provides isolated i18n and theme contexts.
 */
export function DocsLayout({ children, scope = "technical" }: DocsLayoutProps) {
  return (
    <ThemeProvider>
      <DocsI18nProvider scope={scope}>{children}</DocsI18nProvider>
    </ThemeProvider>
  );
}
