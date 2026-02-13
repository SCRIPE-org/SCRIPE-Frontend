"use client";

/**
 * ProfileHeader — Sidebar header with avatar, name, and role
 *
 * Shows above the navigation in the profile sidebar.
 */
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Badge } from "@core/ui/badge";
import type { AdminProfile } from "../../../src/domain/entities/AdminProfile";
import { cn } from "@core/common/utils";

interface ProfileHeaderProps {
      profile: AdminProfile | undefined;
      isLoading: boolean;
}

export function ProfileHeader({ profile, isLoading }: ProfileHeaderProps) {
      if (isLoading || !profile) {
            return (
                  <div className="flex flex-col items-center gap-3 p-4 animate-pulse">
                        <div className="h-20 w-20 rounded-full bg-muted" />
                        <div className="h-4 w-28 rounded bg-muted" />
                        <div className="h-3 w-20 rounded bg-muted" />
                  </div>
            );
      }

      const initials = `${(profile.firstName?.[0] ?? "").toUpperCase()}${(profile.lastName?.[0] ?? "").toUpperCase()}` || "U";
      const fullName = `${profile.firstName} ${profile.lastName}`.trim() || profile.username;

      return (
            <div className="flex flex-col items-center gap-3 p-4">
                  <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-lg">
                        {profile.profileImageUrl && (
                              <AvatarImage src={profile.profileImageUrl} alt={fullName} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-semibold">
                              {initials}
                        </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                        <h3 className="font-semibold text-sm">{fullName}</h3>
                        <p className="text-xs text-muted-foreground">@{profile.username}</p>
                  </div>

                  <Badge variant="secondary" className="text-xs">
                        {profile.adminTypeName || profile.roles?.[0]?.roleName || "Admin"}
                  </Badge>
            </div>
      );
}
