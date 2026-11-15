import type {
  OperationsCalendarDay,
  OperationsCalendarQuery,
} from "../../domain/entities/OperationsCalendar";
import type { IOperationsCalendarRepository } from "../../domain/interfaces/IOperationsCalendarRepository";
import type { IOperationsCalendarService } from "../../domain/interfaces/IOperationsCalendarService";
import { OperationsCalendarMapper } from "../mappers/OperationsCalendarMapper";

/**
 * Repository coordinating operations calendar API retrieval and domain mapping.
 */
export class OperationsCalendarRepository implements IOperationsCalendarRepository {
  constructor(private readonly service: IOperationsCalendarService) {}

  async getDay(query: OperationsCalendarQuery): Promise<OperationsCalendarDay> {
    const dto = await this.service.getDay(query);
    return OperationsCalendarMapper.toDayEntity(dto);
  }
}
