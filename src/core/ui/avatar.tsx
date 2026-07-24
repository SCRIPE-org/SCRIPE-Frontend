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
//
// Size also sets the type scale, because the fallback inherits it: initials in
// a 32px avatar and a 48px avatar used to render at whatever font-size the
// surrounding paragraph happened to have, so the same component read as three
// different components down a member list.
const avatarVariants = cva(
  "relative flex shrink-0 select-none overflow-hidden after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_var(--nx-line)] after:content-['']",
  {
    variants: {
      size: {
        sm: "h-8 w-8 text-xs",
        default: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
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

// Stored settings can hold a legacy avatarStyle the variant map no longer
// knows; cva applies NO shape at all for an unknown key, which silently drops
// the clip and the radius together. Same guard the badge already carries.
const KNOWN_AVATAR_STYLES = ["default", "rounded", "square", "hexagon"] as const;
type KnownAvatarStyle = (typeof KNOWN_AVATAR_STYLES)[number];

const resolveAvatarStyle = (value: string | undefined | null): KnownAvatarStyle =>
  (KNOWN_AVATAR_STYLES as readonly string[]).includes(value ?? "")
    ? (value as KnownAvatarStyle)
    : "default";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>
>(({ className, size, ...props }, ref) => {
  const settings = useSettings();

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        avatarVariants({ size, avatarStyle: resolveAvatarStyle(settings.avatarStyle), className })
      )}
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
    // object-cover, not the browser default: uploaded avatars are rarely
    // square, and `aspect-square h-full w-full` on its own stretched every
    // portrait into a face-widening squash.
    className={cn("aspect-square h-full w-full object-cover", className)}
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
    // No radius and no font-size of its own — the shape comes from the clipped
    // root and the scale from the root's size step. The sunken ground surface
    // keeps initials a quiet step below the page.
    className={cn(
      "flex h-full w-full items-center justify-center bg-nx-ground font-medium leading-none text-nx-ink-2",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
