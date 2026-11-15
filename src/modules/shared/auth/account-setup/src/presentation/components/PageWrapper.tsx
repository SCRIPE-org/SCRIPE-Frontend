"use client";

import React from "react";
import Image from "next/image";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";

/**
 * Documentation for module export
 */
export interface PageWrapperProps {
  children: React.ReactNode;
}

/**
 * Full-screen branded page layout for onboarding and account activation screens.
 */
export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center bg-nx-ground px-4 py-8 text-nx-ink selection:bg-nx-accent-wash sm:py-12">
      <div className="absolute end-4 top-4 z-20 flex items-center gap-1 sm:end-6 sm:top-6">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-nx-line bg-nx-surface p-1.5">
          <Image
            src="/brand/app-logo.svg"
            alt={`${BRAND.name} Logo`}
            width={48}
            height={48}
            priority
            className="h-full w-full object-contain"
          />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-nx-ink-2">
          {BRAND.name} OS
        </span>
      </div>

      <main className="flex w-full flex-col items-center">{children}</main>

      <p className="mt-8 text-center text-[11px] font-medium text-nx-ink-3">
        © {new Date().getFullYear()} {BRAND.name} — Sports Operations OS
      </p>
    </div>
  );
}
