"use client";

/**
 * ProfileRailLayout
 *
 * Persistent command console layout for SCRIPE Sovereign Account World.
 * Houses the sticky navigation rail, executive identity card, and content pane.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import type {
  AccountPrincipalContext,
  SovereignAccountFeatureFlags,
} from "../../domain/entities/SovereignAccountEntities";
import { ProfileRailSidebarSkeleton } from "./AccountSkeletons";
import {
  ProfileRailIdentityCard,
  buildProfileRailCategories,
} from "./ProfileRailSidebarCard";

interface ProfileRailLayoutProps {
  profile?: AdminProfile | null;
  principalContext?: AccountPrincipalContext | null;
  featureFlags?: SovereignAccountFeatureFlags | null;
  selectedAcademyId?: string;
  onSwitchAcademy?: (id: string) => void;
  isLoading?: boolean;
  children: React.ReactNode;
}

/** Layout shell rendering the categorized `/account/*` navigation rail and active view container. */
export function ProfileRailLayout({
  profile,
  principalContext,
  featureFlags,
  selectedAcademyId,
  onSwitchAcademy,
  isLoading = false,
  children,
}: ProfileRailLayoutProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";
  const categories = buildProfileRailCategories(t, isPlatformAdmin, featureFlags);

  const isItemActive = (itemHref: string) =>
    pathname === itemHref || pathname.startsWith(`${itemHref}/`);

  const branchOptions =
    principalContext?.availableBranches && principalContext.availableBranches.length > 0
      ? principalContext.availableBranches.map((b) => ({
          id: b.branchId,
          name: b.branchName,
          isCurrent: b.isCurrent,
        }))
      : profile?.availableAcademies ?? [];

  const activeAcademy =
    branchOptions.find((a) => a.id === selectedAcademyId) ||
    branchOptions.find((a) => a.isCurrent) ||
    branchOptions[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start min-w-0 w-full">
      <aside className="w-full lg:w-64 xl:w-72 shrink-0 space-y-4 lg:sticky lg:top-18 min-w-0">
        {isLoading && !profile ? (
          <ProfileRailSidebarSkeleton />
        ) : (
          <>
            <ProfileRailIdentityCard
              profile={profile}
              principalContext={principalContext}
              isPlatformAdmin={isPlatformAdmin}
              branchOptions={branchOptions}
              activeAcademy={activeAcademy}
              onSwitchAcademy={onSwitchAcademy}
            />

            <nav
              className="rounded-xl border border-nx-line bg-nx-surface p-2.5 space-y-3"
              aria-label={t("profile.rail.navigationLabel", { defaultValue: "Account navigation" })}
            >
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
                    {cat.title}
                  </div>
                  {cat.items.map((item) => {
                    const active = isItemActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors group focus-visible:outline-none focus-visible:shadow-nx-focus",
                          active
                            ? "border border-nx-accent bg-nx-accent-wash text-nx-accent font-semibold"
                            : "text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
                        )}
                      >
                        <Icon
                          aria-hidden="true"
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active ? "text-nx-accent" : "text-nx-ink-3 group-hover:text-nx-accent"
                          )}
                          style={{ width: 16, height: 16, minWidth: 16, minHeight: 16 }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.label}</div>
                          <div
                            className={cn(
                              "text-[10px] truncate leading-tight",
                              active ? "text-nx-accent" : "text-nx-ink-3"
                            )}
                          >
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </>
        )}
      </aside>

      <section
        aria-label={t("profile.rail.contentLabel", { defaultValue: "Account section content" })}
        className="flex-1 min-w-0 w-full"
      >
        {children}
      </section>
    </div>
  );
}
