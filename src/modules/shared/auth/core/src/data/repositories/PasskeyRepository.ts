import type { PasskeyEntity } from "../../domain/entities/PasskeyEntity";
import type { IPasskeyRepository } from "../../domain/interfaces/IPasskeyRepository";
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

  async beginRegistration(): Promise<PublicKeyCredentialCreationOptions> {
    const dto = await this.service.beginRegistration();

    // Convert string-based DTO to the Web API's PublicKeyCredentialCreationOptions
    const challenge = Uint8Array.from(atob(dto.challenge), (c) => c.charCodeAt(0));
    const userId = Uint8Array.from(atob(dto.user.id), (c) => c.charCodeAt(0));

    const excludeCredentials: PublicKeyCredentialDescriptor[] = (dto.excludeCredentials ?? []).map(
      (cred) => ({
        type: cred.type as PublicKeyCredentialType,
        id: Uint8Array.from(atob(cred.id), (c) => c.charCodeAt(0)),
        transports: (cred.transports ?? []) as AuthenticatorTransport[],
      })
    );

    return {
      challenge,
      rp: { id: dto.rp.id, name: dto.rp.name },
      user: {
        id: userId,
        name: dto.user.name,
        displayName: dto.user.displayName,
      },
      pubKeyCredParams: dto.pubKeyCredParams.map((p) => ({
        type: p.type as PublicKeyCredentialType,
        alg: p.alg,
      })),
      timeout: dto.timeout,
      attestation: (dto.attestation as AttestationConveyancePreference) ?? "none",
      authenticatorSelection: {
        authenticatorAttachment: dto.authenticatorSelection.authenticatorAttachment as
          AuthenticatorAttachment | undefined,
        residentKey: dto.authenticatorSelection.residentKey as ResidentKeyRequirement | undefined,
        requireResidentKey: dto.authenticatorSelection.requireResidentKey,
        userVerification: dto.authenticatorSelection.userVerification as
          UserVerificationRequirement | undefined,
      },
      excludeCredentials,
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
      };
    }
  ): Promise<PasskeyEntity> {
    const dto = await this.service.completeRegistration({
      deviceName,
      attestationResponse,
    });
    return PasskeyMapper.toEntity(dto);
  }

  async rename(id: string, newName: string): Promise<void> {
    await this.service.rename(id, { name: newName });
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }
}
