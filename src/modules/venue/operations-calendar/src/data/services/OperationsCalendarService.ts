import type { IApiService } from "@core/interfaces/api.interface";
import type { OperationsCalendarQuery } from "../../domain/entities/OperationsCalendar";
import type { IOperationsCalendarService } from "../../domain/interfaces/IOperationsCalendarService";
import type { OperationsCalendarDayDto } from "../models";
import { OPERATIONS_CALENDAR_ENDPOINTS } from "./operations-calendar.endpoints";

/**
 * Operations calendar API transport service returning raw DTO responses.
 */
export class OperationsCalendarService implements IOperationsCalendarService {
  constructor(private readonly api: IApiService) {}

  getDay(query: OperationsCalendarQuery): Promise<OperationsCalendarDayDto> {
    const params = new URLSearchParams({
      dateLocal: query.dateLocal,
      timeZoneId: query.timeZoneId,
      resourceIds: query.resourceIds.join(","),
    });
    return this.api.get<OperationsCalendarDayDto>(
      `${OPERATIONS_CALENDAR_ENDPOINTS.DAY}?${params.toString()}`,
    );
  }
}
