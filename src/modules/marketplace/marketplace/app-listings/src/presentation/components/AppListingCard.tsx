"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { useI18n } from "@core/providers/i18n-provider";
import type { AppListing } from "../../domain/entities/AppListing";
import { Star, Globe, EyeOff, Trash2, Zap, ExternalLink } from "lucide-react";
import Image from "next/image";

interface AppListingCardProps {
  listing: AppListing;
  onPublish: () => void;
  onUnpublish: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
  isPublishing: boolean;
  isTogglingFeatured: boolean;
  isDeleting: boolean;
}

/**
 * AppListingCard
 *
 * Displays a single marketplace listing in a card layout.
 * Pure presentational — all actions are callbacks from the ViewModel.
 */
export function AppListingCard({
  listing,
  onPublish,
  onUnpublish,
  onToggleFeatured,
  onDelete,
  isPublishing,
  isTogglingFeatured,
  isDeleting,
}: AppListingCardProps) {
  const { t } = useI18n();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  return (
    <Card className="flex flex-col gap-0 overflow-hidden">
      <CardHeader className="flex flex-row items-start gap-3 pb-3">
        {/* Icon */}
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-nx-md bg-nx-raised">
          {listing.iconUrl ? (
            <Image src={listing.iconUrl} alt="" width={40} height={40} unoptimized className="size-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-nx-ink-2" aria-hidden="true">
              {listing.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Title block */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-nx-ink">{listing.name}</span>
            {listing.isFeatured && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Zap className="size-3" aria-hidden="true" />{" "}
                {t("marketplace.listingsFeaturedBadge")}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-nx-ink-2">
            {listing.developerName} · v{listing.version}
          </p>
        </div>

        {/* Status badge */}
        <Badge variant={listing.isPublished ? "default" : "outline"} className="shrink-0">
          {listing.statusLabel}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-0">
        {/* Description */}
        <p className="line-clamp-2 text-xs text-nx-ink-2">{listing.description}</p>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-nx-ink-2">
          <span className="font-medium text-nx-ink">{listing.pricingLabel}</span>
          <div className="flex items-center gap-1">
            <Star className="size-3 fill-warning text-warning" aria-hidden="true" />
            <span>{listing.ratingLabel}</span>
            <span className="text-nx-ink-3">({listing.reviewCount})</span>
          </div>
        </div>

        {/* Tags */}
        {listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="px-1.5 py-0 text-xs">
                {tag}
              </Badge>
            ))}
            {listing.tags.length > 3 && (
              <span className="text-xs text-nx-ink-3">+{listing.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-nx-line pt-1">
          {/* View details link */}
          <Button size="sm" variant="ghost" className="gap-1" asChild>
            <Link href={`/marketplace/${listing.id}`}>
              <ExternalLink className="size-3.5" aria-hidden="true" />{" "}
              {t("marketplace.listingsViewDetails")}
            </Link>
          </Button>

          {listing.isPublished ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={onUnpublish}
              disabled={isPublishing}
            >
              <EyeOff className="size-3.5" aria-hidden="true" />{" "}
              {t("marketplace.listingsUnpublishAction")}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="flex-1 gap-1.5"
              onClick={onPublish}
              disabled={isPublishing}
            >
              <Globe className="size-3.5" aria-hidden="true" />{" "}
              {t("marketplace.listingsPublishAction")}
            </Button>
          )}
          <Button
            size="sm"
            variant={listing.isFeatured ? "secondary" : "ghost"}
            onClick={onToggleFeatured}
            disabled={isTogglingFeatured}
            aria-label={
              listing.isFeatured
                ? t("marketplace.listingsRemoveFeatured")
                : t("marketplace.listingsMarkFeatured")
            }
          >
            <Zap className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmDeleteOpen(true)}
            disabled={isDeleting}
            aria-label={t("marketplace.listingsDeleteAction")}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        variant="destructive"
        title={t("marketplace.deleteTitle")}
        description={t("marketplace.deleteConfirm")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        isLoading={isDeleting}
        onConfirm={onDelete}
      />
    </Card>
  );
}
