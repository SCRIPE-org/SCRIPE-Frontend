"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/ui/sileo-toast";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";

export default function SileoPlaygroundPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t, direction, setLanguage } = useI18n();
  const isDark = resolvedTheme !== "light";
  const dir = direction || "ltr";
  const theme = isDark ? "dark" : "light";
  const [lastAction, setLastAction] = React.useState<
    | { kind: "triggered"; key: string }
    | { kind: "clicked"; key: string; defaultValue: string }
    | null
  >(null);

  const triggerToast = (type: string) => {
    setLastAction({ kind: "triggered", key: type });

    switch (type) {
      case "pill":
        toast.success({
          title: t("sileoPlayground.toasts.pillTitle", {
            defaultValue: "Changes Saved Successfully",
          }),
          duration: 6000,
        });
        break;

      case "success":
        toast.success({
          title: t("sileoPlayground.toasts.successTitle", {
            defaultValue: "Court Booking Confirmed",
          }),
          description: t("sileoPlayground.toasts.successDescription", {
            defaultValue:
              "Court 3 reserved for Al-Ahly First Team on Friday at 18:00 UTC. Confirmation dispatched.",
          }),
          duration: 10000,
          autopilot: true,
        });
        break;

      case "error":
        toast.error({
          title: t("sileoPlayground.toasts.errorTitle", {
            defaultValue: "Payment Authorization Failed",
          }),
          description: t("sileoPlayground.toasts.errorDescription", {
            defaultValue:
              "Stripe transaction declined: Insufficient funds on merchant card. Automatic retry in 15m.",
          }),
          duration: 10000,
          autopilot: true,
          button: {
            title: t("sileoPlayground.toasts.errorAction", { defaultValue: "Retry Payment" }),
            onClick: () =>
              setLastAction({
                kind: "clicked",
                key: "sileoPlayground.toasts.errorAction",
                defaultValue: "Retry Payment",
              }),
          },
        });
        break;

      case "warning":
        toast.warning({
          title: t("sileoPlayground.toasts.warningTitle", {
            defaultValue: "Resource Quota Exceeded (92%)",
          }),
          description: t("sileoPlayground.toasts.warningDescription", {
            defaultValue:
              "Monthly active athlete limit reached for Sports-Enterprise tier. 48 slots remaining before lock.",
          }),
          duration: 10000,
          autopilot: true,
          button: {
            title: t("sileoPlayground.toasts.warningAction", { defaultValue: "Upgrade Tier" }),
            onClick: () =>
              setLastAction({
                kind: "clicked",
                key: "sileoPlayground.toasts.warningAction",
                defaultValue: "Upgrade Tier",
              }),
          },
        });
        break;

      case "info":
        toast.info({
          title: t("sileoPlayground.toasts.infoTitle", {
            defaultValue: "Platform Maintenance Notice",
          }),
          description: t("sileoPlayground.toasts.infoDescription", {
            defaultValue:
              "Database schema migration and cluster sync scheduled for tonight at 02:00 UTC (10m downtime).",
          }),
          duration: 10000,
          autopilot: true,
        });
        break;

      case "action":
        toast.action({
          title: t("sileoPlayground.toasts.actionTitle", {
            defaultValue: "Invoice #INV-2026-089 Drafted",
          }),
          description: t("sileoPlayground.toasts.actionDescription", {
            defaultValue:
              "Corporate sponsorship package ($45,000) finalized and validated against financial ledger.",
          }),
          duration: 10000,
          autopilot: true,
          button: {
            title: t("sileoPlayground.toasts.actionButton", { defaultValue: "Review & Send" }),
            onClick: () =>
              setLastAction({
                kind: "clicked",
                key: "sileoPlayground.toasts.actionButton",
                defaultValue: "Review & Send",
              }),
          },
        });
        break;

      case "loading":
        toast.loading({
          title: t("sileoPlayground.toasts.loadingTitle", {
            defaultValue: "Generating Spatial Heatmap...",
          }),
          description: t("sileoPlayground.toasts.loadingDescription", {
            defaultValue:
              "Computing spatial positioning, acceleration vectors, and ball progression telemetry across 90 minutes.",
          }),
          duration: 10000,
          autopilot: true,
        });
        break;

      case "promise": {
        const promiseFn = new Promise((resolve) => setTimeout(resolve, 2500));
        toast.promise(promiseFn, {
          loading: t("sileoPlayground.toasts.promiseLoading", {
            defaultValue: "Synchronizing Academy Rosters...",
          }),
          success: t("sileoPlayground.toasts.promiseSuccess", {
            defaultValue: "140 Youth Rosters Synchronized!",
          }),
          error: t("sileoPlayground.toasts.promiseError", {
            defaultValue: "Roster Sync Failed",
          }),
        });
        break;
      }

      default:
        toast.show({
          title: t("sileoPlayground.toasts.defaultTitle", { defaultValue: "Sileo Notification" }),
          description: t("sileoPlayground.toasts.defaultDescription", {
            defaultValue: "General system status message.",
          }),
          duration: 6000,
          autopilot: true,
        });
    }
  };

  return (
    <main
      id="sileo-playground"
      dir={dir}
      className="min-h-[100dvh] bg-nx-ground p-6 text-nx-ink transition-colors sm:p-10"
    >
      <div className="mx-auto max-w-[880px]">
        {/* Header Bar */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-nx-line pb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-nx-line bg-nx-surface px-3 py-1 text-[11px] font-semibold text-nx-ink-2">
              <span className="h-2 w-2 rounded-full bg-nx-accent" aria-hidden="true" />
              {t("sileoPlayground.badge", {
                defaultValue: "SCRIPE Sovereign OS • Native Sileo Physics Playground",
              })}
            </div>
            <h1 className="text-[26px] font-bold tracking-tight text-nx-ink">
              {t("sileoPlayground.title", {
                defaultValue: "Sileo Spring Dropdown & Hover Morphing",
              })}
            </h1>
            <p className="mt-1 text-sm text-nx-ink-2">
              {t("sileoPlayground.subtitle", {
                defaultValue:
                  "Verify SVG gooey filters, spring pill-to-dropdown expansion, hover persistence, and Nexus theme colors.",
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              id="btn-toggle-theme"
              type="button"
              variant="outline"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
            >
              {t("sileoPlayground.controls.theme", { defaultValue: "Theme:" })}{" "}
              {theme.toUpperCase()}
            </Button>

            <Button
              id="btn-toggle-lang"
              type="button"
              variant="outline"
              onClick={() => setLanguage(dir === "rtl" ? "en" : "ar")}
              className="border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
            >
              {t("sileoPlayground.controls.dir", { defaultValue: "Dir:" })} {dir.toUpperCase()}
            </Button>
          </div>
        </header>

        {/* Action Status Banner */}
        <div className="mb-6 flex items-center justify-between rounded-[10px] border border-nx-line bg-nx-surface px-4 py-3 text-[13px] text-nx-ink-2">
          <span>
            {t("sileoPlayground.statusLabel", { defaultValue: "Status:" })}{" "}
            <strong className="text-nx-ink">
              {!lastAction
                ? t("sileoPlayground.statusReady", { defaultValue: "Ready" })
                : lastAction.kind === "triggered"
                  ? `${t("sileoPlayground.statusTriggeredPrefix", { defaultValue: "Triggered" })} ${lastAction.key}`
                  : `${t("sileoPlayground.statusClickedPrefix", { defaultValue: "Clicked" })} ${t(lastAction.key, { defaultValue: lastAction.defaultValue })}`}
            </strong>
          </span>
          <span className="font-mono text-[11px] text-nx-ink-3">
            {t("sileoPlayground.engineLabel", {
              defaultValue: "Engine: sileo native with SVG gooey filter",
            })}
          </span>
        </div>

        {/* Trigger Buttons Grid */}
        <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <Button
            id="trigger-pill"
            type="button"
            variant="outline"
            onClick={() => triggerToast("pill")}
            className="h-auto flex-col items-start justify-start gap-1 rounded-xl border-success/40 bg-success/10 p-3.5 text-start font-semibold text-nx-success hover:bg-success/15"
          >
            <span>
              <span aria-hidden="true">▶ </span>
              {t("sileoPlayground.triggers.pillTitle", { defaultValue: "Compact 40px Pill" })}
            </span>
            <span className="text-[11px] font-normal text-nx-ink-2">
              {t("sileoPlayground.triggers.pillDesc", { defaultValue: "Resting Pill State" })}
            </span>
          </Button>

          <Button
            id="trigger-success"
            type="button"
            variant="outline"
            onClick={() => triggerToast("success")}
            className="h-auto flex-col items-start justify-start gap-1 rounded-xl border-success/40 bg-success/10 p-3.5 text-start font-semibold text-nx-success hover:bg-success/15"
          >
            <span>
              <span aria-hidden="true">▶ </span>
              {t("sileoPlayground.triggers.successTitle", { defaultValue: "Success Toast" })}
            </span>
            <span className="text-[11px] font-normal text-nx-ink-2">
              {t("sileoPlayground.triggers.successDesc", {
                defaultValue: "Pill -> Spring Dropdown",
              })}
            </span>
          </Button>

          <Button
            id="trigger-error"
            type="button"
            variant="outline"
            onClick={() => triggerToast("error")}
            className="h-auto flex-col items-start justify-start gap-1 rounded-xl border-destructive/40 bg-destructive/10 p-3.5 text-start font-semibold text-destructive hover:bg-destructive/15"
          >
            <span>
              <span aria-hidden="true">▶ </span>
              {t("sileoPlayground.triggers.errorTitle", { defaultValue: "Error Toast" })}
            </span>
            <span className="text-[11px] font-normal text-nx-ink-2">
              {t("sileoPlayground.triggers.errorDesc", { defaultValue: "Includes Retry action" })}
            </span>
          </Button>

          <Button
            id="trigger-warning"
            type="button"
            variant="outline"
            onClick={() => triggerToast("warning")}
            className="h-auto flex-col items-start justify-start gap-1 rounded-xl border-warning/40 bg-warning/10 p-3.5 text-start font-semibold text-nx-warning-strong hover:bg-warning/15"
          >
            <span>
              <span aria-hidden="true">▶ </span>
              {t("sileoPlayground.triggers.warningTitle", { defaultValue: "Warning Toast" })}
            </span>
            <span className="text-[11px] font-normal text-nx-ink-2">
              {t("sileoPlayground.triggers.warningDesc", {
                defaultValue: "Quota threshold notice",
              })}
            </span>
          </Button>

          <Button
            id="trigger-info"
            type="button"
            variant="outline"
            onClick={() => triggerToast("info")}
            className="h-auto flex-col items-start justify-start gap-1 rounded-xl border-info/40 bg-info/10 p-3.5 text-start font-semibold text-info hover:bg-info/15"
          >
            <span>
              <span aria-hidden="true">▶ </span>
              {t("sileoPlayground.triggers.infoTitle", { defaultValue: "Info Toast" })}
            </span>
            <span className="text-[11px] font-normal text-nx-ink-2">
              {t("sileoPlayground.triggers.infoDesc", { defaultValue: "System maintenance" })}
            </span>
          </Button>

          <Button
            id="trigger-action"
            type="button"
            variant="outline"
            onClick={() => triggerToast("action")}
            className="h-auto flex-col items-start justify-start gap-1 rounded-xl border-nx-accent bg-nx-accent-wash p-3.5 text-start font-semibold text-nx-accent hover:brightness-95"
          >
            <span>
              <span aria-hidden="true">▶ </span>
              {t("sileoPlayground.triggers.actionTitle", { defaultValue: "Interactive Action" })}
            </span>
            <span className="text-[11px] font-normal text-nx-ink-2">
              {t("sileoPlayground.triggers.actionDesc", { defaultValue: "Review & Send button" })}
            </span>
          </Button>

          <Button
            id="trigger-loading"
            type="button"
            variant="outline"
            onClick={() => triggerToast("loading")}
            className="h-auto flex-col items-start justify-start gap-1 rounded-xl border-nx-line bg-nx-raised p-3.5 text-start font-semibold text-nx-ink hover:border-nx-line-hi"
          >
            <span>
              <span aria-hidden="true">▶ </span>
              {t("sileoPlayground.triggers.loadingTitle", { defaultValue: "Loading Spinner" })}
            </span>
            <span className="text-[11px] font-normal text-nx-ink-2">
              {t("sileoPlayground.triggers.loadingDesc", { defaultValue: "Spatial heatmap calc" })}
            </span>
          </Button>

          <Button
            id="trigger-promise"
            type="button"
            variant="outline"
            onClick={() => triggerToast("promise")}
            className="h-auto flex-col items-start justify-start gap-1 rounded-xl border-info/40 bg-info/10 p-3.5 text-start font-semibold text-info hover:bg-info/15"
          >
            <span>
              <span aria-hidden="true">▶ </span>
              {t("sileoPlayground.triggers.promiseTitle", { defaultValue: "Promise Morphing" })}
            </span>
            <span className="text-[11px] font-normal text-nx-ink-2">
              {t("sileoPlayground.triggers.promiseDesc", {
                defaultValue: "Loading -> Success morph",
              })}
            </span>
          </Button>

          <Button
            id="trigger-clear"
            type="button"
            variant="outline"
            onClick={() => toast.clear()}
            className="h-auto flex-col items-start justify-start gap-1 rounded-xl border-nx-line bg-nx-surface p-3.5 text-start font-semibold text-nx-ink-3 hover:border-nx-line-hi hover:text-nx-ink"
          >
            <span>
              <span aria-hidden="true">✕ </span>
              {t("sileoPlayground.triggers.clearTitle", { defaultValue: "Clear All" })}
            </span>
            <span className="text-[11px] font-normal text-nx-ink-3">
              {t("sileoPlayground.triggers.clearDesc", {
                defaultValue: "Dismiss all active toasts",
              })}
            </span>
          </Button>
        </div>

        {/* Behavior Specifications Card */}
        <Card className="border-nx-line bg-nx-surface p-5 text-[13px] leading-relaxed text-nx-ink-2">
          <div className="mb-2 font-semibold text-nx-ink">
            {t("sileoPlayground.specs.title", {
              defaultValue: "Sileo Native Behavior Specifications Verified:",
            })}
          </div>
          <ul className="m-0 list-disc ps-5">
            <li>
              <strong>
                {t("sileoPlayground.specs.arrivalLabel", { defaultValue: "Initial Arrival:" })}
              </strong>{" "}
              {t("sileoPlayground.specs.arrivalBody", {
                defaultValue:
                  "Toast pops in as a compact pill with icon and title using spring physics.",
              })}
            </li>
            <li>
              <strong>
                {t("sileoPlayground.specs.autopilotLabel", {
                  defaultValue: "Autopilot / Hover Dropdown:",
                })}
              </strong>{" "}
              {t("sileoPlayground.specs.autopilotBody", {
                defaultValue:
                  "At 150ms (or upon mouse hover), the body drops down via SVG gooey filter, morphing into the full card and revealing description and action buttons.",
              })}
            </li>
            <li>
              <strong>
                {t("sileoPlayground.specs.persistenceLabel", {
                  defaultValue: "Hover Persistence:",
                })}
              </strong>{" "}
              {t("sileoPlayground.specs.persistenceBody", {
                defaultValue:
                  "Hovering cursor over the expanded toast freezes the timer and keeps the dropdown open for interaction.",
              })}
            </li>
            <li>
              <strong>
                {t("sileoPlayground.specs.collapseLabel", { defaultValue: "Spring Collapse:" })}
              </strong>{" "}
              {t("sileoPlayground.specs.collapseBody", {
                defaultValue:
                  "Mouse exit triggers smooth spring collapse back to resting pill before exiting.",
              })}
            </li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
