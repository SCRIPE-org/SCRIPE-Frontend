"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";

interface Props {
  expiresAtUtc: string;
  asOfUtc: string;
  locale: string;
  timeZoneId: string;
  confirming: boolean;
  canConfirm: boolean;
  actionError: "expired" | "conflict" | "failed" | null;
  t: (key: string, values?: Record<string, string | number>) => string;
  onConfirm: () => void;
  onExpired: () => void;
}

function secondsBetween(expiresAtUtc: string, now: number): number {
  return Math.max(0, Math.ceil((Date.parse(expiresAtUtc) - now) / 1000));
}

export function BookingHoldState(props: Props) {
  const { asOfUtc, expiresAtUtc, onExpired } = props;
  const [remaining, setRemaining] = useState(() => secondsBetween(props.expiresAtUtc, Date.parse(props.asOfUtc)));
  useEffect(() => {
    let reported = false;
    const serverAnchor = Date.parse(asOfUtc);
    const clientAnchor = Date.now();
    const update = () => {
      const elapsed = Math.max(0, Date.now() - clientAnchor);
      const value = secondsBetween(expiresAtUtc, serverAnchor + elapsed);
      setRemaining(value);
      if (value === 0 && !reported) {
        reported = true;
        onExpired();
      }
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [asOfUtc, expiresAtUtc, onExpired]);
  const expiry = new Intl.DateTimeFormat(props.locale, {
    dateStyle: "medium", timeStyle: "short", timeZone: props.timeZoneId,
  }).format(new Date(props.expiresAtUtc));

  return (
    <div className="space-y-4">
      <Alert variant="warning">
        <Clock3 aria-hidden="true" />
        <AlertTitle>{props.t("booking360.hold.active")}</AlertTitle>
        <AlertDescription>
          <p>{props.t("booking360.hold.expires", { time: expiry })}</p>
          <p>{props.t("booking360.hold.remaining", { minutes: Math.floor(remaining / 60), seconds: remaining % 60 })}</p>
        </AlertDescription>
      </Alert>
      {props.actionError && (
        <Alert variant={props.actionError === "failed" ? "destructive" : "warning"} role="status">
          <AlertDescription>{props.t(`booking360.actionError.${props.actionError}`)}</AlertDescription>
        </Alert>
      )}
      {props.canConfirm && remaining > 0 && (
        <Button type="button" loading={props.confirming} onClick={props.onConfirm}>
          {props.confirming ? props.t("booking360.actions.confirming") : props.t("booking360.actions.confirm")}
        </Button>
      )}
    </div>
  );
}
