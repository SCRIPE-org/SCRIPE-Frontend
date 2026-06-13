"use client";

import { useEffect, useRef } from "react";
import { Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";

interface CompleteStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
}

export function CompleteStep({ vm }: CompleteStepProps) {
  const { t, direction } = useI18n();
  const firedRef = useRef(false);

  // ── canvas-confetti celebration ──────────────────────────────────────────
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    import("canvas-confetti").then((mod) => {
      const confetti = mod.default;

      // Left cannon
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: ["#A855F7", "#7C3AED", "#3B82F6", "#22D3EE", "#10B981"],
        disableForReducedMotion: true,
      });

      // Right cannon
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: ["#A855F7", "#7C3AED", "#3B82F6", "#22D3EE", "#10B981"],
          disableForReducedMotion: true,
        });
      }, 150);

      // Center burst
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 90,
          origin: { x: 0.5, y: 0.6 },
          colors: ["#F5F2FF", "#C4B5FD", "#A855F7"],
          scalar: 0.8,
          disableForReducedMotion: true,
        });
      }, 300);
    });
  }, []);

  const highlights = [
    t("signup.complete.inviteTeam") || "Invite your team members",
    t("signup.complete.customizeBranding") || "Customize your branding",
    t("signup.complete.exploreModules") || "Explore modules & features",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center py-6"
      dir={direction}
    >
      {/* Success checkmark */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
      >
        {/* Pulsing glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.1) 100%)",
            border: "2px solid rgba(16,185,129,0.4)",
          }}
        >
          <Check className="h-8 w-8" style={{ color: "#10B981" }} />
        </div>
      </motion.div>

      {/* Title + subtitle */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h1
          className="text-2xl font-bold"
          style={{
            background: BRAND_TOKENS.gradient.heroText,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("signup.complete.welcomeTitle") || "Welcome to Scripe! 🎉"}
        </h1>
        <p className="mt-3 text-sm" style={{ color: BRAND_TOKENS.text.secondary }}>
          {t("signup.complete.workspaceReady", {
            name: vm.wizardData.workspaceName || "your workspace",
          }) || `Your workspace is ready. Redirecting you to your dashboard…`}
        </p>
      </motion.div>

      {/* Feature highlights */}
      <div className="mt-6 space-y-2">
        <AnimatePresence>
          {highlights.map((item, i) => (
            <motion.div
              key={item}
              className="flex items-center justify-center gap-2 text-xs"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.35 }}
              style={{ color: BRAND_TOKENS.text.tertiary }}
            >
              <Sparkles className="h-3 w-3" style={{ color: "#22D3EE" }} />
              {item}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Redirect indicator */}
      <motion.div
        className="mt-8 flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex gap-1">
          {[0, 200, 400].map((delay) => (
            <motion.div
              key={delay}
              className="h-1.5 w-1.5 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: delay / 1000,
                ease: "easeInOut",
              }}
              style={{ background: BRAND_TOKENS.palette.violet }}
            />
          ))}
        </div>
        <p className="text-[11px] font-medium" style={{ color: "rgba(245,242,255,0.4)" }}>
          {t("signup.complete.redirecting") || "Redirecting…"}
        </p>
      </motion.div>
    </motion.div>
  );
}
