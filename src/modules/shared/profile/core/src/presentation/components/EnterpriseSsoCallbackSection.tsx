"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Copy, Check, KeyRound, Info } from "lucide-react";

/** Props for {@link EnterpriseSsoCallbackSection}. */
export interface EnterpriseSsoCallbackSectionProps {
  /** Generated OIDC/SAML callback URI for tenant configuration. */
  callbackUrl: string;
  /** Whether the callback URI was recently copied to clipboard. */
  copiedCallback: boolean;
  /** Copies the callback URI to the user clipboard. */
  onCopyCallback: () => void;
}

/**
 * Displays the copyable enterprise SSO callback URI and configuration guidance notice.
 */
export function EnterpriseSsoCallbackSection({
  callbackUrl,
  copiedCallback,
  onCopyCallback,
}: EnterpriseSsoCallbackSectionProps) {
  const { t } = useI18n();

  return (
    <div className="p-3.5 rounded-xl border border-nx-line bg-nx-surface space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-nx-ink flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5 text-nx-accent" />
          {t("profile.security.ssoCallbackUriLabel")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="sso-dialog-copy-callback-btn"
          onClick={onCopyCallback}
          className="h-6 px-2 text-[10px] text-nx-ink-2 hover:text-nx-ink gap-1"
        >
          {copiedCallback ? (
            <>
              <Check className="h-3 w-3 text-success" />
              <span className="text-success">{t("profile.common.copied")}</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>{t("profile.common.copy")}</span>
            </>
          )}
        </Button>
      </div>
      <div className="p-2 rounded bg-nx-raised border border-nx-line font-mono text-[11px] text-nx-ink-2 break-all select-all">
        {callbackUrl}
      </div>
      <p className="text-[10px] text-nx-ink-3 flex items-center gap-1">
        <Info className="h-3 w-3 shrink-0" />
        <span>{t("profile.security.ssoCallbackNotice")}</span>
      </p>
    </div>
  );
}
