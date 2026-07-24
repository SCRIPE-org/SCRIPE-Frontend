"use client";

/**
 * ProfileHeader — Identity card for the profile sidebar
 *
 * The one place on the page that answers "whose settings am I looking at":
 * avatar, name, username and role. Everything else on the page is a verb
 * (change this, revoke that) — this is the noun they all apply to, so it
 * stays visible above the section switcher on every tab.
 */
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { cn, resolveFileUrl } from "@core/common/utils";
import type { AdminProfile } from "../../../src/domain/entities/AdminProfile";

interface ProfileHeaderProps {
  profile: AdminProfile | undefined;
  isLoading: boolean;
  /** Optional supplementary content rendered under the role badge — e.g. a
   *  compact security-posture indicator. Kept out of this component's own
   *  business so it stays a plain identity card. */
  meta?: React.ReactNode;
  className?: string;
}

/**
 * Presentation UI component rendering the profile header.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ProfileHeader({ profile, isLoading, meta, className }: ProfileHeaderProps) {
  if (isLoading || !profile) {
    return (
      <div className={cn("flex flex-col items-center gap-3 p-4 text-center", className)}>
        <Skeleton shape="circle" className="h-20 w-20" aria-label="Loading profile" />
        <Skeleton shape="text" className="h-4 w-28" />
        <Skeleton shape="text" className="h-3 w-20" />
      </div>
    );
  }

  const initials =
    `${(profile.firstName?.[0] ?? "").toUpperCase()}${(profile.lastName?.[0] ?? "").toUpperCase()}` ||
    "U";
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || profile.username;
  const avatarSrc = resolveFileUrl(profile.profileImageUrl) || null;

  return (
    <div className={cn("flex flex-col items-center gap-3 p-4 text-center", className)}>
      <Avatar size="lg" className="h-20 w-20 text-2xl shadow-nx-sm">
        {avatarSrc && <AvatarImage src={avatarSrc} alt={fullName} />}
        <AvatarFallback className="bg-nx-accent-wash font-semibold text-nx-accent">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div>
        <h3 className="text-sm font-semibold text-nx-ink">{fullName}</h3>
        <p className="text-xs text-nx-ink-2">@{profile.username}</p>
      </div>

      <Badge variant="secondary" className="text-xs">
        {profile.adminTypeName || profile.roles?.[0]?.roleName || "Admin"}
      </Badge>

      {meta}
    </div>
  );
}
