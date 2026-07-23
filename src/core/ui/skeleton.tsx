import { cn } from "@core/common/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // The pulse only runs when the user allows motion; a static muted block is
  // the reduced-motion placeholder.
  return <div className={cn("motion-safe:animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
