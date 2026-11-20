"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import type { PatOneTimeSecretReceipt } from "../../stores/patOneTimeSecretStore";
import { Check, CheckCircle2, Copy, Eye, EyeOff, Terminal, X } from "lucide-react";

/** Props for PatOneTimeSecretBanner. */
export interface PatOneTimeSecretBannerProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  receipt: PatOneTimeSecretReceipt | null | undefined;
  currentUserId?: string | null;
  onDismiss: () => void;
}

/**
 * GitHub-inspired inline one-time cryptographic token receipt banner displayed cleanly
 * right inside /account/integrations or /account/integrations/[id] immediately after generation or rotation.
 */
export function PatOneTimeSecretBanner({
  t,
  receipt,
  currentUserId,
  onDismiss,
}: PatOneTimeSecretBannerProps) {
  const [revealed, setRevealed] = useState(true);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);

  if (!receipt?.plainTextSecret) return null;
  if (
    receipt.ownerUserId != null &&
    currentUserId !== undefined &&
    receipt.ownerUserId !== currentUserId
  ) {
    return null;
  }

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(receipt.plainTextSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleCopyBearerHeader = async () => {
    try {
      await navigator.clipboard.writeText(`Authorization: Bearer ${receipt.plainTextSecret}`);
      setCopiedHeader(true);
      setTimeout(() => setCopiedHeader(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  const maskedPreview = `${receipt.plainTextSecret.slice(0, 14)}${"•".repeat(22)}`;

  return (
    <div
      role="status"
      data-testid="one-time-pat-secret-banner"
      className="rounded-xl border border-success/45 bg-success/5 p-4 sm:p-5 space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <CheckCircle2
            className="h-5 w-5 text-success shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-nx-ink">
                {receipt.isRotated
                  ? t("profile.integrations.secretRotatedBannerTitle", { name: receipt.tokenName })
                  : t("profile.integrations.secretReadyBannerTitle", { name: receipt.tokenName })}
              </p>
              <Badge variant="outline" className="text-[10px] border-success/40 text-success">
                {t("profile.integrations.shownOnceBadge")}
              </Badge>
            </div>
            <p className="text-xs text-nx-ink-2">
              {t("profile.integrations.oneTimeSecretBanner")}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="dismiss-pat-secret-btn"
          onClick={onDismiss}
          className="h-7 px-2.5 text-xs text-nx-ink-2 hover:text-nx-ink self-end sm:self-start gap-1"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{t("profile.integrations.dismissSecret")}</span>
        </Button>
      </div>

      <div className="rounded-lg border border-nx-line bg-nx-ground px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <code
          dir="ltr"
          data-testid="one-time-pat-secret-value"
          className="text-xs font-mono text-nx-ink break-all select-all flex-1"
        >
          {revealed ? receipt.plainTextSecret : maskedPreview}
        </code>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setRevealed((prev) => !prev)}
            className="h-8 px-2.5 text-xs gap-1"
          >
            {revealed ? (
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{revealed ? t("profile.integrations.hideTokenBtn") : t("profile.integrations.revealTokenBtn")}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleCopyBearerHeader()}
            className="h-8 px-2.5 text-xs gap-1"
          >
            {copiedHeader ? (
              <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            ) : (
              <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>
              {copiedHeader ? t("profile.common.copied") : t("profile.integrations.copyAuthHeaderBtn")}
            </span>
          </Button>

          <Button
            type="button"
            size="sm"
            data-testid="copy-one-time-pat-secret-btn"
            onClick={() => void handleCopySecret()}
            className="h-8 px-3 text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5"
          >
            {copiedSecret ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("profile.common.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("profile.common.copy")}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
