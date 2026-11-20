"use client";

/**
 * HubHero — Hero greeting section for the Hub page.
 *
 * Layout:
 * ● All systems operational · Sunday, May 24
 * Good evening, Seif.
 * Your apps & workspaces — pick up where you left off.
 */

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";

export function HubHero() {
  const { t, language } = useI18n();
  const adminFirstName = useAppStore((s) => s.user?.firstName ?? s.user?.username ?? "");

  const greeting = getGreeting(t);
  const dateStr = formatDate(language);

  return (
    <div className="relative pb-5 pt-6 sm:pt-9">
      {/* Status pill */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-nx-line bg-nx-hover px-2.5 py-1 text-xs font-medium text-nx-ink-2">
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
        <span>
          {t("workspaceHub.status.operational")} · {dateStr}
        </span>
      </div>

      {/* Greeting */}
      <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight text-nx-ink sm:text-3xl lg:text-4xl">
        {greeting}
        {adminFirstName ? `, ${adminFirstName}.` : "."}
      </h1>

      {/* Subtitle */}
      <p className="mt-2.5 text-sm text-nx-ink-2 sm:text-base">{t("workspaceHub.subtitle")}</p>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("workspaceHub.greeting.morning");
  if (hour < 18) return t("workspaceHub.greeting.afternoon");
  return t("workspaceHub.greeting.evening");
}

function formatDate(language: string): string {
  const d = new Date();
  return d.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
