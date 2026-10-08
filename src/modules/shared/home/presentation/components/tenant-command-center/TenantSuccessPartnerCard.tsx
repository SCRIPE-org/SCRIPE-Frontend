"use client";

import React from "react";
import { Headphones } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";

export function TenantSuccessPartnerCard() {
  const { t } = useI18n();

  return (
    <Card className="border-[#183747] bg-gradient-to-br from-[#102b37] to-[#0a1d27] p-4 text-white shadow-md">
      <div className="mb-1.5 flex items-center gap-2">
        <Headphones className="h-4 w-4 text-[#c9ff43]" />
        <h3 className="text-sm font-bold text-white">
          {t("tenantCommandCenter.partner.title") || "Your Success Partner"}
        </h3>
      </div>
      <p className="mb-3 text-[11px] leading-relaxed text-[#b1c4cc]">
        {t("tenantCommandCenter.partner.subtitle") ||
          "Need help getting the most out of SCRIPE? Our team can help with setup, onboarding and best practices."}
      </p>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-8 w-full border-white/20 bg-white/10 text-[11px] font-semibold text-white hover:bg-white/20"
      >
        <a href="mailto:support@scripe.org">
          {t("tenantCommandCenter.partner.contactSupport") || "Contact Support"}
        </a>
      </Button>
    </Card>
  );
}
