import type { IApiService } from "@core/interfaces/api.interface";
import { SYSTEM_ENDPOINTS } from "@core/config/api-endpoints";
import type { IResourceMediaService } from "../../domain/interfaces/IResourceMediaService";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico"];

export class ResourceMediaService implements IResourceMediaService {
  constructor(private readonly api: IApiService) {}

  async uploadImage(file: File): Promise<{ url: string }> {
    if (!file) {
      throw new Error("No file provided.");
    }

    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("File exceeds 2 MB limit.");
    }

    const name = file.name || "";
    const dotIdx = name.lastIndexOf(".");
    const ext = dotIdx >= 0 ? name.slice(dotIdx).toLowerCase() : "";

    if (!ALLOWED_EXTENSIONS.includes(ext) && !file.type.startsWith("image/")) {
      throw new Error(`File type '${ext}' is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
    }

    const formData = new FormData();
    formData.append("file", file);

    const result = await this.api.post<{ url: string }>(
      SYSTEM_ENDPOINTS.UPLOADS.IMAGE,
      formData
    );

    return result;
  }
}
