import type { SsoProvider } from "../../domain/entities/SsoProvider";
import { SsoProvider as SsoProviderEntity } from "../../domain/entities/SsoProvider";
import type { SsoProviderDto } from "../models/SsoModels";

export class SsoMapper {
  static providerToDomain(model: SsoProviderDto): SsoProvider {
    return new SsoProviderEntity({
      id: model.id ?? "",
      name: model.name ?? "",
      slug: model.slug ?? "",
      protocol: model.protocol ?? "oidc",
      iconUrl: model.iconUrl ?? null,
      buttonColor: model.buttonColor ?? null,
      buttonLabel: model.buttonLabel ?? null,
      displayOrder: model.displayOrder ?? 0,
    });
  }
}
