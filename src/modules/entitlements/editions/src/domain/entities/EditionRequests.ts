/**
 * Edition Request DTOs
 */
export interface CreateEditionRequest {
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      description?: string;
}

export interface UpdateEditionRequest {
      name?: string;
      displayNameEn?: string;
      displayNameAr?: string;
      description?: string;
}

export interface SetEditionFeatureRequest {
      value: string;
}
