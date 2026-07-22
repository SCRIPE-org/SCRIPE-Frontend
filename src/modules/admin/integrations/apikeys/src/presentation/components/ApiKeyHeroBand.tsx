"use client";

import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { ArrowLeft, RotateCcw, Ban, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";
import type { ApiKeyDetail } from "../../domain/entities/ApiKeyDetail";

interface ApiKeyHeroBandProps {
  detail: ApiKeyDetail;
  isRotating: boolean;
  onRotate: () => void;
  onRevoke: () => void;
}

const STATUS_COLORS = {
  active: "bg-success/10 text-success border-success/25",
  revoked: "bg-destructive/10 text-destructive border-destructive/25",
  expired: "bg-warning/10 text-warning border-warning/25",
};

const STATUS_DOT = {
  active: "bg-success",
  revoked: "bg-destructive",
  expired: "bg-warning",
};

export function ApiKeyHeroBand({ detail, isRotating, onRotate, onRevoke }: ApiKeyHeroBandProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(detail.prefix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const status = detail.status;

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4 px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/integrations/apikeys")}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("apikeys.backToList") || "API Keys"}
        </Button>

        <div className="h-4 w-px bg-border" />

        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-base font-semibold truncate max-w-xs">{detail.name}</h1>

          <div className="flex items-center gap-1.5 font-mono text-xs bg-muted px-2 py-1 rounded-md border">
            <code className="text-muted-foreground">sc_live_</code>
            <code className="font-semibold">{detail.prefix}</code>
            <button
              onClick={handleCopy}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Copy prefix"
            >
              {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>

          <Badge className={`${STATUS_COLORS[status]} border text-xs flex items-center gap-1.5`}>
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
            {t(`apikeys.status.${status}`) || status}
          </Badge>

          {detail.lastUsedAt && (
            <span className="text-xs text-muted-foreground hidden md:block">
              {t("apikeys.lastUsed") || "Last used"}{" "}
              {formatDateTimeUtc(detail.lastUsedAt)} (UTC)
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
            <RotateCcw className={`h-3.5 w-3.5 ${isRotating ? "animate-spin" : ""}`} />
            {t("apikeys.rotateKey") || "Rotate Key"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onRevoke}
            disabled={!detail.isActive}
            className="gap-1.5"
          >
            <Ban className="h-3.5 w-3.5" />
            {t("apikeys.revoke") || "Revoke"}
          </Button>
        </div>
      </div>
    </div>
  );
}
