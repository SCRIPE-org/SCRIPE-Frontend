/**
 * MagicLinkCallbackView — Magic-link sign-in verification page (pure render).
 *
 * All business logic is in useMagicLinkCallbackViewModel.
 * This component is a pure render — no DI imports, no HTTP calls.
 *
 * States:
 *   - verifying: spinner while POST /auth/magic-link/verify runs
 *   - success: brief success flash → redirect
 *   - expired/invalid: error with "request a new link" CTA
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useMagicLinkCallbackViewModel } from "../viewmodels/useMagicLinkCallbackViewModel";
import { VaultBackground } from "../components/layouts/VaultBackground";

export function MagicLinkCallbackView() {
  const { t } = useI18n();
  const vm = useMagicLinkCallbackViewModel();

  return (
    <div
      className="vault-stage relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden"
      dir={vm.direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      <VaultBackground />

      <div className="relative z-[1] flex w-full max-w-[440px] flex-col items-center px-5 py-12">
        <div
          className="sx-screen w-full rounded-[20px] p-8 text-center sm:p-9"
          style={{
            background: "var(--sx-card-bg)",
            border: "1px solid var(--sx-card-border)",
            boxShadow: "var(--sx-card-shadow)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {vm.state === "verifying" && (
            <div className="flex flex-col items-center gap-5">
              <span
                className="sx-spin1 inline-block h-10 w-10 rounded-full border-[3px] border-white/10 border-t-[var(--sx-accent)]"
                aria-label={t("auth.magicLink.verifying")}
              />
              <p className="text-[14px]" style={{ color: "var(--sx-text-mute)" }}>
                {t("auth.magicLink.verifying")}
              </p>
            </div>
          )}

          {vm.state === "success" && (
            <div className="sx-pop flex flex-col items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle className="h-7 w-7 text-emerald-500" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-semibold" style={{ color: "var(--sx-text)" }}>
                  {t("auth.magicLink.successTitle")}
                </h1>
                <p className="text-[13px]" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.redirecting")}
                </p>
              </div>
            </div>
          )}

          {vm.state === "error" && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <AlertTriangle className="h-7 w-7 text-amber-500" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-semibold" style={{ color: "var(--sx-text)" }}>
                  {t("auth.magicLink.expiredTitle")}
                </h1>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
                  {t("auth.magicLink.expiredDesc")}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5">
                <Link href="/login">
                  <Button className="h-12 w-full rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985]">
                    {t("auth.magicLink.requestNew")}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
