"use client";

import Link from "next/link";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import type { AppListing } from "../../domain/entities/AppListing";
import { Star, Globe, EyeOff, Trash2, Zap, ExternalLink } from "lucide-react";

interface AppListingCardProps {
  listing: AppListing;
  onPublish: () => void;
  onUnpublish: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
  isPublishing: boolean;
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
  isDeleting,
}: AppListingCardProps) {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-3 pb-3">
        {/* Icon */}
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
          {listing.iconUrl ? (
            <img src={listing.iconUrl} alt={listing.name} className="size-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {listing.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Title block */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold">{listing.name}</span>
            {listing.isFeatured && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Zap className="size-3" /> Featured
              </Badge>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
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
        <p className="line-clamp-2 text-xs text-muted-foreground">{listing.description}</p>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{listing.pricingLabel}</span>
          <div className="flex items-center gap-1">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            <span>{listing.ratingLabel}</span>
            <span className="text-muted-foreground/60">({listing.reviewCount})</span>
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
              <span className="text-xs text-muted-foreground">+{listing.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 border-t pt-1">
          {/* View details link (Phase 5.1) */}
          <Button size="sm" variant="ghost" className="gap-1" asChild>
            <Link href={`/marketplace/${listing.id}`}>
              <ExternalLink className="size-3.5" /> Details
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
              <EyeOff className="size-3.5" /> Unpublish
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              className="flex-1 gap-1.5"
              onClick={onPublish}
              disabled={isPublishing}
            >
              <Globe className="size-3.5" /> Publish
            </Button>
          )}
          <Button
            size="sm"
            variant={listing.isFeatured ? "secondary" : "ghost"}
            onClick={onToggleFeatured}
            title={listing.isFeatured ? "Remove from featured" : "Mark as featured"}
          >
            <Zap className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
