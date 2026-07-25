"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useExternalLoginsViewModel } from "../viewmodels/useExternalLoginsViewModel";
import Image from "next/image";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Link2, Unlink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";

/**
 * Perceived (WCAG relative) luminance of a hex colour, 0 (black) - 1 (white).
 * Unparseable input is treated as light so callers fall back to dark ink.
 * Same measured-luminance approach as the theme gallery's arbitrary
 * tenant-colour swatches (Wave 8).
 */
function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) return 1;
  const channel = (start: number) => {
    const c = parseInt(full.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * provider.buttonColor is server-supplied and unbounded — a near-white value
 * under a fixed white icon would make the icon disappear. When the colour is
 * a measurable hex we pick pure black/white ink from its own luminance
 * (mirrors ThemeGalleryView's inkBaseFor for arbitrary tenant colours);
 * anything we cannot measure falls back to the accent-fill token pair, which
 * is already contrast-checked.
 */
function tileTreatment(buttonColor: string | undefined | null) {
  if (buttonColor && HEX_COLOR.test(buttonColor)) {
    return {
      background: buttonColor,
      ink: relativeLuminance(buttonColor) > 0.5 ? "black" : "white",
    };
  }
  return { background: "var(--nx-accent-fill)", ink: "var(--nx-on-fill)" };
}

/**
 * Presentation UI component rendering the external logins section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ExternalLoginsSection() {
  const { t } = useI18n();
  const { externalLogins, providers, isLoading, isUnlinking, unlink, handleLink } =
    useExternalLoginsViewModel();

  if (isLoading) {
    return <LoadingSpinner showText={false} />;
  }

  // Filter out providers that are already linked
  const linkedProviderNames = externalLogins.map((el) => el.providerName);
  const unlinkedProviders = providers.filter((p: any) => !linkedProviderNames.includes(p.name));

  return (
    <div className="space-y-4">
      {/* Existing Linked Accounts */}
      {externalLogins.length === 0 ? (
        <p className="text-sm text-nx-ink-2">{t("sso.noExternalLoginsLinked")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {externalLogins.map((login) => {
            const providerInfo = providers.find((p: any) => p.name === login.providerName);
            const tile = tileTreatment(providerInfo?.buttonColor);

            return (
              <div
                key={login.id}
                className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-surface p-4 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:border-nx-line-hi"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: tile.background, color: tile.ink }}
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
              </div>
            );
          })}
        </div>
      )}

      {/* Link New Account Dropdown */}
      {unlinkedProviders.length > 0 && (
        <div className="border-t border-nx-line pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="mt-2 w-full sm:w-auto">
                <Link2 className="me-2 h-4 w-4" aria-hidden="true" />
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
                      className="me-3 h-5 w-5"
                    />
                  ) : (
                    <span
                      className="me-3 inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: tileTreatment(provider.buttonColor).background }}
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
