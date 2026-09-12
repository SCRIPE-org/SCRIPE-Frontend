import type {
  OperationsCalendarDay,
  OperationsCalendarQuery,
} from "../entities/OperationsCalendar";

export interface IOperationsCalendarRepository {
  getDay(query: OperationsCalendarQuery): Promise<OperationsCalendarDay>;
}
