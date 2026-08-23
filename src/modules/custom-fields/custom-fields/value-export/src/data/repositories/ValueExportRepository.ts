/**
 * ValueExport Repository Implementation
 *
 * Implements `IValueExportRepository` over `IValueExportService`, mapping Models to Entities. Same
 * layering as `DefinitionExportRepository`:
 * - Service handles API calls, returns Models
 * - Repository maps to Entities
 * - ViewModel works with Entities only
 *
 * IT MAPS THE FAILURE PATH TOO, WHICH THE SCHEMA SIBLING DOES NOT NEED TO
 * ------------------------------------------------------------------------
 * `SchemaExportRepository` lets errors fall straight through, because a schema export's only
 * failure is a fault. This route has THREE failures that are not faults -- the row-cap refusal, an
 * unknown entity type, and a forbidden view permission -- so the error crosses this boundary as
 * deliberately as the payload does.
 */
import type { IValueExportRepository } from "../../domain/interfaces/IValueExportRepository";
import type { IValueExportService } from "../../domain/interfaces/IValueExportService";
import type { ValueExport } from "../../domain/entities/ValueExport";
import { ValueExportFailure } from "../models/ValueExportModel";
import { ValueExportMapper } from "../mappers/ValueExportMapper";

export class ValueExportRepository implements IValueExportRepository {
  constructor(private readonly service: IValueExportService) {}

  async exportValues(entityTypeKey: string): Promise<ValueExport> {
    try {
      const model = await this.service.exportValues(entityTypeKey);
      return ValueExportMapper.toEntity(model);
    } catch (error) {
      if (error instanceof ValueExportFailure) {
        throw ValueExportMapper.toError(error.failure);
      }
      // `DownloadInterceptedError` and anything unforeseen travel on untouched. Wrapping an
      // unrecognised throwable in a domain error would give it an `errorCode` it never had, and a
      // fabricated code is worse than no code: it is one a branch could match.
      throw error;
    }
  }
}
