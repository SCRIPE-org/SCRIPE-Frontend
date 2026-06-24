import type { LoginLayout } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import type { ComponentType } from "react";
import type { LoginLayoutProps } from "./layout-types";

import { VaultLayout } from "./VaultLayout";
import { SplitRightLayout } from "./SplitRightLayout";
import { SplitLeftLayout } from "./SplitLeftLayout";
import { CenteredLayout } from "./CenteredLayout";
import { BrandedFullLayout } from "./BrandedFullLayout";
import { MinimalLayout } from "./MinimalLayout";
import { OverlayLayout } from "./OverlayLayout";
import { MagazineLayout } from "./MagazineLayout";
import { StackedLayout } from "./StackedLayout";
import { SidebarCompactLayout } from "./SidebarCompactLayout";
import { AsymmetricLayout } from "./AsymmetricLayout";
import { FloatingLayout } from "./FloatingLayout";
import { ImmersiveLayout } from "./ImmersiveLayout";
import { SplitDiagonalLayout } from "./SplitDiagonalLayout";
import { CarouselLayout } from "./CarouselLayout";
import { GlassMorphismLayout } from "./GlassMorphismLayout";
import { GradientWaveLayout } from "./GradientWaveLayout";
import { SpotlightLayout } from "./SpotlightLayout";
import { DualPanelLayout } from "./DualPanelLayout";
import { CornerCardLayout } from "./CornerCardLayout";
import { VerticalSplitLayout } from "./VerticalSplitLayout";
import { FullscreenFormLayout } from "./FullscreenFormLayout";
import { MosaicLayout } from "./MosaicLayout";

/**
 * Exported type in the auth/signin module.
 */
export type { LoginLayoutProps };
export { SplitRightLayout };

/**
 * Exported constant defining parameters and fields for l a y o u t_ r e g i s t r y configurations.
 */
export const LAYOUT_REGISTRY: Record<LoginLayout, ComponentType<LoginLayoutProps>> = {
  vault: VaultLayout,
  "split-right": SplitRightLayout,
  "split-left": SplitLeftLayout,
  centered: CenteredLayout,
  "branded-full": BrandedFullLayout,
  minimal: MinimalLayout,
  overlay: OverlayLayout,
  magazine: MagazineLayout,
  stacked: StackedLayout,
  "sidebar-compact": SidebarCompactLayout,
  asymmetric: AsymmetricLayout,
  floating: FloatingLayout,
  immersive: ImmersiveLayout,
  "split-diagonal": SplitDiagonalLayout,
  carousel: CarouselLayout,
  "glass-morphism": GlassMorphismLayout,
  "gradient-wave": GradientWaveLayout,
  spotlight: SpotlightLayout,
  "dual-panel": DualPanelLayout,
  "corner-card": CornerCardLayout,
  "vertical-split": VerticalSplitLayout,
  "fullscreen-form": FullscreenFormLayout,
  mosaic: MosaicLayout,
};
