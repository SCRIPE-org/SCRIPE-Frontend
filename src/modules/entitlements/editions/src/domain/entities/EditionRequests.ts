/**
 * Edition Request DTOs
 */
export interface CreateEditionRequest {
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      description?: string;
      fallbackEditionId?: string;
}

export interface UpdateEditionRequest {
      name?: string;
      displayNameEn?: string;
      displayNameAr?: string;
      description?: string;
      fallbackEditionId?: string;
}

export interface SetEditionFeatureRequest {
      value: string;
}
