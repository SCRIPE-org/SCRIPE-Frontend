"use client"

import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@core/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useI18n } from "@core/providers/i18n-provider"
import { cn } from "@core/common/utils"

interface ThemeSwitcherProps {
  buttonClassName?: string
  contentClassName?: string
}

export function ThemeSwitcher({ buttonClassName, contentClassName }: ThemeSwitcherProps) {
  const { setTheme } = useTheme()
  const { t, direction } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn(buttonClassName)}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={direction === "rtl" ? "start" : "end"}
        className={cn(contentClassName)}
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          {t("theme.light") || "فاتح"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          {t("theme.dark") || "داكن"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          {t("theme.system") || "النظام"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

