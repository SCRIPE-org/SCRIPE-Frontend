/**
 * EntityLookup Submodule Public Exports (Wave 4 — EntityReference / UserReference)
 *
 * The data layer is exported alongside the hooks because two consumers outside this submodule need
 * it: the reference control consumes the hooks, and the definition-level target-type picker needs
 * the available-types list. Nothing here exports a mapper or a container — the DI wiring lives in
 * the module container at `../di.ts`, not in a submodule-local one.
 *
 * That second consumer now goes through `useEntityLookupAvailableTypes` rather than reaching for
 * `entityLookupRepository.getAvailableTypes` itself: the repository is still exported (its interface
 * is part of this submodule's contract) but a view calling it directly would re-fetch on every modal
 * open and would have to re-derive "the server said there is nothing" from a bare array on its own.
 */

// Hooks
export {
  useEntityLookupAvailableTypes,
  ENTITY_LOOKUP_AVAILABLE_TYPES_QUERY_KEY,
  type UseEntityLookupAvailableTypesArgs,
  type UseEntityLookupAvailableTypesResult,
} from "./src/presentation/hooks/useEntityLookupAvailableTypes";
export {
  useEntityLookupSearch,
  type UseEntityLookupSearchArgs,
  type UseEntityLookupSearchResult,
} from "./src/presentation/hooks/useEntityLookupSearch";
export {
  useResolveEntityReference,
  type EntityReferenceResolveStatus,
  type UseResolveEntityReferenceResult,
} from "./src/presentation/hooks/useResolveEntityReference";

// Wire models
export type {
  EntityLookupItem,
  EntityLookupReference,
  EntityLookupSearchQuery,
  EntityLookupType,
} from "./src/data/models/EntityLookupModel";
export {
  ENTITY_LOOKUP_DEFAULT_PAGE_SIZE,
  ENTITY_LOOKUP_SEARCH_DEBOUNCE_MS,
} from "./src/data/models/EntityLookupModel";

// Failure taxonomy — exported because "which failure was it" is a rendering decision, and the
// control cannot make it from a bare Error.
export {
  EntityLookupError,
  type EntityLookupFailureKind,
} from "./src/domain/entities/EntityLookupError";

// Interfaces
export type { IEntityLookupRepository } from "./src/domain/interfaces/IEntityLookupRepository";
export type { IEntityLookupService } from "./src/domain/interfaces/IEntityLookupService";
