/**
 * DefinitionExport Repository Implementation
 *
 * Implements `IDefinitionExportRepository` over `IDefinitionExportService`, mapping Models to
 * Entities. Same layering as `FieldGroupRepository` and `SchemaExportRepository`:
 * - Service handles API calls, returns Models
 * - Repository maps to Entities
 * - ViewModel works with Entities only
 *
 * IT MAPS THE FAILURE PATH TOO, WHICH THE SIBLINGS DO NOT NEED TO
 * --------------------------------------------------------------
 * `SchemaExportRepository` lets errors fall straight through, because a schema export's only failure
 * is a fault and a fault needs no translation. This route has a failure that is NOT a fault — the
 * row-cap refusal — so the error crosses this boundary as deliberately as the payload does: the
 * model-layer `DefinitionExportFailure` becomes the domain's `DefinitionExportError`, and the view
 * model above never has to know what an `ErrorResponse` is.
 */
import type { IDefinitionExportRepository } from "../../domain/interfaces/IDefinitionExportRepository";
import type { IDefinitionExportService } from "../../domain/interfaces/IDefinitionExportService";
import type { DefinitionExport } from "../../domain/entities/DefinitionExport";
import { DefinitionExportFailure } from "../models/DefinitionExportModel";
import { DefinitionExportMapper } from "../mappers/DefinitionExportMapper";

/**
 * Documentation for module export
 */
export class DefinitionExportRepository implements IDefinitionExportRepository {
  constructor(private readonly service: IDefinitionExportService) {}

  async exportDefinitions(entityTypeKey?: string | null): Promise<DefinitionExport> {
    try {
      const model = await this.service.exportDefinitions(entityTypeKey);
      return DefinitionExportMapper.toEntity(model);
    } catch (error) {
      if (error instanceof DefinitionExportFailure) {
        throw DefinitionExportMapper.toError(error.failure);
      }
      // `DownloadInterceptedError` and anything unforeseen travel on untouched. Wrapping an
      // unrecognised throwable in a domain error would give it an `errorCode` it never had, and a
      // fabricated code is worse than no code: it is one a branch could match.
      throw error;
    }
  }
}
