/**
 * OAuth Application Mapper
 *
 * Converts between OAuth App Models (DTOs) and Entities (Domain).
 *
 * @module oauth-apps/data
 */
import {
      OAuthApp,
      OAuthAppListItem,
      RegenerateSecretResult,
      CreateOAuthAppResponse,
      type OAuthAppData,
      type OAuthAppListItemData,
      type CreateOAuthAppRequest,
      type UpdateOAuthAppRequest,
} from "../../domain/entities/OAuthApp";
import {
      OAuthAppModel,
      OAuthAppListItemModel,
      type OAuthAppJson,
      type OAuthAppListItemJson,
      type RegenerateSecretResultJson,
      type CreateOAuthAppResponseJson,
} from "../models/OAuthAppModel";
import { resolveFileUrl, unresolveFileUrl } from "@core/common/utils";

export class OAuthAppMapper {
      static toEntity(model: OAuthAppModel): OAuthApp {
            const data: OAuthAppData = {
                  id: model.id,
                  displayName: model.displayName,
                  clientId: model.clientId,
                  clientType: model.clientType,
                  redirectUrisJson: model.redirectUrisJson,
                  postLogoutRedirectUrisJson: model.postLogoutRedirectUrisJson,
                  allowedScopes: model.allowedScopes,
                  allowedGrantTypes: model.allowedGrantTypes,
                  tenantId: model.tenantId,
                  requireConsent: model.requireConsent,
                  requirePkce: model.requirePkce,
                  logoUri: resolveFileUrl(model.logoUri),
                  samlAcsUrl: model.samlAcsUrl,
                  samlSpEntityId: model.samlSpEntityId,
                  description: model.description,
                  accessTokenLifetimeMinutes: model.accessTokenLifetimeMinutes,
                  refreshTokenLifetimeDays: model.refreshTokenLifetimeDays,
                  isActive: model.isActive,
                  createdAt: model.createdAt,
                  modifiedAt: model.modifiedAt,
            };
            return new OAuthApp(data);
      }

      static fromJsonToEntity(json: OAuthAppJson): OAuthApp {
            const model = OAuthAppModel.fromJson(json);
            return OAuthAppMapper.toEntity(model);
      }

      static toListItemEntity(model: OAuthAppListItemModel): OAuthAppListItem {
            const data: OAuthAppListItemData = {
                  id: model.id,
                  displayName: model.displayName,
                  clientId: model.clientId,
                  clientType: model.clientType,
                  allowedScopes: model.allowedScopes,
                  allowedGrantTypes: model.allowedGrantTypes,
                  isActive: model.isActive,
                  requirePkce: model.requirePkce,
                  logoUri: resolveFileUrl(model.logoUri),
                  description: model.description,
                  createdAt: model.createdAt,
            };
            return new OAuthAppListItem(data);
      }

      static fromListItemJsonToEntity(json: OAuthAppListItemJson): OAuthAppListItem {
            const model = OAuthAppListItemModel.fromJson(json);
            return OAuthAppMapper.toListItemEntity(model);
      }

      static toRegenerateSecretEntity(json: RegenerateSecretResultJson): RegenerateSecretResult {
            return new RegenerateSecretResult(json.clientId, json.newClientSecret);
      }

      static toCreateResponseEntity(json: CreateOAuthAppResponseJson): CreateOAuthAppResponse {
            return new CreateOAuthAppResponse(json.id, json.clientId, json.clientSecret);
      }

      static toCreateJson(request: CreateOAuthAppRequest) {
            return {
                  ...request,
                  logoUri: unresolveFileUrl(request.logoUri),
            };
      }

      static toUpdateJson(request: UpdateOAuthAppRequest) {
            return {
                  ...request,
                  logoUri: unresolveFileUrl(request.logoUri),
            };
      }
}
