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
      className="flex flex-shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-nx-line px-4 py-2 text-[11px] text-nx-ink-3 lg:px-5"
      style={{
        background: "color-mix(in oklch, var(--nx-surface, hsl(var(--card))) 40%, transparent)",
      }}
    >
      <span className="min-w-0 truncate">
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
