import { PluginExecutionLog } from "../../domain/entities/PluginExecutionLog";
import type { PluginExecutionLogModel } from "../models/LogsModels";
import { z } from "zod";
import { safeParseApiResponse, uuidField } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const PluginExecutionLogModelSchema = z.object({
  id: uuidField(),
  installationId: uuidField(),
  pluginKey: z.string().min(1),
  endpoint: z.string().min(1),
  executedAt: z.string().min(1),
  durationMs: z.number().optional().default(0),
  isSuccess: z.boolean().optional().default(false),
  statusCode: z.number().int().optional().nullable(),
  errorMessage: z.string().optional().nullable(),
});

export class LogsMapper {
  static toEntity(model: PluginExecutionLogModel): PluginExecutionLog {
    const validated = safeParseApiResponse(
      PluginExecutionLogModelSchema,
      model,
      "PluginExecutionLog"
    );
    return new PluginExecutionLog({
      id: validated.id,
      installationId: validated.installationId,
      pluginKey: validated.pluginKey,
      endpoint: validated.endpoint,
      executedAt: validated.executedAt,
      durationMs: validated.durationMs ?? 0,
      isSuccess: validated.isSuccess ?? false,
      statusCode: validated.statusCode ?? undefined,
      errorMessage: validated.errorMessage ?? undefined,
    });
  }
}
