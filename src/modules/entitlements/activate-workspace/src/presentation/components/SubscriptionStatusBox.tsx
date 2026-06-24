import React from "react";

interface SubscriptionStatusBoxProps {
  subscription: any;
  tokens: any;
  isRtl: boolean;
}

/**
 * React presentation component representing the subscription status box UI element.
 */
export function SubscriptionStatusBox({ subscription, tokens, isRtl }: SubscriptionStatusBoxProps) {
  if (!subscription) return null;

  return (
    <div
      className="space-y-2 rounded-xl border p-4 text-sm"
      style={{
        background: tokens.surfaceRaised,
        borderColor: tokens.border,
      }}
    >
      <div
        className="mb-2 flex items-center justify-between border-b pb-2"
        style={{ borderColor: tokens.border }}
      >
        <span className="font-medium" style={{ color: tokens.inkMuted }}>
          {isRtl ? "الخطة المحددة:" : "Selected Plan:"}
        </span>
        <span className="text-base font-semibold" style={{ color: tokens.accent }}>
          {subscription.editionName}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span style={{ color: tokens.inkGhost }}>{isRtl ? "نوع الفوترة:" : "Billing cycle:"}</span>
        <span className="font-medium" style={{ color: tokens.inkMuted }}>
          {subscription.type === "Monthly"
            ? isRtl
              ? "شهري"
              : "Monthly"
            : isRtl
              ? "سنوي"
              : "Yearly"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span style={{ color: tokens.inkGhost }}>{isRtl ? "العملة:" : "Currency:"}</span>
        <span className="font-medium uppercase" style={{ color: tokens.inkMuted }}>
          {subscription.currency}
        </span>
      </div>
    </div>
  );
}
