import type {
  ActiveBlock,
  BlockStatus,
  FocusSession,
  Schedule,
  TemporaryUnlock,
} from '@/constants/types';
import { formatTimeOfDate, parseDateKey, toDateKey } from '@/utils/format';

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export interface TimeWindow {
  start: number;
  end: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** The window that starts on `day`. If end <= start it runs past midnight. */
function windowOnDay(day: Date, startMinutes: number, endMinutes: number): TimeWindow {
  const base = startOfDay(day).getTime();
  const start = base + startMinutes * MINUTE_MS;
  let end = base + endMinutes * MINUTE_MS;
  if (endMinutes <= startMinutes) end += DAY_MS;
  return { start, end };
}

/** Current window if active, otherwise the next upcoming one (within a week). */
export function getNextWindow(schedule: Schedule, now: Date): TimeWindow | null {
  const t = now.getTime();

  if (schedule.date) {
    const w = windowOnDay(parseDateKey(schedule.date), schedule.startMinutes, schedule.endMinutes);
    return w.end > t ? w : null;
  }

  if (schedule.days.length === 0) return null;
  for (let offset = -1; offset <= 7; offset++) {
    const day = addDays(now, offset);
    if (!schedule.days.includes(day.getDay())) continue;
    const w = windowOnDay(day, schedule.startMinutes, schedule.endMinutes);
    if (w.end > t) return w;
  }
  return null;
}

/** Epoch ms when the schedule's current window ends, or null if it is not active. */
export function getScheduleActiveUntil(schedule: Schedule, now: Date): number | null {
  if (!schedule.enabled) return null;
  const w = getNextWindow(schedule, now);
  return w && w.start <= now.getTime() ? w.end : null;
}

export function isScheduleLocked(schedule: Schedule, strictMode: boolean, now: Date): boolean {
  return strictMode && getScheduleActiveUntil(schedule, now) !== null;
}

export function isScheduleFinished(schedule: Schedule, now: Date): boolean {
  return !!schedule.date && getNextWindow(schedule, now) === null;
}

/** For a one-time block: today if today's window hasn't ended yet, otherwise tomorrow. */
export function oneTimeDateFor(startMinutes: number, endMinutes: number, now: Date): string {
  const today = windowOnDay(now, startMinutes, endMinutes);
  return toDateKey(today.end > now.getTime() ? now : addDays(now, 1));
}

export function getActiveBlocks(params: {
  now: Date;
  alwaysOn: boolean;
  focusSession: FocusSession | null;
  schedules: Schedule[];
  blockedAppIds: string[];
}): ActiveBlock[] {
  const { now, alwaysOn, focusSession, schedules, blockedAppIds } = params;
  const blocks: ActiveBlock[] = [];

  if (focusSession && focusSession.endsAt > now.getTime()) {
    blocks.push({
      active: true,
      reason: 'focus',
      until: focusSession.endsAt,
      label: `Focus session until ${formatTimeOfDate(focusSession.endsAt)}`,
      appIds: blockedAppIds,
    });
  }

  const scheduleBlocks: ActiveBlock[] = [];
  for (const schedule of schedules) {
    const until = getScheduleActiveUntil(schedule, now);
    if (until === null) continue;
    scheduleBlocks.push({
      active: true,
      reason: 'schedule',
      until,
      label: `${schedule.name} until ${formatTimeOfDate(until)}`,
      appIds: schedule.appIds?.length ? schedule.appIds : blockedAppIds,
    });
  }
  scheduleBlocks.sort((a, b) => (b.until ?? 0) - (a.until ?? 0));
  blocks.push(...scheduleBlocks);

  if (alwaysOn) {
    blocks.push({ active: true, reason: 'always', until: null, label: 'Always blocking', appIds: blockedAppIds });
  }

  return blocks.filter((b) => b.appIds.length > 0);
}

export function summarizeBlocks(blocks: ActiveBlock[]): BlockStatus {
  const first = blocks[0];
  if (!first) return { active: false, reason: null, until: null, label: 'Blocking is off' };
  return { active: true, reason: first.reason, until: first.until, label: first.label };
}

export function isTemporarilyUnlocked(
  appId: string,
  unlocks: TemporaryUnlock[],
  now: number
): TemporaryUnlock | undefined {
  return unlocks.find((u) => u.appId === appId && u.until > now);
}
