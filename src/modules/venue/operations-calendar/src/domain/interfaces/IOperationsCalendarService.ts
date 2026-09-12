import type {
  OperationsCalendarDay,
  OperationsCalendarQuery,
} from "../entities/OperationsCalendar";

export interface IOperationsCalendarService {
  getDay(query: OperationsCalendarQuery): Promise<OperationsCalendarDay>;
}
