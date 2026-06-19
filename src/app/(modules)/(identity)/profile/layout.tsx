"use client";

import { useModuleLocales } from "@core/hooks/use-module-locales";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  useModuleLocales(() => import("@/modules/profile/core/locales"), "profile");

  return <>{children}</>;
}
