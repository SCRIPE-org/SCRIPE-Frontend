/**
 * SchemaExport Repository Implementation
 *
 * Implements ISchemaExportRepository over ISchemaExportService, mapping Models to Entities. Same
 * layering as FieldGroupRepository:
 * - Service handles API calls, returns Models
 * - Repository maps to Entities
 * - ViewModel works with Entities only
 */
import type { ISchemaExportRepository } from "../../domain/interfaces/ISchemaExportRepository";
import type { ISchemaExportService } from "../../domain/interfaces/ISchemaExportService";
import type { SchemaBundle } from "../../domain/entities/SchemaBundle";
import { SchemaBundleMapper } from "../mappers/SchemaBundleMapper";

export class SchemaExportRepository implements ISchemaExportRepository {
  constructor(private readonly service: ISchemaExportService) {}

  async exportSchema(entityTypeKey?: string | null): Promise<SchemaBundle> {
    const model = await this.service.getSchema(entityTypeKey);
    return SchemaBundleMapper.toEntity(model);
  }
}
