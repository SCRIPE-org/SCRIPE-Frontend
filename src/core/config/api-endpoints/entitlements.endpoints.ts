import { V1 } from "./_shared";

export const ENTITLEMENTS_ENDPOINTS = {
  ENTITLEMENTS: {
    FEATURES: {
      LIST: `${V1}/features`,
      EFFECTIVE: `${V1}/features/effective`,
      BY_ID: (id: string) => `${V1}/features/${id}`,
      CREATE: `${V1}/features`,
      UPDATE: (id: string) => `${V1}/features/${id}`,
      DELETE: (id: string) => `${V1}/features/${id}`,
      GROUPED: `${V1}/features/grouped`,
    },
    EDITIONS: {
      LIST: `${V1}/editions`,
      BY_ID: (id: string) => `${V1}/editions/${id}`,
      CREATE: `${V1}/editions`,
      UPDATE: (id: string) => `${V1}/editions/${id}`,
      DELETE: (id: string) => `${V1}/editions/${id}`,
      SET_FEATURE: (editionId: string, featureId: string) =>
        `${V1}/editions/${editionId}/features/${featureId}`,
      VERSIONS: (editionId: string) => `${V1}/editions/${editionId}/versions`,
      CREATE_VERSION: (editionId: string) => `${V1}/editions/${editionId}/versions`,
      PUBLISH_VERSION: (editionId: string, versionId: string) =>
        `${V1}/editions/${editionId}/versions/${versionId}/publish`,
      CANCEL_VERSION: (editionId: string, versionId: string) =>
        `${V1}/editions/${editionId}/versions/${versionId}/cancel`,
      DIRECT_APPLY_FEATURES: (editionId: string) => `${V1}/editions/${editionId}/features/apply`,
      PRICES: (editionId: string) => `${V1}/editions/${editionId}/prices`,
      SET_PRICES: (editionId: string) => `${V1}/editions/${editionId}/prices`,
      // ── Promotions ──
      PROMOTIONS: (editionId: string) => `${V1}/editions/${editionId}/promotions`,
      CREATE_PROMOTION: (editionId: string) => `${V1}/editions/${editionId}/promotions`,
      UPDATE_PROMOTION: (editionId: string, promoId: string) =>
        `${V1}/editions/${editionId}/promotions/${promoId}`,
      DELETE_PROMOTION: (editionId: string, promoId: string) =>
        `${V1}/editions/${editionId}/promotions/${promoId}`,
      VALIDATE_PROMO_CODE: (editionId: string) =>
        `${V1}/editions/${editionId}/promotions/validate-code`,
    },
    TENANT_FEATURES: {
      OVERRIDES: (tenantId: string) => `${V1}/tenants/${tenantId}/features/overrides`,
      RESOLVED: (tenantId: string) => `${V1}/tenants/${tenantId}/features/resolved`,
      SET_OVERRIDE: (tenantId: string, featureId: string) =>
        `${V1}/tenants/${tenantId}/features/${featureId}`,
      REMOVE_OVERRIDE: (tenantId: string, featureId: string) =>
        `${V1}/tenants/${tenantId}/features/${featureId}`,
    },
    SUBSCRIPTIONS: {
      LIST_ALL: `${V1}/subscriptions`,
      ASSIGN: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription`,
      CHANGE: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription`,
      RENEW: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/renew`,
      CONVERT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/convert`,
      SUSPEND: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/suspend`,
      RESUME: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/resume`,
      CANCEL: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/cancel`,
      RESYNC: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/resync`,
      LIST_BY_TENANT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscriptions`,
      GET_BY_ID: (id: string) => `${V1}/subscriptions/${id}`,
      REVOKE: (id: string) => `${V1}/subscriptions/${id}`,
      CHANGE_CURRENCY: (tenantId: string) =>
        `${V1}/tenants/${tenantId}/subscription/change-currency`,
      DOWNGRADE_IMPACT: (tenantId: string, targetEditionId: string) =>
        `${V1}/tenants/${tenantId}/subscription/downgrade-impact?targetEditionId=${targetEditionId}`,
      EXPORT: (
        format: string,
        status?: string,
        type?: string,
        currency?: string,
        dateFrom?: string,
        dateTo?: string,
        expiringInDays?: number,
        edition?: string
      ) => {
        const params = new URLSearchParams({ format });
        if (status && status !== "all") params.set("status", status);
        if (type && type !== "all") params.set("type", type);
        if (currency) params.set("currency", currency);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        if (expiringInDays && expiringInDays > 0)
          params.set("expiringInDays", expiringInDays.toString());
        if (edition && edition !== "all") params.set("edition", edition);
        return `${V1}/subscriptions/export?${params.toString()}`;
      },
      RECEIPT: (tenantId: string) => `${V1}/tenants/${tenantId}/subscription/receipt`,
    },
    PRICING: {
      PREVIEW: (editionId: string, currency: string, type: string) =>
        `${V1}/editions/${editionId}/prices/preview?currency=${currency}&type=${type}`,
      OVERRIDE_COST_SET: (overrideId: string) => `${V1}/overrides/${overrideId}/cost`,
      OVERRIDE_COST_REMOVE: (overrideId: string) => `${V1}/overrides/${overrideId}/cost`,
    },
    CURRENCY: {
      RATES: (baseCurrency: string = "USD") => `${V1}/currency/rates?baseCurrency=${baseCurrency}`,
      SUPPORTED: `${V1}/currency/supported`,
      REFRESH: `${V1}/currency/rates/refresh`,
      LAST_UPDATED: `${V1}/currency/rates/last-updated`,
    },
    BILLING: {
      INVOICES: {
        LIST: `${V1}/invoices`,
        BY_ID: (id: string) => `${V1}/invoices/${id}`,
        TRANSACTIONS: `${V1}/invoices/transactions`,
        PDF: (id: string) => `${V1}/invoices/${id}/pdf`,
        SEND_EMAIL: (id: string) => `${V1}/invoices/${id}/send-email`,
      },
      CHECKOUT: (tenantId: string) => `${V1}/billing/tenants/${tenantId}/checkout`,
      PORTAL: (tenantId: string) => `${V1}/billing/tenants/${tenantId}/portal`,
      CANCEL_GATEWAY: (tenantId: string) => `${V1}/billing/tenants/${tenantId}/cancel-gateway`,
      /** @deprecated Use CANCEL_GATEWAY instead */
      CANCEL_STRIPE: (tenantId: string) => `${V1}/billing/tenants/${tenantId}/cancel-gateway`,
      PAYMENT_LINK: (tenantId: string) => `${V1}/billing/tenants/${tenantId}/payment-link`,
      DASHBOARD: `${V1}/billing/dashboard`,
      // ── Payment Gateway Management ──
      GATEWAYS: {
        BASE: `${V1}/payment-gateways`,
        STATUS: (gateway: string) => `${V1}/payment-gateways/${gateway}`,
        TEST_CONNECTION: (gateway: string) => `${V1}/payment-gateways/${gateway}/test-connection`,
        TOGGLE: (gateway: string) => `${V1}/payment-gateways/${gateway}/toggle`,
      },
    },
    // ===== TENANT PLANS (Tier 2 — User-Level Subscriptions) =====
    TENANT_PLANS: {
      LIST: `${V1}/tenant-plans`,
      BY_ID: (id: string) => `${V1}/tenant-plans/${id}`,
      CREATE: `${V1}/tenant-plans`,
      UPDATE: (id: string) => `${V1}/tenant-plans/${id}`,
      DELETE: (id: string) => `${V1}/tenant-plans/${id}`,
      PUBLISH: (id: string) => `${V1}/tenant-plans/${id}/publish`,
      ARCHIVE: (id: string) => `${V1}/tenant-plans/${id}/archive`,
    },
    // ===== TENANT FEATURE DEFINITIONS (Tier 2 Feature Catalog) =====
    TENANT_FEATURE_DEFINITIONS: {
      LIST: `${V1}/tenant-feature-definitions`,
      ACTIVE: `${V1}/tenant-feature-definitions/active`,
      ACTIVE_GROUPED: `${V1}/tenant-feature-definitions/active/grouped`,
      BY_ID: (id: string) => `${V1}/tenant-feature-definitions/${id}`,
      CREATE: `${V1}/tenant-feature-definitions`,
      UPDATE: (id: string) => `${V1}/tenant-feature-definitions/${id}`,
      DELETE: (id: string) => `${V1}/tenant-feature-definitions/${id}`,
    },
    // ===== TENANT PLAN PROMOTIONS (Tier 2 Promo Codes) =====
    TENANT_PLAN_PROMOTIONS: {
      LIST: `${V1}/tenant-plan-promotions`,
      BY_ID: (id: string) => `${V1}/tenant-plan-promotions/${id}`,
      CREATE: `${V1}/tenant-plan-promotions`,
      UPDATE: (id: string) => `${V1}/tenant-plan-promotions/${id}`,
      DELETE: (id: string) => `${V1}/tenant-plan-promotions/${id}`,
      VALIDATE: `${V1}/tenant-plan-promotions/validate`,
    },
    // ===== USER SUBSCRIPTIONS (Tier 2)  =====
    USER_SUBSCRIPTIONS: {
      LIST: `${V1}/user-subscriptions`,
      BY_ID: (id: string) => `${V1}/user-subscriptions/${id}`,
      CREATE: `${V1}/user-subscriptions`,
      CANCEL: (id: string) => `${V1}/user-subscriptions/${id}/cancel`,
      RENEW: (id: string) => `${V1}/user-subscriptions/${id}/renew`,
      ME: `${V1}/user-subscriptions/me`,
      CHANGE_PLAN: (id: string) => `${V1}/user-subscriptions/${id}/change-plan`,
    },
    // ===== STRIPE CONNECT (Phase 10) =====
    STRIPE_CONNECT: {
      ACCOUNTS: {
        LIST: `${V1}/stripe-connect/accounts`,
        ELIGIBLE_TENANTS: `${V1}/stripe-connect/accounts/eligible-tenants`,
        BY_ID: (tenantId: string) => `${V1}/stripe-connect/accounts/${tenantId}`,
        CREATE: `${V1}/stripe-connect/accounts`,
        REFRESH_LINK: (tenantId: string) =>
          `${V1}/stripe-connect/accounts/${tenantId}/refresh-link`,
        DASHBOARD_LINK: (tenantId: string) =>
          `${V1}/stripe-connect/accounts/${tenantId}/dashboard-link`,
        COMMISSION_RATE: (tenantId: string) =>
          `${V1}/stripe-connect/accounts/${tenantId}/commission-rate`,
      },
      COMMISSIONS: {
        LIST: `${V1}/commissions`,
        BY_TENANT: (tenantId: string) => `${V1}/commissions/tenants/${tenantId}`,
        DASHBOARD: `${V1}/commissions/dashboard`,
        TRENDS: `${V1}/commissions/trends`,
        TOP_TENANTS: `${V1}/commissions/top-tenants`,
      },
      TENANT_STRIPE_CONNECT: {
        STATUS: `${V1}/tenant-stripe-connect/status`,
        ONBOARD: `${V1}/tenant-stripe-connect/onboard`,
        REFRESH_LINK: `${V1}/tenant-stripe-connect/refresh-link`,
        DASHBOARD_LINK: `${V1}/tenant-stripe-connect/dashboard`,
        TRANSACTIONS: `${V1}/tenant-stripe-connect/transactions`,
        SYNC: `${V1}/tenant-stripe-connect/sync`,
      },
      COMMISSION_LEDGER: {
        LIST: `${V1}/commission-ledger`,
      },
      COMMISSION_INVOICES: {
        LIST: `${V1}/commission-invoices`,
        RETRY_CHARGE: (id: string) => `${V1}/commission-invoices/${id}/retry-charge`,
        WAIVE: (id: string) => `${V1}/commission-invoices/${id}/waive`,
      },
    },
    // ===== PLATFORM STRIPE DASHBOARD (System Admin) =====
    PLATFORM_STRIPE: {
      DASHBOARD: `${V1}/platform-stripe/dashboard`,
    },
    // ===== REVENUE ANALYTICS (Phase 11) =====
    ANALYTICS: {
      OVERVIEW: `${V1}/analytics/overview`,
      MRR_MOVEMENT: `${V1}/analytics/mrr-movement`,
      COHORT: `${V1}/analytics/cohort`,
      LTV: `${V1}/analytics/ltv`,
      FORECAST: `${V1}/analytics/forecast`,
      HEALTH_SCORES: `${V1}/analytics/health`,
      HEALTH_BY_ID: (tenantId: string) => `${V1}/analytics/health/${tenantId}`,
      REPORT_PREFERENCES: `${V1}/analytics/report-preference`,
      EXPORT: `${V1}/analytics/export`,
      GENERATE_REPORT: `${V1}/analytics/generate-report`,
    },
    // ===== SELF-SERVICE: My Tenant Subscription =====
    MY_SUBSCRIPTION: {
      GET: `${V1}/subscriptions/my-tenant`,
    },
    // ===== TENANT PAYMENT GATEWAYS (Tier 2 — self-service gateway config) =====
    TENANT_GATEWAYS: {
      LIST: `${V1}/tenant-gateways`,
      CONFIGURE: `${V1}/tenant-gateways`,
      VERIFY: (gatewayType: string) => `${V1}/tenant-gateways/${gatewayType}/verify`,
      REMOVE: (gatewayType: string) => `${V1}/tenant-gateways/${gatewayType}`,
    },
  },
};
