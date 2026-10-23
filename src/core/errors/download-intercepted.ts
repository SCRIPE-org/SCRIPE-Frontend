/**
 * DownloadInterceptedError
 *
 * Thrown by ApiService blob-download methods when an external download manager
 * (IDM, FDM, etc.) intercepts a request and aborts its network transfer.
 *
 * When IDM or any download manager intercepts a file download, the browser's
 * network request is aborted mid-stream, which triggers:
 *   - Axios: error.code === 'ERR_CANCELED' or error.message === 'canceled'
 *   - Fetch:  error.name === 'AbortError'
 *   - DOM:    error.code === 20 (DOMException ABORT_ERR)
 *
 * These shapes overlap with a user-initiated AbortSignal cancellation. The API
 * service only treats them as download interception for blob responses when
 * the caller did not abort the request. A caller cancellation remains an error
 * so UI flows can stop work without falsely reporting download success.
 *
 * Usage:
 *   try {
 *     const blob = await apiService.getBlob(url);
 *     // ... save file
 *   } catch (err) {
 *     if (err instanceof DownloadInterceptedError) {
 *       showSuccess("Captured by your download manager");
 *     } else {
 *       showError("Download failed");
 *     }
 *   }
 */
export class DownloadInterceptedError extends Error {
  public readonly intercepted = true;

  constructor() {
    super("Download intercepted by external download manager");
    this.name = "DownloadInterceptedError";
    Object.setPrototypeOf(this, DownloadInterceptedError.prototype);
  }
}

/**
 * Check whether an error has a shape used by external download-manager
 * interception. Callers must scope this check to blob downloads and preserve
 * any caller-initiated AbortSignal cancellation.
 */
export function isExternalAbort(error: unknown): boolean {
  // DOMException AbortError (Fetch API)
  if (error instanceof DOMException && error.name === "AbortError") return true;
  // DOMException ABORT_ERR code (legacy)
  if (error instanceof DOMException && error.code === 20) return true;

  // Axios specific checks
  if (typeof error === "object" && error !== null) {
    const errObj = error as { code?: string; message?: string; config?: { responseType?: string } };

    // Axios uses ECONNABORTED for request timeouts as well as some adapters'
    // aborts. Treating it as interception can make a failed download look
    // successful to consumers, so only the explicit cancellation code qualifies.
    if (errObj.code === "ERR_CANCELED") return true;
    if (errObj.message?.toLowerCase() === "canceled") return true;

    // IDM Advanced Integration specifically causes a "CORS error" in the browser
    // when it intercepts the stream, which surfaces in Axios as ERR_NETWORK.
    // We only treat ERR_NETWORK as an intercept if the request was expecting a blob (i.e. download).
    if (errObj.code === "ERR_NETWORK" && errObj.config?.responseType === "blob") {
      return true;
    }
  }

  return false;
}
