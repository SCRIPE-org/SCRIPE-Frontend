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
}

export function OtpInputField({
  value,
  onChange,
  length = 6,
  autoFocus = true,
  variant = "nexus",
  id = "otp-field",
  disabled = false,
}: OtpInputFieldProps) {
  return (
    <InputOTP
      maxLength={length}
      value={value}
      onChange={onChange}
      pattern="[0-9]*"
      inputMode="numeric"
      id={id}
      autoFocus={autoFocus}
      disabled={disabled}
      containerClassName="justify-center w-full"
      dir="ltr"
    >
      {/* OTP digit runs stay dir="ltr" in every locale (see input-otp.tsx). */}
      <div className="flex items-center justify-center gap-2" dir="ltr">
        {Array.from({ length }).map((_, i) => {
          const ch = value[i];

          const getSlotConfig = () => {
            if (variant === "glass") {
              // Auth-shell opt-in — fixed signup purple, literals by design.
              return {
                className:
                  "w-[46px] h-[56px] rounded-xl text-center text-[22px] font-semibold font-mono outline-none transition-all duration-200 border-none ring-0 ring-offset-0 ring-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
                style: {
                  background: ch ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${ch ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: "#F5F2FF",
                  boxShadow: ch ? "0 0 8px rgba(168,85,247,0.12)" : "none",
                },
                activeClass:
                  "data-[active=true]:border-[rgba(168,85,247,0.6)] data-[active=true]:ring-4 data-[active=true]:ring-[rgba(168,85,247,0.15)]",
              };
            }

            if (variant === "vault") {
              // Auth-shell opt-in — the reset flow's --sx- palette.
              return {
                className:
                  "w-[46px] h-[56px] rounded-xl text-center text-[22px] font-semibold font-mono outline-none transition-all duration-200 border ring-0 ring-offset-0 ring-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
                style: {
                  background: ch ? "var(--sx-accent-soft)" : "var(--sx-chip-bg)",
                  borderColor: ch ? "var(--sx-accent-soft-border)" : "var(--sx-chip-border)",
                  color: "var(--sx-text)",
                },
                activeClass:
                  "data-[active=true]:border-[var(--sx-accent-text)] data-[active=true]:ring-3 data-[active=true]:ring-[var(--sx-accent-ring,rgba(139,92,246,0.18))]",
              };
            }

            // Default: nexus — core tokens only. Empty slots are the sunken
            // field surface; filled slots take the accent wash behind a 40%
            // accent hairline. The active lit edge (shadow-nx-focus) comes
            // from the base InputOTPSlot; no inline styles here so the
            // workspace accent and theme resolve through the tokens.
            return {
              className: cn(
                "h-14 w-11 rounded-nx-control border text-center text-xl font-semibold font-mono transition-[background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                ch
                  ? "border-[color:color-mix(in_srgb,var(--nx-accent)_40%,transparent)] bg-nx-accent-wash text-nx-ink"
                  : "border-nx-line bg-nx-ground text-nx-ink"
              ),
              style: undefined,
              activeClass: "",
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
                    "select-none self-center px-0.5 font-mono text-[20px]",
                    variant === "nexus" && "text-nx-ink-3"
                  )}
                  style={
                    variant === "nexus"
                      ? undefined
                      : {
                          color:
                            variant === "glass"
                              ? "rgba(255,255,255,0.3)"
                              : "var(--sx-text-faint)",
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
