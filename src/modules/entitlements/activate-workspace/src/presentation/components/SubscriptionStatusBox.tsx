import React from "react";

interface SubscriptionStatusBoxProps {
  subscription: any;
  tokens: any;
  isRtl: boolean;
}

export function SubscriptionStatusBox({ subscription, tokens, isRtl }: SubscriptionStatusBoxProps) {
  if (!subscription) return null;

  return (
    <div
      className="rounded-xl border p-4 space-y-2 text-sm"
      style={{
        background: tokens.surfaceRaised,
        borderColor: tokens.border,
      }}
    >
      <div className="flex justify-between items-center border-b pb-2 mb-2" style={{ borderColor: tokens.border }}>
        <span className="font-medium" style={{ color: tokens.inkMuted }}>
          {isRtl ? "الخطة المحددة:" : "Selected Plan:"}
        </span>
        <span className="font-semibold text-base" style={{ color: tokens.accent }}>
          {subscription.editionName}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span style={{ color: tokens.inkGhost }}>{isRtl ? "نوع الفوترة:" : "Billing cycle:"}</span>
        <span className="font-medium" style={{ color: tokens.inkMuted }}>
          {subscription.type === "Monthly" ? (isRtl ? "شهري" : "Monthly") : (isRtl ? "سنوي" : "Yearly")}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span style={{ color: tokens.inkGhost }}>{isRtl ? "العملة:" : "Currency:"}</span>
        <span className="font-medium uppercase" style={{ color: tokens.inkMuted }}>
          {subscription.currency}
        </span>
      </div>
    </div>
  );
}
