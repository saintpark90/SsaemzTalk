export type ScheduleRecord = {
  id: string;
  companyId: string;
  teacherId: string;
  createdById: string;
  title: string;
  location: string;
  startAt: Date;
  endAt: Date;
  isRecurringWeekly: boolean;
  recurrenceParentId: string | null;
  createdByAdmin: boolean;
  payAmount: number | null;
  note: string;
  teacher?: { id: string; name: string };
  createdBy?: { id: string; name: string };
};

export type ExpandedSchedule = ScheduleRecord & {
  occurrenceId: string;
  isOccurrence: boolean;
};

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameTimeShift(base: Date, from: Date, to: Date) {
  const duration = to.getTime() - from.getTime();
  const start = new Date(base);
  start.setHours(from.getHours(), from.getMinutes(), from.getSeconds(), 0);
  const end = new Date(start.getTime() + duration);
  return { startAt: start, endAt: end };
}

/** Expand weekly recurring schedules into concrete occurrences within [from, to]. */
export function expandSchedules(
  schedules: ScheduleRecord[],
  from: Date,
  to: Date
): ExpandedSchedule[] {
  const result: ExpandedSchedule[] = [];

  for (const schedule of schedules) {
    if (!schedule.isRecurringWeekly) {
      if (schedule.startAt >= from && schedule.startAt <= to) {
        result.push({
          ...schedule,
          occurrenceId: schedule.id,
          isOccurrence: false,
        });
      }
      continue;
    }

    // Walk weekly from the original start, covering the visible range.
    let cursor = new Date(schedule.startAt);
    // Rewind to on/before range start
    while (cursor > from) {
      cursor = addDays(cursor, -7);
    }
    while (cursor < from) {
      cursor = addDays(cursor, 7);
    }

    while (cursor <= to) {
      const { startAt, endAt } = sameTimeShift(
        cursor,
        schedule.startAt,
        schedule.endAt
      );
      result.push({
        ...schedule,
        startAt,
        endAt,
        occurrenceId: `${schedule.id}_${startAt.toISOString()}`,
        isOccurrence: startAt.getTime() !== schedule.startAt.getTime(),
      });
      cursor = addDays(cursor, 7);
    }
  }

  return result.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

export function monthRange(year: number, monthIndex: number) {
  const from = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const to = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  return { from, to };
}

export function sumPayForTeacher(
  schedules: ExpandedSchedule[],
  teacherId: string
) {
  return schedules
    .filter(
      (s) =>
        s.teacherId === teacherId &&
        s.createdByAdmin &&
        typeof s.payAmount === "number"
    )
    .reduce((sum, s) => sum + (s.payAmount ?? 0), 0);
}
