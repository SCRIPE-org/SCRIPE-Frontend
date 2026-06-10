"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";

interface ProvisioningStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
}

export function ProvisioningStep({ vm }: ProvisioningStepProps) {
  const { t, direction } = useI18n();
  const [dots, setDots] = useState("");

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const provisioningSteps = useMemo(
    () => [
      {
        label: t("signup.provisioning.creatingWorkspace") || "Creating workspace",
        icon: "🏗️",
      },
      {
        label: t("signup.provisioning.settingDefaults") || "Setting up defaults",
        icon: "⚙️",
      },
      {
        label: t("signup.provisioning.registeringAccount") || "Registering your account",
        icon: "🔐",
      },
      {
        label: t("signup.provisioning.configuringPermissions") || "Configuring permissions",
        icon: "🛡️",
      },
      {
        label: t("signup.provisioning.almostReady") || "Almost ready…",
        icon: "✨",
      },
    ],
    [t]
  );

  const currentStep = Math.min(vm.provisioningStep, provisioningSteps.length - 1);

  return (
    <div
      className="flex flex-col items-center py-6"
      style={{ animation: "sxScreenIn 0.4s ease-out" }}
      dir={direction}
    >
      {/* Spinning logo / loader */}
      <div className="relative mb-8">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(168,85,247,0.12) 0%, rgba(99,102,241,0.08) 100%)",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(168,85,247,0.3) 50%, transparent 100%)",
              animation: "spin 2s linear infinite",
            }}
          />
          <span className="relative text-3xl" style={{ animation: "sxPop 0.5s ease-out" }}>
            {provisioningSteps[currentStep].icon}
          </span>
        </div>
      </div>

      {/* Current step label */}
      <h2
        className="mb-3 text-lg font-semibold"
        style={{
          background: "linear-gradient(180deg, #F5F2FF 0%, #C7B8F0 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {provisioningSteps[currentStep].label}
        {dots}
      </h2>

      {/* Progress steps */}
      <div className="mt-4 w-full max-w-xs space-y-3">
        {provisioningSteps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 transition-all duration-300"
            style={{
              opacity: i <= currentStep ? 1 : 0.3,
              transform: i <= currentStep ? "translateX(0)" : "translateX(8px)",
              transition: "all 0.4s ease-out",
              transitionDelay: `${i * 100}ms`,
            }}
          >
            <div
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] transition-all duration-300"
              style={{
                background:
                  i < currentStep
                    ? "rgba(16,185,129,0.15)"
                    : i === currentStep
                      ? "linear-gradient(180deg, rgba(168,85,247,0.2) 0%, rgba(99,102,241,0.15) 100%)"
                      : "rgba(255,255,255,0.04)",
                border: `1px solid ${
                  i < currentStep
                    ? "rgba(16,185,129,0.3)"
                    : i === currentStep
                      ? "rgba(168,85,247,0.3)"
                      : "rgba(255,255,255,0.06)"
                }`,
              }}
            >
              {i < currentStep ? (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : i === currentStep ? (
                <Loader2 className="h-3 w-3 animate-spin" style={{ color: "#C4B5FD" }} />
              ) : null}
            </div>
            <span
              className="text-xs font-medium"
              style={{
                color:
                  i < currentStep
                    ? "#10B981"
                    : i === currentStep
                      ? "#F5F2FF"
                      : "rgba(245,242,255,0.35)",
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="mt-6 h-1 w-full max-w-xs overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${((currentStep + 1) / provisioningSteps.length) * 100}%`,
            background: "linear-gradient(90deg, #A855F7 0%, #3B82F6 100%)",
            boxShadow: "0 0 10px rgba(168,85,247,0.3)",
          }}
        />
      </div>

      <p className="mt-4 text-[11px]" style={{ color: "rgba(245,242,255,0.35)" }}>
        {t("signup.provisioning.usuallyTakes") || "This usually takes a few seconds"}
      </p>
    </div>
  );
}
