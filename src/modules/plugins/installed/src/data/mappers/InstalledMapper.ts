import { PluginInstallation } from "../../domain/entities/PluginInstallation";
import type { PluginInstallationModel } from "../models/InstalledModels";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  isoDateString,
  optionalIsoDate,
  urlField,
} from "@core/common/zod-utils";

// ─── Plugin Installation Response Schema ──────────────────────────────────────

const PluginInstallationModelSchema = z.object({
  id: uuidField(),
  pluginDefinitionId: uuidField(),
  pluginKey: z.string().min(1),
  pluginName: z.string().min(1),
  pluginNameAr: optionalString(),
  iconUrl: urlField(),
  /** Plugin's embedded web app URL — distinct from iconUrl (logo). Used by PluginFrame. */
  frontendUrl: urlField(),
  status: z.string(),
  settingsJson: optionalString(),
  installedAt: isoDateString(),
  healthCheckPassing: z.boolean(),
  lastHealthCheckAt: optionalIsoDate(),
});

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class InstalledMapper {
  static toEntity(model: PluginInstallationModel): PluginInstallation {
    safeParseApiResponse(PluginInstallationModelSchema, model, "PluginInstallation");
    return new PluginInstallation(model);
  }
}
