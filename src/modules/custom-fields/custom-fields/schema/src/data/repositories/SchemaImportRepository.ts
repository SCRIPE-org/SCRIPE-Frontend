/**
 * SchemaImport Repository Implementation
 *
 * Implements `ISchemaImportRepository` over `ISchemaImportService`, mapping the Model result to
 * the Entity. See `ISchemaImportRepository`'s own doc comment for why the INPUT is a data-layer
 * payload rather than a domain entity.
 */
import type { ISchemaImportRepository } from "../../domain/interfaces/ISchemaImportRepository";
import type { ISchemaImportService } from "../../domain/interfaces/ISchemaImportService";
import type { SchemaImportResult } from "../../domain/entities/SchemaImportResult";
import {
  ImportSchemaBundleFailure,
  type SchemaImportBundlePayload,
} from "../models/SchemaImportModel";
import { SchemaImportMapper } from "../mappers/SchemaImportMapper";

/**
 * Documentation for module export
 */
export class SchemaImportRepository implements ISchemaImportRepository {
  constructor(private readonly service: ISchemaImportService) {}

  async importSchema(bundle: SchemaImportBundlePayload): Promise<SchemaImportResult> {
    try {
      const model = await this.service.importSchema(bundle);
      return SchemaImportMapper.toEntity(model);
    } catch (error) {
      if (error instanceof ImportSchemaBundleFailure) {
        throw SchemaImportMapper.toError(error.failure);
      }
      throw error;
    }
  }
}
