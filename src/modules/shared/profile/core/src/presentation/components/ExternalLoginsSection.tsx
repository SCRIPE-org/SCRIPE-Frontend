"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useExternalLoginsViewModel } from "../viewmodels/useExternalLoginsViewModel";
import Image from "next/image";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Link2, Unlink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { resolveProviderBadgeColors } from "../utils/enterprise-sso.utils";

/**
 * Presentation UI component rendering the compact external logins section.
 * Consumes live database-configured `availableSsoProviders` via {@link useExternalLoginsViewModel}
 * and invokes Sudo-gated federated link/unlink mutations.
 */
export function ExternalLoginsSection() {
  const { t } = useI18n();
  const {
    externalLogins,
    availableSsoProviders,
    isLoading,
    isUnlinking,
    isInitiatingLink,
    unlink,
    initiateFederatedLink,
  } = useExternalLoginsViewModel();

  if (isLoading) {
    return <LoadingSpinner showText={false} />;
  }

  const unlinkedProviders = availableSsoProviders.filter((p) => !p.isLinked);

  return (
    <div className="space-y-4">
      {externalLogins.length === 0 ? (
        <p className="text-sm text-nx-ink-2">{t("sso.noExternalLoginsLinked")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {externalLogins.map((login) => {
            const matchedProvider = availableSsoProviders.find(
              (p) => p.externalLoginId === login.id || p.name === login.providerName
            );
            const tile = resolveProviderBadgeColors(matchedProvider?.buttonColor);

            return (
              <Card
                key={login.id}
                className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-surface p-4 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi motion-reduce:transition-none"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: tile.background, color: tile.color }}
                  >
                    {matchedProvider?.iconUrl ? (
                      <Image
                        src={matchedProvider.iconUrl}
                        alt={login.providerName}
                        width={20}
                        height={20}
                        unoptimized
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      <Link2 className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>
                  <div className="max-w-[150px] overflow-hidden">
                    <h4 className="truncate text-sm font-medium text-nx-ink">
                      {login.providerName}
                    </h4>
                    <p className="truncate text-xs text-nx-ink-2">
                      {login.email || login.displayName || login.providerKey}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => unlink(login.id)}
                  disabled={isUnlinking}
                  aria-label={t("profile.security.connectedAccounts.unlink")}
                >
                  <Unlink className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {unlinkedProviders.length > 0 && (
        <div className="border-t border-nx-line pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="mt-2 w-full sm:w-auto" disabled={isInitiatingLink}>
                <Link2 className="me-2 h-4 w-4" aria-hidden="true" />
                {t("sso.linkExternalAccount")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {unlinkedProviders.map((provider) => (
                <DropdownMenuItem
                  key={provider.encryptedId}
                  onClick={() => void initiateFederatedLink(provider)}
                  className="cursor-pointer p-3 font-medium"
                >
                  {provider.iconUrl ? (
                    <Image
                      src={provider.iconUrl}
                      alt={provider.name}
                      width={20}
                      height={20}
                      unoptimized
                      className="me-3 h-5 w-5 object-contain"
                    />
                  ) : (
                    <span
                      className="me-3 inline-block h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: resolveProviderBadgeColors(provider.buttonColor).background,
                      }}
                      aria-hidden="true"
                    />
                  )}
                  {provider.buttonLabel || provider.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
