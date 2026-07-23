"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

// The radius (or hexagon clip) lives on the ROOT with overflow-hidden, so the
// image and the fallback inherit one clipped shape — the fallback used to
// hardcode rounded-full and ignored the square/rounded settings entirely.
//
// The ::after overlay is the hairline inner ring: an inset shadow on the root
// itself would paint underneath the image, so the ring rides a pseudo element
// above it and inherits the root's radius. On hexagon the rectangular ring is
// clipped away with the corners — the cut shape carries its own edge.
const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_var(--nx-line)] after:content-['']",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
      },
      avatarStyle: {
        default: "rounded-full",
        rounded: "rounded-nx-control",
        square: "rounded-none",
        // A real hexagon at last — the old value was rounded-full beside a
        // comment promising CSS that never existed.
        hexagon: "rounded-none [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]",
      },
    },
    defaultVariants: {
      size: "default",
      avatarStyle: "default",
    },
  }
);

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>
>(({ className, size, ...props }, ref) => {
  const settings = useSettings();

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size, avatarStyle: settings.avatarStyle, className }))}
      {...props}
    />
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    // No radius of its own — the shape comes from the clipped root. The
    // sunken ground surface keeps initials a quiet step below the page.
    className={cn(
      "flex h-full w-full items-center justify-center bg-nx-ground text-nx-ink-2",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
