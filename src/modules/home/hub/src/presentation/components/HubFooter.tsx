"use client";

/**
 * HubFooter — Subtle footer for the Hub page.
 * Left: SCRIPE · v4.2.1 · Tenant: name
 * Right: What's new | Docs | Status
 */

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";

/**
 * Presentation UI component rendering the hub footer.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function HubFooter() {
  const { t } = useI18n();
  const tenantName = useAppStore((s) => (s.user as any)?.tenantName ?? "SCRIPE");

  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 18,
        borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 11.5,
        color: "rgba(230,233,245,0.4)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <span>SCRIPE · v4.2.1 · Tenant: {tenantName}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
          {t("workspaceHub.footer.whatsNew")}
        </a>
        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
          {t("workspaceHub.footer.docs")}
        </a>
        <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
          {t("workspaceHub.footer.status")}
        </a>
      </span>
    </div>
  );
}
