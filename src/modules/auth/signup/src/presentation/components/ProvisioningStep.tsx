"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BRAND_TOKENS } from "@core/ui/tokens/brand";
import type { useSignupWizardViewModel } from "../viewmodels/useSignupWizardViewModel";

interface ProvisioningStepProps {
  vm: ReturnType<typeof useSignupWizardViewModel>;
}

// ── Stagger container + item variants ──────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export function ProvisioningStep({ vm }: ProvisioningStepProps) {
  const { t, direction } = useI18n();

  const provisioningSteps = useMemo(
    () => [
      { label: t("signup.provisioning.creatingWorkspace") || "Creating workspace", emoji: "🏗️" },
      { label: t("signup.provisioning.settingDefaults") || "Setting up defaults", emoji: "⚙️" },
      {
        label: t("signup.provisioning.registeringAccount") || "Registering your account",
        emoji: "🔐",
      },
      {
        label: t("signup.provisioning.configuringPermissions") || "Configuring permissions",
        emoji: "🛡️",
      },
      { label: t("signup.provisioning.almostReady") || "Almost ready…", emoji: "✨" },
    ],
    [t]
  );

  const currentStep = Math.min(vm.provisioningStep, provisioningSteps.length - 1);
  const progressPct = ((currentStep + 1) / provisioningSteps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center py-6"
      dir={direction}
    >
      {/* Spinning conic gradient ring */}
      <div className="relative mb-8">
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(168,85,247,0.12) 0%, rgba(99,102,241,0.08) 100%)",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          {/* Rotating conic overlay */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(168,85,247,0.4) 50%, transparent 100%)",
              borderRadius: "inherit",
            }}
          />
          {/* Current step icon */}
          <AnimatePresence mode="wait">
            <motion.span
              key={currentStep}
              className="relative text-3xl"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 20 }}
              transition={{ type: "spring", damping: 14, stiffness: 260 }}
            >
              {provisioningSteps[currentStep].emoji}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Current step label */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={currentStep}
          className="mb-3 text-lg font-semibold"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          style={{
            background: BRAND_TOKENS.gradient.heroText,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {provisioningSteps[currentStep].label}
        </motion.h2>
      </AnimatePresence>

      {/* Step checklist with stagger */}
      <motion.div
        className="mt-4 w-full max-w-xs space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {provisioningSteps.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <motion.div
              key={step.label}
              variants={itemVariants}
              className="flex items-center gap-3"
              style={{ opacity: i <= currentStep ? 1 : 0.3 }}
            >
              {/* Status icon */}
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
                style={{
                  background: isDone
                    ? "rgba(16,185,129,0.15)"
                    : isActive
                      ? "linear-gradient(180deg, rgba(168,85,247,0.2) 0%, rgba(99,102,241,0.15) 100%)"
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    isDone
                      ? "rgba(16,185,129,0.4)"
                      : isActive
                        ? "rgba(168,85,247,0.4)"
                        : "rgba(255,255,255,0.06)"
                  }`,
                }}
              >
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#10B981" }} />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2
                        className="h-3 w-3 animate-spin"
                        style={{ color: BRAND_TOKENS.palette.violet }}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <span
                className="text-xs font-medium"
                style={{
                  color: isDone
                    ? "#10B981"
                    : isActive
                      ? BRAND_TOKENS.text.primary
                      : "rgba(245,242,255,0.35)",
                  transition: "color 0.3s",
                }}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Progress bar */}
      <div
        className="mt-6 h-1 w-full max-w-xs overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, #A855F7 0%, #3B82F6 100%)",
            boxShadow: "0 0 10px rgba(168,85,247,0.35)",
          }}
        />
      </div>

      <p className="mt-4 text-[11px]" style={{ color: "rgba(245,242,255,0.35)" }}>
        {t("signup.provisioning.usuallyTakes") || "This usually takes a few seconds"}
      </p>
    </motion.div>
  );
}
