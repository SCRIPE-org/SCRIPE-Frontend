export interface IResourceMediaService {
  uploadImage(file: File): Promise<{ url: string }>;
}
