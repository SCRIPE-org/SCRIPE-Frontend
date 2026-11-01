import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type { CustomerSummary } from "../../domain/entities/Booking";
import type {
  ICustomerPickerService,
  CustomerCreateOptions,
  PagedCustomerResult,
} from "../../domain/interfaces/ICustomerPickerService";
import { BOOKING_ENDPOINTS } from "./booking.endpoints";

interface PartyPage {
  items: CustomerSummary[];
}

export class PartialCustomerSaveError extends Error {
  constructor(
    message: string,
    public readonly partyId: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "PartialCustomerSaveError";
  }
}

/**
 * Documentation for module export
 */
export class CustomerPickerService implements ICustomerPickerService {
  constructor(private readonly api: IApiService) {}

  async search(query: string): Promise<CustomerSummary[]> {
    try {
      const result = await this.api.get<PartyPage>(
        buildUrl(BOOKING_ENDPOINTS.PARTIES, {
          page: 1,
          pageSize: 20,
          search: query.trim() || undefined,
        })
      );
      const items = Array.isArray(result?.items)
        ? result.items
        : Array.isArray(result)
        ? result
        : [];
      return items.map((item: any) => {
        const phone = item.phone ?? item.primaryPhone;
        const email = item.email ?? item.primaryEmail;
        return {
          ...item,
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
        };
      });
    } catch {
      return [];
    }
  }

  async searchPaged(
    query?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PagedCustomerResult> {
    try {
      const result = await this.api.get<any>(
        buildUrl(BOOKING_ENDPOINTS.PARTIES, {
          page: Math.max(1, page),
          pageSize: Math.max(1, Math.min(pageSize, 100)),
          search: query?.trim() || undefined,
        })
      );

      const rawItems = Array.isArray(result?.items)
        ? result.items
        : Array.isArray(result)
        ? result
        : [];

      const items: CustomerSummary[] = rawItems.map((item: any) => {
        const phone = item.phone ?? item.primaryPhone;
        const email = item.email ?? item.primaryEmail;
        return {
          ...item,
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
        };
      });

      const totalCount = typeof result?.totalCount === "number" ? result.totalCount : items.length;
      const pageNumber = typeof result?.pageNumber === "number" ? result.pageNumber : page;
      const effectivePageSize = typeof result?.pageSize === "number" ? result.pageSize : pageSize;
      const totalPages =
        typeof result?.totalPages === "number"
          ? result.totalPages
          : Math.ceil(totalCount / effectivePageSize) || 1;
      const hasPreviousPage =
        typeof result?.hasPreviousPage === "boolean"
          ? result.hasPreviousPage
          : pageNumber > 1;
      const hasNextPage =
        typeof result?.hasNextPage === "boolean"
          ? result.hasNextPage
          : pageNumber < totalPages;

      return {
        items,
        totalCount,
        pageNumber,
        pageSize: effectivePageSize,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      };
    } catch {
      return {
        items: [],
        totalCount: 0,
        pageNumber: page,
        pageSize,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    }
  }

  getById(id: string): Promise<CustomerSummary> {
    return this.api.get(BOOKING_ENDPOINTS.PARTY_BY_ID(id));
  }

  async create(
    displayName: string,
    type: "Person" | "Organization" = "Person",
    phone?: string,
    options?: CustomerCreateOptions
  ): Promise<CustomerSummary> {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      throw new Error("Customer name is required.");
    }

    const idempotencyKey =
      options?.idempotencyKey ||
      (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : undefined);

    let partyId: string;

    if (type === "Person") {
      const headers: Record<string, string> = {};
      if (idempotencyKey) {
        headers["Idempotency-Key"] = idempotencyKey;
      }

      const res = await this.api.post<{ id: string }>(
        BOOKING_ENDPOINTS.PEOPLE,
        {
          fullName: trimmedName,
          displayName: trimmedName,
          givenName: null,
          middleNames: null,
          familyName: null,
        },
        undefined,
        Object.keys(headers).length > 0 ? { headers } : undefined
      );
      partyId = res.id;
    } else {
      const headers: Record<string, string> = {};
      if (idempotencyKey) {
        headers["Idempotency-Key"] = idempotencyKey;
      }

      const res = await this.api.post<{ id: string }>(
        BOOKING_ENDPOINTS.ORGANIZATIONS,
        {
          legalName: trimmedName,
          displayName: trimmedName,
        },
        undefined,
        Object.keys(headers).length > 0 ? { headers } : undefined
      );
      partyId = res.id;
    }

    if (phone && phone.trim()) {
      const contactHeaders: Record<string, string> = {};
      if (idempotencyKey) {
        contactHeaders["Idempotency-Key"] = `${idempotencyKey}:phone`;
      }
      try {
        await this.api.post(
          BOOKING_ENDPOINTS.CONTACT_POINTS,
          {
            partyId,
            type: "Phone",
            value: phone.trim(),
            isPrimary: true,
          },
          undefined,
          Object.keys(contactHeaders).length > 0 ? { headers: contactHeaders } : undefined
        );
      } catch (err) {
        if (options?.onContactPointFailure) {
          options.onContactPointFailure(err, partyId);
        } else {
          throw new PartialCustomerSaveError(
            `Customer was created with ID ${partyId}, but saving the phone number failed.`,
            partyId,
            err
          );
        }
      }
    }

    if (options?.email && options.email.trim()) {
      const emailHeaders: Record<string, string> = {};
      if (idempotencyKey) {
        emailHeaders["Idempotency-Key"] = `${idempotencyKey}:email`;
      }
      try {
        await this.api.post(
          BOOKING_ENDPOINTS.CONTACT_POINTS,
          {
            partyId,
            type: "Email",
            value: options.email.trim(),
            isPrimary: true,
          },
          undefined,
          Object.keys(emailHeaders).length > 0 ? { headers: emailHeaders } : undefined
        );
      } catch (err) {
        if (options?.onContactPointFailure) {
          options.onContactPointFailure(err, partyId);
        } else {
          throw new PartialCustomerSaveError(
            `Customer was created with ID ${partyId}, but saving the email address failed.`,
            partyId,
            err
          );
        }
      }
    }

    return this.getById(partyId);
  }
}
