/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * HubFooter — Subtle footer for the Hub page.
 * Left: SCRIPE · v4.2.1 · Tenant: name
 * Right: What's new | Docs | Status
 */

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { BRAND } from "@core/config/branding";

const APP_VERSION = "v4.2.1";

const FOOTER_LINK =
  "text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink-2 focus-visible:outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none";

export function HubFooter() {
  const { t } = useI18n();
  const tenantName = useAppStore((s) => (s.user as any)?.tenantName ?? BRAND?.name ?? "SCRIPE");

  return (
    <div className="mt-6 flex items-center justify-between border-t border-nx-line pt-4 text-[11.5px] text-nx-ink-3">
      <span>
        {t("workspaceHub.footer.brandLine", {
          brand: BRAND?.name ?? "SCRIPE",
          version: APP_VERSION,
          tenant: tenantName,
        })}
      </span>
      <span className="inline-flex items-center gap-3.5">
        <a href="#" className={FOOTER_LINK}>
          {t("workspaceHub.footer.whatsNew")}
        </a>
        <a href="#" className={FOOTER_LINK}>
          {t("workspaceHub.footer.docs")}
        </a>
        <a href="#" className={FOOTER_LINK}>
          {t("workspaceHub.footer.status")}
        </a>
      </span>
    </div>
  );
}
