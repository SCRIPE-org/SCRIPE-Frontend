"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { CreditCard, Wallet } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Interface defining property specifications, keys types, and structural contract rules for gateway option.
 */
export interface GatewayOption {
  gateway: string;
}

interface GatewaySelectionStepProps {
  gateways: GatewayOption[];
  onSelect: (gatewayType: string) => void;
}

/**
 * Presentation UI component rendering the gateway selection step.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function GatewaySelectionStep({ gateways, onSelect }: GatewaySelectionStepProps) {
  const { t } = useI18n();

  if (!gateways || gateways.length === 0) {
    return null;
  }

  const getGatewayIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "stripe":
        return <CreditCard className="h-6 w-6 text-[#635bff]" />;
      case "paypal":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#003087]">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788l.038-.2.728-4.616.047-.256a.925.925 0 0 1 .915-.788h.578c3.737 0 6.662-1.518 7.518-5.907.357-1.832.173-3.361-.769-4.436a3.713 3.713 0 0 0-.35-.292z" />
          </svg>
        );
      case "paymob":
        return <Wallet className="h-6 w-6 text-[#00B2FF]" />;
      default:
        return <CreditCard className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getGatewayLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "stripe":
        return t("billing.gateways.stripe") || "Pay with Card (Stripe)";
      case "paypal":
        return t("billing.gateways.paypal") || "Pay with PayPal";
      case "paymob":
        return t("billing.gateways.paymob") || "Pay with Paymob";
      default:
        return type;
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{t("billing.choosePaymentMethod") || "Choose Payment Method"}</CardTitle>
        <CardDescription>
          {t("billing.choosePaymentMethodDesc") ||
            "Select how you would like to pay for your subscription."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {gateways.map((gw) => (
          <Button
            key={gw.gateway}
            variant="outline"
            className="h-16 w-full justify-start gap-4 px-6 hover:border-primary/50 hover:bg-primary/5"
            onClick={() => onSelect(gw.gateway)}
          >
            {getGatewayIcon(gw.gateway)}
            <span className="text-base font-medium">{getGatewayLabel(gw.gateway)}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
