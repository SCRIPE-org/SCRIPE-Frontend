/**
 * Customization Module — Barrel Exports
 *
 * Clean Architecture module for login customization and branding.
 * Replaces the old customizer-studio module with proper domain/data/presentation layers.
 *
 * @module customization
 */

// Domain entities
export { BrandingConfig, type BrandingConfigProps } from "./src/domain/entities/BrandingConfig";
export { SystemDefaults, type SystemDefaultsProps } from "./src/domain/entities/SystemDefaults";
export { AuditLogEntry, type AuditLogEntryProps } from "./src/domain/entities/AuditLogEntry";
export {
  type StudioDraftProps,
  DEFAULT_DRAFT,
  DEVICE_DIMENSIONS,
  type DeviceSize,
  type StudioPanel,
} from "./src/domain/entities/StudioDraft";

// Domain interfaces
export type { ICustomizationRepository } from "./src/domain/interfaces/ICustomizationRepository";
export type { ICustomizationService } from "./src/domain/interfaces/ICustomizationService";

// Data layer
export { CustomizationService } from "./src/data/services/CustomizationService";
export { CustomizationRepository } from "./src/data/repositories/CustomizationRepository";
export { BrandingMapper } from "./src/data/mappers/BrandingMapper";

// Presentation
export { CustomizerStudioView } from "./src/presentation/views/CustomizerStudioView";
export { ThemeManagementView } from "./src/presentation/views/ThemeManagementView";
export { ThemeGalleryView } from "./src/presentation/views/ThemeGalleryView";
export { ThemeMarketplacePanel } from "./src/presentation/components/ThemeMarketplacePanel";
export { ThemeDetailModal } from "./src/presentation/components/ThemeDetailModal";
export { useThemeMarketplace } from "./src/presentation/hooks/useThemeMarketplace";
