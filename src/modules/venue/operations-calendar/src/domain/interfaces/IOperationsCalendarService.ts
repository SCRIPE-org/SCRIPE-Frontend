import type {
  OperationsCalendarDay,
  OperationsCalendarQuery,
} from "../entities/OperationsCalendar";

/**
 * Documentation for module export
 */
export interface IOperationsCalendarService {
  getDay(query: OperationsCalendarQuery): Promise<OperationsCalendarDay>;
}
