"use client";

import { useI18n } from "@core/providers/i18n-provider";

export function Footer() {
      const { t } = useI18n();
      return (
            <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
                  {t("app.version")}
            </footer>
      );
}
