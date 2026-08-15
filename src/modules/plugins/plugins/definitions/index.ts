// Public surface of the `definitions` sub-module.
// Only presentation and domain-level items exposed — never data-layer internals.

export { DefinitionsView } from "./src/presentation/views/DefinitionsView";
export { useDefinitionsViewModel } from "./src/presentation/viewmodels/useDefinitionsViewModel";
export type {
  IDefinitionsRepository,
  CreateDefinitionRequest,
  UpdateDefinitionRequest,
} from "./src/domain/interfaces/IDefinitionsRepository";
