import { base64UrlToBuffer } from "@core/services/webauthn.service";
import type { PasskeyEntity } from "../../domain/entities/PasskeyEntity";
import type {
  IPasskeyRepository,
  PasskeyBeginRegistrationOptions,
  PasskeyRegistrationCompletionMetadata,
} from "../../domain/interfaces/IPasskeyRepository";
import type { IPasskeyService } from "../../domain/interfaces/IPasskeyService";
import { PasskeyMapper } from "../mappers/PasskeyMapper";

/**
 * PasskeyRepository — Coordinates between the PasskeyService (HTTP)
 * and the PasskeyMapper (DTO → Entity conversion).
 *
 * Consumed by viewmodels via the DI container.
 */
export class PasskeyRepository implements IPasskeyRepository {
  constructor(private readonly service: IPasskeyService) {}

  async getAll(): Promise<PasskeyEntity[]> {
    const result = await this.service.getAll();
    return PasskeyMapper.toEntityList(result.items);
  }

  async beginRegistration(
    deviceName?: string,
    mode?: string
  ): Promise<PasskeyBeginRegistrationOptions> {
    const dto = await this.service.beginRegistration(deviceName, mode);

    const challenge = new Uint8Array(base64UrlToBuffer(dto.challenge));
    const resolvedUserId = dto.user?.id ?? dto.userId ?? "scripe-user";
    const userId = new Uint8Array(base64UrlToBuffer(resolvedUserId));

    const excludeCredentials: PublicKeyCredentialDescriptor[] = (dto.excludeCredentials ?? []).map(
      (cred) => ({
        type: cred.type as PublicKeyCredentialType,
        id: new Uint8Array(base64UrlToBuffer(cred.id)),
        transports: (cred.transports ?? []) as AuthenticatorTransport[],
      })
    );

    const rpId = dto.rp?.id ?? dto.rpId ?? "";
    const rpName = dto.rp?.name ?? dto.rpName ?? "SCRIPE Enterprise OS";
    const userName = dto.user?.name ?? dto.userName ?? "user@scripe.app";
    const userDisplayName = dto.user?.displayName ?? dto.userDisplayName ?? userName;

    return {
      challenge,
      rp: { id: rpId, name: rpName },
      user: {
        id: userId,
        name: userName,
        displayName: userDisplayName,
      },
      pubKeyCredParams: (dto.pubKeyCredParams ?? [{ type: "public-key", alg: -7 }]).map((p) => ({
        type: p.type as PublicKeyCredentialType,
        alg: p.alg,
      })),
      timeout: dto.timeout ?? 60000,
      attestation: (dto.attestation as AttestationConveyancePreference) ?? "none",
      authenticatorSelection: {
        authenticatorAttachment: dto.authenticatorSelection?.authenticatorAttachment as
          | AuthenticatorAttachment
          | undefined,
        residentKey: dto.authenticatorSelection?.residentKey as ResidentKeyRequirement | undefined,
        requireResidentKey: dto.authenticatorSelection?.requireResidentKey,
        userVerification: dto.authenticatorSelection?.userVerification as
          | UserVerificationRequirement
          | undefined,
      },
      excludeCredentials,
      challengeToken: dto.challengeToken,
      mode: dto.mode,
    };
  }

  async completeRegistration(
    deviceName: string,
    attestationResponse: {
      id: string;
      rawId: string;
      type: string;
      response: {
        attestationObject: string;
        clientDataJSON: string;
        transports?: string[] | null;
      };
      clientExtensionResults?: Record<string, unknown>;
    },
    metadata?: PasskeyRegistrationCompletionMetadata
  ): Promise<PasskeyEntity> {
    const dto = await this.service.completeRegistration({
      deviceName,
      attestationResponse,
      challengeToken: metadata?.challengeToken,
      attestationMode: metadata?.attestationMode,
      credentialIdBase64: metadata?.credentialIdBase64 ?? attestationResponse.rawId,
      transports: metadata?.transports ?? attestationResponse.response.transports,
      clientExtensionResults:
        metadata?.clientExtensionResults ?? attestationResponse.clientExtensionResults,
    });
    return PasskeyMapper.toEntity(dto);
  }

  async rename(id: string, newName: string): Promise<void> {
    await this.service.rename(id, { newName });
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }
}
