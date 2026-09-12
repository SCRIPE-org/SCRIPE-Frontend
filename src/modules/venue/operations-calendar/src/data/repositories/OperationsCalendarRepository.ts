import type { OperationsCalendarQuery } from "../../domain/entities/OperationsCalendar";
import type { IOperationsCalendarRepository } from "../../domain/interfaces/IOperationsCalendarRepository";
import type { IOperationsCalendarService } from "../../domain/interfaces/IOperationsCalendarService";

export class OperationsCalendarRepository implements IOperationsCalendarRepository {
  constructor(private readonly service: IOperationsCalendarService) {}

  getDay(query: OperationsCalendarQuery) {
    return this.service.getDay(query);
  }
}
