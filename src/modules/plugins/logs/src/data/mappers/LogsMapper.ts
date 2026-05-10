import { PluginExecutionLog } from "../../domain/entities/PluginExecutionLog";
import type { PluginExecutionLogModel } from "../models/LogsModels";

export class LogsMapper {
  static toEntity(model: PluginExecutionLogModel): PluginExecutionLog {
    return new PluginExecutionLog(model);
  }
}
