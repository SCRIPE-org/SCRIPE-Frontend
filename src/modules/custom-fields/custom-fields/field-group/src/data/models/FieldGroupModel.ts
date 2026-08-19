/**
 * FieldGroup Model (DTO)
 *
 * Wire shapes for the field-group endpoints (Wave 5 row 5.2), mirroring
 * `CustomFields.Application.DTOs` one-for-one. Service speaks these; the
 * mapper converts to/from the `FieldGroup` entity.
 */

/**
 * `FieldGroupResponse` -- the ONLY read shape. There is no separate sparse
 * list DTO here, so (unlike CustomField) there is no "populated a form from a
 * list row and blanked half the record" hazard to guard against.
 */
export interface FieldGroupJson {
  id: string;
  entityTypeKey: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  isGlobal: boolean;
}

/**
 * `CreateFieldGroupRequest`. `entityTypeKey` (<=100) and `labelEn` (<=200) are
 * required; `labelAr` (<=200) is optional.
 *
 * `isGlobal: true` is re-checked server-side and rejected with 403 for anyone
 * who is not a super admin -- it is a request, not an assertion.
 */
export interface CreateFieldGroupRequestJson {
  entityTypeKey: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  isGlobal: boolean;
}

/**
 * `UpdateFieldGroupRequest`. Deliberately carries NEITHER `entityTypeKey` NOR
 * any scope field: both are immutable after creation, and the backend record
 * has no property to bind them to. Do not add them here to "match" the create
 * request.
 */
export interface UpdateFieldGroupRequestJson {
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
}

/** One entry of `ReorderFieldGroupsRequest.Items`. */
export interface FieldGroupReorderItemJson {
  id: string;
  sortOrder: number;
}

/**
 * `ReorderFieldGroupsRequest` -- the FULL reordered set, not a per-move delta.
 *
 * `SortOrder` is assigned directly from this payload rather than incremented
 * relative to current state, so resubmitting an identical payload converges to
 * the identical final state (idempotent). A payload containing one
 * invalid/inaccessible id mutates NOTHING and fails the whole request, so the
 * caller must never include a group it is not allowed to mutate.
 */
export interface ReorderFieldGroupsRequestJson {
  items: FieldGroupReorderItemJson[];
}

/**
 * FieldGroup Model class -- wraps the response JSON with fromJson/toJson.
 */
export class FieldGroupModel {
  constructor(
    public readonly id: string,
    public readonly entityTypeKey: string,
    public readonly labelEn: string,
    public readonly sortOrder: number,
    public readonly isGlobal: boolean,
    public readonly labelAr?: string | null
  ) {}

  /** Create a FieldGroupModel from API JSON. */
  static fromJson(json: FieldGroupJson): FieldGroupModel {
    return new FieldGroupModel(
      json.id,
      json.entityTypeKey,
      json.labelEn,
      json.sortOrder,
      // A response from a backend predating the IsGlobal column would omit it;
      // default to false (tenant-scoped) rather than letting `undefined` flow
      // into the ownership checks that decide whether Edit/Delete/Move render.
      json.isGlobal ?? false,
      json.labelAr
    );
  }

  /** Convert back to the API JSON shape. */
  toJson(): FieldGroupJson {
    return {
      id: this.id,
      entityTypeKey: this.entityTypeKey,
      labelEn: this.labelEn,
      labelAr: this.labelAr,
      sortOrder: this.sortOrder,
      isGlobal: this.isGlobal,
    };
  }
}
