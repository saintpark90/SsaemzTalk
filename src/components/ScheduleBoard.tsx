"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Teacher = { id: string; name: string };

type ScheduleItem = {
  id: string;
  occurrenceId: string;
  title: string;
  location: string;
  startAt: string;
  endAt: string;
  isRecurringWeekly: boolean;
  createdByAdmin: boolean;
  payAmount: number | null;
  teacher: { id: string; name: string };
  note: string;
};

type Props = {
  year: number;
  month: number;
  isAdmin: boolean;
  currentUserId: string;
  teachers: Teacher[];
  initialSchedules: ScheduleItem[];
  initialPayTotal: number;
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ScheduleBoard({
  year: initialYear,
  month: initialMonth,
  isAdmin,
  currentUserId,
  teachers,
  initialSchedules,
  initialPayTotal,
}: Props) {
  const router = useRouter();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [payTotal, setPayTotal] = useState(initialPayTotal);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const totalDays = daysInMonth(year, month);

  const byDay = useMemo(() => {
    const map = new Map<number, ScheduleItem[]>();
    for (const s of schedules) {
      const d = new Date(s.startAt);
      if (d.getFullYear() !== year || d.getMonth() + 1 !== month) continue;
      const day = d.getDate();
      const list = map.get(day) ?? [];
      list.push(s);
      map.set(day, list);
    }
    return map;
  }, [schedules, year, month]);

  async function load(nextYear: number, nextMonth: number) {
    setLoading(true);
    setError("");
    const res = await fetch(
      `/api/v1/schedules?year=${nextYear}&month=${nextMonth}`
    );
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "불러오기 실패");
      return;
    }
    setSchedules(
      data.schedules.map((s: ScheduleItem & { startAt: string | Date; endAt: string | Date }) => ({
        ...s,
        startAt: new Date(s.startAt).toISOString(),
        endAt: new Date(s.endAt).toISOString(),
      }))
    );
    setPayTotal(data.payTotal ?? 0);
    setYear(nextYear);
    setMonth(nextMonth);
  }

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    void load(d.getFullYear(), d.getMonth() + 1);
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const date = String(form.get("date"));
    const startTime = String(form.get("startTime"));
    const endTime = String(form.get("endTime"));
    const payload = {
      title: form.get("title"),
      location: form.get("location"),
      note: form.get("note"),
      isRecurringWeekly: form.get("isRecurringWeekly") === "on",
      startAt: new Date(`${date}T${startTime}:00`),
      endAt: new Date(`${date}T${endTime}:00`),
      ...(isAdmin
        ? {
            teacherId: form.get("teacherId"),
            payAmount: form.get("payAmount")
              ? Number(form.get("payAmount"))
              : null,
          }
        : {}),
    };

    const res = await fetch("/api/v1/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "등록 실패");
      return;
    }
    e.currentTarget.reset();
    await load(year, month);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("이 일정을 삭제할까요? (매주 반복이면 템플릿 전체가 삭제됩니다)")) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/v1/schedules/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "삭제 실패");
      return;
    }
    await load(year, month);
  }

  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const defaultDate = `${year}-${pad(month)}-${pad(Math.min(new Date().getDate(), totalDays))}`;

  return (
    <div>
      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

      <div className="schedule-pay panel" style={{ padding: 16, marginBottom: 16 }}>
        <strong>이번 달 내 페이 합계</strong>
        <div className="schedule-pay-amount">
          {payTotal.toLocaleString("ko-KR")}원
        </div>
        <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
          회사가 배정한 일정에 입력된 페이만 합산됩니다.
        </p>
      </div>

      <div className="toolbar" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => shiftMonth(-1)}>
            이전
          </button>
          <strong>
            {year}년 {month}월
          </strong>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => shiftMonth(1)}>
            다음
          </button>
        </div>
        {loading ? <span className="muted">불러오는 중...</span> : null}
      </div>

      <div className="calendar panel" style={{ marginBottom: 16 }}>
        <div className="calendar-weekdays">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {cells.map((day, idx) => (
            <div key={idx} className={`calendar-cell${day ? "" : " empty"}`}>
              {day ? (
                <>
                  <div className="calendar-day">{day}</div>
                  <div className="calendar-events">
                    {(byDay.get(day) ?? []).map((s) => (
                      <button
                        key={s.occurrenceId}
                        type="button"
                        className={`calendar-event${s.createdByAdmin ? " admin" : ""}`}
                        title={`${s.title} @ ${s.location}`}
                        onClick={() => {
                          if (
                            s.teacher.id === currentUserId ||
                            isAdmin
                          ) {
                            void onDelete(s.id);
                          }
                        }}
                      >
                        <span>
                          {new Date(s.startAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          {s.title}
                        </span>
                        {s.createdByAdmin ? (
                          <em className="cal-badge">회사</em>
                        ) : null}
                        {s.isRecurringWeekly ? (
                          <em className="cal-badge muted-badge">매주</em>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <form className="panel form" onSubmit={onCreate}>
        <strong>일정 등록</strong>
        <div className="form-grid-2">
          <div className="field">
            <label htmlFor="title">수업명</label>
            <input id="title" name="title" className="input" required />
          </div>
          <div className="field">
            <label htmlFor="location">장소</label>
            <input id="location" name="location" className="input" required />
          </div>
        </div>
        <div className="form-grid-2">
          <div className="field">
            <label htmlFor="date">날짜</label>
            <input
              id="date"
              name="date"
              type="date"
              className="input"
              required
              defaultValue={defaultDate}
            />
          </div>
          <div className="field">
            <label>시간</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                name="startTime"
                type="time"
                className="input"
                required
                defaultValue="14:00"
              />
              <input
                name="endTime"
                type="time"
                className="input"
                required
                defaultValue="15:00"
              />
            </div>
          </div>
        </div>

        {isAdmin ? (
          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="teacherId">선생님 배정</label>
              <select
                id="teacherId"
                name="teacherId"
                className="select"
                required
                defaultValue={currentUserId}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="payAmount">페이 (원)</label>
              <input
                id="payAmount"
                name="payAmount"
                type="number"
                min={0}
                className="input"
                placeholder="50000"
              />
            </div>
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="note">메모</label>
          <input id="note" name="note" className="input" />
        </div>

        <label className="home-keep" style={{ color: "var(--muted)" }}>
          <input type="checkbox" name="isRecurringWeekly" />
          <span>매주 같은 일정 반복</span>
        </label>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            일정 추가
          </button>
        </div>
      </form>
    </div>
  );
}
