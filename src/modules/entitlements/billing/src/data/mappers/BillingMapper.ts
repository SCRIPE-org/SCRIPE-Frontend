import { BillingEntity } from "../../domain/entities/BillingEntity";
import type { BillingModel } from "../models/BillingModel";

export class BillingMapper {
  static toEntity(dto: BillingModel): BillingEntity {
    return new BillingEntity({
      mode: dto.mode ?? "",
      stripeConnected: dto.stripeConnected ?? "",
      revenue: dto.revenue ?? "",
      features: dto.features ?? "",
      publicPlans: dto.publicPlans ?? "",
    });
  }
}
