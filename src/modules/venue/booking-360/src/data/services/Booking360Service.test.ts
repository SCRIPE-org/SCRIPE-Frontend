import { describe, expect, it, vi } from "vitest";
import { Booking360Service } from "./Booking360Service";

describe("Booking360Service", () => {
  it("loads only the canonical bounded operational-detail route", async () => {
    const api = { get: vi.fn().mockResolvedValue({ id: "reservation-1" }) };
    const service = new Booking360Service(api as never);

    await service.getById("reservation-1");

    expect(api.get).toHaveBeenCalledWith("/v1/reservations/reservation-1/operational-detail");
  });
});
