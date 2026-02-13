"use client";

import { LogOut } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { cn } from "@core/common/utils";

interface LogoutButtonProps {
      /** Show only icon (no text) */
      iconOnly?: boolean;
      className?: string;
      /** Extra class for the text label (for hiding in collapsed state) */
      textClassName?: string;
}

/**
 * Shared logout button that uses `useAppStore.logout()` directly.
 * No `@modules/auth` import — no module boundary violation.
 */
export function LogoutButton({
      iconOnly = false,
      className,
      textClassName,
}: LogoutButtonProps) {
      const { t } = useI18n();
      const logout = useAppStore((state) => state.logout);

      return (
            <Button
                  variant="ghost"
                  onClick={logout}
                  className={cn(
                        "w-full justify-start space-x-3 rtl:space-x-reverse text-sidebar-foreground/70",
                        "hover:text-destructive hover:bg-destructive/10 px-3 py-2 h-auto rounded-lg",
                        "shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105",
                        className
                  )}
            >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 shrink-0">
                        <LogOut className="w-4 h-4 text-destructive" />
                  </div>
                  {!iconOnly && (
                        <span className={cn("text-sm", textClassName)}>
                              {t("nav.logout")}
                        </span>
                  )}
            </Button>
      );
}
