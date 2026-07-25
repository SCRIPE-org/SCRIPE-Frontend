/**
 * Bundle layer display info — presentation-layer concern.
 *
 * Moved out of the ThemeBundle domain entity: a domain entity describes what a
 * BundleLayer IS (a business concept), not how to render one (icon, color).
 *
 * `chartSlot` is a categorical colour slot (see @core/ui/chart's `chartColor`)
 * rather than a literal hex — colour follows the layer's fixed identity, not a
 * one-off brand value, and stays inside the CVD-safe global chart ladder.
 */
import type { BundleLayer, BundleType } from "../../domain/entities/ThemeBundle";

export const LAYER_INFO: Record<
  BundleLayer,
  { labelKey: string; icon: string; chartSlot: 1 | 2 | 3 | 4 | 5 }
> = {
  login: { labelKey: "studio.bundles.layers.login", icon: "LogIn", chartSlot: 1 },
  authPages: { labelKey: "studio.bundles.layers.authPages", icon: "FileKey2", chartSlot: 4 },
  dashboard: {
    labelKey: "studio.bundles.layers.dashboard",
    icon: "LayoutDashboard",
    chartSlot: 2,
  },
  loginBuilder: {
    labelKey: "studio.bundles.layers.loginBuilder",
    icon: "Blocks",
    chartSlot: 5,
  },
  dashboardBuilder: {
    labelKey: "studio.bundles.layers.dashboardBuilder",
    icon: "Grid3X3",
    chartSlot: 3,
  },
};

/**
 * Bundle-type display colour — same rationale as `LAYER_INFO`. The domain's
 * `BUNDLE_TYPE_CONFIG` still owns label/icon/layers (business catalog data);
 * this presentation-only slot map replaces its hardcoded `color` hex at the
 * point of use so bundle-type chips stay on the categorical chart ladder.
 */
export const BUNDLE_TYPE_CHART_SLOT: Record<BundleType, 1 | 2 | 3 | 4 | 5> = {
  "login-only": 1,
  "auth-suite": 4,
  "dashboard-only": 2,
  "full-bundle": 3,
};
