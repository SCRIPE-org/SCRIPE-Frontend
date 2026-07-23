"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "@core/common/utils";

// OTP codes are digit sequences and read left-to-right in EVERY locale —
// Arabic UIs included — so InputOTPGroup forces dir="ltr" (overridable via
// props, but no consumer should). The logical properties on the slots
// therefore resolve to the same physical edges in both languages.

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} dir="ltr" className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      data-active={isActive}
      className={cn(
        // The shared field surface sliced per slot: sunken ground behind a
        // hairline. Adjacent slots share edges — only the first draws its
        // start border, only the ends round. Colour-only transition at micro
        // speed; motion-reduce drops even that.
        "relative flex h-10 w-10 items-center justify-center border-y border-e border-nx-line bg-nx-ground text-sm text-nx-ink transition-[border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none first:rounded-s-nx-control first:border-s last:rounded-e-nx-control",
        // The active slot is where light collects — the --nx-focus lit edge
        // (inset accent line + wash ring) draws on all four sides, so
        // shared-border middle slots light up evenly too.
        isActive && "z-raised shadow-nx-focus",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* The fake caret rides the shared caret-blink keyframe (opacity
              only); reduced motion holds it solid instead of blinking. */}
          <div className="h-4 w-px animate-caret-blink bg-nx-ink motion-reduce:animate-none" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} role="separator" className={cn("text-nx-ink-3", className)} {...props}>
    <Dot />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
