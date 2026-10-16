/**
 * Media session service
 *
 * A recent backend fix gated `/api/files/*` behind JWT Bearer authentication
 * (see MiddlewarePipeline.cs). Native `<img>`/`<video>` tags never carry the
 * Bearer header — only the Axios interceptor attaches it — so any relative
 * file path rendered directly through that route now 401s deterministically.
 *
 * The backend's answer is DownloadsController's session pair:
 *   - POST /downloads/session  (auth + medias.view) → mints a short-lived
 *     { sessionId, expiresIn } for one file path.
 *   - GET  /downloads/session/{sessionId}  ([AllowAnonymous]) → streams the
 *     file with no Authorization header needed at all.
 *
 * This module mints sessions on demand and caches the resulting redemption
 * URL per file path (in-memory, TTL below the backend's session expiry) so
 * repeated renders of the same image/video don't re-mint a session per paint.
 */
import { getModuleApiService } from "@core/services/api-factory";
import { SYSTEM_ENDPOINTS } from "@core/config/api-endpoints";

interface CreateSessionResponse {
  sessionId: string;
  expiresIn: string;
}

interface CachedEntry {
  url: string;
  expiresAt: number;
}

/** Session lifetime requested from the backend. Kept short — this is minted
 *  freshly per file path and re-minted well before it would ever expire. */
const REQUESTED_EXPIRATION_HOURS = 1;

/** Cache TTL, comfortably under the requested backend expiration so a cached
 *  URL is never handed out after the session it points at has expired. */
const CACHE_TTL_MS = 50 * 60 * 1000;

const urlCache = new Map<string, CachedEntry>();
const inFlight = new Map<string, Promise<string | null>>();

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/** Same-origin API root, e.g. "http://localhost:5035/api" — the session
 *  redemption URL is a plain string handed to <img src>/<video src>, so it
 *  must be built without going through Axios. */
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "/api").trim().replace(/\/+$/, "");

function buildSessionUrl(sessionId: string): string {
  return `${API_ORIGIN}${SYSTEM_ENDPOINTS.DOWNLOADS.BY_SESSION(sessionId)}`;
}

/**
 * Resolve `filePath` to a URL an unauthenticated `<img>`/`<video>` tag can
 * load: mints (or reuses a cached) DownloadsController session and returns
 * the `/downloads/session/{id}` redemption URL.
 *
 * Returns the value unchanged when it is already an absolute http(s) URL
 * (e.g. a public cloud-storage/CDN URL, which never needed a session) and
 * `null` when the value is empty or session creation fails (caller falls
 * back to a placeholder — never to the old raw `/api/files` URL, since that
 * is the exact 401 this exists to fix).
 */
export function getSessionDownloadUrl(filePath: string | null | undefined): Promise<string | null> {
  if (!filePath) return Promise.resolve(null);
  if (isAbsoluteUrl(filePath)) return Promise.resolve(filePath);

  const cached = urlCache.get(filePath);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.url);
  }

  const pending = inFlight.get(filePath);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const api = getModuleApiService("MEDIA");
      const response = await api.post<CreateSessionResponse>(
        SYSTEM_ENDPOINTS.DOWNLOADS.CREATE_SESSION,
        { filePath, expirationHours: REQUESTED_EXPIRATION_HOURS }
      );
      const url = buildSessionUrl(response.sessionId);
      urlCache.set(filePath, { url, expiresAt: Date.now() + CACHE_TTL_MS });
      return url;
    } catch {
      // Caller degrades gracefully (existing onError handlers already hide
      // broken images) — never fall back to the raw gated URL here.
      return null;
    } finally {
      inFlight.delete(filePath);
    }
  })();

  inFlight.set(filePath, promise);
  return promise;
}

/** Clears the in-memory session cache. Exposed for tests only. */
export function __clearMediaSessionCacheForTests(): void {
  urlCache.clear();
  inFlight.clear();
}
