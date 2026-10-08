"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@core/common/utils";
import type { CalendarResource, OperationsCalendarBlock, OperationsCalendarDay } from "../../domain/entities/OperationsCalendar";
import { blockPosition, buildTimeSlots, placeBlocksOnTracks } from "../viewmodels/calendarLayout";

const SLOT_WIDTH = 76;
const BLOCK_HEIGHT = 38;

interface ResourceTimelineProps {
  day: OperationsCalendarDay;
  resources: CalendarResource[];
  locale: string;
  direction: "ltr" | "rtl";
  canCreate: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  onOpen: (block: OperationsCalendarBlock) => void;
  onEmptySlot: (resource: CalendarResource, instantUtc: string) => void;
}

function statusClass(status: OperationsCalendarBlock["status"]) {
  if (status === "Held") return "border-warning/50 bg-warning/15 text-warning-strong";
  if (status === "CheckedIn") return "border-info/50 bg-info/15 text-info";
  return "border-success/50 bg-success/15 text-success";
}

function localTime(value: string, locale: string, timeZoneId: string) {
  return new Intl.DateTimeFormat(locale, { timeZone: timeZoneId, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value));
}

/**
 * Documentation for module export
 */
export function ResourceTimeline(props: ResourceTimelineProps) {
  const slots = buildTimeSlots(props.day, props.locale);
  const timelineWidth = Math.max(SLOT_WIDTH, slots.length * SLOT_WIDTH);
  const [now, setNow] = useState(() => Date.parse(props.day.asOfUtc));
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const from = Date.parse(props.day.fromUtc);
  const to = Date.parse(props.day.toUtc);
  const currentPercent = now >= from && now < to ? ((now - from) / (to - from)) * 100 : null;

  return (
    <div className="overflow-auto rounded-nx-lg border border-nx-line bg-nx-surface" data-testid="resource-timeline">
      <div className="min-w-max" dir="ltr">
        <div className="flex border-b border-nx-line bg-nx-raised">
          <div className="sticky left-0 z-30 flex w-48 shrink-0 items-center border-r border-nx-line bg-nx-raised px-4 text-sm font-semibold" dir={props.direction}>
            {props.t("operationsCalendar.timeline.resource")}
          </div>
          <div className="flex" style={{ width: timelineWidth }}>
            {slots.map((slot) => <div key={slot.instantUtc} className="w-[76px] shrink-0 border-r border-nx-line px-2 py-3 text-xs tabular-nums text-nx-ink-2">{slot.label}</div>)}
          </div>
        </div>
        {props.resources.map((resource) => {
          const placed = placeBlocksOnTracks(props.day.blocks.filter((block) => block.resourceId === resource.id));
          const trackCount = Math.max(1, ...placed.map((item) => item.track + 1));
          const laneHeight = Math.max(64, trackCount * BLOCK_HEIGHT + 14);
          return (
            <div key={resource.id} className="flex border-b border-nx-line last:border-b-0" style={{ minHeight: laneHeight }} data-resource-id={resource.id}>
              <div className="sticky left-0 z-30 w-48 shrink-0 border-r border-nx-line bg-nx-surface px-4 py-3" dir={props.direction}>
                <p className="truncate text-sm font-semibold text-nx-ink">{resource.name}</p>
                <p className="truncate text-xs text-nx-ink-3">{resource.profileName}</p>
              </div>
              <div className="relative flex" style={{ width: timelineWidth, height: laneHeight }}>
                {slots.map((slot) => {
                  const slotStart = Date.parse(slot.instantUtc);
                  const slotEnd = slotStart + 60 * 60 * 1000;
                  const occupied = placed.some(({ block }) => Date.parse(block.startUtc) < slotEnd && slotStart < Date.parse(block.endUtc));
                  // UI-EXCEPTION: interactive transparent calendar slot in custom SVG/canvas-like timeline grid
                  return <button
                    type="button"
                    key={slot.instantUtc}
                    className="h-full w-[76px] shrink-0 border-r border-nx-line text-transparent outline-none hover:bg-nx-hover focus-visible:z-20 focus-visible:shadow-nx-focus"
                    aria-label={occupied ? undefined : props.t("operationsCalendar.timeline.emptySlot", { resource: resource.name, time: slot.label })}
                    aria-hidden={occupied || undefined}
                    tabIndex={occupied ? -1 : undefined}
                    disabled={!props.canCreate || occupied}
                    onClick={() => props.onEmptySlot(resource, slot.instantUtc)}
                  >{slot.label}</button>;
                })}
                {placed.map(({ block, track }) => {
                  const position = blockPosition(block, props.day);
                  const start = localTime(block.startUtc, props.locale, props.day.timeZoneId);
                  const end = localTime(block.endUtc, props.locale, props.day.timeZoneId);
                  const status = props.t(`operationsCalendar.status.${block.status}`);
                  return (
                    // UI-EXCEPTION: absolute-positioned custom calendar booking block chip in timeline grid
                    <button
                      type="button"
                      key={block.reservationId}
                      className={cn("absolute z-10 overflow-hidden rounded-nx-sm border px-2 py-1 text-left text-[11px] leading-tight outline-none focus-visible:z-20 focus-visible:shadow-nx-focus", statusClass(block.status))}
                      style={{ left: `${position.leftPercent}%`, width: `${position.widthPercent}%`, minWidth: 34, top: 7 + track * BLOCK_HEIGHT, height: BLOCK_HEIGHT - 4 } as CSSProperties}
                      aria-label={props.t("operationsCalendar.timeline.bookingLabel", { reference: block.reservationNumber, status, start, end, resource: resource.name })}
                      onClick={() => props.onOpen(block)}
                    >
                      <span className="block truncate font-semibold">{block.reservationNumber}</span>
                      <span className="block truncate">{status} · {start}–{end}</span>
                    </button>
                  );
                })}
                {currentPercent != null && (
                  <div className="pointer-events-none absolute inset-y-0 z-20 w-px bg-destructive" style={{ left: `${currentPercent}%` }} title={props.t("operationsCalendar.timeline.currentTime")} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
