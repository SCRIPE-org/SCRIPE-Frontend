"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";

interface CompleteStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
}

export function CompleteStep({ vm }: CompleteStepProps) {
  const { t, direction } = useI18n();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="flex flex-col items-center py-6"
      style={{ animation: "sxScreenIn 0.4s ease-out" }}
      dir={direction}
    >
      {/* Success checkmark with celebration effect */}
      <div className="relative mb-6">
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
            transform: "scale(2.5)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.1) 100%)",
            border: "2px solid rgba(16,185,129,0.4)",
            animation: "sxPop 0.5s ease-out",
          }}
        >
          <Check className="h-8 w-8" style={{ color: "#10B981" }} />
        </div>
      </div>

      {showContent && (
        <div className="text-center" style={{ animation: "sxRise 0.5s ease-out" }}>
          <h1
            className="text-2xl font-bold"
            style={{
              background: "linear-gradient(180deg, #F5F2FF 0%, #C7B8F0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("signup.complete.welcomeTitle") || "Welcome to Scripe! 🎉"}
          </h1>
          <p className="mt-3 text-sm" style={{ color: "rgba(245,242,255,0.62)" }}>
            {t("signup.complete.workspaceReady", {
              name: vm.wizardData.workspaceName || "your workspace",
            }) ||
              `Your workspace ${vm.wizardData.workspaceName || "your workspace"} is ready. Redirecting you to your dashboard…`}
          </p>

          {/* Feature highlights */}
          <div className="mt-6 space-y-2" style={{ animation: "sxRise 0.5s ease-out 0.3s both" }}>
            {[
              t("signup.complete.inviteTeam") || "Invite your team members",
              t("signup.complete.customizeBranding") || "Customize your branding",
              t("signup.complete.exploreModules") || "Explore modules & features",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-2 text-xs"
                style={{
                  color: "rgba(245,242,255,0.55)",
                  animation: `sxRise 0.3s ease-out ${0.4 + i * 0.1}s both`,
                }}
              >
                <Sparkles className="h-3 w-3" style={{ color: "#22D3EE" }} />
                {item}
              </div>
            ))}
          </div>

          {/* Animated redirect indicator */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[0, 200, 400].map((delay) => (
                <div
                  key={delay}
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{
                     background: "#A855F7",
                     animationDelay: `${delay}ms`,
                  }}
                />
              ))}
            </div>
            <p className="text-[11px] font-medium" style={{ color: "rgba(245,242,255,0.4)" }}>
              {t("signup.complete.redirecting") || "Redirecting…"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
