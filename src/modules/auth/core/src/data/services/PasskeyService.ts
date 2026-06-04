import type { IApiService } from "@core/interfaces/api.interface";
import { AUTH_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  IPasskeyService,
  PasskeyListResponseDto,
  PasskeyRegistrationOptionsResponseDto,
  PasskeyResponseDto,
  PasskeyCompleteRegistrationRequestDto,
  PasskeyRenameRequestDto,
} from "../../domain/interfaces/IPasskeyService";

/**
 * PasskeyService — HTTP calls to the Passkey/WebAuthn API.
 *
 * Uses IApiService (authenticated) for all requests.
 * This is a data-layer service — never imported in presentation.
 */
export class PasskeyService implements IPasskeyService {
  constructor(private readonly api: IApiService) {}

  async getAll(): Promise<PasskeyListResponseDto> {
    const items = await this.api.get<PasskeyResponseDto[]>(AUTH_ENDPOINTS.AUTH.PASSKEY.LIST);
    return { items: items ?? [] };
  }

  async beginRegistration(): Promise<PasskeyRegistrationOptionsResponseDto> {
    return this.api.post<PasskeyRegistrationOptionsResponseDto>(
      AUTH_ENDPOINTS.AUTH.PASSKEY.REGISTER_BEGIN,
      {}
    );
  }

  async completeRegistration(
    request: PasskeyCompleteRegistrationRequestDto
  ): Promise<PasskeyResponseDto> {
    return this.api.post<PasskeyResponseDto>(AUTH_ENDPOINTS.AUTH.PASSKEY.REGISTER_VERIFY, request);
  }

  async rename(id: string, request: PasskeyRenameRequestDto): Promise<void> {
    // PATCH or PUT to rename — use the list endpoint with ID
    await this.api.put(`${AUTH_ENDPOINTS.AUTH.PASSKEY.LIST}/${id}/name`, request);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(AUTH_ENDPOINTS.AUTH.PASSKEY.DELETE(id));
  }
}
