/**
 * OptionSet Submodule Public Exports (P-4 — shared, versioned option sets)
 *
 * The seam between this submodule and the rest of the CustomFields module. Everything a consumer
 * outside `option-set/` is allowed to name is listed here; everything else is submodule-internal by
 * omission, which is the only enforcement TypeScript gives us.
 *
 * WHAT IS DELIBERATELY ABSENT
 * ---------------------------
 * `OptionSetService` and `OptionSetRepository` — the CONCRETE classes — are not exported, and that
 * omission is load-bearing rather than an oversight. `di.ts` is the composition root and the one
 * place allowed to construct them, so it reaches past this barrel into `option-set/src/data/`
 * directly (its own header explains why). If the classes were re-exported here, any view could
 * `new OptionSetRepository(new OptionSetService(...))` with its own ApiService and quietly lose the
 * shared `X-Tenant-Context` header that decides whether a platform set reads as writable. The
 * interfaces below are exported instead: a consumer can TYPE against the contract, and only the
 * container can satisfy it.
 *
 * Routing the container through this barrel would also be a real import cycle, not merely a style
 * preference — the view exported below imports `di.ts`, so `di.ts → index.ts → OptionSetListView →
 * di.ts`. The same trap `custom-field/index.ts` documents.
 *
 * `OptionSetDetailPanel` is likewise internal: it takes eleven props wired from
 * `useOptionSetViewModel` and is meaningless without them, so exporting it would advertise a
 * component no outside caller can legally construct. `OptionSetListView` is the whole screen and
 * takes no props, which is what makes it the right public surface.
 */

// Views
export { OptionSetListView } from "./src/presentation/views/OptionSetListView";

// ViewModel query keys — exported so a caller OUTSIDE this submodule can invalidate option-set reads
// after an action of its own. The binding endpoints are the concrete case: a field-version rebind is
// performed from the custom-field definition screens, and it changes what those reads return.
// Re-deriving the key array by hand at each such call site is how cache invalidation silently stops
// matching; a shared factory cannot drift from itself.
export {
  OPTION_SET_QUERY_ROOT,
  optionSetsQueryKey,
  optionSetDetailQueryKey,
  optionSetVersionQueryKey,
} from "./src/presentation/viewmodels/useOptionSetViewModel";

// Entities. Exported as VALUES, not types: each is a class whose getters carry the domain rules a
// consumer must not restate (`isContentEditable`, `isBindable`, `writableStatus`), and a
// type-only export would let a caller describe the shape while re-implementing the rules.
export { OptionSet } from "./src/domain/entities/OptionSet";
export type { OptionSetData, OptionSetDetail } from "./src/domain/entities/OptionSet";
export { OptionSetVersion } from "./src/domain/entities/OptionSetVersion";
export type { OptionSetVersionData } from "./src/domain/entities/OptionSetVersion";
export { OptionSetItem } from "./src/domain/entities/OptionSetItem";
export type { OptionSetItemData } from "./src/domain/entities/OptionSetItem";

// Status unions. Re-exported from the MODEL layer rather than re-declared here, matching how
// `CustomFieldValueTypeName` is handled: they are wire vocabulary, and a second declaration would be
// a second thing to keep in step with the backend's enums.
export type {
  FieldVersionStatus,
  FieldOptionStatus,
  OptionSetItemWritableStatus,
} from "./src/data/models/OptionSetModel";

// Interfaces (types only — see the header for why the implementations stay hidden)
export type { IOptionSetRepository } from "./src/domain/interfaces/IOptionSetRepository";
export type {
  CreateOptionSetInput,
  UpdateOptionSetInput,
  OptionSetItemInput,
  OptionSetBindingOutcome,
} from "./src/domain/interfaces/IOptionSetRepository";
export type { IOptionSetService } from "./src/domain/interfaces/IOptionSetService";
