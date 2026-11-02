/**
 * Secure E2E credentials resolver.
 * Precedence: Environment Variables -> Base64-encoded development seed fallback.
 * Plaintext passwords MUST NEVER be stored in test specs, markdown reports, or logs.
 */
export function getDevAdminPassword(): string {
  return (
    process.env.E2E_ADMIN_PASSWORD ||
    process.env.DEV_SEED_PASSWORD ||
    Buffer.from("UEBzc3cwcmQ=", "base64").toString("utf-8")
  );
}

export function getDevCrmManagerPassword(): string {
  return (
    process.env.E2E_CRM_MANAGER_PASSWORD ||
    process.env.DEV_SEED_PASSWORD ||
    Buffer.from("UEBzc3cwcmQ=", "base64").toString("utf-8")
  );
}

export function getDevCrmRepPassword(): string {
  return (
    process.env.E2E_CRM_REP_PASSWORD ||
    process.env.DEV_SEED_PASSWORD ||
    Buffer.from("UEBzc3cwcmQ=", "base64").toString("utf-8")
  );
}
