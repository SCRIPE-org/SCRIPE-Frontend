/**
 * Identity Provider Mapper
 *
 * Converts between Identity Provider Models (DTOs) and Entities (Domain).
 *
 * @module identity-providers/data
 */
import {
      IdentityProvider,
      IdentityProviderListItem,
      TestConnectionResult,
      type IdentityProviderData,
      type IdentityProviderListItemData,
      type CreateIdentityProviderRequest,
      type UpdateIdentityProviderRequest,
} from "../../domain/entities/IdentityProvider";
import {
      IdentityProviderModel,
      IdentityProviderListItemModel,
      type IdentityProviderJson,
      type IdentityProviderListItemJson,
      type TestConnectionResultJson,
} from "../models/IdentityProviderModel";

export class IdentityProviderMapper {
      static toEntity(model: IdentityProviderModel): IdentityProvider {
            const data: IdentityProviderData = {
                  id: model.id,
                  name: model.name,
                  slug: model.slug,
                  protocol: model.protocol,
                  tenantId: model.tenantId,
                  authority: model.authority,
                  clientId: model.clientId,
                  scopes: model.scopes,
                  redirectUri: model.redirectUri,
                  claimMappingJson: model.claimMappingJson,
                  enabledForAdmins: model.enabledForAdmins,
                  enabledForUsers: model.enabledForUsers,
                  iconUrl: model.iconUrl,
                  buttonColor: model.buttonColor,
                  buttonLabel: model.buttonLabel,
                  displayOrder: model.displayOrder,
                  isActive: model.isActive,
                  createdAt: model.createdAt,
                  modifiedAt: model.modifiedAt,
            };
            return new IdentityProvider(data);
      }

      static fromJsonToEntity(json: IdentityProviderJson): IdentityProvider {
            const model = IdentityProviderModel.fromJson(json);
            return IdentityProviderMapper.toEntity(model);
      }

      static toListItemEntity(model: IdentityProviderListItemModel): IdentityProviderListItem {
            const data: IdentityProviderListItemData = {
                  id: model.id,
                  name: model.name,
                  slug: model.slug,
                  protocol: model.protocol,
                  enabledForAdmins: model.enabledForAdmins,
                  enabledForUsers: model.enabledForUsers,
                  isActive: model.isActive,
                  displayOrder: model.displayOrder,
                  iconUrl: model.iconUrl,
                  buttonColor: model.buttonColor,
                  createdAt: model.createdAt,
            };
            return new IdentityProviderListItem(data);
      }

      static fromListItemJsonToEntity(json: IdentityProviderListItemJson): IdentityProviderListItem {
            const model = IdentityProviderListItemModel.fromJson(json);
            return IdentityProviderMapper.toListItemEntity(model);
      }

      static toTestResultEntity(json: TestConnectionResultJson): TestConnectionResult {
            return new TestConnectionResult(
                  json.isSuccess,
                  json.message,
                  json.discoveredIssuer,
                  json.discoveredEndpoints,
            );
      }

      static toCreateJson(request: CreateIdentityProviderRequest) {
            return { ...request };
      }

      static toUpdateJson(request: UpdateIdentityProviderRequest) {
            return { ...request };
      }
}
