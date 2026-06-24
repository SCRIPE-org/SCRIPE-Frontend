"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useExternalLoginsViewModel } from "../viewmodels/useExternalLoginsViewModel";
import Image from "next/image";
import { Button } from "@core/ui/button";
import { Loader2, Link2, Unlink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";

/**
 * React presentation component representing the external logins section UI element.
 */
export function ExternalLoginsSection() {
  const { t } = useI18n();
  const { externalLogins, providers, isLoading, isUnlinking, unlink, handleLink } =
    useExternalLoginsViewModel();

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Filter out providers that are already linked
  const linkedProviderNames = externalLogins.map((el) => el.providerName);
  const unlinkedProviders = providers.filter((p: any) => !linkedProviderNames.includes(p.name));

  return (
    <div className="space-y-4">
      {/* Existing Linked Accounts */}
      {externalLogins.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("sso.noExternalLoginsLinked")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {externalLogins.map((login) => {
            const providerInfo = providers.find((p: any) => p.name === login.providerName);

            return (
              <div
                key={login.id}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: providerInfo?.buttonColor || "hsl(var(--primary))" }}
                  >
                    {providerInfo?.iconUrl ? (
                      <Image
                        src={providerInfo.iconUrl}
                        alt={login.providerName}
                        width={20}
                        height={20}
                        className="h-5 w-5 invert"
                      />
                    ) : (
                      <Link2 className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="max-w-[150px] overflow-hidden">
                    <h4 className="truncate text-sm font-medium">{login.providerName}</h4>
                    <p className="truncate text-xs text-muted-foreground">
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
                  title={t("common.delete")}
                >
                  <Unlink className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Link New Account Dropdown */}
      {unlinkedProviders.length > 0 && (
        <div className="border-t border-border/40 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="mt-2 w-full sm:w-auto">
                <Link2 className="mr-2 h-4 w-4" />
                {t("sso.linkExternalAccount")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {unlinkedProviders.map((provider: any) => (
                <DropdownMenuItem
                  key={provider.id}
                  onClick={() => handleLink(provider.id, provider.protocol)}
                  className="cursor-pointer p-3 font-medium"
                >
                  {provider.iconUrl ? (
                    <Image
                      src={provider.iconUrl}
                      alt={provider.name}
                      width={20}
                      height={20}
                      className="mr-3 h-5 w-5"
                    />
                  ) : (
                    <span
                      className="mr-3 inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: provider.buttonColor || "hsl(var(--primary))" }}
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
