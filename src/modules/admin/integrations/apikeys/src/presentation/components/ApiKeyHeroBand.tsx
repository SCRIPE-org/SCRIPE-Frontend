"use client";

import { Badge, type BadgeProps } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw, Ban, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc, cn } from "@core/common/utils";
import type { ApiKeyDetail } from "../../domain/entities/ApiKeyDetail";

interface ApiKeyHeroBandProps {
  detail: ApiKeyDetail;
  isRotating: boolean;
  onRotate: () => void;
  onRevoke: () => void;
}

const STATUS_BADGE_VARIANT: Record<ApiKeyDetail["status"], BadgeProps["variant"]> = {
  active: "success",
  revoked: "destructive",
  expired: "warning",
};

const STATUS_DOT: Record<ApiKeyDetail["status"], string> = {
  active: "bg-success",
  revoked: "bg-destructive",
  expired: "bg-warning",
};

export function ApiKeyHeroBand({ detail, isRotating, onRotate, onRevoke }: ApiKeyHeroBandProps) {
  const router = useRouter();
  const { t, direction } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(detail.prefix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const status = detail.status;
  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="sticky top-0 z-sticky border-b border-nx-line bg-nx-surface">
      <div className="flex items-center gap-4 px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/integrations/apikeys")}
          className="gap-1.5"
        >
          <BackIcon className="h-4 w-4" aria-hidden="true" />
          {t("apikeys.backToList")}
        </Button>

        <div className="h-4 w-px bg-nx-line" />

        <div className="flex flex-1 items-center gap-3">
          <h1 className="max-w-xs truncate text-base font-semibold text-nx-ink">{detail.name}</h1>

          <div className="flex items-center gap-1.5 rounded-nx-sm border border-nx-line bg-nx-raised px-2 py-1 font-mono text-xs">
            <code className="text-nx-ink-2">sc_live_</code>
            <code className="font-semibold text-nx-ink">{detail.prefix}</code>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={t("apikeys.copyPrefix")}
              className="ms-1 text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink motion-reduce:transition-none"
            >
              {copied ? (
                <Check className="h-3 w-3 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-3 w-3" aria-hidden="true" />
              )}
            </button>
          </div>

          <Badge variant={STATUS_BADGE_VARIANT[status]} className="gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} aria-hidden="true" />
            {t(`apikeys.status.${status}`)}
          </Badge>

          {detail.lastUsedAt && (
            <span className="hidden text-xs text-nx-ink-2 md:block">
              {t("apikeys.lastUsedAt", { time: formatDateTimeUtc(detail.lastUsedAt) })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRotate}
            disabled={isRotating || !detail.isActive}
            className="gap-1.5"
          >
            <RotateCcw
              className={cn("h-3.5 w-3.5", isRotating && "motion-safe:animate-spin")}
              aria-hidden="true"
            />
            {t("apikeys.rotateKey")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onRevoke}
            disabled={!detail.isActive}
            className="gap-1.5"
          >
            <Ban className="h-3.5 w-3.5" aria-hidden="true" />
            {t("apikeys.revoke")}
          </Button>
        </div>
      </div>
    </div>
  );
}
