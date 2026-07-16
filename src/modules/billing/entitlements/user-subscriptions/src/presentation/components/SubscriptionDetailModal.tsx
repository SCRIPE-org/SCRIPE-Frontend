// FILE-EXCEPTION: file length
/**
 * SubscriptionDetailModal — Comprehensive read-only detail view for a UserSubscription.
 *
 * Shows all subscription data in a rich, sectioned card layout with status badges,
 * formatted dates, pricing info, payment details, and admin notes.
 */
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { UserSubscription } from "../../domain/entities/UserSubscription";
import { formatUtc } from "@core/common/utils";
import {
  User,
  Mail,
  CreditCard,
  Calendar,
  Clock,
  Tag,
  Shield,
  FileText,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Timer,
  Percent,
  Globe,
} from "lucide-react";

interface SubscriptionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: UserSubscription | null;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon?: React.ElementType;
  label: string;
  value: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="flex min-w-[140px] items-center gap-2.5 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={`text-right text-sm font-medium ${valueColor ?? ""}`}>{value}</div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card className="border border-border/50 bg-muted/30">
      <CardHeader className="px-5 pb-3 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4 pt-0">
        <div className="divide-y divide-border/30">{children}</div>
      </CardContent>
    </Card>
  );
}

function formatDate(value?: string): string {
  if (!value) return "—";
  try {
    return formatUtc(value, "PPP");
  } catch {
    return value;
  }
}

function formatDateTime(value?: string): string {
  if (!value) return "—";
  try {
    return formatUtc(value, "PPPp");
  } catch {
    return value;
  }
}

