"use client"
import { useI18n } from "@core/providers/i18n-provider"
import { useSettings } from "@core/providers/settings-provider"
import { cn } from "@core/common/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "inline"
  showText?: boolean
  className?: string
}

export function LoadingSpinner({ 
  size = "md", 
  showText = true, 
  className 
}: LoadingSpinnerProps) {
  const { t } = useI18n()
  const settings = useSettings()

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8"
      case "lg":
        return "w-24 h-24"
      case "inline":
        return "w-4 h-4"
      default:
        return "w-16 h-16"
    }
  }

  const getLoadingComponent = () => {
    const sizeClasses = getSizeClasses()
    
    switch (settings.loadingStyle) {
      case "dots":
        if (size === "inline") {
          return (
            <div className="flex space-x-0.5">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-100"></div>
              <div className="w-1 h-1 bg-current rounded-full animate-bounce delay-200"></div>
            </div>
          )
        }
        return (
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-200"></div>
          </div>
        )
      case "bars":
        if (size === "inline") {
          return (
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-4 bg-current animate-pulse"></div>
              <div className="w-0.5 h-4 bg-current animate-pulse delay-100"></div>
              <div className="w-0.5 h-4 bg-current animate-pulse delay-200"></div>
            </div>
          )
        }
        return (
          <div className="flex space-x-1">
            <div className="w-1 h-8 bg-primary animate-pulse"></div>
            <div className="w-1 h-8 bg-primary animate-pulse delay-100"></div>
            <div className="w-1 h-8 bg-primary animate-pulse delay-200"></div>
            <div className="w-1 h-8 bg-primary animate-pulse delay-300"></div>
          </div>
        )
      case "pulse":
        if (size === "inline") {
          return (
            <div className="w-4 h-4 bg-current rounded animate-pulse"></div>
          )
        }
        return (
          <div className={cn(sizeClasses, "bg-primary rounded animate-pulse")}></div>
        )
      case "wave":
        if (size === "inline") {
          return (
            <div className="flex space-x-0.5 items-end">
              <div className="w-0.5 h-2 bg-current rounded-full animate-pulse"></div>
              <div className="w-0.5 h-3 bg-current rounded-full animate-pulse delay-75"></div>
              <div className="w-0.5 h-4 bg-current rounded-full animate-pulse delay-150"></div>
              <div className="w-0.5 h-3 bg-current rounded-full animate-pulse delay-225"></div>
              <div className="w-0.5 h-2 bg-current rounded-full animate-pulse delay-300"></div>
            </div>
          )
        }
        return (
          <div className="flex space-x-1 items-end">
            <div className="w-2 h-4 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-6 bg-primary rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-8 bg-primary rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-6 bg-primary rounded-full animate-pulse delay-225"></div>
            <div className="w-2 h-4 bg-primary rounded-full animate-pulse delay-300"></div>
          </div>
        )
      case "orbit":
        if (size === "inline") {
          return (
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border border-current/20 rounded-full"></div>
              <div className="absolute top-0 left-1/2 w-1 h-1 -ml-0.5 -mt-0.5 bg-current rounded-full animate-spin origin-[0_8px]"></div>
            </div>
          )
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "border-2 border-primary/20 rounded-full")}></div>
            <div className={cn("absolute top-0 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-primary rounded-full animate-spin", 
              size === "sm" ? "origin-[0_16px]" : size === "lg" ? "origin-[0_48px]" : "origin-[0_32px]")}></div>
          </div>
        )
      case "ripple":
        if (size === "inline") {
          return (
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border border-current rounded-full animate-ping"></div>
              <div className="absolute inset-0 border border-current rounded-full animate-ping delay-150"></div>
            </div>
          )
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "border-2 border-primary rounded-full animate-ping")}></div>
            <div className={cn("absolute top-0 left-0", sizeClasses, "border-2 border-primary rounded-full animate-ping delay-150")}></div>
          </div>
        )
      case "gradient":
        if (size === "inline") {
          return (
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full animate-spin"></div>
            </div>
          )
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full animate-spin")}></div>
          </div>
        )
      case "matrix":
        if (size === "inline") {
          return (
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-3 bg-primary animate-pulse opacity-100"></div>
              <div className="w-0.5 h-4 bg-primary animate-pulse delay-75 opacity-75"></div>
              <div className="w-0.5 h-2 bg-primary animate-pulse delay-150 opacity-50"></div>
              <div className="w-0.5 h-3 bg-primary animate-pulse delay-225 opacity-75"></div>
              <div className="w-0.5 h-4 bg-primary animate-pulse delay-300 opacity-100"></div>
            </div>
          )
        }
        return (
          <div className="grid grid-cols-4 gap-1">
            <div className="w-2 h-6 bg-primary animate-pulse opacity-100"></div>
            <div className="w-2 h-8 bg-primary animate-pulse delay-100 opacity-75"></div>
            <div className="w-2 h-4 bg-primary animate-pulse delay-200 opacity-50"></div>
            <div className="w-2 h-7 bg-primary animate-pulse delay-300 opacity-75"></div>
            <div className="w-2 h-5 bg-primary animate-pulse delay-75 opacity-60"></div>
            <div className="w-2 h-8 bg-primary animate-pulse delay-175 opacity-90"></div>
            <div className="w-2 h-6 bg-primary animate-pulse delay-250 opacity-70"></div>
            <div className="w-2 h-4 bg-primary animate-pulse delay-325 opacity-80"></div>
          </div>
        )
      case "helix":
        if (size === "inline") {
          return (
            <div className="relative w-4 h-4">
              <div className="absolute inset-0">
                <div className="absolute w-1 h-1 bg-primary rounded-full animate-spin origin-center" style={{
                  animation: 'spin 1s linear infinite, helixMove 2s ease-in-out infinite'
                }}></div>
                <div className="absolute w-1 h-1 bg-primary/70 rounded-full animate-spin origin-center delay-500" style={{
                  animation: 'spin 1s linear infinite reverse, helixMove 2s ease-in-out infinite reverse'
                }}></div>
              </div>
            </div>
          )
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "flex items-center justify-center")}>
              <div className="relative w-full h-full">
                <div className="absolute w-3 h-3 bg-primary rounded-full animate-spin" style={{
                  animation: 'spin 1.5s linear infinite, helixMove 3s ease-in-out infinite',
                  left: '50%', top: '50%', transform: 'translate(-50%, -50%)'
                }}></div>
                <div className="absolute w-2 h-2 bg-primary/70 rounded-full animate-spin" style={{
                  animation: 'spin 1.5s linear infinite reverse, helixMove 3s ease-in-out infinite reverse',
                  left: '50%', top: '50%', transform: 'translate(-50%, -50%)'
                }}></div>
                <div className="absolute w-1 h-1 bg-primary/50 rounded-full animate-spin" style={{
                  animation: 'spin 1.5s linear infinite, helixMove 3s ease-in-out infinite',
                  left: '50%', top: '50%', transform: 'translate(-50%, -50%)'
                }}></div>
              </div>
            </div>
          </div>
        )
      case "quantum":
        if (size === "inline") {
          return (
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border border-primary/30 rounded-full animate-pulse"></div>
              <div className="absolute inset-1 border border-primary/50 rounded-full animate-pulse delay-150"></div>
              <div className="absolute inset-2 bg-primary rounded-full animate-pulse delay-300"></div>
            </div>
          )
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "relative")}>
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 border-2 border-primary/40 rounded-full animate-pulse delay-200"></div>
              <div className="absolute inset-4 border-2 border-primary/60 rounded-full animate-pulse delay-400"></div>
              <div className="absolute inset-6 bg-primary rounded-full animate-pulse delay-600"></div>
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full animate-ping transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        )
      case "morphing":
        if (size === "inline") {
          return (
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 bg-primary rounded-full animate-pulse" style={{
                animation: 'morphShape 2s ease-in-out infinite'
              }}></div>
            </div>
          )
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "relative")}>
              <div className="absolute inset-0 bg-primary animate-pulse" style={{
                animation: 'morphShape 3s ease-in-out infinite',
                borderRadius: '50%'
              }}></div>
              <div className="absolute inset-2 bg-primary/70 animate-pulse" style={{
                animation: 'morphShape 3s ease-in-out infinite reverse',
                borderRadius: '20%'
              }}></div>
              <div className="absolute inset-4 bg-primary/40 animate-pulse" style={{
                animation: 'morphShape 3s ease-in-out infinite',
                borderRadius: '10%'
              }}></div>
            </div>
          </div>
        )
      default: // spinner
        if (size === "inline") {
          return (
            <div className="relative">
              <div className="w-4 h-4 border-2 border-current/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            </div>
          )
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "border-4 border-primary/20 rounded-full")}></div>
            <div className={cn("absolute top-0 left-0", sizeClasses, "border-4 border-primary border-t-transparent rounded-full animate-spin")}></div>
          </div>
        )
    }
  }

  if (size === "inline") {
    return (
      <div className={cn("inline-flex items-center", className)}>
        {getLoadingComponent()}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center min-h-[60vh]", className)}>
      <div className="flex flex-col items-center space-y-4">
        {getLoadingComponent()}
        {showText && (
          <p className="text-muted-foreground font-medium">{t("common.loading")}</p>
        )}
      </div>
    </div>
  )
}
