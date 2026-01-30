"use client"

import { Search } from "lucide-react"
import { Input } from "@core/ui/input"
import { useI18n } from "@core/providers/i18n-provider"
import { cn } from "@core/common/utils"
import type { InputHTMLAttributes } from "react"

interface HeaderSearchProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholderKey?: string
  containerClassName?: string
  inputClassName?: string
  iconClassName?: string
}

export function HeaderSearch({
  placeholderKey = "common.search",
  containerClassName,
  inputClassName,
  iconClassName,
  ...inputProps
}: HeaderSearchProps) {
  const { t, direction } = useI18n()
  const isRTL = direction === "rtl"

  return (
    <div className={cn("relative", containerClassName)}>
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
          isRTL ? "right-3" : "left-3",
          iconClassName
        )}
      />
      <Input
        placeholder={t(placeholderKey)}
        className={cn(
          isRTL ? "pr-9 text-right" : "pl-9",
          inputClassName
        )}
        {...inputProps}
      />
    </div>
  )
}
