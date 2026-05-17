"use client";

import { useReviewsViewModel } from "../viewmodels/useReviewsViewModel";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Star, Trash2 } from "lucide-react";

export function ReviewsView() {
  const vm = useReviewsViewModel();
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold">App Reviews</h2>
        <p className="text-sm text-muted-foreground">{vm.pagination.totalCount} reviews</p>
      </div>

      {vm.isLoading ? (
        <div className="flex flex-col gap-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : vm.reviews.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">No reviews yet</div>
      ) : (
        <div className="flex flex-col gap-3">
          {vm.reviews.map((review) => (
            <Card key={review.id} className={review.isModerated ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{review.appName}</span>
                    <div className="flex">{review.stars.map((s, i) => <Star key={i} className={`size-3 ${s === "full" ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />)}</div>
                    <Badge variant="outline" className="text-xs">{review.tenantName}</Badge>
                  </div>
                  <p className="text-sm font-medium mt-1">{review.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{review.body}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive shrink-0" onClick={() => vm.moderate(review.id)} disabled={vm.isModerating}>
                  <Trash2 className="size-3.5" />
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
