"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";

export function PlatformCommandFooter() {
  const { t } = useI18n();

  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground pt-6 pb-2 border-t border-border/40 mt-8 gap-2">
      <div>
        {t("platformCommandCenter.footer.copyright") || "© 2026 SCRIPE. All rights reserved."}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-primary font-bold text-sm leading-none">—</span>
        <span className="tracking-widest font-semibold text-foreground/80 text-[11px]">
          {t("platformCommandCenter.footer.tagline") || "BUILT FOR A MORE ACTIVE WORLD."}
        </span>
        <span className="text-muted-foreground font-mono text-[11px]">v1.1.0</span>
      </div>
    </footer>
  );
}
