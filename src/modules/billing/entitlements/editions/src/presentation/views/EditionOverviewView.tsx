// FILE-EXCEPTION: file length
"use client";
/**
 * EditionOverviewView — Premium read-only detail page.
 * Shows all edition configuration in a beautifully designed card layout.
 * This is the "View" action destination from the editions list.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import {
  ArrowLeft,
  Settings2,
  Zap,
  Loader2,
  Tag,
  DollarSign,
  ShieldCheck,
  Clock,
  CalendarRange,
  ShoppingCart,
  Award,
  Layers,
  Users,
  Check,
  X,
  Infinity,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatUtc } from "@core/common/utils";
import { useEditionDetailViewModel } from "../viewmodels/useEditionDetailViewModel";

interface EditionOverviewViewProps {
  editionId: string;
}

/* ── Helper: Stat Card ── */
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="space-y-2 border border-border bg-card p-4 transition-colors hover:bg-muted/20">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-md ${accent || "bg-primary/10"}`}
        >
          <Icon className={`h-3.5 w-3.5 ${accent ? "text-white" : "text-primary"}`} />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="text-lg font-bold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

/* ── Helper: Info Row ── */
function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-3.5 last:border-b-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className={`text-end text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

/* ── Helper: Bool indicator ── */
function BoolIndicator({
  value,
  enabledLabel,
  disabledLabel,
}: {
  value: boolean;
  enabledLabel?: string;
  disabledLabel?: string;
}) {
  return value ? (
    <Badge variant="default" className="gap-1 text-xs">
      <Check className="h-3 w-3" /> {enabledLabel || "Enabled"}
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1 text-xs">
      <X className="h-3 w-3" /> {disabledLabel || "Disabled"}
    </Badge>
  );
}

