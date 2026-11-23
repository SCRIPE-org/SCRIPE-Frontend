"use client";

import { useState } from "react";
import Image from "next/image";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { BrandIcon } from "@core/ui/brand-icons";
import type { AvailableSsoProvider } from "../../domain/entities/SovereignAccountEntities";
import {
  formatLinkedTimestamp,
  formatProtocolLabel,
  isGlobalSsoScope,
  resolveProviderBadgeColors,
} from "../utils/enterprise-sso.utils";
import { Building2, CheckCircle2, Globe, Link2, Loader2, Unlink } from "lucide-react";

/** Renders the provider's icon image if supplied, or a clean SVG brand/protocol fallback mark. */
export function SsoProviderBrandMark({
  provider,
}: {
  provider: Pick<AvailableSsoProvider, "slug" | "name" | "protocol" | "iconUrl" | "buttonColor">;
}) {
  const colors = resolveProviderBadgeColors(provider.buttonColor);

  if (provider.iconUrl) {
    return (
      <div
        className="w-9 h-9 rounded-lg border border-nx-line flex items-center justify-center shrink-0 overflow-hidden"
        style={{ backgroundColor: colors.background }}
      >
        <Image
          src={provider.iconUrl}
          alt={provider.name}
          width={20}
          height={20}
          unoptimized
          className="h-5 w-5 object-contain"
        />
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-lg border border-nx-line bg-nx-surface flex items-center justify-center shrink-0">
      <BrandIcon
        slug={provider.slug}
        name={provider.name}
        protocol={provider.protocol}
        className="h-5 w-5"
      />
    </div>
  );
}

/**
 * Props for {@link EnterpriseSsoProviderTile}.
 */
export interface EnterpriseSsoProviderTileProps {
  /** Live DB Identity Provider metadata & current user's link state. */
  provider: AvailableSsoProvider;
  /** Whether an unlink mutation is currently in progress. */
  isUnlinking: boolean;
  /** Opens the Sudo-gated federated handshake flow for an unlinked provider. */
  onConnect: (provider: AvailableSsoProvider) => void;
  /** Triggers the Sudo-gated unlink mutation for a connected external login ID. */
  onDisconnect: (externalLoginId: string) => Promise<unknown> | void;
}

/**
 * Single live DB-configured Enterprise SSO Identity Provider tile on `/account/security`.
 */
export function EnterpriseSsoProviderTile({
  provider,
  isUnlinking,
  onConnect,
  onDisconnect,
}: EnterpriseSsoProviderTileProps) {
  const { t, language } = useI18n();
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const protocolLabel = formatProtocolLabel(provider.protocol);
  const isGlobal = isGlobalSsoScope(provider.scope);
  const scopeLabel = isGlobal
    ? t("profile.security.ssoScopeGlobal")
    : t("profile.security.ssoScopeOrganization");
  const linkedTimestamp = formatLinkedTimestamp(provider.linkedAtUtc, language);

  return (
    <Card
      data-testid={`enterprise-sso-tile-${provider.slug || provider.encryptedId}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-nx-line bg-nx-raised hover:border-nx-line-hi transition-colors"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <SsoProviderBrandMark provider={provider} />

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-nx-ink truncate">
              {provider.name}
            </span>
            <Badge
              variant="outline"
              className="border-nx-line text-nx-ink-2 text-[10px] font-mono py-0"
            >
              {protocolLabel}
            </Badge>
            <Badge
              variant="outline"
              className="border-nx-line text-nx-ink-2 text-[10px] py-0 gap-1"
            >
              {isGlobal ? (
                <Globe className="h-2.5 w-2.5 text-nx-accent" />
              ) : (
                <Building2 className="h-2.5 w-2.5 text-nx-ink-2" />
              )}
              <span>{scopeLabel}</span>
            </Badge>
            {provider.isLinked ? (
              <Badge className="bg-success/15 text-success border border-success/30 text-[10px] font-semibold gap-1 py-0">
                <CheckCircle2 className="h-2.5 w-2.5" />
                <span>{t("profile.security.ssoConnectedBadge")}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-nx-line text-nx-ink-3 text-[10px] py-0"
              >
                {t("profile.security.ssoAvailableBadge")}
              </Badge>
            )}
          </div>

          <p className="text-[11px] text-nx-ink-2 truncate">
            {provider.isLinked ? (
              <bdi dir="ltr" className="font-mono text-nx-ink">
                {provider.linkedEmail || t("profile.security.ssoVerifiedClaimLabel")}
              </bdi>
            ) : (
              t("profile.security.ssoNotConnectedProtocolHint", {
                protocol: protocolLabel,
              })
            )}
          </p>

          {provider.isLinked && linkedTimestamp && (
            <p className="text-[10px] text-nx-ink-3">
              {t("profile.security.ssoLinkedAtLabel", { date: linkedTimestamp })}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {provider.isLinked && provider.externalLoginId ? (
          confirmUnlink ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-destructive font-medium">
                {t("profile.security.ssoConfirmDisconnectPrompt")}
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isUnlinking}
                data-testid={`confirm-unlink-${provider.slug || provider.encryptedId}`}
                onClick={async () => {
                  try {
                    await onDisconnect(provider.externalLoginId!);
                    setConfirmUnlink(false);
                  } catch {
                    // Errors & Sudo cancellations handled safely by ViewModel mutation callbacks
                  }
                }}
                className="h-7 text-[10px] px-2 font-semibold"
              >
                {isUnlinking ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  t("profile.security.ssoConfirmDisconnectBtn")
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUnlinking}
                onClick={() => setConfirmUnlink(false)}
                className="h-7 text-[10px] px-2 border-nx-line text-nx-ink-2"
              >
                {t("profile.common.cancel")}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid={`disconnect-sso-${provider.slug || provider.encryptedId}`}
              onClick={() => setConfirmUnlink(true)}
              className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 gap-1"
            >
              <Unlink className="h-3 w-3" />
              <span>{t("profile.security.ssoDisconnectBtn")}</span>
            </Button>
          )
        ) : (
          <Button
            type="button"
            size="sm"
            data-testid={`connect-sso-${provider.slug || provider.encryptedId}`}
            onClick={() => onConnect(provider)}
            className="h-7 text-xs font-semibold gap-1 bg-nx-accent-fill text-nx-on-fill"
          >
            <Link2 className="h-3 w-3" />
            <span>{t("profile.security.ssoConnectBtn")}</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
