import { describe, it, expect } from "vitest";
import { getSafeCheckoutUrl } from "../viewmodels/hooks/useSignupProvisioning";

describe("Signup checkout URL safety", () => {
  it("enforces https-only Stripe checkout URLs in getSafeCheckoutUrl", () => {
    expect(getSafeCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test_123")).toBe(
      "https://checkout.stripe.com/c/pay/cs_test_123"
    );
    expect(getSafeCheckoutUrl("http://checkout.stripe.com/c/pay/cs_test_123")).toBeNull();
    expect(getSafeCheckoutUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeCheckoutUrl("//evil.com/checkout")).toBeNull();
    expect(getSafeCheckoutUrl("/checkout")).toBeNull();
  });
});
