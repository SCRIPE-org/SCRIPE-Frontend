"use client";

import React from "react";
import { Headphones } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";

export function TenantSuccessPartnerCard() {
  const { t } = useI18n();

  return (
    <Card className="p-4 sm:p-5 min-w-0 border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi transition-[border-color,background-color] duration-nx-micro">
      <div className="mb-2 flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md"
          style={{
            background: "color-mix(in oklch, var(--nx-accent) 12%, transparent)",
            color: "var(--nx-accent)",
          }}
        >
          <Headphones className="h-4.5 w-4.5" />
        </div>
        <h3 className="text-sm font-semibold text-nx-ink">
          {t("tenantCommandCenter.partner.title") || "Your Success Partner"}
        </h3>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-nx-ink-3">
        {t("tenantCommandCenter.partner.subtitle") ||
          "Need help getting the most out of SCRIPE? Our team can help with setup, onboarding and operational best practices."}
      </p>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-8 w-full border-nx-line text-xs font-semibold hover:border-nx-line-hi hover:bg-nx-raised"
      >
        <a href="mailto:support@scripe.org">
          {t("tenantCommandCenter.partner.contactSupport") || "Contact Support"}
        </a>
      </Button>
    </Card>
  );
}
