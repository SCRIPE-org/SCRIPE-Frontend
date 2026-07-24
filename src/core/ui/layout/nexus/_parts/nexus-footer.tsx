"use client";

/**
 * NexusFooter — minimal footer strip for the Nexus layout.
 *
 * Rendered only when the showFooter setting is on. It sits at the end of the
 * content scroll column: short pages pin it to the bottom edge (the main
 * region grows to fill), long pages push it below the fold. Every colour
 * reads the --nx- token layer — theme resolves in CSS, no isDark branches.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

export function NexusFooter() {
  const { t } = useI18n();
  const appName = useBrandedAppName();
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 20px",
        borderBlockStart: "1px solid var(--nx-line, hsl(var(--border)))",
        background: "color-mix(in oklch, var(--nx-surface, hsl(var(--card))) 40%, transparent)",
        fontSize: 11,
        color: "var(--nx-ink-3, hsl(var(--muted-foreground)))",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        {/* Both keys ship EN and AR, so the old `|| "English literal"` guards
            were unreachable copy that only ever hid a missing translation. */}
        © {year} {appName}. {t("common.all_rights_reserved")}
      </span>
      <span
        className="rounded-full border border-nx-line bg-nx-raised text-nx-ink-2"
        style={{
          flexShrink: 0,
          padding: "2px 8px",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.3px",
        }}
      >
        {t("app.version")}
      </span>
    </footer>
  );
}
