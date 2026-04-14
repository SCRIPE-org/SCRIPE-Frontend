/**
 * DownloadInterceptedError
 *
 * Thrown by ApiService.getBlob() when the browser's XHR/fetch is aborted
 * by an external download manager (IDM, FDM, etc.).
 *
 * When IDM or any download manager intercepts a file download, the browser's
 * network request is aborted mid-stream, which triggers:
 *   - Axios: error.code === 'ERR_CANCELED' or error.message === 'canceled'
 *   - Fetch:  error.name === 'AbortError'
 *   - DOM:    error.code === 20 (DOMException ABORT_ERR)
 *   - Axios:  error.code === 'ECONNABORTED'
 *
 * All of these mean the file WAS captured by the download manager.
 * Callers should treat this as a success, not an error.
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
 * Check if an error was caused by an external download manager
 * intercepting the browser's network request.
 */
export function isExternalAbort(error: unknown): boolean {
  // DOMException AbortError (Fetch API)
  if (error instanceof DOMException && error.name === "AbortError") return true;
  // DOMException ABORT_ERR code (legacy)
  if (error instanceof DOMException && error.code === 20) return true;

  // Axios specific checks
  if (typeof error === "object" && error !== null) {
    const errObj = error as { code?: string; message?: string; config?: { responseType?: string } };

    // Standard aborts
    if (errObj.code === "ERR_CANCELED" || errObj.code === "ECONNABORTED") return true;
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
