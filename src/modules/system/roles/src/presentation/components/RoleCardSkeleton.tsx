/**
 * Role Card Skeleton Component
 *
 * Loading skeleton for the role card grid.
 */
import { Card, CardContent, CardHeader } from "@core/ui/card";

export function RoleCardSkeleton() {
      return (
            <Card className="animate-pulse">
                  <CardHeader className="pb-2">
                        <div className="h-6 bg-muted rounded w-1/2" />
                        <div className="h-4 bg-muted rounded w-1/3 mt-1" />
                  </CardHeader>
                  <CardContent>
                        <div className="h-4 bg-muted rounded w-full mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
            </Card>
      );
}

export function RoleCardSkeletonGrid({ count = 6 }: { count?: number }) {
      return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: count }).map((_, i) => (
                        <RoleCardSkeleton key={i} />
                  ))}
            </div>
      );
}