/**
 * Presentation UI component rendering the subscription detail modal.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SubscriptionDetailModal({
  open,
  onOpenChange,
  subscription: sub,
}: SubscriptionDetailModalProps) {
  const { t } = useI18n();

  if (!sub) return null;

  const statusMap: Record<string, string> = {
    Free: t("entitlements.userSubscriptions.statusFree") || "Free",
    Trial: t("entitlements.userSubscriptions.statusTrialing") || "Trial",
    Active: t("entitlements.userSubscriptions.statusActive") || "Active",
    PastDue: t("entitlements.userSubscriptions.statusPastDue") || "Past Due",
    Cancelled: t("entitlements.userSubscriptions.statusCancelled") || "Cancelled",
    Expired: t("entitlements.userSubscriptions.statusExpired") || "Expired",
    PendingPayment: t("entitlements.userSubscriptions.statusPendingPayment") || "Pending Payment",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            {t("entitlements.userSubscriptions.detailTitle")}
          </DialogTitle>
        </DialogHeader>

        {/* ── Status Banner ── */}
        <div className="mb-2 flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <Badge variant={sub.statusColor} className="px-3 py-1 text-sm">
              {statusMap[sub.status] || sub.status}
            </Badge>
            {sub.isSelfService && (
              <Badge variant="outline" className="text-xs">
                <Globe className="mr-1 h-3 w-3" />
                {t("entitlements.userSubscriptions.detailSelfService")}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {sub.isAutoRenew && (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{t("entitlements.userSubscriptions.autoRenew")}</span>
              </div>
            )}
            {sub.isExpiringSoon && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{sub.daysRemaining}d</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* ── User Info ── */}
          <SectionCard title={t("entitlements.userSubscriptions.detailUserInfo")} icon={User}>
            <InfoRow
              icon={User}
              label={t("entitlements.userSubscriptions.user")}
              value={sub.userName || t("entitlements.userSubscriptions.detailUnknownUser")}
            />
            {sub.userEmail && (
              <InfoRow
                icon={Mail}
                label="Email"
                value={
                  <span className="font-mono text-xs text-muted-foreground">{sub.userEmail}</span>
                }
              />
            )}
          </SectionCard>

          {/* ── Plan & Pricing ── */}
          <SectionCard title={t("entitlements.userSubscriptions.detailPlanInfo")} icon={Zap}>
            <InfoRow
              icon={Tag}
              label={t("entitlements.userSubscriptions.plan")}
              value={<span className="font-semibold text-foreground">{sub.planName}</span>}
            />
            {sub.billingCycle && (
              <InfoRow
                icon={RefreshCw}
                label={t("entitlements.userSubscriptions.billingCycle")}
                value={sub.billingCycle}
              />
            )}
            {sub.price > 0 && (
              <InfoRow
                icon={CreditCard}
                label={t("entitlements.mySubscription.price")}
                value={
                  <span className="font-semibold text-foreground">
                    {sub.formattedPrice}
                    {sub.billingCycle && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}
                        / {sub.billingCycle.toLowerCase()}
                      </span>
                    )}
                  </span>
                }
              />
            )}
            {sub.tenantPlanVersionNumber != null && (
              <InfoRow
                icon={Shield}
                label={t("entitlements.userSubscriptions.detailVersionPinned")}
                value={`v${sub.tenantPlanVersionNumber}`}
              />
            )}
          </SectionCard>

          {/* ── Important Dates ── */}
          <SectionCard title={t("entitlements.userSubscriptions.detailDates")} icon={Calendar}>
            <InfoRow
              icon={CheckCircle2}
              label={t("entitlements.userSubscriptions.startedAt")}
              value={formatDate(sub.startedAt)}
            />
            <InfoRow
              icon={Clock}
              label={t("entitlements.userSubscriptions.expiresAt")}
              value={
                sub.expiresAt
                  ? formatDate(sub.expiresAt)
                  : t("entitlements.userSubscriptions.detailLifetime")
              }
              valueColor={sub.isExpiringSoon ? "text-amber-600 dark:text-amber-400" : undefined}
            />
            {sub.trialEndsAt && (
              <InfoRow
                icon={Timer}
                label={t("entitlements.userSubscriptions.trialEnds")}
                value={formatDate(sub.trialEndsAt)}
              />
            )}
            {sub.cancelledAt && (
              <InfoRow
                icon={XCircle}
                label={t("entitlements.userSubscriptions.detailCancelledAt")}
                value={formatDateTime(sub.cancelledAt)}
                valueColor="text-red-600 dark:text-red-400"
              />
            )}
            {sub.gracePeriodEndsAt && (
              <InfoRow
                icon={AlertTriangle}
                label={t("entitlements.userSubscriptions.detailGracePeriod")}
                value={formatDate(sub.gracePeriodEndsAt)}
                valueColor="text-amber-600 dark:text-amber-400"
              />
            )}
            <InfoRow
              icon={Calendar}
              label={t("common.createdAt")}
              value={formatDateTime(sub.createdAt)}
            />
            {sub.updatedAt && (
              <InfoRow
                icon={Calendar}
                label={t("common.updatedAt") || "Updated"}
                value={formatDateTime(sub.updatedAt)}
              />
            )}
          </SectionCard>

          {/* ── Payment & Billing (conditional) ── */}
          {(sub.paymentMethod || sub.externalRef || sub.originalPrice != null) && (
            <SectionCard
              title={t("entitlements.userSubscriptions.detailPayment")}
              icon={CreditCard}
            >
              {sub.paymentMethod && (
                <InfoRow
                  icon={CreditCard}
                  label={t("entitlements.userSubscriptions.detailPaymentMethod")}
                  value={
                    <Badge variant="outline" className="text-xs capitalize">
                      {sub.paymentMethod}
                    </Badge>
                  }
                />
              )}
              {sub.externalRef && (
                <InfoRow
                  icon={Globe}
                  label={t("entitlements.userSubscriptions.detailExternalRef")}
                  value={
                    <span
                      className="inline-block max-w-[200px] truncate font-mono text-xs"
                      title={sub.externalRef}
                    >
                      {sub.externalRef}
                    </span>
                  }
                />
              )}
              {sub.originalPrice != null && (
                <InfoRow
                  icon={Tag}
                  label={t("entitlements.userSubscriptions.detailOriginalPrice")}
                  value={
                    <span className="text-muted-foreground line-through">
                      {sub.formattedOriginalPrice}
                    </span>
                  }
                />
              )}
            </SectionCard>
          )}

          {/* ── Promotion (conditional) ── */}
          {sub.hasPromotion && (
            <SectionCard title={t("entitlements.userSubscriptions.detailPromotion")} icon={Percent}>
              <InfoRow
                icon={Tag}
                label={t("entitlements.userSubscriptions.promotionCode")}
                value={
                  <Badge variant="secondary" className="font-mono text-xs">
                    {sub.promotionCode}
                  </Badge>
                }
              />
              {sub.discountAmount > 0 && (
                <InfoRow
                  icon={Percent}
                  label={t("entitlements.userSubscriptions.detailDiscountAmount")}
                  value={
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      -{sub.formattedDiscount}
                    </span>
                  }
                />
              )}
            </SectionCard>
          )}

          {/* ── Admin Notes (conditional) ── */}
          {sub.notes && (
            <SectionCard
              title={t("entitlements.userSubscriptions.detailAdminNotes")}
              icon={FileText}
            >
              <div className="py-2.5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {sub.notes}
                </p>
              </div>
            </SectionCard>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
