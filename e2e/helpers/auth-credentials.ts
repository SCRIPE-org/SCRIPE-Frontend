/**
 * Secure E2E credentials resolver.
 * Precedence: Environment Variables strictly.
 * Plaintext passwords MUST NEVER be stored in test specs, markdown reports, or code.
 */
export function getDevAdminPassword(): string {
  const pwd =
    process.env.E2E_ADMIN_PASSWORD ||
    process.env.E2E_AHLY_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    process.env.DEV_SEED_PASSWORD;
  if (!pwd) {
    throw new Error(
      "E2E admin password not configured. Set E2E_ADMIN_PASSWORD, E2E_AHLY_ADMIN_PASSWORD, ADMIN_PASSWORD, or DEV_SEED_PASSWORD in your environment."
    );
  }
  return pwd;
}

export function getDevCrmManagerPassword(): string {
  const pwd =
    process.env.E2E_CRM_MANAGER_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    process.env.DEV_SEED_PASSWORD;
  if (!pwd) {
    throw new Error(
      "E2E CRM manager password not configured. Set E2E_CRM_MANAGER_PASSWORD, ADMIN_PASSWORD, or DEV_SEED_PASSWORD in your environment."
    );
  }
  return pwd;
}

export function getDevCrmRepPassword(): string {
  const pwd =
    process.env.E2E_CRM_REP_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    process.env.DEV_SEED_PASSWORD;
  if (!pwd) {
    throw new Error(
      "E2E CRM rep password not configured. Set E2E_CRM_REP_PASSWORD, ADMIN_PASSWORD, or DEV_SEED_PASSWORD in your environment."
    );
  }
  return pwd;
}
