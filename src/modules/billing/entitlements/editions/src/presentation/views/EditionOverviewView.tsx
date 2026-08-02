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
import { StatCard } from "@core/ui/stat-card";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@core/ui/table";
import {
  ArrowLeft,
  Settings2,
  Zap,
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
    <div className="flex items-start justify-between gap-4 border-b border-nx-line px-5 py-3.5 last:border-b-0">
      <span className="shrink-0 text-sm text-nx-ink-2">{label}</span>
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

  const enabledLabel = t("entitlements.editions.wizard.yes");
  const disabledLabel = t("entitlements.editions.wizard.no");

  if (vm.isLoading) {
    return <LoadingSpinner size="lg" fullHeight />;
  }

  if (vm.error || !vm.edition) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">
          {vm.error?.message || t("entitlements.editions.notFound")}
        </p>
        <Link href="/entitlements/editions">
          <Button variant="ghost" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" /> {t("common.back")}
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
            <p className="mt-1 text-sm text-nx-ink-2">
              {edition.description ||
                edition.tagline ||
                t("entitlements.editions.wizard.overviewDesc")}
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
            {t("entitlements.editions.wizard.editSettings")}
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(`/entitlements/editions/${editionId}`)}
          >
            <Zap className="h-4 w-4" />
            {t("entitlements.editions.wizard.manageFeatures")}
          </Button>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={Layers}
          label={t("entitlements.editions.wizard.tierLevel")}
          value={edition.tierLevel}
          tone="neutral"
        />
        <StatCard
          icon={Zap}
          label={t("entitlements.editions.wizard.featureCountLabel")}
          value={edition.featureCount}
          tone="info"
        />
        <StatCard
          icon={Users}
          label={t("entitlements.editions.wizard.maxSubscriptions")}
          value={
            edition.maxActiveSubscriptions === -1 ? (
              <span className="flex items-center gap-1">
                <Infinity className="h-4 w-4" />
                {t("entitlements.editions.wizard.unlimited")}
              </span>
            ) : (
              edition.maxActiveSubscriptions
            )
          }
          tone="success"
        />
        <StatCard
          icon={Clock}
          label={t("common.createdAt")}
          value={edition.createdAt ? formatUtc(edition.createdAt, "MMM d, yyyy") : "—"}
          tone="neutral"
        />
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── General Information ── */}
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-nx-accent" />
              {t("entitlements.editions.wizard.sectionGeneral")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <InfoRow
              label={t("entitlements.editions.wizard.internalName")}
              value={
                <code className="rounded-nx-sm bg-nx-raised px-2 py-0.5 text-xs">
                  {edition.name}
                </code>
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.displayNameEn")}
              value={edition.displayNameEn}
            />
            <InfoRow
              label={t("entitlements.editions.wizard.displayNameAr")}
              value={edition.displayNameAr || "—"}
            />
            <InfoRow
              label={t("entitlements.editions.wizard.tagline")}
              value={edition.tagline || "—"}
            />
            <InfoRow
              label={t("entitlements.editions.wizard.category")}
              value={
                edition.category ? (
                  <Badge variant="secondary">{edition.category}</Badge>
                ) : (
                  <span className="italic text-nx-ink-2">
                    {t("entitlements.editions.wizard.uncategorized")}
                  </span>
                )
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.overflowPolicy")}
              value={<Badge variant="outline">{edition.overflowPolicy}</Badge>}
            />
            <InfoRow
              label={t("entitlements.editions.wizard.fallbackEdition")}
              value={edition.fallbackEditionName || t("entitlements.editions.wizard.noFallback")}
            />
          </CardContent>
        </Card>

        {/* ── Billing Configuration ── */}
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CalendarRange className="h-4 w-4 text-nx-accent" />
              {t("entitlements.editions.wizard.sectionBilling")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <InfoRow
              label={t("entitlements.editions.wizard.monthly")}
              value={
                <BoolIndicator
                  value={edition.allowMonthly}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.annual")}
              value={
                <BoolIndicator
                  value={edition.allowYearly}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.lifetime")}
              value={
                <BoolIndicator
                  value={edition.allowLifetime}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.billingCycles")}
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
                  <span className="italic text-nx-ink-2">
                    {t("entitlements.editions.wizard.noneFree")}
                  </span>
                )
              }
            />
          </CardContent>
        </Card>

        {/* ── Trial & Grace Period ── */}
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-nx-accent" />
              {t("entitlements.editions.wizard.sectionTrial")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <InfoRow
              label={t("entitlements.editions.wizard.freeTrial")}
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
                  label={t("entitlements.editions.wizard.trialDuration")}
                  value={`${edition.trialDurationDays} ${t("entitlements.editions.wizard.gracePeriodDays")}`}
                />
                <InfoRow
                  label={t("entitlements.editions.wizard.completelyFree")}
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
                    label={t("entitlements.editions.wizard.trialDiscount")}
                    value={`${edition.trialDiscountPercent}%`}
                    mono
                  />
                )}
              </>
            )}
            <InfoRow
              label={t("entitlements.editions.wizard.gracePeriod")}
              value={`${edition.gracePeriodDays} ${t("entitlements.editions.wizard.gracePeriodDays")}`}
            />
          </CardContent>
        </Card>

        {/* ── Access & Checkout ── */}
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingCart className="h-4 w-4 text-nx-accent" />
              {t("entitlements.editions.wizard.sectionAccess")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <InfoRow
              label={t("entitlements.editions.wizard.selfService")}
              value={
                <BoolIndicator
                  value={edition.isSelfServiceEnabled}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.contactSalesOnly")}
              value={
                <BoolIndicator
                  value={edition.isContactSalesOnly}
                  enabledLabel={enabledLabel}
                  disabledLabel={disabledLabel}
                />
              }
            />
            <InfoRow
              label={t("entitlements.editions.wizard.maxSubscriptions")}
              value={
                edition.maxActiveSubscriptions === -1 ? (
                  <span className="flex items-center gap-1">
                    <Infinity className="h-3.5 w-3.5" />
                    {t("entitlements.editions.wizard.unlimited")}
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
          <CardHeader className="border-b bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="h-4 w-4 text-nx-accent" />
              {t("entitlements.editions.wizard.sectionPricing")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("entitlements.editions.wizard.currency")}</TableHead>
                  {cycles.map((c) => (
                    <TableHead key={c}>{c}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(new Set(edition.prices.map((p) => p.currency))).map((currency) => (
                  <TableRow key={currency}>
                    <TableCell className="font-semibold text-nx-ink">{currency}</TableCell>
                    {cycles.map((cycle) => {
                      const price = edition.getPriceForCycle(cycle, currency);
                      const suffix =
                        cycle === "Monthly"
                          ? t("entitlements.editions.wizard.perMonth")
                          : cycle === "Yearly"
                            ? t("entitlements.editions.wizard.perYear")
                            : t("entitlements.editions.wizard.oneTime");
                      return (
                        <TableCell key={cycle}>
                          {price !== undefined ? (
                            <span className="font-semibold tabular-nums text-success">
                              {price.toFixed(2)}{" "}
                              <span className="text-xs font-normal text-nx-ink-3">{suffix}</span>
                            </span>
                          ) : (
                            <span className="text-nx-ink-3">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {edition.prices.length === 0 && edition.isFreeEdition && (
        <EmptyState
          icon={DollarSign}
          title={t("entitlements.editions.wizard.freeTierTitle")}
          description={t("entitlements.editions.wizard.noPricingConfigured")}
        />
      )}

      {/* ── Badges ── */}
      {badges.length > 0 && (
        <Card className="border shadow-none">
          <CardHeader className="border-b bg-[color:color-mix(in_srgb,var(--nx-raised)_30%,transparent)] pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Award className="h-4 w-4 text-nx-accent" />
              {t("entitlements.editions.wizard.sectionBadges")}
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
