// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Separator } from "@core/ui/separator";
import { Skeleton } from "@core/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import {
  AlertTriangle,
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
import type { AppReview } from "@modules/marketplace";

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

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (vm.isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="col-span-2 h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (vm.isError || !vm.listing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">Failed to load app listing.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/marketplace">Back to listings</Link>
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
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to App Listings
      </Link>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        {/* App icon */}
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted">
          {listing.iconUrl ? (
            <img src={listing.iconUrl} alt={listing.name} className="size-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {listing.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold">{listing.name}</h1>
            {listing.isFeatured && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="size-3" /> Featured
              </Badge>
            )}
            <Badge variant={listing.isPublished ? "default" : "outline"}>
              {listing.statusLabel}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            by <span className="font-medium text-foreground">{listing.developerName}</span>
            {" · "}
            {listing.categoryName}
            {" · "}v{listing.version}
          </p>
          <div className="mt-1 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${i < Math.round(listing.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
              />
            ))}
            <span className="ml-1 text-sm font-medium">{listing.ratingLabel}</span>
            <span className="text-sm text-muted-foreground">({listing.reviewCount} reviews)</span>
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
              <EyeOff className="size-3.5" /> Unpublish
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="gap-1.5"
              onClick={() => vm.publish()}
              disabled={vm.isPublishing}
            >
              <Globe className="size-3.5" /> Publish
            </Button>
          )}
          <Button
            size="sm"
            variant={listing.isFeatured ? "secondary" : "ghost"}
            className="gap-1.5"
            onClick={() => vm.toggleFeatured()}
            disabled={vm.isTogglingFeatured}
          >
            <Zap className="size-3.5" />
            {listing.isFeatured ? "Unfeature" : "Feature"}
          </Button>
        </div>
      </div>

      {/* ── Screenshot carousel (Phase 5.1) ─────────────────────────────────── */}
      {listing.screenshotUrls.length > 0 && (
        <div className="relative overflow-hidden rounded-xl border bg-muted">
          <img
            src={listing.screenshotUrls[vm.screenshotIndex]}
            alt={`Screenshot ${vm.screenshotIndex + 1}`}
            className="h-72 w-full object-cover"
          />
          {listing.screenshotUrls.length > 1 && (
            <>
              <button
                onClick={vm.prevScreenshot}
                disabled={vm.screenshotIndex === 0}
                className="absolute left-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 backdrop-blur transition hover:bg-background disabled:opacity-40"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={vm.nextScreenshot}
                disabled={vm.screenshotIndex === listing.screenshotUrls.length - 1}
                className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 backdrop-blur transition hover:bg-background disabled:opacity-40"
                aria-label="Next screenshot"
              >
                <ChevronRight className="size-4" />
              </button>
              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {listing.screenshotUrls.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => vm.setScreenshotIndex(i)}
                    className={`size-2 rounded-full transition-all ${
                      i === vm.screenshotIndex ? "w-4 bg-white" : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Screenshot ${i + 1}`}
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
            <h2 className="text-base font-semibold">About this app</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
            {listing.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Tag className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
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
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <ShoppingBag className="size-4" /> Pricing
            </h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="text-3xl font-bold tracking-tight">{listing.pricingLabel}</div>
            {listing.pricingModel === "Subscription" && listing.billingInterval && (
              <p className="text-xs text-muted-foreground">
                Billed {listing.billingInterval === "Annual" ? "annually" : "monthly"}
              </p>
            )}
            {listing.pricingModel === "Free" && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <CheckCircle2 className="size-3.5" /> No cost to install
              </div>
            )}
            <Separator />
            <dl className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <dt>Model</dt>
                <dd className="font-medium text-foreground">{listing.pricingModel}</dd>
              </div>
              {listing.currency && (
                <div className="flex justify-between">
                  <dt>Currency</dt>
                  <dd className="font-medium text-foreground">{listing.currency}</dd>
                </div>
              )}
              {listing.publishedAt && (
                <div className="flex justify-between">
                  <dt>Published</dt>
                  <dd className="font-medium text-foreground">
                    {new Date(listing.publishedAt).toLocaleDateString()}
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
            <MessageSquare className="size-3.5" />
            Reviews
            {vm.reviewsTotalCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {vm.reviewsTotalCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Reviews tab */}
        <TabsContent value="reviews" className="mt-4">
          {vm.isLoadingReviews ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : vm.reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <MessageSquare className="size-8" />
              <p className="text-sm">No reviews yet.</p>
            </div>
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
                  <dt className="mb-1 text-xs text-muted-foreground">Version</dt>
                  <dd className="font-medium">{listing.version}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-muted-foreground">Category</dt>
                  <dd className="font-medium">{listing.categoryName}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-muted-foreground">Developer</dt>
                  <dd className="font-medium">{listing.developerName}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-muted-foreground">Rating</dt>
                  <dd className="font-medium">{listing.ratingLabel} ⭐</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-muted-foreground">Review Count</dt>
                  <dd className="font-medium">{listing.reviewCount}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-xs text-muted-foreground">Created</dt>
                  <dd className="font-medium">
                    {new Date(listing.createdAt).toLocaleDateString()}
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
 * Pure presentational — callbacks from AppDetailView.
 */
function ReviewCard({ review, onDelete, isDeleting }: ReviewCardProps) {
  return (
    <Card className="flex flex-row items-start gap-4 p-4">
      {/* Star rating */}
      <div className="flex shrink-0 gap-0.5 pt-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`size-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>

      <div className="min-w-0 flex-1">
        {review.title && <p className="text-sm font-medium">{review.title}</p>}
        {review.body && (
          <p className="mt-0.5 line-clamp-3 text-xs text-muted-foreground">{review.body}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground/60">
          {review.tenantName} · {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="shrink-0 text-destructive hover:text-destructive"
        onClick={onDelete}
        disabled={isDeleting}
        title="Moderate (delete) this review"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </Card>
  );
}
