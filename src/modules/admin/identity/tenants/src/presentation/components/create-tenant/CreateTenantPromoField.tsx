/**
 * CreateTenantPromoField — Promotion code input with available promo chips
 *
 * Extracted from CreateTenantStep3 to respect Clean Architecture < 200 lines per file.
 *
 * @module tenants/presentation/components
 */
"use client";

import React from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";

interface CreateTenantPromoFieldProps {
  vm: CreateTenantVM;
  t: (key: string) => string;
}

/**
 * Documentation for module export
 */
export function CreateTenantPromoField({ vm, t }: CreateTenantPromoFieldProps) {
  return (
    <div className="space-y-2 duration-nx-standard ease-nx-enter fade-in-0 motion-safe:animate-in motion-safe:slide-in-from-bottom-2">
      <Label>{t("tenant.promoCode")}</Label>
      <Input
        value={vm.form.promoCode}
        onChange={(e) => vm.updateField("promoCode", e.target.value)}
        placeholder={t("tenant.promoCodePlaceholder")}
        className="font-mono uppercase"
      />
      {vm.availablePromotions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {vm.availablePromotions.map((promo) => {
            const isSelected = vm.form.promotionId === promo.id;

            return (
              <button
                key={promo.id}
                type="button"
                className="rounded-full transition-colors duration-nx-micro ease-nx-enter focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
                aria-pressed={isSelected}
                onClick={() => {
                  if (isSelected) {
                    vm.setForm((prev) => ({
                      ...prev,
                      promotionId: "",
                      promoCode: promo.code ? "" : prev.promoCode,
                    }));
                  } else {
                    vm.setForm((prev) => ({
                      ...prev,
                      promotionId: promo.id,
                      promoCode: promo.code || prev.promoCode,
                    }));
                  }
                }}
              >
                <Badge
                  variant={isSelected ? "default" : "secondary"}
                  className="cursor-pointer text-xs transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-accent-wash motion-reduce:transition-none"
                >
                  {promo.name} (
                  {promo.type === "Percentage"
                    ? `${promo.discountValue}%`
                    : `$${promo.discountValue}`}
                  )
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
