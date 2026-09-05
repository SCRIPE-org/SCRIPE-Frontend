/**
 * EntityLookup wire models (Wave 4 — EntityReference / UserReference)
 *
 * Verbatim mirrors of `EntityLookupTypeResponse` and `EntityLookupItemResponse` in
 * `SCRIPE-Backend/src/Host/API/Controllers/CustomFields/EntityLookupController.cs`.
 *
 * NO MAPPER LAYER, UNLIKE `field-group/` AND `definition-export/`
 * --------------------------------------------------------------
 * Those submodules map JSON -> Model -> entity because they have something to compute: default
 * labels, derived flags, a filename. These two responses are already the narrowest projection the
 * server is willing to expose — a label, a disambiguator, and one boolean — chosen server-side to
 * be exactly what a picker needs and nothing more. A mapper over them would be a file whose whole
 * body is the identity function, and a second place for a property name to be misspelled. So these
 * interfaces are both the wire shape and the shape the hooks and the control consume.
 *
 * The consequence is that the property names here ARE the contract. If the server renames one, the
 * compiler will not notice — the runtime hands back `undefined` and a picker row renders blank.
 * That is why `EntityLookupService.test.ts` asserts the literal names rather than only the routes.
 */

export type {
  EntityLookupType,
  EntityLookupItem,
  EntityLookupSearchQuery,
  EntityLookupReference,
} from "../../domain/entities/EntityLookup";

export {
  ENTITY_LOOKUP_DEFAULT_PAGE_SIZE,
  ENTITY_LOOKUP_SEARCH_DEBOUNCE_MS,
} from "../../domain/entities/EntityLookup";
