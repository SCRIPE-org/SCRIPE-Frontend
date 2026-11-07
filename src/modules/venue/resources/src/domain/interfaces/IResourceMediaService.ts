export interface IResourceMediaService {
  uploadImage(file: File, ownerEntityId?: string): Promise<{ url: string }>;
}
