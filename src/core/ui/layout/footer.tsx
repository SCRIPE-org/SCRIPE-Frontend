"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useTenantBranding } from "@core/providers/tenant-branding-provider";

export function Footer() {
  const { t } = useI18n();
  const { companyName } = useTenantBranding();
  return (
    <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} {companyName}.{" "}
      {t("footer.allRightsReserved") || "All rights reserved."}
    </footer>
  );
}
