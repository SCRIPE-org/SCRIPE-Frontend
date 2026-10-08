/**
 * Documentation for module export
 */
export const en = {
  modules: {
    webhooks: {
      title: "Webhooks",
      description:
        "Gateway-independent webhook dispatcher featuring secure HMAC signatures and automatic exponential retry queues.",
      intro:
        "Asynchronous outbound webhook execution subsystem verifying payload integrity via HMAC-SHA256 headers with configurable backoff policies.",
      engineTitle: "Webhook Dispatch Engine",
      engineContent:
        "The webhook dispatch engine processes domain events asynchronously. It acts as an outbox consumer that listens for events, matches them against tenant webhook subscriptions, and queues them for delivery. The process is fully decoupled from the main HTTP request thread, ensuring that slow third-party servers do not affect platform performance.",
      payloadTitle: "Payload Structure & Format",
      payloadContent:
        "All webhook notifications sent by SCRIPE are HTTP POST requests containing a standard JSON payload envelope. The envelope contains metadata about the event, and the payload body inside 'data' contains the serialized state of the modified resource.",
      retryTitle: "Automatic Retry & Backoff",
      retryContent:
        "When an external webhook endpoint returns a non-2xx status code or times out, the dispatch engine queues it for retry. It uses an exponential backoff strategy to wait longer between subsequent attempts, preventing overwhelming the target server.",
      securityTitle: "HMAC-SHA256 Signature Security",
      securityContent:
        "To prevent spoofing attacks, all webhook requests include an X-Scripe-Signature header. This header contains the HMAC-SHA256 signature of the raw JSON request body, computed using the webhook's secret key. Receivers must compute the signature of the received body and compare it using a constant-time comparison helper.",
      signatureWarning:
        "Security Notice: Always verify webhook signatures before processing payloads to guarantee authenticity and prevent unauthorized access or spoofing.",
      registeringTitle: "Webhook Management APIs",
    },
  },
};
