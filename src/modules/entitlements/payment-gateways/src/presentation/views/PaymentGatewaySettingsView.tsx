/**
 * Payment Gateway Settings View
 *
 * Premium settings page for platform super-admins to view all
 * configured payment gateways, their status, and feature matrix.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@core/ui/tooltip";
import {
  CreditCard, Crown, CheckCircle2, XCircle, Globe,
  Smartphone, Shield, RefreshCw, Link2, Info,
  Zap, Wallet, Activity, Power
} from "lucide-react";
import { usePaymentGatewaysViewModel, type GatewayInfo } from "../viewmodels/usePaymentGatewaysViewModel";
import { Button } from "@core/ui/button";
import { Switch } from "@core/ui/switch";

// ── Gateway Icon Map ──
function GatewayIcon({ gateway, size = 24 }: { gateway: string; size?: number }) {
  const iconClass = `h-${size / 4} w-${size / 4}`;
  switch (gateway) {
    case "stripe":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} style={{ color: "#635bff" }}>
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
        </svg>
      );
    case "paypal":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} style={{ color: "#003087" }}>
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788l.038-.2.728-4.616.047-.256a.925.925 0 0 1 .915-.788h.578c3.737 0 6.662-1.518 7.518-5.907.357-1.832.173-3.361-.769-4.436a3.713 3.713 0 0 0-.35-.292z" />
        </svg>
      );
    case "paymob":
      return <Wallet className={iconClass} style={{ color: "#00B2FF" }} />;
    default:
      return <CreditCard className={iconClass} style={{ color: "#6b7280" }} />;
  }
}

// ── Feature Icons Map ──
const FEATURE_ICONS: Record<string, React.ReactNode> = {
  recurring: <RefreshCw className="h-3.5 w-3.5" />,
  billingPortal: <CreditCard className="h-3.5 w-3.5" />,
  multiCurrency: <Globe className="h-3.5 w-3.5" />,
  mobileWallet: <Smartphone className="h-3.5 w-3.5" />,
  webhooks: <Zap className="h-3.5 w-3.5" />,
  refunds: <RefreshCw className="h-3.5 w-3.5" />,
  paymentLinks: <Link2 className="h-3.5 w-3.5" />,
  threeDSecure: <Shield className="h-3.5 w-3.5" />,
  tokenizedRecurring: <RefreshCw className="h-3.5 w-3.5" />,
  menaCurrencies: <Globe className="h-3.5 w-3.5" />,
  checkout: <CreditCard className="h-3.5 w-3.5" />,
};

function GatewayCard({ 
  gw, 
  isDefault, 
  t,
  onTestConnection,
  onToggleStatus,
  isTesting,
  isToggling
}: { 
  gw: GatewayInfo; 
  isDefault: boolean; 
  t: (key: string) => string;
  onTestConnection: (gateway: string) => void;
  onToggleStatus: (gateway: string, enabled: boolean) => void;
  isTesting: boolean;
  isToggling: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ${
        gw.enabled
          ? "border-border/60 bg-card hover:shadow-lg hover:shadow-primary/5"
          : "border-muted/40 bg-muted/20 opacity-75"
      }`}
    >
      {/* Gradient top bar */}
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ background: gw.enabled ? gw.color : "#6b7280" }}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center h-12 w-12 rounded-xl"
              style={{
                background: gw.enabled
                  ? `${gw.color}15`
                  : "var(--muted)",
              }}
            >
              <GatewayIcon gateway={gw.icon} size={24} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {gw.displayName}
                {isDefault && (
                  <Badge
                    variant="secondary"
                    className="text-xs gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  >
                    <Crown className="h-3 w-3" />
                    {t("billing.gateways.default")}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {t(`billing.gateways.${gw.description}`) || gw.description}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={gw.enabled ? "default" : "secondary"}
            className={`text-xs ${
              gw.enabled
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {gw.enabled ? (
              <>
                <CheckCircle2 className="h-3 w-3 me-1" />
                {t("billing.gateways.enabled")}
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 me-1" />
                {t("billing.gateways.disabled")}
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Feature Capabilities */}
        {gw.features.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t("billing.gateways.features")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {gw.features.map((f) => (
                <Badge
                  key={f}
                  variant="outline"
                  className="text-[10px] gap-1 font-normal py-0.5 px-2"
                >
                  {FEATURE_ICONS[f] || null}
                  {t(`billing.gateways.${f}`) || f}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Capabilities Row */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {gw.supportsRecurring ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
            )}
            {t("billing.gateways.supportsRecurring")}
          </div>
          <div className="flex items-center gap-1">
            {gw.supportsBillingPortal ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
            )}
            {t("billing.gateways.supportsBillingPortal")}
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTestConnection(gw.gateway)}
            disabled={isTesting}
            className="text-xs h-8"
          >
            <Activity className="h-3.5 w-3.5 me-1.5" />
            {t("billing.gateways.testConnection")}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t("common.status")}
            </span>
            {isDefault ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Switch
                      checked={gw.enabled}
                      onCheckedChange={(checked) => onToggleStatus(gw.gateway, checked)}
                      disabled={true}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("billing.gateways.defaultGatewayCannotBeDisabled") || "Default gateways cannot be disabled."}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Switch
                checked={gw.enabled}
                onCheckedChange={(checked) => onToggleStatus(gw.gateway, checked)}
                disabled={isToggling}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Loading Skeleton ──
function GatewayCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-muted" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-20 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main View ──
export function PaymentGatewaySettingsView() {
  const { t } = useI18n();
  const vm = usePaymentGatewaysViewModel();

  return (
    <div className="space-y-6 p-1">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          {t("billing.gateways.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("billing.gateways.description")}
        </p>
      </div>

      {/* Stats Bar */}
      {!vm.isLoading && (
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm gap-1.5 py-1.5 px-3">
            <Crown className="h-3.5 w-3.5 text-amber-500" />
            {t("billing.gateways.defaultGateway")}: <strong>{vm.defaultGateway}</strong>
          </Badge>
          <Badge variant="outline" className="text-sm gap-1.5 py-1.5 px-3">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {vm.enabledCount} / {vm.totalCount} {t("billing.gateways.enabled")}
          </Badge>
        </div>
      )}

      {/* Gateway Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vm.isLoading ? (
          <>
            <GatewayCardSkeleton />
            <GatewayCardSkeleton />
            <GatewayCardSkeleton />
          </>
        ) : (
          vm.gateways.map((gw) => (
            <GatewayCard
              key={gw.gateway}
              gw={gw}
              isDefault={gw.gateway === vm.defaultGateway}
              t={t}
              onTestConnection={vm.testConnection}
              onToggleStatus={vm.toggleStatus}
              isTesting={vm.isTestingConnection}
              isToggling={vm.isTogglingStatus}
            />
          ))
        )}
      </div>

      {/* Config Note */}
      {!vm.isLoading && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="flex items-start gap-3 p-4">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("billing.gateways.configNote")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {vm.error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{vm.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
