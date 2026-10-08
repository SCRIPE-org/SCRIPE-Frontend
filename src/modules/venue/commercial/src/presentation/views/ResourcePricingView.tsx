"use client";

import { BadgeDollarSign, AlertCircle, Lock, RefreshCw } from "lucide-react";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Checkbox } from "@core/ui/checkbox";
import { EmptyState } from "@core/ui/empty-state";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { useResourcePricingViewModel } from "../viewmodels/useResourcePricingViewModel";

/**
 * Documentation for module export
 */
export function ResourcePricingView() {
  useModuleLocales(() => import("../../../locales"), "venue.pricing");
  const { t, direction } = useI18n();
  const canView = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_VIEW_COMMERCIALS);
  const canCreateItem = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_CREATE_CATALOG_ITEM);
  const canPublishOffering = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_PUBLISH_OFFERING);
  const canCreatePriceBook = usePermission(
    VENUE_PERMISSIONS.CATALOG_PRICING_CREATE_PRICE_BOOK_VERSION
  );
  const canConfigure = canCreateItem && canPublishOffering && canCreatePriceBook;
  const canManageTax = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_APPLY_DISCOUNT_TAX);
  const model = useResourcePricingViewModel({
    messages: {
      fallbackError: t("pricing.error.description"),
      validation: t("pricing.validation.invalid"),
    },
  });

  if (!canView)
    return (
      <EmptyState
        icon={Lock}
        title={t("pricing.permission.title")}
        description={t("pricing.permission.description")}
      />
    );
  if (model.loading) return <LoadingSpinner showText={false} />;
  if (model.error && model.resources.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={t("pricing.error.title")}
        description={model.error}
        action={
          <Button variant="outline" onClick={() => void model.loadResources()}>
            <RefreshCw className="size-4" />
            {t("pricing.retry")}
          </Button>
        }
      />
    );
  }
  if (model.resources.length === 0) {
    return (
      <EmptyState
        icon={BadgeDollarSign}
        title={t("pricing.empty.title")}
        description={t("pricing.empty.description")}
      />
    );
  }

  return (
    <div className="space-y-6" dir={direction} data-testid="resource-pricing">
      <PageHeader
        icon={BadgeDollarSign}
        title={t("pricing.title")}
        description={t("pricing.description")}
      />
      <div className="max-w-xl space-y-2">
        <Label id="pricing-resource-label" htmlFor="pricing-resource-select">
          {t("pricing.resource")}
        </Label>
        <GenericSelect
          id="pricing-resource-select"
          aria-labelledby="pricing-resource-label"
          type="searchable"
          searchType="client"
          allowClear={false}
          options={model.resourceOptions}
          value={model.selectedResourceId}
          onValueChange={(value: string | string[]) =>
            model.setSelectedResourceId(Array.isArray(value) ? (value[0] ?? "") : value)
          }
          placeholder={t("pricing.selectResource")}
        />
      </div>
      {model.configurationLoading ? (
        <LoadingSpinner showText={false} />
      ) : (
        model.selectedResource && (
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{t("pricing.rate.title")}</CardTitle>
                <p className="mt-1 text-sm text-nx-ink-2">{t("pricing.rate.description")}</p>
              </div>
              <Badge variant={model.configuration ? "active" : "inactive"}>
                {t(model.configuration ? "pricing.configured" : "pricing.notConfigured")}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              {model.error && (
                <Alert variant="destructive">
                  <AlertTitle>{t("pricing.error.title")}</AlertTitle>
                  <AlertDescription>{model.error}</AlertDescription>
                </Alert>
              )}
              {model.success && (
                <Alert variant="success">
                  <AlertTitle>{t("pricing.saved")}</AlertTitle>
                  <AlertDescription>{t("pricing.savedDescription")}</AlertDescription>
                </Alert>
              )}
              {!canConfigure && (
                <Alert variant="info">
                  <AlertTitle>{t("pricing.configurePermission.title")}</AlertTitle>
                  <AlertDescription>
                    {t("pricing.configurePermission.description")}
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="price-name">{t("pricing.fields.name")}</Label>
                  <Input
                    id="price-name"
                    value={model.displayName}
                    disabled={!canConfigure || model.saving}
                    onChange={(event) => model.setDisplayName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-currency">{t("pricing.fields.currency")}</Label>
                  <Input
                    id="price-currency"
                    value={model.currencyCode}
                    maxLength={3}
                    dir="ltr"
                    disabled={!canConfigure || model.saving}
                    onChange={(event) => model.setCurrencyCode(event.target.value.toUpperCase())}
                    placeholder="ISO"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-unit">{t("pricing.fields.unitPrice")}</Label>
                  <Input
                    id="price-unit"
                    type="number"
                    min={0}
                    step="0.01"
                    value={model.unitPrice}
                    dir="ltr"
                    disabled={!canConfigure || model.saving}
                    onChange={(event) => model.setUnitPrice(event.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="price-effective">{t("pricing.fields.effectiveFromUtc")}</Label>
                  <Input
                    id="price-effective"
                    type="datetime-local"
                    value={model.effectiveFromUtc}
                    disabled={!canConfigure || model.saving}
                    onChange={(event) => model.setEffectiveFromUtc(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-min">{t("pricing.fields.minDuration")}</Label>
                  <Input
                    id="price-min"
                    type="number"
                    min={1}
                    value={model.minDuration}
                    disabled={!canConfigure || model.saving}
                    onChange={(event) => model.setMinDuration(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-max">{t("pricing.fields.maxDuration")}</Label>
                  <Input
                    id="price-max"
                    type="number"
                    min={1}
                    value={model.maxDuration}
                    disabled={!canConfigure || model.saving}
                    onChange={(event) => model.setMaxDuration(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-step">{t("pricing.fields.increment")}</Label>
                  <Input
                    id="price-step"
                    type="number"
                    min={1}
                    value={model.increment}
                    disabled={!canConfigure || model.saving}
                    onChange={(event) => model.setIncrement(event.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label id="pricing-tax-cat-label" htmlFor="pricing-tax-cat-select">
                    {t("pricing.fields.taxCategory")}
                  </Label>
                  <GenericSelect
                    id="pricing-tax-cat-select"
                    aria-labelledby="pricing-tax-cat-label"
                    type="searchable"
                    searchType="client"
                    allowClear={false}
                    options={model.taxCategoryOptions}
                    value={model.taxCategoryId}
                    disabled={!canConfigure || !canManageTax || model.saving}
                    onValueChange={(value: string | string[]) =>
                      model.setTaxCategoryId(Array.isArray(value) ? (value[0] ?? "") : value)
                    }
                    placeholder={t("pricing.fields.noTax")}
                  />
                </div>
              </div>
              {!canManageTax && (
                <Alert variant="info">
                  <AlertDescription>{t("pricing.taxPermission")}</AlertDescription>
                </Alert>
              )}
              {canManageTax && (
                <div className="border-nx-border space-y-3 rounded-xl border p-4">
                  <div>
                    <p className="font-medium text-nx-ink">{t("pricing.taxSetup.title")}</p>
                    <p className="text-sm text-nx-ink-2">{t("pricing.taxSetup.description")}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="tax-name">{t("pricing.taxSetup.name")}</Label>
                      <Input
                        id="tax-name"
                        value={model.newTaxName}
                        disabled={model.creatingTax}
                        onChange={(event) => model.setNewTaxName(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-code">{t("pricing.taxSetup.code")}</Label>
                      <Input
                        id="tax-code"
                        maxLength={50}
                        dir="ltr"
                        value={model.newTaxCode}
                        disabled={model.creatingTax}
                        onChange={(event) => model.setNewTaxCode(event.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-rate">{t("pricing.taxSetup.rate")}</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        min={0}
                        max={100}
                        step="0.001"
                        dir="ltr"
                        value={model.newTaxRate}
                        disabled={model.creatingTax}
                        onChange={(event) => model.setNewTaxRate(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="tax-inclusive"
                      checked={model.newTaxInclusive}
                      disabled={model.creatingTax}
                      onCheckedChange={(checked) => model.setNewTaxInclusive(checked === true)}
                    />
                    <Label htmlFor="tax-inclusive" className="cursor-pointer text-sm text-nx-ink">
                      {t("pricing.taxSetup.inclusive")}
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={model.creatingTax}
                    onClick={() => void model.createTax()}
                  >
                    {model.creatingTax
                      ? t("pricing.taxSetup.creating")
                      : t("pricing.taxSetup.create")}
                  </Button>
                </div>
              )}
              <Button
                type="button"
                disabled={!canConfigure || model.saving}
                onClick={() => void model.save()}
              >
                {model.saving
                  ? t("pricing.saving")
                  : t(model.configuration ? "pricing.replace" : "pricing.configure")}
              </Button>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
