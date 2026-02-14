"use client";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "inline";
  showText?: boolean;
  className?: string;
}

export function LoadingSpinner({ size = "md", showText = true, className }: LoadingSpinnerProps) {
  const { t } = useI18n();
  const settings = useSettings();

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8";
      case "lg":
        return "w-24 h-24";
      case "inline":
        return "w-4 h-4";
      default:
        return "w-16 h-16";
    }
  };

  const getLoadingComponent = () => {
    const sizeClasses = getSizeClasses();

    switch (settings.loadingStyle) {
      case "dots":
        if (size === "inline") {
          return (
            <div className="flex space-x-0.5">
              <div className="h-1 w-1 animate-bounce rounded-full bg-current"></div>
              <div className="h-1 w-1 animate-bounce rounded-full bg-current delay-100"></div>
              <div className="h-1 w-1 animate-bounce rounded-full bg-current delay-200"></div>
            </div>
          );
        }
        return (
          <div className="flex space-x-1">
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary"></div>
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary delay-100"></div>
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary delay-200"></div>
          </div>
        );
      case "bars":
        if (size === "inline") {
          return (
            <div className="flex space-x-0.5">
              <div className="h-4 w-0.5 animate-pulse bg-current"></div>
              <div className="h-4 w-0.5 animate-pulse bg-current delay-100"></div>
              <div className="h-4 w-0.5 animate-pulse bg-current delay-200"></div>
            </div>
          );
        }
        return (
          <div className="flex space-x-1">
            <div className="h-8 w-1 animate-pulse bg-primary"></div>
            <div className="h-8 w-1 animate-pulse bg-primary delay-100"></div>
            <div className="h-8 w-1 animate-pulse bg-primary delay-200"></div>
            <div className="h-8 w-1 animate-pulse bg-primary delay-300"></div>
          </div>
        );
      case "pulse":
        if (size === "inline") {
          return <div className="h-4 w-4 animate-pulse rounded bg-current"></div>;
        }
        return <div className={cn(sizeClasses, "animate-pulse rounded bg-primary")}></div>;
      case "wave":
        if (size === "inline") {
          return (
            <div className="flex items-end space-x-0.5">
              <div className="h-2 w-0.5 animate-pulse rounded-full bg-current"></div>
              <div className="h-3 w-0.5 animate-pulse rounded-full bg-current delay-75"></div>
              <div className="h-4 w-0.5 animate-pulse rounded-full bg-current delay-150"></div>
              <div className="delay-225 h-3 w-0.5 animate-pulse rounded-full bg-current"></div>
              <div className="h-2 w-0.5 animate-pulse rounded-full bg-current delay-300"></div>
            </div>
          );
        }
        return (
          <div className="flex items-end space-x-1">
            <div className="h-4 w-2 animate-pulse rounded-full bg-primary"></div>
            <div className="h-6 w-2 animate-pulse rounded-full bg-primary delay-75"></div>
            <div className="h-8 w-2 animate-pulse rounded-full bg-primary delay-150"></div>
            <div className="delay-225 h-6 w-2 animate-pulse rounded-full bg-primary"></div>
            <div className="h-4 w-2 animate-pulse rounded-full bg-primary delay-300"></div>
          </div>
        );
      case "orbit":
        if (size === "inline") {
          return (
            <div className="relative h-4 w-4">
              <div className="border-current/20 absolute inset-0 rounded-full border"></div>
              <div className="absolute left-1/2 top-0 -ml-0.5 -mt-0.5 h-1 w-1 origin-[0_8px] animate-spin rounded-full bg-current"></div>
            </div>
          );
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "rounded-full border-2 border-primary/20")}></div>
            <div
              className={cn(
                "absolute left-1/2 top-0 -ml-1 -mt-1 h-2 w-2 animate-spin rounded-full bg-primary",
                size === "sm"
                  ? "origin-[0_16px]"
                  : size === "lg"
                    ? "origin-[0_48px]"
                    : "origin-[0_32px]"
              )}
            ></div>
          </div>
        );
      case "ripple":
        if (size === "inline") {
          return (
            <div className="relative h-4 w-4">
              <div className="absolute inset-0 animate-ping rounded-full border border-current"></div>
              <div className="absolute inset-0 animate-ping rounded-full border border-current delay-150"></div>
            </div>
          );
        }
        return (
          <div className="relative">
            <div
              className={cn(sizeClasses, "animate-ping rounded-full border-2 border-primary")}
            ></div>
            <div
              className={cn(
                "absolute left-0 top-0",
                sizeClasses,
                "animate-ping rounded-full border-2 border-primary delay-150"
              )}
            ></div>
          </div>
        );
      case "gradient":
        if (size === "inline") {
          return (
            <div className="relative h-4 w-4">
              <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-primary via-primary/50 to-transparent"></div>
            </div>
          );
        }
        return (
          <div className="relative">
            <div
              className={cn(
                sizeClasses,
                "animate-spin rounded-full bg-gradient-to-r from-primary via-primary/50 to-transparent"
              )}
            ></div>
          </div>
        );
      case "matrix":
        if (size === "inline") {
          return (
            <div className="flex space-x-0.5">
              <div className="h-3 w-0.5 animate-pulse bg-primary opacity-100"></div>
              <div className="h-4 w-0.5 animate-pulse bg-primary opacity-75 delay-75"></div>
              <div className="h-2 w-0.5 animate-pulse bg-primary opacity-50 delay-150"></div>
              <div className="delay-225 h-3 w-0.5 animate-pulse bg-primary opacity-75"></div>
              <div className="h-4 w-0.5 animate-pulse bg-primary opacity-100 delay-300"></div>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-4 gap-1">
            <div className="h-6 w-2 animate-pulse bg-primary opacity-100"></div>
            <div className="h-8 w-2 animate-pulse bg-primary opacity-75 delay-100"></div>
            <div className="h-4 w-2 animate-pulse bg-primary opacity-50 delay-200"></div>
            <div className="h-7 w-2 animate-pulse bg-primary opacity-75 delay-300"></div>
            <div className="h-5 w-2 animate-pulse bg-primary opacity-60 delay-75"></div>
            <div className="delay-175 h-8 w-2 animate-pulse bg-primary opacity-90"></div>
            <div className="delay-250 h-6 w-2 animate-pulse bg-primary opacity-70"></div>
            <div className="delay-325 h-4 w-2 animate-pulse bg-primary opacity-80"></div>
          </div>
        );
      case "helix":
        if (size === "inline") {
          return (
            <div className="relative h-4 w-4">
              <div className="absolute inset-0">
                <div
                  className="absolute h-1 w-1 origin-center animate-spin rounded-full bg-primary"
                  style={{
                    animation: "spin 1s linear infinite, helixMove 2s ease-in-out infinite",
                  }}
                ></div>
                <div
                  className="absolute h-1 w-1 origin-center animate-spin rounded-full bg-primary/70 delay-500"
                  style={{
                    animation:
                      "spin 1s linear infinite reverse, helixMove 2s ease-in-out infinite reverse",
                  }}
                ></div>
              </div>
            </div>
          );
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "flex items-center justify-center")}>
              <div className="relative h-full w-full">
                <div
                  className="absolute h-3 w-3 animate-spin rounded-full bg-primary"
                  style={{
                    animation: "spin 1.5s linear infinite, helixMove 3s ease-in-out infinite",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
                <div
                  className="absolute h-2 w-2 animate-spin rounded-full bg-primary/70"
                  style={{
                    animation:
                      "spin 1.5s linear infinite reverse, helixMove 3s ease-in-out infinite reverse",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
                <div
                  className="absolute h-1 w-1 animate-spin rounded-full bg-primary/50"
                  style={{
                    animation: "spin 1.5s linear infinite, helixMove 3s ease-in-out infinite",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      case "quantum":
        if (size === "inline") {
          return (
            <div className="relative h-4 w-4">
              <div className="absolute inset-0 animate-pulse rounded-full border border-primary/30"></div>
              <div className="absolute inset-1 animate-pulse rounded-full border border-primary/50 delay-150"></div>
              <div className="absolute inset-2 animate-pulse rounded-full bg-primary delay-300"></div>
            </div>
          );
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "relative")}>
              <div className="absolute inset-0 animate-pulse rounded-full border-2 border-primary/20"></div>
              <div className="absolute inset-2 animate-pulse rounded-full border-2 border-primary/40 delay-200"></div>
              <div className="delay-400 absolute inset-4 animate-pulse rounded-full border-2 border-primary/60"></div>
              <div className="delay-600 absolute inset-6 animate-pulse rounded-full bg-primary"></div>
              <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 transform animate-ping rounded-full bg-primary"></div>
            </div>
          </div>
        );
      case "morphing":
        if (size === "inline") {
          return (
            <div className="relative h-4 w-4">
              <div
                className="absolute inset-0 animate-pulse rounded-full bg-primary"
                style={{
                  animation: "morphShape 2s ease-in-out infinite",
                }}
              ></div>
            </div>
          );
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "relative")}>
              <div
                className="absolute inset-0 animate-pulse bg-primary"
                style={{
                  animation: "morphShape 3s ease-in-out infinite",
                  borderRadius: "50%",
                }}
              ></div>
              <div
                className="absolute inset-2 animate-pulse bg-primary/70"
                style={{
                  animation: "morphShape 3s ease-in-out infinite reverse",
                  borderRadius: "20%",
                }}
              ></div>
              <div
                className="absolute inset-4 animate-pulse bg-primary/40"
                style={{
                  animation: "morphShape 3s ease-in-out infinite",
                  borderRadius: "10%",
                }}
              ></div>
            </div>
          </div>
        );
      default: // spinner
        if (size === "inline") {
          return (
            <div className="relative">
              <div className="border-current/20 h-4 w-4 rounded-full border-2"></div>
              <div className="absolute left-0 top-0 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            </div>
          );
        }
        return (
          <div className="relative">
            <div className={cn(sizeClasses, "rounded-full border-4 border-primary/20")}></div>
            <div
              className={cn(
                "absolute left-0 top-0",
                sizeClasses,
                "animate-spin rounded-full border-4 border-primary border-t-transparent"
              )}
            ></div>
          </div>
        );
    }
  };

  if (size === "inline") {
    return <div className={cn("inline-flex items-center", className)}>{getLoadingComponent()}</div>;
  }

  return (
    <div className={cn("flex min-h-[60vh] items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-4">
        {getLoadingComponent()}
        {showText && <p className="font-medium text-muted-foreground">{t("common.loading")}</p>}
      </div>
    </div>
  );
}
