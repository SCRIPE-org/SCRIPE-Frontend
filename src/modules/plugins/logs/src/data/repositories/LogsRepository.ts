import type { ILogsRepository } from "../../domain/interfaces/ILogsRepository";
import type { ILogsService } from "../../domain/interfaces/ILogsService";
import type { PluginExecutionLog } from "../../domain/entities/PluginExecutionLog";
import type { PagedResult } from "../models/LogsModels";
import { LogsMapper } from "../mappers/LogsMapper";

export class LogsRepository implements ILogsRepository {
  constructor(private readonly service: ILogsService) {}

  async getLogs(
    installationId: string,
    page: number,
    pageSize: number
  ): Promise<PagedResult<PluginExecutionLog>> {
    const result = await this.service.getLogs(installationId, page, pageSize);
    return {
      ...result,
      items: result.items.map(LogsMapper.toEntity),
    };
  }
}
