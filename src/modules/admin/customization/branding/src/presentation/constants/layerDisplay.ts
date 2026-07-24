/**
 * Bundle layer display info — presentation-layer concern.
 *
 * Moved out of the ThemeBundle domain entity: a domain entity describes what a
 * BundleLayer IS (a business concept), not how to render one (icon, color).
 */
import type { BundleLayer } from "../../domain/entities/ThemeBundle";

export const LAYER_INFO: Record<BundleLayer, { labelKey: string; icon: string; color: string }> = {
  login: { labelKey: "studio.bundles.layers.login", icon: "LogIn", color: "#6366f1" },
  authPages: { labelKey: "studio.bundles.layers.authPages", icon: "FileKey2", color: "#8b5cf6" },
  dashboard: {
    labelKey: "studio.bundles.layers.dashboard",
    icon: "LayoutDashboard",
    color: "#06b6d4",
  },
  loginBuilder: {
    labelKey: "studio.bundles.layers.loginBuilder",
    icon: "Blocks",
    color: "#10b981",
  },
  dashboardBuilder: {
    labelKey: "studio.bundles.layers.dashboardBuilder",
    icon: "Grid3X3",
    color: "#f59e0b",
  },
};
