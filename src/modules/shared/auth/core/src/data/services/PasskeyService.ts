import type { IApiService } from "@core/interfaces/api.interface";
import type {
  IPasskeyService,
  PasskeyListResponseDto,
  PasskeyRegistrationOptionsResponseDto,
  PasskeyResponseDto,
  PasskeyCompleteRegistrationRequestDto,
  PasskeyRenameRequestDto,
} from "../../domain/interfaces/IPasskeyService";
import { AUTH_CORE_ENDPOINTS } from "../../../data/services/auth-core.endpoints";

/**
 * PasskeyService — HTTP calls to the Passkey/WebAuthn API.
 *
 * Uses IApiService (authenticated) for all requests.
 * This is a data-layer service — never imported in presentation.
 */
export class PasskeyService implements IPasskeyService {
  constructor(private readonly api: IApiService) {}

  async getAll(): Promise<PasskeyListResponseDto> {
    const items = await this.api.get<PasskeyResponseDto[]>(AUTH_CORE_ENDPOINTS.PASSKEY.LIST);
    return { items: items ?? [] };
  }

  async beginRegistration(): Promise<PasskeyRegistrationOptionsResponseDto> {
    return this.api.post<PasskeyRegistrationOptionsResponseDto>(
      AUTH_CORE_ENDPOINTS.PASSKEY.REGISTER_BEGIN,
      {}
    );
  }

  async completeRegistration(
    request: PasskeyCompleteRegistrationRequestDto
  ): Promise<PasskeyResponseDto> {
    const backendBody = {
      attestationObjectBase64: request.attestationResponse.response.attestationObject,
      clientDataJsonBase64: request.attestationResponse.response.clientDataJSON,
      deviceName: request.deviceName,
      transports: null,
    };
    return this.api.post<PasskeyResponseDto>(
      AUTH_CORE_ENDPOINTS.PASSKEY.REGISTER_VERIFY,
      backendBody as any
    );
  }

  async rename(id: string, request: PasskeyRenameRequestDto): Promise<void> {
    // PATCH or PUT to rename — use the list endpoint with ID
    await this.api.put(`${AUTH_CORE_ENDPOINTS.PASSKEY.LIST}/${id}/name`, request);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(AUTH_CORE_ENDPOINTS.PASSKEY.DELETE(id));
  }
}
