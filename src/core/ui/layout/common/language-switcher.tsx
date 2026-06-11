"use client";

import { Globe } from "lucide-react";
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

export function LanguageSwitcher({ buttonClassName, contentClassName }: LanguageSwitcherProps) {
  const { setLanguage, t, direction } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn(buttonClassName)}>
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={direction === "rtl" ? "start" : "end"}
        className={cn(contentClassName)}
      >
        <DropdownMenuItem onClick={() => setLanguage("ar")}>
          {t("language.arabic") || "العربية"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          {t("language.english") || "English"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
