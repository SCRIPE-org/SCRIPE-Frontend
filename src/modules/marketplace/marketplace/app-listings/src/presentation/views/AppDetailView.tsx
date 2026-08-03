// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

import { useState } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Separator } from "@core/ui/separator";
import { Skeleton } from "@core/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Globe,
  EyeOff,
  Star,
  Zap,
  Tag,
  ShoppingBag,
  MessageSquare,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAppDetailViewModel } from "../viewmodels/useAppDetailViewModel";
import { formatUtc } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { AppReview } from "@modules/marketplace";
import Image from "next/image";

interface AppDetailViewProps {
  /** The AppListing ID from route [id] */
  id: string;
}

/**
 * AppDetailView (Phase 5.1)
 *
 * Full-page detail view for a marketplace app listing.
 * Provides:
 *   - Screenshot carousel with prev/next navigation
 *   - Pricing / billing interval card
 *   - App metadata (category, tags, version, developer)
 *   - Admin actions (publish/unpublish, featured toggle)
 *   - Reviews tab with moderation (delete) capability
 *
 * Pure presentational — all state and business logic in useAppDetailViewModel.
 */
export function AppDetailView({ id }: AppDetailViewProps) {
  const vm = useAppDetailViewModel(id);
  const { t } = useI18n();

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (vm.isLoading) {
    return (
      <div
        className="mx-auto flex max-w-5xl flex-col gap-6 p-6"
        role="status"
        aria-busy="true"
        aria-label={t("common.loading")}
      >
        <Skeleton shape="title" className="h-8 w-40" />
        <Skeleton className="h-64 rounded-nx-lg" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="col-span-2 h-32 rounded-nx-lg" />
          <Skeleton className="h-32 rounded-nx-lg" />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (vm.isError || !vm.listing) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <ErrorMessage message={t("marketplace.detailFailedToLoad")} />
        <Button variant="outline" size="sm" asChild>
          <Link href="/marketplace">{t("marketplace.detailBackToListings")}</Link>
        </Button>
      </div>
    );
  }

  const { listing } = vm;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      {/* ── Back navigation ── */}
      <Link
        href="/marketplace"
        className="flex w-fit items-center gap-2 text-sm text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        {t("marketplace.detailBackToListings")}
      </Link>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        {/* App icon */}
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-nx-lg border border-nx-line bg-nx-raised">
          {listing.iconUrl ? (
            <Image src={listing.iconUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-nx-ink-2" aria-hidden="true">
              {listing.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold text-nx-ink">{listing.name}</h1>
            {listing.isFeatured && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="size-3" aria-hidden="true" />{" "}
                {t("marketplace.listingsFeaturedBadge")}
              </Badge>
            )}
            <Badge variant={listing.isPublished ? "default" : "outline"}>
              {listing.statusLabel}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-nx-ink-2">
            <span className="font-medium text-nx-ink">{listing.developerName}</span>
            {" · "}
            {listing.categoryName}
            {" · "}v{listing.version}
          </p>
          <div className="mt-1 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                aria-hidden="true"
                className={`size-4 ${i < Math.round(listing.averageRating) ? "fill-warning text-warning" : "text-nx-ink-3"}`}
              />
            ))}
            <span className="ms-1 text-sm font-medium text-nx-ink">{listing.ratingLabel}</span>
            <span className="text-sm text-nx-ink-2">({listing.reviewCount})</span>
          </div>
        </div>

        {/* Admin action bar */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {listing.isPublished ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => vm.unpublish()}
              disabled={vm.isPublishing}
            >
              <EyeOff className="size-3.5" aria-hidden="true" />{" "}
              {t("marketplace.listingsUnpublishAction")}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="gap-1.5"
              onClick={() => vm.publish()}
              disabled={vm.isPublishing}
            >
              <Globe className="size-3.5" aria-hidden="true" />{" "}
              {t("marketplace.listingsPublishAction")}
            </Button>
          )}
          <Button
            size="sm"
            variant={listing.isFeatured ? "secondary" : "ghost"}
            className="gap-1.5"
            onClick={() => vm.toggleFeatured()}
            disabled={vm.isTogglingFeatured}
          >
            <Zap className="size-3.5" aria-hidden="true" />
            {listing.isFeatured
              ? t("marketplace.detailUnfeatureAction")
              : t("marketplace.detailFeatureAction")}
          </Button>
        </div>
      </div>

      {/* ── Screenshot carousel (Phase 5.1) ─────────────────────────────────── */}
      {listing.screenshotUrls.length > 0 && (
        <div className="relative overflow-hidden rounded-nx-lg border border-nx-line bg-nx-raised">
          <Image
            src={listing.screenshotUrls[vm.screenshotIndex]}
            alt={t("marketplace.detailScreenshotAlt", { count: vm.screenshotIndex + 1 })}
            className="h-72 w-full object-cover"
          />
          {listing.screenshotUrls.length > 1 && (
            <>
              <button
                type="button"
                onClick={vm.prevScreenshot}
                disabled={vm.screenshotIndex === 0}
                className="absolute start-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-nx-line bg-nx-popover text-nx-ink transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-raised-2 focus-visible:shadow-nx-focus focus-visible:outline-none disabled:pointer-events-none disabled:text-nx-ink-3 motion-reduce:transition-none"
                aria-label={t("marketplace.detailPrevScreenshot")}
              >
                <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={vm.nextScreenshot}
                disabled={vm.screenshotIndex === listing.screenshotUrls.length - 1}
                className="absolute end-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-nx-line bg-nx-popover text-nx-ink transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-raised-2 focus-visible:shadow-nx-focus focus-visible:outline-none disabled:pointer-events-none disabled:text-nx-ink-3 motion-reduce:transition-none"
                aria-label={t("marketplace.detailNextScreenshot")}
              >
                <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
              </button>
              {/* Dot indicators */}
              <div className="absolute bottom-3 start-1/2 flex -translate-x-1/2 gap-1.5 rtl:translate-x-1/2">
                {listing.screenshotUrls.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => vm.setScreenshotIndex(i)}
                    className={`size-2 rounded-full transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none ${
                      i === vm.screenshotIndex
                        ? "bg-nx-on-fill"
                        : "bg-[color:color-mix(in_srgb,var(--nx-on-fill)_50%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--nx-on-fill)_80%,transparent)]"
                    }`}
                    aria-label={t("marketplace.detailScreenshotAlt", { count: i + 1 })}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Info grid (description + pricing) ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Description */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <h2 className="text-base font-semibold text-nx-ink">
              {t("marketplace.detailAboutApp")}
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-nx-ink-2">{listing.description}</p>
            {listing.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Tag className="mt-0.5 size-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
                {listing.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="px-2 py-0 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing card (Phase 5.1) */}
        <Card>
          <CardHeader className="pb-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-nx-ink">
              <ShoppingBag className="size-4" aria-hidden="true" />{" "}
              {t("marketplace.detailPricingTitle")}
            </h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="text-3xl font-bold tabular-nums tracking-tight text-nx-ink">
              {listing.pricingLabel}
            </div>
            {listing.pricingModel === "Subscription" && listing.billingInterval && (
              <p className="text-xs text-nx-ink-2">
                {listing.billingInterval === "Annual"
                  ? t("marketplace.detailBilledAnnually")
                  : t("marketplace.detailBilledMonthly")}
              </p>
            )}
            {listing.pricingModel === "Free" && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />{" "}
                {t("marketplace.detailNoCost")}
              </div>
            )}
            <Separator />
            <dl className="space-y-1 text-xs text-nx-ink-2">
              <div className="flex justify-between">
                <dt>{t("marketplace.detailModel")}</dt>
                <dd className="font-medium text-nx-ink">{listing.pricingModel}</dd>
              </div>
              {listing.currency && (
                <div className="flex justify-between">
                  <dt>{t("marketplace.detailCurrency")}</dt>
                  <dd className="font-medium text-nx-ink">{listing.currency}</dd>
                </div>
              )}
              {listing.publishedAt && (
                <div className="flex justify-between">
                  <dt>{t("marketplace.statsPublished")}</dt>
                  <dd className="font-medium tabular-nums text-nx-ink">
                    {formatUtc(listing.publishedAt, "MMM d, yyyy")}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs: Reviews / Details ─────────────────────────────────────────── */}
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews" className="gap-1.5">
            <MessageSquare className="size-3.5" aria-hidden="true" />
            {t("marketplace.detailReviewsTab")}
            {vm.reviewsTotalCount > 0 && (
              <Badge variant="secondary" className="ms-1 px-1.5 py-0 text-xs">
                {vm.reviewsTotalCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="details">{t("common.details")}</TabsTrigger>
        </TabsList>

        {/* Reviews tab */}
        <TabsContent value="reviews" className="mt-4">
          {vm.isLoadingReviews ? (
            <div
              className="flex flex-col gap-3"
              role="status"
              aria-busy="true"
              aria-label={t("common.loading")}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-nx-lg" />
              ))}
            </div>
          ) : vm.reviews.length === 0 ? (
            <EmptyState icon={MessageSquare} title={t("marketplace.detailNoReviewsYet")} />
          ) : (
            <div className="flex flex-col gap-3">
              {vm.reviews.map((review: AppReview) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onDelete={() => vm.deleteReview(review.id)}
                  isDeleting={vm.isDeletingReview}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Details tab */}
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="mb-1 text-xs text-nx-ink-2">
                    {t("marketplace.detailVersionLabel")}
                  </dt>
                  <dd className="font-medium text-nx-ink">{listing.version}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-nx-ink-2">
                    {t("marketplace.detailCategoryLabel")}
                  </dt>
                  <dd className="font-medium text-nx-ink">{listing.categoryName}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-nx-ink-2">
                    {t("marketplace.detailDeveloperLabel")}
                  </dt>
                  <dd className="font-medium text-nx-ink">{listing.developerName}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-nx-ink-2">
                    {t("marketplace.detailRatingLabel")}
                  </dt>
                  <dd className="font-medium tabular-nums text-nx-ink">{listing.ratingLabel}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-nx-ink-2">
                    {t("marketplace.detailReviewCountLabel")}
                  </dt>
                  <dd className="font-medium tabular-nums text-nx-ink">{listing.reviewCount}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-nx-ink-2">{t("common.created")}</dt>
                  <dd className="font-medium tabular-nums text-nx-ink">
                    {formatUtc(listing.createdAt, "MMM d, yyyy")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Review Card sub-component ─────────────────────────────────────────────────

interface ReviewCardProps {
  review: AppReview;
  onDelete: () => void;
  isDeleting: boolean;
}

/**
 * ReviewCard
 *
 * Displays a single app review with moderation (delete) action.
 * Pure presentational — callbacks from AppDetailView. The delete action is
 * irreversible (it removes the review outright), so it is routed through a
 * real confirmation step rather than firing on the first click.
 */
function ReviewCard({ review, onDelete, isDeleting }: ReviewCardProps) {
  const { t } = useI18n();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card className="flex flex-row items-start gap-4 p-4">
      {/* Star rating */}
      <div className="flex shrink-0 gap-0.5 pt-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            aria-hidden="true"
            className={`size-3.5 ${i < review.rating ? "fill-warning text-warning" : "text-nx-ink-3"}`}
          />
        ))}
      </div>

      <div className="min-w-0 flex-1">
        {review.title && <p className="text-sm font-medium text-nx-ink">{review.title}</p>}
        {review.body && <p className="mt-0.5 line-clamp-3 text-xs text-nx-ink-2">{review.body}</p>}
        {/* No tenant/reviewer name field exists on the backend review DTO — show the date alone. */}
        <p className="mt-1 text-xs text-nx-ink-3">{formatUtc(review.createdAt, "MMM d, yyyy")}</p>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="shrink-0 text-destructive hover:text-destructive"
        onClick={() => setConfirmOpen(true)}
        disabled={isDeleting}
        aria-label={t("marketplace.detailModerateReview")}
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </Button>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="destructive"
        title={t("marketplace.deleteReview")}
        description={t("marketplace.detailReviewDeleteConfirmDesc")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        isLoading={isDeleting}
        onConfirm={onDelete}
      />
    </Card>
  );
}
