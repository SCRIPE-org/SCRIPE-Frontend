"use client";

import * as React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@core/ui/input-otp";
import { cn } from "@core/common/utils";

interface OtpInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  /**
   * "nexus" (default) is the in-app treatment on core tokens: sunken ground
   * behind a hairline, filled digits get the accent wash, the active slot
   * wears the lit edge from the base slot.
   *
   * "vault" and "glass" are AUTH-SHELL-ONLY opt-ins — they ride the auth
   * shell's --sx- palette and fixed purple respectively. In-app surfaces
   * (2FA setup/disable, profile) must never opt into them; the shell pages
   * pass them explicitly.
   */
  variant?: "nexus" | "vault" | "glass";
  id?: string;
  disabled?: boolean;
  onComplete?: (value: string) => void;
  "aria-invalid"?: boolean | "true" | "false";
}

export function OtpInputField({
  value,
  onChange,
  length = 6,
  autoFocus = true,
  variant = "nexus",
  id = "otp-field",
  disabled = false,
  onComplete,
  "aria-invalid": ariaInvalid,
}: OtpInputFieldProps) {
  const isInvalid = ariaInvalid === true || ariaInvalid === "true";

  return (
    <InputOTP
      maxLength={length}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      pattern="[0-9]*"
      inputMode="numeric"
      id={id}
      autoFocus={autoFocus}
      disabled={disabled}
      aria-invalid={isInvalid ? true : undefined}
      containerClassName="justify-center w-full"
      dir="ltr"
    >
      {/* OTP digit runs stay dir="ltr" in every locale (see input-otp.tsx). */}
      <div className="flex items-center justify-center gap-2" dir="ltr">
        {Array.from({ length }).map((_, i) => {
          const ch = value[i];

          const getSlotConfig = () => {
            if (variant === "glass") {
              // Auth-shell opt-in — fixed Signal Lime, literals by design.
              return {
                className:
                  "w-[46px] h-[56px] rounded-xl text-center text-[22px] font-semibold font-mono outline-none transition-[border-color,background-color,box-shadow] duration-200 motion-reduce:transition-none border-none ring-0 ring-offset-0 ring-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
                style: {
                  background: ch ? "rgba(198,255,0,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${ch ? "rgba(198,255,0,0.5)" : "rgba(255,255,255,0.42)"}`,
                  color: "#F7F8F5",
                  boxShadow: ch ? "0 0 8px rgba(198,255,0,0.18)" : "none",
                },
                activeClass:
                  "data-[active=true]:border-[rgba(198,255,0,0.6)] data-[active=true]:ring-4 data-[active=true]:ring-[rgba(198,255,0,0.15)]",
              };
            }

            if (variant === "vault") {
              // Auth-shell opt-in — the reset flow's --sx- palette.
              return {
                className:
                  "w-[46px] h-[56px] rounded-xl text-center text-[22px] font-semibold font-mono outline-none transition-[border-color,background-color,box-shadow] duration-200 motion-reduce:transition-none border ring-0 ring-offset-0 ring-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
                style: {
                  background: ch ? "var(--sx-accent-soft)" : "var(--sx-chip-bg)",
                  borderColor: ch ? "var(--sx-accent-soft-border)" : "var(--sx-chip-border)",
                  color: "var(--sx-text)",
                },
                activeClass:
                  "data-[active=true]:border-[var(--sx-accent-text)] data-[active=true]:ring-3 data-[active=true]:ring-[var(--sx-accent-ring,rgba(198,255,0,0.18))]",
              };
            }

            // Default: nexus — core tokens only. Empty slots take 3:1 line-hi
            // hairline; filled slots take the accent wash; invalid outranks idle.
            return {
              className: cn(
                "h-14 w-11 rounded-nx-control border text-center font-mono text-xl font-semibold tabular-nums transition-[background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                isInvalid && !disabled
                  ? "border-nx-danger bg-nx-ground text-nx-ink"
                  : ch
                    ? "border-[color:color-mix(in_srgb,var(--nx-accent)_65%,transparent)] bg-nx-accent-wash text-nx-ink"
                    : "border-nx-line-hi bg-nx-ground text-nx-ink"
              ),
              style: undefined,
              activeClass:
                isInvalid && !disabled
                  ? "data-[active=true]:border-nx-danger data-[active=true]:shadow-[inset_0_0_0_1px_var(--nx-danger),0_0_0_3px_color-mix(in_srgb,var(--nx-danger)_18%,transparent)]"
                  : "",
            };
          };

          const config = getSlotConfig();

          return (
            <React.Fragment key={i}>
              <InputOTPGroup>
                <InputOTPSlot
                  index={i}
                  className={cn(config.className, config.activeClass)}
                  style={config.style}
                />
              </InputOTPGroup>
              {i === 2 && (
                <span
                  className={cn(
                    // a grouping mark, not a character: it sits one ink step
                    // back so the eye reads two triplets, not seven glyphs
                    "select-none self-center px-0.5 font-mono text-xl",
                    variant === "nexus" && "text-nx-ink-3"
                  )}
                  style={
                    variant === "nexus"
                      ? undefined
                      : {
                          color:
                            variant === "glass" ? "rgba(255,255,255,0.3)" : "var(--sx-text-faint)",
                        }
                  }
                  aria-hidden="true"
                >
                  –
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </InputOTP>
  );
}
