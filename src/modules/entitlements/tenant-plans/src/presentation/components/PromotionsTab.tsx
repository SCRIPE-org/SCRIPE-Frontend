/**
 * PromotionsTab — Promo codes & discounts linked to a plan.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Tag } from "lucide-react";
import Link from "next/link";
import type { TFn } from "./shared-helpers";

interface PromotionsTabProps {
  planId: string;
  t: TFn;
}

export function PromotionsTab({ planId: _planId, t }: PromotionsTabProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">{t("entitlements.tenantPlans.promotionsTitle")}</CardTitle>
        </div>
        <CardDescription>
          {t("entitlements.tenantPlans.promotionsDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <Tag className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">{t("entitlements.tenantPlans.promotionsPlaceholder")}</p>
        <Link href="/entitlements/promotions" className="mt-3">
          <Button variant="outline" size="sm">
            <Tag className="h-4 w-4 me-1" />
            {t("entitlements.tenantPlans.viewAllPromotions")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
