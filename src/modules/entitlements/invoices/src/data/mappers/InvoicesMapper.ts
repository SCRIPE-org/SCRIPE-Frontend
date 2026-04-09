import { InvoicesEntity } from "../../domain/entities/InvoicesEntity";
import type { InvoicesModel } from "../models/InvoicesModel";

export class InvoicesMapper {
  static toEntity(dto: InvoicesModel): InvoicesEntity {
    return new InvoicesEntity({
      id: dto.id ?? "",
      number: dto.number ?? "",
      tenantName: dto.tenantName ?? "",
      amount: dto.amount ?? "",
      currency: dto.currency ?? "",
      status: dto.status ?? "",
      dueDate: dto.dueDate ?? "",
      paidAt: dto.paidAt ?? "",
      createdAt: dto.createdAt ?? "",
    });
  }
}
