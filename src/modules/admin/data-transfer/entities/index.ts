/**
 * Entities sub-module barrel exports.
 */
export { DataExchangeEntity } from "./src/domain/entities/DataExchangeEntity";
export type { IEntitiesRepository } from "./src/domain/interfaces/IEntitiesRepository";
export type { IEntitiesService } from "./src/domain/interfaces/IEntitiesService";
export type { DataExchangeEntityModel } from "./src/data/models/DataExchangeEntityModel";
export { DataExchangeEntityMapper } from "./src/data/mappers/DataExchangeEntityMapper";
export { EntitiesService } from "./src/data/services/EntitiesService";
export { EntitiesRepository } from "./src/data/repositories/EntitiesRepository";
export { useEntitiesViewModel } from "./src/presentation/viewmodels/useEntitiesViewModel";
export { EntitiesCatalogView } from "./src/presentation/views/EntitiesCatalogView";
export { en as entitiesEn, ar as entitiesAr } from "./locales";
