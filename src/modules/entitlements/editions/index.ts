/**
 * Editions Submodule Public Exports
 */
export { EditionsView } from "./src/presentation/views/EditionsView";
export { EditionDetailView } from "./src/presentation/views/EditionDetailView";
export { EditionComparisonView } from "./src/presentation/views/EditionComparisonView";
export { EditionWizardView } from "./src/presentation/views/EditionWizardView";
export { EditionEditWizardView } from "./src/presentation/views/EditionEditWizardView";
export { Edition } from "./src/domain/entities/Edition";
export type { EditionData, EditionFeatureDto, EditionPriceData } from "./src/domain/entities/Edition";
export type { CreateEditionRequest, UpdateEditionRequest } from "./src/domain/entities/EditionRequests";
export type { IEditionRepository } from "./src/domain/interfaces/IEditionRepository";
export { EditionPromotion } from "./src/domain/entities/EditionPromotion";
export type { EditionPromotionData, CreatePromotionRequest, UpdatePromotionRequest, PromoCodeValidationResult } from "./src/domain/entities/EditionPromotion";
