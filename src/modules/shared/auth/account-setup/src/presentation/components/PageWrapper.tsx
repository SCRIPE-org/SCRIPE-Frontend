"use client";

import React from "react";
import Image from "next/image";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";

export interface PageWrapperProps {
  children: React.ReactNode;
}

/**
 * Full-screen branded page layout for onboarding and account activation screens.
 */
export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-8 sm:py-12 selection:bg-primary/20">
      <div className="absolute end-4 sm:end-6 top-4 sm:top-6 z-20 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <Image
            src="/brand/app-logo-1024.png"
            alt={`${BRAND.name} Logo`}
            width={48}
            height={48}
            priority
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {BRAND.name} OS
        </span>
      </div>

      {children}

      <p className="mt-8 text-[11px] font-medium text-muted-foreground/50 text-center">
        © {new Date().getFullYear()} {BRAND.name} — Sports Operations OS
      </p>
    </div>
  );
}
