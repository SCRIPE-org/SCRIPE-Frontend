"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";
import { cn } from "@core/common/utils";

export function Footer() {
  const { t, direction } = useI18n();
  const appName = useBrandedAppName();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn("border-t border-border/50 bg-background/50 backdrop-blur-sm", "px-6 py-3")}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-between gap-2 sm:flex-row",
          direction === "rtl" && "sm:flex-row-reverse"
        )}
      >
        {/* Left: Copyright */}
        <p className="text-xs text-muted-foreground">
          © {year} {appName}. {t("common.all_rights_reserved") || "All rights reserved."}
        </p>

        {/* Right: Version badge */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {t("app.version") || "v1.0.0"}
          </span>
        </div>
      </div>
    </footer>
  );
}
