import type {
  OperationsCalendarDay,
  OperationsCalendarQuery,
} from "../entities/OperationsCalendar";

/**
 * Documentation for module export
 */
export interface IOperationsCalendarRepository {
  getDay(query: OperationsCalendarQuery): Promise<OperationsCalendarDay>;
}
