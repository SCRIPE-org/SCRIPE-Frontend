/** Route-group fallback for the (auth) surfaces — the Relay vault stage
 * with a calm three-dot pulse, matching LoginView's own hydration gate so an
 * auth page never falls through to a plain white/blank flash while loading. */
export default function AuthLoading() {
  return (
    <div
      className="scripe-auth-stage flex min-h-screen w-full items-center justify-center"
      aria-hidden="true"
    >
      <div className="flex gap-1.5">
        <span
          className="h-2 w-2 animate-pulse rounded-full"
          style={{ background: "var(--scripe-signal, #C6FF00)", animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 animate-pulse rounded-full"
          style={{ background: "var(--scripe-signal, #C6FF00)", animationDelay: "150ms" }}
        />
        <span
          className="h-2 w-2 animate-pulse rounded-full"
          style={{ background: "var(--scripe-signal, #C6FF00)", animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
