/**
 * OptionSet Service
 *
 * All HTTP calls for the twelve option-set endpoints (P-4). Returns Models (DTOs); the repository
 * maps them to entities.
 *
 * NO `buildUrl` CALL IN THIS FILE, AND THAT IS DELIBERATE
 * ------------------------------------------------------
 * `buildUrl` is the house helper for query strings, and `OptionSetsController` has NONE: no filter,
 * no paging, no `entityTypeKey` gate -- unlike `FieldGroupService`, whose list read is defined by its
 * required query parameter. Every identifier on this API travels in the PATH. Stated here so a reader
 * comparing the two files does not read the absence as an oversight and "fix" it by inventing a
 * parameter the backend will ignore.
 *
 * WHERE THE `?? []` GUARDS ARE, AND WHERE THEY ARE NOT
 * ---------------------------------------------------
 * The list read defaults an empty body to `[]`, same as `FieldGroupService`, so a 204 cannot make
 * `.map` throw. The three binding calls have NO such default: their bodies are counts, and a
 * fabricated zero would report "nothing changed" about a write that did change things. A missing body
 * there must surface as a failure, not as a reassuring receipt.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import {
  OptionSetModel,
  OptionSetDetailModel,
  OptionSetVersionModel,
  OptionSetBindingResultModel,
  type OptionSetJson,
  type OptionSetDetailJson,
  type OptionSetVersionJson,
  type OptionSetBindingResultJson,
  type CreateOptionSetRequestJson,
  type UpdateOptionSetRequestJson,
  type OptionSetVersionItemsRequestJson,
  type BindOptionSetRequestJson,
} from "../models/OptionSetModel";
import type { IOptionSetService } from "../../domain/interfaces/IOptionSetService";
import { OPTION_SET_ENDPOINTS } from "./option-set.endpoints";

/**
 * Documentation for module export
 */
export class OptionSetService implements IOptionSetService {
  constructor(private readonly api: IApiService) {}

  async getAll(): Promise<OptionSetModel[]> {
    // Bare array, NOT a PagedResult envelope -- there is no pagination on this read. `?? []` guards a
    // 204/empty body rather than letting `.map` throw on undefined.
    const response = await this.api.get<OptionSetJson[]>(OPTION_SET_ENDPOINTS.LIST);
    return (response ?? []).map((json) => OptionSetModel.fromJson(json));
  }

  async getById(id: string): Promise<OptionSetDetailModel> {
    const response = await this.api.get<OptionSetDetailJson>(OPTION_SET_ENDPOINTS.DETAIL(id));
    return OptionSetDetailModel.fromJson(response);
  }

  async getVersion(versionId: string): Promise<OptionSetVersionModel> {
    const response = await this.api.get<OptionSetVersionJson>(
      OPTION_SET_ENDPOINTS.VERSION(versionId)
    );
    return OptionSetVersionModel.fromJson(response);
  }

  async create(data: CreateOptionSetRequestJson): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(OPTION_SET_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: UpdateOptionSetRequestJson): Promise<void> {
    await this.api.put(OPTION_SET_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(OPTION_SET_ENDPOINTS.DELETE(id));
  }

  async createVersion(
    optionSetId: string,
    data: OptionSetVersionItemsRequestJson
  ): Promise<{ id: string }> {
    // Nested under the SET, because creating a version needs its parent. The other three version
    // routes are keyed by the version's own id and are flat siblings of `{id}` -- the asymmetry is
    // the controller's, not a mistake here.
    return this.api.post<{ id: string }>(OPTION_SET_ENDPOINTS.CREATE_VERSION(optionSetId), data);
  }

  async updateVersion(versionId: string, data: OptionSetVersionItemsRequestJson): Promise<void> {
    await this.api.put(OPTION_SET_ENDPOINTS.UPDATE_VERSION(versionId), data);
  }

  async publishVersion(versionId: string): Promise<void> {
    // POST with NO BODY. The version id in the path is the whole request: there is nothing to choose
    // about a publish, and a body would invite someone to try to publish "as" a status.
    await this.api.post(OPTION_SET_ENDPOINTS.PUBLISH_VERSION(versionId));
  }

  async bind(
    fieldVersionId: string,
    data: BindOptionSetRequestJson
  ): Promise<OptionSetBindingResultModel> {
    const response = await this.api.post<OptionSetBindingResultJson>(
      OPTION_SET_ENDPOINTS.BIND(fieldVersionId),
      data
    );
    return OptionSetBindingResultModel.fromJson(response);
  }

  async rebind(
    fieldVersionId: string,
    data: BindOptionSetRequestJson
  ): Promise<OptionSetBindingResultModel> {
    // Same path as `bind`, different verb. Named separately because the two refuse each other's
    // preconditions -- bind 409s when already bound, rebind 409s when not -- and only this one can
    // deactivate options a tenant is currently offering.
    const response = await this.api.put<OptionSetBindingResultJson>(
      OPTION_SET_ENDPOINTS.REBIND(fieldVersionId),
      data
    );
    return OptionSetBindingResultModel.fromJson(response);
  }

  async unbind(fieldVersionId: string): Promise<OptionSetBindingResultModel> {
    // The one DELETE in this module that returns a BODY rather than 204: unbinding reports what it
    // left behind, which is the whole point of an operation that touches no rows.
    const response = await this.api.delete<OptionSetBindingResultJson>(
      OPTION_SET_ENDPOINTS.UNBIND(fieldVersionId)
    );
    return OptionSetBindingResultModel.fromJson(response);
  }
}
