"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { BrandIcon } from "@core/ui/brand-icons";
import { type SsoProviderCatalogItem } from "./EnterpriseSsoConnectDialog";
import { Link2, Unlink, CheckCircle2, Loader2 } from "lucide-react";
import type { ExternalLogin } from "../../domain/entities/ExternalLogin";

export {
  ENTERPRISE_IDP_CATALOG,
  matchExternalLogin,
  findFederatedProviderId,
} from "../utils/enterprise-sso.utils";

/**
 * Props for {@link EnterpriseSsoProviderTile}.
 */
export interface EnterpriseSsoProviderTileProps {
  /** Catalog metadata for the enterprise identity provider. */
  item: SsoProviderCatalogItem;
  /** Matching linked external login record for the current user, if connected. */
  matchingLogin?: ExternalLogin;
  /** True when the tile is currently in inline unlink confirmation state. */
  isConfirmingUnlink: boolean;
  /** True when this specific login binding is currently unlinking. */
  isUnlinkingThis: boolean;
  /** Opens the connect/federate modal for this provider. */
  onConnect: (item: SsoProviderCatalogItem) => void;
  /** Requests inline unlink confirmation for the given login ID. */
  onRequestUnlink: (loginId: string) => void;
  /** Cancels inline unlink confirmation. */
  onCancelUnlink: () => void;
  /** Confirms and executes unlinking the given external login ID. */
  onConfirmUnlink: (loginId: string) => Promise<void>;
}

/**
 * Single enterprise SSO identity provider tile showing brand identity,
 * connection status, linked claim summary, and connect/disconnect actions.
 */
export function EnterpriseSsoProviderTile({
  item,
  matchingLogin,
  isConfirmingUnlink,
  isUnlinkingThis,
  onConnect,
  onRequestUnlink,
  onCancelUnlink,
  onConfirmUnlink,
}: EnterpriseSsoProviderTileProps) {
  const { t } = useI18n();
  const isConnected = Boolean(matchingLogin);

  return (
    <div
      data-testid={`sso-provider-card-${item.key}`}
      className={`rounded-xl border p-4 flex flex-col justify-between gap-3.5 transition-colors ${
        isConnected
          ? "border-nx-accent/40 bg-nx-ground"
          : "border-nx-line bg-nx-ground hover:border-nx-line-hi"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${item.brandContainerClass}`}
          >
            <BrandIcon
              slug={item.slug}
              name={item.name}
              protocol={item.protocol}
              className="h-5 w-5"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-nx-ink">{item.name}</span>
              <Badge
                variant="outline"
                className="border-nx-line text-nx-ink-2 font-mono text-[10px] py-0 px-1.5"
              >
                {item.protocol}
              </Badge>
            </div>

            {isConnected && matchingLogin ? (
              <p className="text-xs font-mono text-nx-ink-2 truncate">
                {matchingLogin.email || matchingLogin.displayName || matchingLogin.providerKey}
              </p>
            ) : (
              <p className="text-xs text-nx-ink-3">
                {item.domainHint
                  ? t("profile.security.ssoNotConnectedHint", { domain: item.domainHint })
                  : t("profile.security.ssoNotConnectedProtocolHint", { protocol: item.protocol })}
              </p>
            )}
          </div>
        </div>

        {isConnected ? (
          <Badge className="bg-success/15 text-success border border-success/30 text-[10px] font-semibold shrink-0 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" style={{ minWidth: 12, minHeight: 12 }} />
            <span>{t("profile.security.ssoConnectedBadge")}</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-nx-line text-nx-ink-3 text-[10px] shrink-0"
          >
            {t("profile.security.ssoAvailableBadge")}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-nx-line">
        <span className="text-[11px] font-mono text-nx-ink-3">
          {isConnected
            ? t("profile.security.ssoVerifiedClaimLabel")
            : t("profile.security.ssoPreconfiguredByTenant")}
        </span>

        {isConnected && matchingLogin ? (
          isConfirmingUnlink ? (
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <span className="text-[11px] text-destructive font-medium">
                {t("profile.security.ssoConfirmDisconnectPrompt")}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid={`sso-confirm-disconnect-btn-${item.key}`}
                onClick={() => void onConfirmUnlink(matchingLogin.id)}
                disabled={isUnlinkingThis}
                className="h-7 px-2 text-[10px] font-semibold border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                {isUnlinkingThis ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  t("profile.security.ssoConfirmDisconnectBtn")
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancelUnlink}
                className="h-7 px-2 text-[10px] text-nx-ink-3 hover:text-nx-ink"
              >
                {t("profile.common.cancel")}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid={`sso-disconnect-btn-${item.key}`}
              onClick={() => onRequestUnlink(matchingLogin.id)}
              disabled={isUnlinkingThis}
              className="h-8 text-xs font-semibold border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
            >
              {isUnlinkingThis ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Unlink className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
              )}
              <span>{t("profile.security.ssoDisconnectBtn")}</span>
            </Button>
          )
        ) : (
          <Button
            type="button"
            size="sm"
            data-testid={`sso-connect-btn-${item.key}`}
            onClick={() => onConnect(item)}
            className="h-8 text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5"
          >
            <Link2 className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
            <span>{t("profile.security.ssoConnectBtn")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
