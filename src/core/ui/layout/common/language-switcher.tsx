"use client";

import { ChevronDown, Check } from "lucide-react";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

interface LanguageSwitcherProps {
  buttonClassName?: string;
  contentClassName?: string;
}

// Stylized premium circular US Flag SVG
export function USFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <mask id="us-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
      </mask>
      <g mask="url(#us-mask)">
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
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <mask id="eg-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <circle cx="10" cy="10" r="10" fill="#FFFFFF" />
      </mask>
      <g mask="url(#eg-mask)">
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

export function LanguageSwitcher({ buttonClassName, contentClassName }: LanguageSwitcherProps) {
  const { language, setLanguage, direction } = useI18n();

  const ActiveFlag = language === "ar" ? EGFlag : USFlag;
  const isRtl = direction === "rtl";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full border border-transparent px-2.5 transition-all duration-200 hover:border-border/30 hover:bg-accent active:scale-95",
            buttonClassName
          )}
        >
          <ActiveFlag className="h-5 w-5 shrink-0 rounded-full border border-black/5 object-cover shadow-sm" />
          <span className="hidden text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:inline-block">
            {language === "ar" ? "عربي" : "EN"}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground/50 transition-transform duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRtl ? "start" : "end"}
        className={cn(
          "mt-1 w-44 rounded-2xl border border-border/80 bg-popover/90 p-1.5 shadow-xl shadow-black/5 backdrop-blur-md duration-200 animate-in fade-in-50 zoom-in-95",
          contentClassName
        )}
      >
        <DropdownMenuItem
          onClick={() => setLanguage("ar")}
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors hover:bg-accent",
            language === "ar" ? "bg-accent/40 text-foreground" : "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <EGFlag className="h-4 w-4 shrink-0 rounded-full border border-black/5 object-cover" />
            <span>العربية (مصر)</span>
          </div>
          {language === "ar" && <Check className="h-3.5 w-3.5 stroke-[2.5] text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors hover:bg-accent",
            language === "en" ? "bg-accent/40 text-foreground" : "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <USFlag className="h-4 w-4 shrink-0 rounded-full border border-black/5 object-cover" />
            <span>English (US)</span>
          </div>
          {language === "en" && <Check className="h-3.5 w-3.5 stroke-[2.5] text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
