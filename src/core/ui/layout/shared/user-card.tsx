"use client";

import { cn } from "@core/common/utils";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
import { useAppStore } from "@core/store/useAppStore";

type UserCardSize = "sm" | "md" | "lg";

interface UserCardProps {
  size?: UserCardSize;
  showStatus?: boolean;
  showRole?: boolean;
  className?: string;
  /** Additional class for text that should be hidden in collapsed states */
  textClassName?: string;
}

const sizeConfig: Record<
  UserCardSize,
  {
    avatar: string;
    container: string;
    name: string;
    role: string;
    statusDot: string;
  }
> = {
  sm: {
    avatar: "h-8 w-8",
    container: "p-2",
    name: "text-xs font-medium",
    role: "text-[10px]",
    statusDot: "w-2.5 h-2.5",
  },
  md: {
    avatar: "h-10 w-10",
    container: "p-3",
    name: "text-sm font-medium",
    role: "text-xs",
    statusDot: "w-3 h-3",
  },
  lg: {
    avatar: "h-12 w-12",
    container: "p-4",
    name: "text-base font-semibold",
    role: "text-sm",
    statusDot: "w-3.5 h-3.5",
  },
};

/**
 * Shared user card component used across layouts that display user info.
 * Uses firstName[0] + lastName[0] for initials.
 */
export function UserCard({
  size = "md",
  showStatus = true,
  showRole = true,
  className,
  textClassName,
}: UserCardProps) {
  const user = useAppStore((state) => state.user);
  if (!user) return null;

  const config = sizeConfig[size];
  const initials =
    `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase() || "U";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl",
        "to-primary/2 border border-primary/10 bg-gradient-to-br from-primary/5",
        "shadow-sm transition-all duration-300 hover:shadow-md",
        config.container,
        className
      )}
    >
      <div className="relative shrink-0">
        <Avatar
          className={cn(
            config.avatar,
            "shadow-md ring-1 ring-primary/20",
            "transition-all duration-300 hover:scale-105"
          )}
        >
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        {showStatus && (
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background shadow-sm",
              config.statusDot
            )}
          >
            <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-br from-green-400 to-green-600" />
          </div>
        )}
      </div>
      <div className={cn("min-w-0 flex-1", textClassName)}>
        <p className={cn("truncate text-sidebar-foreground", config.name)}>
          {user.firstName} {user.lastName}
        </p>
        {showRole && (
          <p className={cn("truncate text-sidebar-foreground/60", config.role)}>
            {user.adminTypeName}
          </p>
        )}
      </div>
    </div>
  );
}
