/**
 * Editions Submodule Public Exports
 */
export { EditionsView } from "./src/presentation/views/EditionsView";
export { Edition } from "./src/domain/entities/Edition";
export type { EditionData, EditionFeatureDto } from "./src/domain/entities/Edition";
export type { CreateEditionRequest, UpdateEditionRequest } from "./src/domain/entities/EditionRequests";
export type { IEditionRepository } from "./src/domain/interfaces/IEditionRepository";
