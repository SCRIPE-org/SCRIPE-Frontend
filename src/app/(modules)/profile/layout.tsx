"use client";

/**
 * Profile Layout — Shared sidebar layout for all profile pages
 *
 * Uses GitHub Settings-style left sidebar with navigation.
 */
import { useProfilePageViewModel } from "@modules/profile/src/presentation/viewmodels/useProfilePageViewModel";
import { ProfileHeader } from "@modules/profile/src/presentation/components/ProfileHeader";
import { ProfileNav } from "@modules/profile/src/presentation/components/ProfileNav";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useProfilePageViewModel();

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 md:flex-row lg:gap-10">
          {/* Sidebar */}
          <aside className="w-full flex-shrink-0 md:w-60 lg:w-64">
            <div className="space-y-4 md:sticky md:top-20">
              {/* Profile header - hidden on mobile (shown in content area) */}
              <div className="hidden md:block">
                <ProfileHeader profile={profile} isLoading={isLoading} />
              </div>
              <ProfileNav />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1 pb-12">{children}</main>
        </div>
      </div>
    </div>
  );
}
