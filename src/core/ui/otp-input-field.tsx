"use client";

import * as React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@core/ui/input-otp";
import { cn } from "@core/common/utils";

interface OtpInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  variant?: "vault" | "glass";
  id?: string;
  disabled?: boolean;
}

export function OtpInputField({
  value,
  onChange,
  length = 6,
  autoFocus = true,
  variant = "vault",
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
      <div className="flex items-center justify-center gap-2" dir="ltr">
        {Array.from({ length }).map((_, i) => {
          const ch = value[i];

          const getSlotConfig = () => {
            if (variant === "glass") {
              return {
                className:
                  "w-[46px] h-[56px] rounded-xl text-center text-[22px] font-semibold font-mono outline-none transition-all duration-200 border-none ring-0 ring-offset-0 ring-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
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

            // Default: vault
            return {
              className:
                "w-[46px] h-[56px] rounded-xl text-center text-[22px] font-semibold font-mono outline-none transition-all duration-200 border ring-0 ring-offset-0 ring-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              style: {
                background: ch ? "var(--sx-accent-soft)" : "var(--sx-chip-bg)",
                borderColor: ch ? "var(--sx-accent-soft-border)" : "var(--sx-chip-border)",
                color: "var(--sx-text)",
              },
              activeClass:
                "data-[active=true]:border-[var(--sx-accent-text)] data-[active=true]:ring-3 data-[active=true]:ring-[var(--sx-accent-ring,rgba(139,92,246,0.18))]",
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
                  className="select-none self-center px-0.5 font-mono text-[20px]"
                  style={{
                    color: variant === "glass" ? "rgba(255,255,255,0.3)" : "var(--sx-text-faint)",
                  }}
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
