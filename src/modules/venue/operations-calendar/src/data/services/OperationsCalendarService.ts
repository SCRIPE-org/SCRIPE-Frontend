import type { IApiService } from "@core/interfaces/api.interface";
import type {
  OperationsCalendarBlock,
  OperationsCalendarDay,
  OperationsCalendarQuery,
} from "../../domain/entities/OperationsCalendar";
import type { IOperationsCalendarService } from "../../domain/interfaces/IOperationsCalendarService";
import { OPERATIONS_CALENDAR_ENDPOINTS } from "./operations-calendar.endpoints";

export class OperationsCalendarService implements IOperationsCalendarService {
  constructor(private readonly api: IApiService) {}

  async getDay(query: OperationsCalendarQuery): Promise<OperationsCalendarDay> {
    const params = new URLSearchParams({
      dateLocal: query.dateLocal,
      timeZoneId: query.timeZoneId,
      resourceIds: query.resourceIds.join(","),
    });
    const res = await this.api.get<any>(`${OPERATIONS_CALENDAR_ENDPOINTS.DAY}?${params.toString()}`);
    const blocks: OperationsCalendarBlock[] = [...(res.blocks || [])];
    if (Array.isArray(res.closures)) {
      for (const closure of res.closures) {
        blocks.push({
          reservationId: `closure-${closure.resourceId}-${closure.startUtc}`,
          reservationNumber: closure.reason ? `⊘ ${closure.reason}` : `⊘ ${closure.closureType || "Closure"}`,
          resourceId: closure.resourceId,
          status: (closure.closureType === "Maintenance" ? "Maintenance" : "Unavailable") as any,
          startUtc: closure.startUtc,
          endUtc: closure.endUtc,
          quantity: 1,
          customerPartyId: "",
          holdExpiresAtUtc: null,
        });
      }
    }
    return {
      ...res,
      blocks,
    };
  }
}
