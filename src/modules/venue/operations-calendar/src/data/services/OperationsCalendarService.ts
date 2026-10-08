import type { IApiService } from "@core/interfaces/api.interface";
import type {
  OperationsCalendarDay,
  OperationsCalendarQuery,
} from "../../domain/entities/OperationsCalendar";
import type { IOperationsCalendarService } from "../../domain/interfaces/IOperationsCalendarService";
import { OPERATIONS_CALENDAR_ENDPOINTS } from "./operations-calendar.endpoints";

/**
 * Documentation for module export
 */
export class OperationsCalendarService implements IOperationsCalendarService {
  constructor(private readonly api: IApiService) {}

  getDay(query: OperationsCalendarQuery): Promise<OperationsCalendarDay> {
    const params = new URLSearchParams({
      dateLocal: query.dateLocal,
      timeZoneId: query.timeZoneId,
      resourceIds: query.resourceIds.join(","),
    });
    return this.api.get(`${OPERATIONS_CALENDAR_ENDPOINTS.DAY}?${params.toString()}`);
  }
}
