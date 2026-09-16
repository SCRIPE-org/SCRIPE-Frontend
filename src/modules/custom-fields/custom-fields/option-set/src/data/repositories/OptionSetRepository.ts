/**
 * OptionSet Repository Implementation
 *
 * Implements `IOptionSetRepository` over `IOptionSetService`, mapping Models to Entities. Same
 * layering as every other CustomFields submodule:
 * - Service handles API calls, returns Models
 * - Repository maps to Entities
 * - ViewModel works with Entities only
 *
 * THIS REPOSITORY DOES TWO THINGS BEYOND MAPPING, BOTH DEFENCE IN DEPTH
 * --------------------------------------------------------------------
 *  1. `update` narrows to the three properties `UpdateOptionSetRequest` declares. `stableKey` and
 *     `isGlobal` are immutable, and forwarding either would ask the backend to rebind a set's
 *     portable identity or its ownership. The narrowing is invisible while callers happen to build
 *     exactly the right object -- which is why it has its own test.
 *
 *  2. Item writes are checked for `FieldOptionStatus.Deleted` at runtime, on top of the type-level
 *     exclusion in `OptionSetItemInput`. The type stops the honest mistake; the throw stops the one
 *     that arrives through a cast, an `as unknown`, or a value parsed from JSON. It has to be a throw
 *     rather than a silent coercion: coercing would make the UI claim it saved what the admin typed
 *     while sending something else, and the alternative -- letting it through -- soft-deletes an
 *     option row that stored values still reference, with no remap-or-blank decision ever taken.
 *     `OptionSetItem.writableStatus` is the supported way to get a safe status out of a loaded item.
 */
import type {
  IOptionSetRepository,
  CreateOptionSetInput,
  UpdateOptionSetInput,
  OptionSetItemInput,
  OptionSetBindingOutcome,
} from "../../domain/interfaces/IOptionSetRepository";
import type { IOptionSetService } from "../../domain/interfaces/IOptionSetService";
import type { OptionSet, OptionSetDetail } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type { OptionSetItemRequestJson } from "../models/OptionSetModel";
import { OptionSetMapper } from "../mappers/OptionSetMapper";

export class OptionSetRepository implements IOptionSetRepository {
  constructor(private readonly service: IOptionSetService) {}

  async getAll(): Promise<OptionSet[]> {
    const models = await this.service.getAll();
    return models.map((model) => OptionSetMapper.toEntity(model));
  }

  async getById(id: string): Promise<OptionSetDetail> {
    const model = await this.service.getById(id);
    return OptionSetMapper.detailToEntity(model);
  }

  async getVersion(versionId: string): Promise<OptionSetVersion> {
    const model = await this.service.getVersion(versionId);
    return OptionSetMapper.versionToEntity(model);
  }

  async create(data: CreateOptionSetInput): Promise<string> {
    const response = await this.service.create({
      stableKey: data.stableKey,
      labelEn: data.labelEn,
      // `?? null` on both optionals: an omitted key and an explicit null mean the same thing to the
      // backend, and sending one spelling consistently keeps request bodies comparable in a log.
      labelAr: data.labelAr ?? null,
      description: data.description ?? null,
      isGlobal: data.isGlobal,
    });
    return response.id;
  }

  async update(id: string, data: UpdateOptionSetInput): Promise<void> {
    // Only the three properties UpdateOptionSetRequest declares are sent. `stableKey` and `isGlobal`
    // are immutable and are not forwarded even if a caller's object happens to carry them -- see
    // point 1 of this file's header.
    await this.service.update(id, {
      labelEn: data.labelEn,
      labelAr: data.labelAr ?? null,
      description: data.description ?? null,
    });
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async createVersion(optionSetId: string, items: OptionSetItemInput[]): Promise<string> {
    const response = await this.service.createVersion(optionSetId, {
      items: items.map((item) => OptionSetRepository.toItemRequest(item)),
    });
    return response.id;
  }

  async updateVersion(versionId: string, items: OptionSetItemInput[]): Promise<void> {
    await this.service.updateVersion(versionId, {
      items: items.map((item) => OptionSetRepository.toItemRequest(item)),
    });
  }

  async publishVersion(versionId: string): Promise<void> {
    await this.service.publishVersion(versionId);
  }

  async bind(fieldVersionId: string, optionSetVersionId: string): Promise<OptionSetBindingOutcome> {
    const model = await this.service.bind(fieldVersionId, { optionSetVersionId });
    return OptionSetMapper.bindingResultToOutcome(model);
  }

  async rebind(fieldVersionId: string, optionSetVersionId: string): Promise<OptionSetBindingOutcome> {
    const model = await this.service.rebind(fieldVersionId, { optionSetVersionId });
    return OptionSetMapper.bindingResultToOutcome(model);
  }

  async unbind(fieldVersionId: string): Promise<OptionSetBindingOutcome> {
    const model = await this.service.unbind(fieldVersionId);
    return OptionSetMapper.bindingResultToOutcome(model);
  }

  /**
   * One item, domain input -> request JSON.
   *
   * Spelled out property by property rather than spread, for the same reason the mapper is: a member
   * added to `OptionSetItemInput` and not mapped here would be silently absent from a FULL-REPLACE
   * payload, which does not read as a missing field -- it reads as the admin having cleared it.
   *
   * The `Deleted` guard lives here rather than in the two callers so that both write paths are covered
   * by one check that cannot be forgotten by a third path added later. Contrast the backend's own
   * per-handler security guards, which are deliberately NOT centralised -- this is a payload shape
   * rule, not an authorization decision.
   */
  private static toItemRequest(item: OptionSetItemInput): OptionSetItemRequestJson {
    // Compared against the string rather than the type, because the whole point is to catch a value
    // the type system was told did not exist.
    if ((item.status as string) === "Deleted") {
      throw new Error(
        `Option "${item.key}" cannot be saved with status Deleted. ` +
          "Deleting an option requires a per-value remap-or-blank decision that this UI does not " +
          "make; deactivate it instead."
      );
    }

    return {
      key: item.key,
      labelEn: item.labelEn,
      labelAr: item.labelAr ?? null,
      color: item.color ?? null,
      iconKey: item.iconKey ?? null,
      sortOrder: item.sortOrder,
      status: item.status,
    };
  }
}
