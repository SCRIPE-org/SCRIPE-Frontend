"use client";

import type React from "react";
import { DocsI18nProvider } from "../../providers/DocsI18nProvider";
import { ThemeProvider } from "@core/providers/theme-provider";
import "../../styles/docs.css";

interface DocsLayoutProps {
  children: React.ReactNode;
}

/**
 * DocsLayout — Root layout wrapper for the documentation portal.
 * Provides isolated i18n and theme contexts.
 */
export function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <ThemeProvider>
      <DocsI18nProvider>{children}</DocsI18nProvider>
    </ThemeProvider>
  );
}
