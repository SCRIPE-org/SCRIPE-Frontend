"use client";

import { useState } from "react";
import { useReviewsViewModel } from "../viewmodels/useReviewsViewModel";
import { Button } from "@core/ui/button";
import { Card, CardHeader } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { Skeleton } from "@core/ui/skeleton";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
import { Star, Trash2 } from "lucide-react";
import type { AppReview } from "../../domain/entities/AppReview";

/**
 * Presentation UI component rendering the reviews view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ReviewsView() {
  const vm = useReviewsViewModel();
  const { t } = useI18n();
  const [pendingModerate, setPendingModerate] = useState<AppReview | null>(null);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-nx-ink">{t("marketplace.reviewsTitle")}</h2>
        <p className="text-sm text-nx-ink-2">
          {t("marketplace.reviewsCountLabel", { count: vm.pagination.totalCount })}
        </p>
      </div>

      {/* Reviews are scoped to a single app listing at a time (the backend
          query requires an appListingId -- there is no "all listings" mode),
          so an explicit picker drives which app's reviews are fetched. */}
      <div className="max-w-xs">
        <Select
          value={vm.appListingId}
          onValueChange={vm.setAppListingId}
          disabled={vm.isLoadingAppListingOptions || vm.appListingOptions.length === 0}
        >
          <SelectTrigger aria-label={t("marketplace.reviewsSelectAppListingLabel")}>
            <SelectValue placeholder={t("marketplace.reviewsSelectAppListingPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {vm.appListingOptions.map((listing) => (
              <SelectItem key={listing.id} value={listing.id}>
                {listing.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!vm.appListingId ? (
        <EmptyState
          size="sm"
          bare
          icon={Star}
          title={t("marketplace.reviewsSelectAppListingPrompt")}
        />
      ) : vm.isLoading ? (
        <div
          className="flex flex-col gap-3"
          role="status"
          aria-busy="true"
          aria-label={t("common.loading")}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-nx-lg" />
          ))}
        </div>
      ) : vm.reviews.length === 0 ? (
        <EmptyState size="lg" icon={Star} title={t("marketplace.reviewsEmpty")} />
      ) : (
        <div className="flex flex-col gap-3">
          {vm.reviews.map((review) => (
            <Card key={review.id} className={review.isModerated ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-nx-ink">{review.appName}</span>
                    <div className="flex">
                      {review.stars.map((s, i) => (
                        <Star
                          key={i}
                          aria-hidden="true"
                          className={`size-3 ${s === "full" ? "fill-warning text-warning" : "text-nx-ink-3"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm font-medium text-nx-ink">{review.title}</p>
                  <p className="line-clamp-2 text-xs text-nx-ink-2">{review.body}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => setPendingModerate(review)}
                  disabled={vm.isModerating}
                  aria-label={t("marketplace.deleteReview")}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Moderating a review deletes it outright, so it goes through a real
          confirmation step instead of firing on the first click. */}
      <ConfirmationDialog
        open={pendingModerate !== null}
        onOpenChange={(open) => {
          if (!open) setPendingModerate(null);
        }}
        variant="destructive"
        title={t("marketplace.deleteReview")}
        description={t("marketplace.reviewsDeleteConfirmDesc")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        isLoading={vm.isModerating}
        onConfirm={() => {
          if (pendingModerate) vm.moderate(pendingModerate.id);
          setPendingModerate(null);
        }}
      />
    </div>
  );
}
