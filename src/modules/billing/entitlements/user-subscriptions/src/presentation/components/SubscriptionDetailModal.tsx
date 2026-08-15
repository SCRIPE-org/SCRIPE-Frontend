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
import { DetailRow } from "@core/ui/detail-row";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
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
    <Card className="border border-nx-line bg-nx-raised">
      <CardHeader className="px-5 pb-3 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-nx-accent" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-nx-line px-5 pb-4 pt-0">{children}</CardContent>
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
    Free: t("entitlements.userSubscriptions.statusFree"),
    Trial: t("entitlements.userSubscriptions.statusTrialing"),
    Active: t("entitlements.userSubscriptions.statusActive"),
    PastDue: t("entitlements.userSubscriptions.statusPastDue"),
    Cancelled: t("entitlements.userSubscriptions.statusCancelled"),
    Expired: t("entitlements.userSubscriptions.statusExpired"),
    PendingPayment: t("entitlements.userSubscriptions.statusPendingPayment"),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-nx-md bg-nx-accent-wash"
              aria-hidden="true"
            >
              <Shield className="h-5 w-5 text-nx-accent" />
            </div>
            {t("entitlements.userSubscriptions.detailTitle")}
          </DialogTitle>
        </DialogHeader>

        {/* ── Status Banner ── */}
        <div className="mb-2 flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-raised px-4 py-3">
          <div className="flex items-center gap-3">
            <Badge variant={sub.statusColor} className="px-3 py-1 text-sm">
              {statusMap[sub.status] || sub.status}
            </Badge>
            {sub.isSelfService && (
              <Badge variant="outline" className="text-xs">
                <Globe className="me-1 h-3 w-3" aria-hidden="true" />
                {t("entitlements.userSubscriptions.detailSelfService")}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-nx-ink-2">
            {sub.isAutoRenew && (
              <div className="flex items-center gap-1 text-success">
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("entitlements.userSubscriptions.autoRenew")}</span>
              </div>
            )}
            {sub.isExpiringSoon && (
              <div className="flex items-center gap-1 text-warning">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="tabular-nums">{sub.daysRemaining}d</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* ── User Info ── */}
          <SectionCard title={t("entitlements.userSubscriptions.detailUserInfo")} icon={User}>
            <DetailRow
              icon={User}
              label={t("entitlements.userSubscriptions.user")}
              value={sub.userName || t("entitlements.userSubscriptions.detailUnknownUser")}
            />
            {sub.userEmail && (
              <DetailRow
                icon={Mail}
                label={t("entitlements.userSubscriptions.email")}
                value={sub.userEmail}
                mono
                valueClassName="text-xs text-nx-ink-2"
              />
            )}
          </SectionCard>

          {/* ── Plan & Pricing ── */}
          <SectionCard title={t("entitlements.userSubscriptions.detailPlanInfo")} icon={Zap}>
            <DetailRow
              icon={Tag}
              label={t("entitlements.userSubscriptions.plan")}
              value={sub.planName}
            />
            {sub.billingCycle && (
              <DetailRow
                icon={RefreshCw}
                label={t("entitlements.userSubscriptions.billingCycle")}
                value={sub.billingCycle}
              />
            )}
            {sub.price > 0 && (
              <DetailRow
                icon={CreditCard}
                label={t("entitlements.mySubscription.price")}
                value={
                  <>
                    {sub.formattedPrice}
                    {sub.billingCycle && (
                      <span className="text-xs font-normal text-nx-ink-3">
                        {" "}
                        / {sub.billingCycle.toLowerCase()}
                      </span>
                    )}
                  </>
                }
              />
            )}
            {sub.tenantPlanVersionNumber != null && (
              <DetailRow
                icon={Shield}
                label={t("entitlements.userSubscriptions.detailVersionPinned")}
                value={`v${sub.tenantPlanVersionNumber}`}
              />
            )}
          </SectionCard>

          {/* ── Important Dates ── */}
          <SectionCard title={t("entitlements.userSubscriptions.detailDates")} icon={Calendar}>
            <DetailRow
              icon={CheckCircle2}
              label={t("entitlements.userSubscriptions.startedAt")}
              value={formatDate(sub.startedAt)}
            />
            <DetailRow
              icon={Clock}
              label={t("entitlements.userSubscriptions.expiresAt")}
              value={
                sub.expiresAt
                  ? formatDate(sub.expiresAt)
                  : t("entitlements.userSubscriptions.detailLifetime")
              }
              valueClassName={cn(sub.isExpiringSoon && "text-warning")}
            />
            {sub.trialEndsAt && (
              <DetailRow
                icon={Timer}
                label={t("entitlements.userSubscriptions.trialEnds")}
                value={formatDate(sub.trialEndsAt)}
              />
            )}
            {sub.cancelledAt && (
              <DetailRow
                icon={XCircle}
                label={t("entitlements.userSubscriptions.detailCancelledAt")}
                value={formatDateTime(sub.cancelledAt)}
                valueClassName="text-destructive"
              />
            )}
            {sub.gracePeriodEndsAt && (
              <DetailRow
                icon={AlertTriangle}
                label={t("entitlements.userSubscriptions.detailGracePeriod")}
                value={formatDate(sub.gracePeriodEndsAt)}
                valueClassName="text-warning"
              />
            )}
            <DetailRow
              icon={Calendar}
              label={t("common.createdAt")}
              value={formatDateTime(sub.createdAt)}
            />
            {sub.updatedAt && (
              <DetailRow
                icon={Calendar}
                label={t("common.updatedAt")}
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
                <DetailRow
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
                <DetailRow
                  icon={Globe}
                  label={t("entitlements.userSubscriptions.detailExternalRef")}
                  value={sub.externalRef}
                  mono
                  copyable={sub.externalRef}
                />
              )}
              {sub.originalPrice != null && (
                <DetailRow
                  icon={Tag}
                  label={t("entitlements.userSubscriptions.detailOriginalPrice")}
                  value={sub.formattedOriginalPrice}
                  valueClassName="text-nx-ink-3 line-through"
                />
              )}
            </SectionCard>
          )}

          {/* ── Promotion (conditional) ── */}
          {sub.hasPromotion && (
            <SectionCard title={t("entitlements.userSubscriptions.detailPromotion")} icon={Percent}>
              <DetailRow
                icon={Tag}
                label={t("entitlements.userSubscriptions.promotionCode")}
                value={
                  <Badge variant="secondary" className="font-mono text-xs">
                    {sub.promotionCode}
                  </Badge>
                }
              />
              {sub.discountAmount > 0 && (
                <DetailRow
                  icon={Percent}
                  label={t("entitlements.userSubscriptions.detailDiscountAmount")}
                  value={`-${sub.formattedDiscount}`}
                  valueClassName="text-success"
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
                <p className="whitespace-pre-wrap text-start text-sm leading-relaxed text-nx-ink">
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