/**
 * Presentation UI component rendering the edition overview view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function EditionOverviewView({ editionId }: EditionOverviewViewProps) {
  useModuleLocales(() => import("../../../locales"), "editions");
  const { t, language } = useI18n();
  const vm = useEditionDetailViewModel(editionId);
  const router = useRouter();

  const enabledLabel = t("entitlements.editions.wizard.yes") || "Enabled";
  const disabledLabel = t("entitlements.editions.wizard.no") || "Disabled";

  if (vm.isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("common.loading") || "Loading…"}</p>
      </div>
    );
  }

  if (vm.error || !vm.edition) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">
          {vm.error?.message || t("entitlements.editions.notFound") || "Edition not found"}
        </p>
        <Link href="/entitlements/editions">
          <Button variant="ghost" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> {t("common.back") || "Back"}
          </Button>
        </Link>
      </div>
    );
  }

  const edition = vm.edition;
  const badges = edition.recommendationLabels;
  const cycles = edition.supportedCycles;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* ── Hero Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/entitlements/editions">
            <Button variant="ghost" size="icon" className="mt-1 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {edition.getDisplayName(language)}
              </h1>
              {edition.isSystem && (
                <Badge
                  variant="outline"
                  className="border-warning/50 font-mono text-xs text-warning"
                >
                  SYSTEM
                </Badge>
              )}
              {edition.isRetired && (
                <Badge variant="destructive" className="text-xs">
                  RETIRED
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {edition.description ||
                edition.tagline ||
                t("entitlements.editions.wizard.overviewDesc") ||
                "Complete edition overview"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(`/entitlements/editions/${editionId}/edit`)}
          >
            <Settings2 className="h-4 w-4" />
            {t("entitlements.editions.wizard.editSettings") || "Edit Settings"}
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(`/entitlements/editions/${editionId}`)}
          >
            <Zap className="h-4 w-4" />
            {t("entitlements.editions.wizard.manageFeatures") || "Manage Features"}
          </Button>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={Layers}
          label={t("entitlements.editions.wizard.tierLevel") || "Tier Level"}
          value={edition.tierLevel}
          accent="bg-primary"
        />
        <StatCard
          icon={Zap}
          label={t("entitlements.editions.wizard.featureCountLabel") || "Features"}
          value={edition.featureCount}
          accent="bg-info"
        />
        <StatCard
          icon={Users}
          label={t("entitlements.editions.wizard.maxSubscriptions") || "Max Subscriptions"}
          value={
            edition.maxActiveSubscriptions === -1 ? (
              <span className="flex items-center gap-1">
                <Infinity className="h-4 w-4" />
                {t("entitlements.editions.wizard.unlimited") || "Unlimited"}
              </span>
            ) : (
              edition.maxActiveSubscriptions
            )
          }
          accent="bg-success"
        />
        <StatCard
          icon={Clock}
          label={t("common.createdAt") || "Created"}
          value={edition.createdAt ? formatUtc(edition.createdAt, "MMM d, yyyy") : "—"}
          accent="bg-muted-foreground"
        />
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── General Information ── */}
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-primary" />
              {t("entitlements.editions.wizard.sectionGeneral") || "General Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <InfoRow
              label={t("entitlements.editions.wizard.internalName") || "Internal Name"}
              value={<code className="rounded bg-muted px-2 py-0.5 text-xs">{edition.name}</code>}
            />
            <InfoRow
              label={t("entitlements.editions.wizard.displayNameEn") || "Display (EN)"}
              value={edition.displayNameEn}
            />
            <InfoRow
              label={t("entitlements.editions.wizard.displayNameAr") || "Display (AR)"}
              value={edition.displayNameAr || "—"}
            />
            <InfoRow
              label={t("entitlements.editions.wizard.tagline") || "Tagline"}
              value={edition.tagline || "—"}
            />
            <InfoRow
              label={t("entitlements.editions.wizard.category") || "Category"}
              value={
                edition.category ? (
                  <Badge variant="secondary">{edition.category}</Badge>
                ) : (
                  <span className="italic text-muted-foreground">
                    {t("entitlements.editions.wizard.uncategorized") || "Uncategorized"}
                  </span>
                )
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.overflowPolicy") || "Overflow Policy"}
              value={<Badge variant="outline">{edition.overflowPolicy}</Badge>}
            />
            <InfoRow
              label={t("entitlements.editions.wizard.fallbackEdition") || "Fallback Edition"}
              value={
                edition.fallbackEditionName ||
                t("entitlements.editions.wizard.noFallback") ||
                "None"
              }
            />
          </CardContent>
        </Card>

        {/* ── Billing Configuration ── */}
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CalendarRange className="h-4 w-4 text-primary" />
              {t("entitlements.editions.wizard.sectionBilling") || "Billing Configuration"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <InfoRow
              label={t("entitlements.editions.wizard.monthly") || "Monthly"}
              value={
                <BoolIndicator
                  value={edition.allowMonthly}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.annual") || "Annual"}
              value={
                <BoolIndicator
                  value={edition.allowYearly}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.lifetime") || "Lifetime"}
              value={
                <BoolIndicator
                  value={edition.allowLifetime}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.billingCycles") || "Active Cycles"}
              value={
                cycles.length > 0 ? (
                  <div className="flex flex-wrap justify-end gap-1">
                    {cycles.map((c) => (
                      <Badge key={c} variant="outline" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="italic text-muted-foreground">
                    {t("entitlements.editions.wizard.noneFree") || "None (Free)"}
                  </span>
                )
              }
            />
          </CardContent>
        </Card>

        {/* ── Trial & Grace Period ── */}
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t("entitlements.editions.wizard.sectionTrial") || "Trial & Grace Period"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <InfoRow
              label={t("entitlements.editions.wizard.freeTrial") || "Free Trial"}
              value={
                <BoolIndicator
                  value={edition.allowTrial}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            {edition.allowTrial && (
              <>
                <InfoRow
                  label={t("entitlements.editions.wizard.trialDuration") || "Duration"}
                  value={`${edition.trialDurationDays} ${t("entitlements.editions.wizard.gracePeriodDays") || "days"}`}
                />
                <InfoRow
                  label={t("entitlements.editions.wizard.completelyFree") || "Completely Free"}
                  value={
                    <BoolIndicator
                      value={edition.trialIsFree}
                      enabledLabel={enabledLabel}
                      disabledLabel={disabledLabel}
                    />
                  }
                />
                {!edition.trialIsFree && (
                  <InfoRow
                    label={t("entitlements.editions.wizard.trialDiscount") || "Discount"}
                    value={`${edition.trialDiscountPercent}%`}
                    mono
                  />
                )}
              </>
            )}
            <InfoRow
              label={t("entitlements.editions.wizard.gracePeriod") || "Grace Period"}
              value={`${edition.gracePeriodDays} ${t("entitlements.editions.wizard.gracePeriodDays") || "days"}`}
            />
          </CardContent>
        </Card>

        {/* ── Access & Checkout ── */}
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingCart className="h-4 w-4 text-primary" />
              {t("entitlements.editions.wizard.sectionAccess") || "Access & Checkout"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <InfoRow
              label={t("entitlements.editions.wizard.selfService") || "Self-Service"}
              value={
                <BoolIndicator
                  value={edition.isSelfServiceEnabled}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.contactSalesOnly") || "Contact Sales Only"}
              value={
                <BoolIndicator
                  value={edition.isContactSalesOnly}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.maxSubscriptions") || "Max Subscriptions"}
              value={
                edition.maxActiveSubscriptions === -1 ? (
                  <span className="flex items-center gap-1">
                    <Infinity className="h-3.5 w-3.5" />
                    {t("entitlements.editions.wizard.unlimited") || "Unlimited"}
                  </span>
                ) : (
                  <span className="tabular-nums">{edition.maxActiveSubscriptions}</span>
                )
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Pricing Matrix (full width) ── */}
      {edition.prices.length > 0 && (
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="h-4 w-4 text-primary" />
              {t("entitlements.editions.wizard.sectionPricing") || "Pricing Matrix"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("entitlements.editions.wizard.currency") || "Currency"}
                    </th>
                    {cycles.map((c) => (
                      <th
                        key={c}
                        className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Array.from(new Set(edition.prices.map((p) => p.currency))).map((currency) => (
                    <tr key={currency} className="transition-colors hover:bg-muted/20">
                      <td className="px-5 py-3.5 font-semibold text-foreground">{currency}</td>
                      {cycles.map((cycle) => {
                        const price = edition.getPriceForCycle(cycle, currency);
                        const suffix =
                          cycle === "Monthly"
                            ? t("entitlements.editions.wizard.perMonth") || "/mo"
                            : cycle === "Yearly"
                              ? t("entitlements.editions.wizard.perYear") || "/yr"
                              : t("entitlements.editions.wizard.oneTime") || "one-time";
                        return (
                          <td key={cycle} className="px-5 py-3.5">
                            {price !== undefined ? (
                              <span className="font-semibold tabular-nums text-success">
                                {price.toFixed(2)}{" "}
                                <span className="text-xs font-normal text-muted-foreground">
                                  {suffix}
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {edition.prices.length === 0 && edition.isFreeEdition && (
        <Card className="border shadow-none">
          <CardContent className="py-8 text-center">
            <DollarSign className="mx-auto mb-3 h-8 w-8 text-success" />
            <p className="text-sm font-medium text-foreground">
              {t("entitlements.editions.wizard.freeTierTitle") || "Free Tier"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("entitlements.editions.wizard.noPricingConfigured") || "No pricing configured."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Badges ── */}
      {badges.length > 0 && (
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Award className="h-4 w-4 text-primary" />
              {t("entitlements.editions.wizard.sectionBadges") || "Recommendation Badges"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge} className="px-3 py-1 text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
