import type { OperationsCalendarQuery } from "../entities/OperationsCalendar";
import type { OperationsCalendarDayDto } from "../../data/models";

/**
 * HTTP service contract for retrieving operations calendar day snapshots.
 */
export interface IOperationsCalendarService {
  getDay(query: OperationsCalendarQuery): Promise<OperationsCalendarDayDto>;
}
