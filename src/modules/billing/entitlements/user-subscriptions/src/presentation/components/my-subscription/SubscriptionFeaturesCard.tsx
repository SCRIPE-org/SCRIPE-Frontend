/**
 * SubscriptionFeaturesCard — Lists features from the user's active subscription.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Check, X, Infinity, Layers } from "lucide-react";
import type { UserSubscription } from "../../../domain/entities/UserSubscription";

interface SubscriptionFeaturesCardProps {
  subscription: UserSubscription;
  t: (key: string) => string;
  language: string;
}

/**
 * Presentation UI component rendering the subscription features card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SubscriptionFeaturesCard({
  subscription,
  t,
  language,
}: SubscriptionFeaturesCardProps) {
  const features = subscription.features;

  if (features.length === 0) {
    return null; // No features = don't render the card
  }

  const renderFeatureValue = (feat: (typeof features)[0]) => {
    switch (feat.valueType) {
      case "Boolean":
        return feat.value === "true" ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <X className="h-4 w-4 text-muted-foreground" />
        );
      case "Numeric": {
        const num = parseInt(feat.value);
        if (num === -1) return <Infinity className="h-4 w-4 text-info" />;
        return (
          <Badge variant="secondary" className="tabular-nums">
            {num.toLocaleString()}
          </Badge>
        );
      }
      default:
        return <span className="text-sm">{feat.value}</span>;
    }
  };

  const getDisplayName = (feat: (typeof features)[0]) => {
    if (language === "ar" && feat.displayNameAr) return feat.displayNameAr;
    return feat.displayNameEn || feat.featureKey;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          {t("entitlements.mySubscription.features") || "Included Features"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {features.map((feat) => (
            <div key={feat.featureKey} className="flex items-center justify-between py-2.5">
              <span className="text-sm">{getDisplayName(feat)}</span>
              <div>{renderFeatureValue(feat)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
