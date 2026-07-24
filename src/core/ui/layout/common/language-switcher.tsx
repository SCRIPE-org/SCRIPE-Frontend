"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { useI18n, type Language } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

interface LanguageSwitcherProps {
  buttonClassName?: string;
  contentClassName?: string;
}

/*
 * The two flags are national marks, not design decisions — their colours are
 * fixed the way a vendor logo's are, so they carry literals the same way
 * `brand-icons.tsx` does. Everything structural around them (the ring, the
 * size, the placement) is tokenised.
 *
 * The mask ids are generated per instance: the switcher renders the same flag
 * in the trigger and again in the menu, and a hardcoded id put three elements
 * with the same `id` in the document, where `url(#us-mask)` resolves to
 * whichever one the browser saw first.
 */

// Stylized premium circular US Flag SVG
export function USFlag({ className }: { className?: string }) {
  const maskId = React.useId();
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true" focusable="false">
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width="20" height="20" fill="#F0F2F5" />
        <path
          d="M0 0H20V2.86H0V0ZM0 5.71H20V8.57H0V5.71ZM0 11.43H20V14.29H0V11.43ZM0 17.14H20V20H0V17.14Z"
          fill="#BD082C"
        />
        <rect width="10" height="10.5" fill="#1A2F6D" />
        <circle cx="2" cy="2" r="0.6" fill="white" />
        <circle cx="5" cy="2" r="0.6" fill="white" />
        <circle cx="8" cy="2" r="0.6" fill="white" />
        <circle cx="3.5" cy="3.5" r="0.6" fill="white" />
        <circle cx="6.5" cy="3.5" r="0.6" fill="white" />
        <circle cx="2" cy="5" r="0.6" fill="white" />
        <circle cx="5" cy="5" r="0.6" fill="white" />
        <circle cx="8" cy="5" r="0.6" fill="white" />
        <circle cx="3.5" cy="6.5" r="0.6" fill="white" />
        <circle cx="6.5" cy="6.5" r="0.6" fill="white" />
        <circle cx="2" cy="8" r="0.6" fill="white" />
        <circle cx="5" cy="8" r="0.6" fill="white" />
        <circle cx="8" cy="8" r="0.6" fill="white" />
      </g>
    </svg>
  );
}

// Stylized premium circular Egypt Flag SVG
export function EGFlag({ className }: { className?: string }) {
  const maskId = React.useId();
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true" focusable="false">
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width="20" height="6.67" fill="#C1272D" />
        <rect y="6.67" width="20" height="6.67" fill="#FFFFFF" />
        <rect y="13.33" width="20" height="6.67" fill="#000000" />
        <path
          d="M9.3 9.4c.1-.1.2-.2.3-.2l.4.1.4-.1c.1 0 .2.1.3.2.1.1.2.3.1.5l-.2.7c0 .1-.1.2-.2.3l-.2.1v.2c.1.1.2.2.2.3v.2l.2.3v.2l-.2.2c-.1 0-.1.1-.1.2v.3h-.2c-.1.1-.2.1-.3 0h-.2v-.3c0-.1-.1-.2-.1-.2l-.2-.2v-.2l.2-.3v-.2c0-.1.1-.2.2-.3v-.2l-.2-.1c-.1-.1-.2-.2-.2-.3l-.2-.7c-.1-.2 0-.4.1-.5z"
          fill="#C5A059"
        />
        <path d="M10 9.7v2" stroke="#C5A059" strokeWidth="0.4" />
      </g>
    </svg>
  );
}

/** The ring around a flag is chrome, so it is a hairline like every other. */
const FLAG_RING = "shrink-0 rounded-full border border-nx-line";

export function LanguageSwitcher({ buttonClassName, contentClassName }: LanguageSwitcherProps) {
  const { t, language, setLanguage, direction } = useI18n();

  const ActiveFlag = language === "ar" ? EGFlag : USFlag;
  const isRtl = direction === "rtl";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          // The trigger is icon-plus-code, and at the sm breakpoint the code is
          // hidden — so the name has to be on the control itself rather than
          // borrowed from a label that is not always in the DOM.
          aria-label={t("chrome.language.change")}
          className={cn(
            "group flex h-9 items-center gap-1.5 rounded-full border border-transparent px-2.5",
            "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
            "hover:border-nx-line-hi hover:bg-nx-hover",
            "focus-visible:outline-none focus-visible:shadow-nx-focus",
            buttonClassName
          )}
        >
          <ActiveFlag className={cn(FLAG_RING, "h-5 w-5")} />
          <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-nx-ink-2 sm:inline-block">
            {t("chrome.language.short")}
          </span>
          {/* Rotation reports the menu's state; it is not a direction, so it
              stays identical in both writing directions. */}
          <ChevronDown
            aria-hidden="true"
            className="h-3 w-3 text-nx-ink-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRtl ? "start" : "end"}
        // Surface, radius, depth, padding and motion all come from the
        // primitive — a panel that redecorates itself here is how the app ended
        // up with four different dropdown skins.
        className={cn("w-44", contentClassName)}
      >
        {/* One value out of a fixed set: a radio group, so the current language
            is announced as checked instead of being implied by a tick glyph. */}
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => setLanguage(value as Language)}
        >
          <DropdownMenuRadioItem value="ar">
            <EGFlag className={cn(FLAG_RING, "h-4 w-4")} />
            <span>{t("chrome.language.arabicNative")}</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en">
            <USFlag className={cn(FLAG_RING, "h-4 w-4")} />
            <span>{t("chrome.language.englishNative")}</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
