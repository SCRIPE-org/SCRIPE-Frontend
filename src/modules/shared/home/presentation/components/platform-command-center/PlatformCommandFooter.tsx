"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";

export function PlatformCommandFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/40 pb-2 pt-6 text-xs text-muted-foreground sm:flex-row">
      <div>
        {t("platformCommandCenter.footer.copyright") || "© 2026 SCRIPE. All rights reserved."}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold leading-none text-primary">—</span>
        <span className="text-[11px] font-semibold tracking-widest text-foreground/80">
          {t("platformCommandCenter.footer.tagline") || "BUILT FOR A MORE ACTIVE WORLD."}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">v1.1.0</span>
      </div>
    </footer>
  );
}
