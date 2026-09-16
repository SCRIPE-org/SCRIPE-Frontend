/**
 * SchemaExport Service
 *
 * The HTTP call for the schema-export endpoint (Wave 6 row 6.5). Returns a Model (DTO); the
 * repository maps it to an entity.
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import { SchemaBundleModel, type SchemaBundleJson } from "../models/SchemaBundleModel";
import type { ISchemaExportService } from "../../domain/interfaces/ISchemaExportService";
import { SCHEMA_EXPORT_ENDPOINTS } from "./schema-export.endpoints";

export class SchemaExportService implements ISchemaExportService {
  constructor(private readonly api: IApiService) {}

  async getSchema(entityTypeKey?: string | null): Promise<SchemaBundleModel> {
    // `buildUrl` drops undefined and null params, so an unscoped export sends NO `entityTypeKey`
    // parameter at all rather than an empty one. That distinction is real on the server: it treats
    // "" the same as absent today, but the bundle it returns records `entityTypeKey: null` either
    // way, and sending an empty string would leave the request looking like a scoped export of
    // nothing in any log or trace.
    const url = buildUrl(SCHEMA_EXPORT_ENDPOINTS.SCHEMA, {
      entityTypeKey: entityTypeKey && entityTypeKey.length > 0 ? entityTypeKey : undefined,
    });
    const response = await this.api.get<SchemaBundleJson>(url);
    return SchemaBundleModel.fromJson(response);
  }
}
