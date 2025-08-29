// src/components/DateTimePicker.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  name: string; // "dateTime"
  value: string; // e.g. "2025-08-29T10:00" or ""
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
};

/* -------------------------- format helpers -------------------------- */
const fmtDateLabel = (d: Date) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

const fmtTimeLabel = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* ------------------------------- component ------------------------------- */
export default function DateTimePicker({ name, value, onChange, required }: Props) {
  // parse incoming combined value (if any)
  const parsed = useMemo(() => {
    if (!value) return { date: "", time: "" };
    const [d, t] = value.split("T");
    return { date: d ?? "", time: (t ?? "").slice(0, 5) };
  }, [value]);

  // keep LOCAL selections so picking date OR time sticks visually
  const [selDate, setSelDate] = useState<string>(parsed.date);
  const [selTime, setSelTime] = useState<string>(parsed.time);

  // sync local state if parent value changes from outside
  useEffect(() => {
    setSelDate(parsed.date);
    setSelTime(parsed.time);
  }, [parsed.date, parsed.time]);

  // popovers
  const [openCal, setOpenCal] = useState(false);
  const [openTimes, setOpenTimes] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const timesRef = useRef<HTMLDivElement | null>(null);

  // Tomorrow placeholder for date
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  // current calendar view
  const [viewYear, setViewYear] = useState<number>(() =>
    selDate ? Number(selDate.slice(0, 4)) : tomorrow.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(() =>
    selDate ? Number(selDate.slice(5, 7)) - 1 : tomorrow.getMonth()
  );

  // month days grid
  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay();
    const last = new Date(viewYear, viewMonth + 1, 0);
    const totalDays = last.getDate();

    const cells: Array<{ key: string; date?: Date }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ key: `b-${i}` });
    for (let d = 1; d <= totalDays; d++) cells.push({ key: `d-${d}`, date: new Date(viewYear, viewMonth, d) });
    return cells;
  }, [viewYear, viewMonth]);

  // 10-minute time slots
  const timeOptions = useMemo(() => {
    const opts: { key: string; label: string; value: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 10) {
        const v = `${pad(h)}:${pad(m)}`;
        opts.push({ key: v, label: fmtTimeLabel(h, m), value: v });
      }
    }
    return opts;
  }, []);

  // close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (openCal && calendarRef.current && !calendarRef.current.contains(t)) setOpenCal(false);
      if (openTimes && timesRef.current && !timesRef.current.contains(t)) setOpenTimes(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openCal, openTimes]);

  // Emit combined ONLY when both are present (but keep local selection always)
  function emitIfComplete(nextDate: string, nextTime: string) {
    if (nextDate && nextTime) {
      const evt = { target: { name, value: `${nextDate}T${nextTime}` } } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(evt);
    } else {
      // If not complete, still notify parent with empty to keep required validation;
      // comment out the next 2 lines if you prefer leaving parent value untouched.
      const evt = { target: { name, value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(evt);
    }
  }

  function pickDate(d: Date) {
    const newDate = toISODate(d);
    setSelDate(newDate);
    emitIfComplete(newDate, selTime);
    setOpenCal(false);
  }

  function pickTime(v: string) {
    setSelTime(v);
    emitIfComplete(selDate, v);
    setOpenTimes(false);
  }

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div className="relative" ref={calendarRef}>
          <label className="block text-sm font-medium text-brand-text-light mb-1">
            Date {required && <span className="text-red-500">*</span>}
          </label>

          <button
            type="button"
            aria-label="Choose date"
            className="w-full h-12 rounded-md border border-slate-300 bg-white pl-10 pr-10 text-left
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary relative"
            onClick={() => {
              setOpenCal((v) => !v);
              setOpenTimes(false);
            }}
          >
            {/* calendar icon (centered) */}
            <span className="absolute left-3 top-1/2 -translate-y-1/4 pointer-events-none">
              <svg className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6 2a1 1 0 012 0v1h4V2a1 1 0 112 0v1h1a2 2 0 012 2v2H3V5a2 2 0 012-2h1V2zM3 9h14v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
            </span>

            <span className="block truncate">
              {selDate ? fmtDateLabel(new Date(selDate)) : fmtDateLabel(tomorrow)}
            </span>

            {/* caret (centered) */}
            <span className="absolute right-4 top-1/2 -translate-y-1/4 text-slate-600">▾</span>
          </button>

          {openCal && (
            <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-xl p-3">
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-slate-100"
                  onClick={() =>
                    setViewMonth((m) => {
                      const nm = m - 1;
                      if (nm < 0) { setViewYear((y) => y - 1); return 11; }
                      return nm;
                    })
                  }
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <div className="font-medium">
                  {new Date(viewYear, viewMonth, 1).toLocaleString(undefined, { month: "long", year: "numeric" })}
                </div>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-slate-100"
                  onClick={() =>
                    setViewMonth((m) => {
                      const nm = m + 1;
                      if (nm > 11) { setViewYear((y) => y + 1); return 0; }
                      return nm;
                    })
                  }
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 px-1 pt-1 pb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1 px-1 pb-1">
                {days.map(({ key, date }) =>
                  !date ? (
                    <div key={key} className="h-9 rounded-md" aria-hidden="true" />
                  ) : (
                    <button
                      key={key}
                      type="button"
                      className={[
                        "h-9 rounded-md text-sm",
                        selDate && toISODate(date) === selDate
                          ? "bg-brand-primary text-white"
                          : "hover:bg-slate-100 text-brand-text",
                      ].join(" ")}
                      onClick={() => pickDate(date)}
                    >
                      {date.getDate()}
                    </button>
                  )
                )}
              </div>

              <div className="px-2 py-2 text-xs text-slate-500">
                Reserve your ride up to <b>30 days</b> in advance
              </div>
            </div>
          )}
        </div>

        {/* Time */}
        <div className="relative" ref={timesRef}>
          <label className="block text-sm font-medium text-brand-text-light mb-1">
            Time {required && <span className="text-red-500">*</span>}
          </label>

          <button
            type="button"
            aria-label="Choose time"
            className="w-full h-12 rounded-md border border-slate-300 bg-white pl-10 pr-10 text-left
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary relative"
            onClick={() => {
              setOpenTimes((v) => !v);
              setOpenCal(false);
            }}
          >
            {/* clock icon (centered) */}
            <span className="absolute left-3 top-1/2 -translate-y-1/4 pointer-events-none">
              <svg className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12a.75.75 0 00-1.5 0v4c0 .199.079.39.22.53l2.5 2.5a.75.75 0 101.06-1.06l-2.28-2.28V6z"
                  clipRule="evenodd"
                />
              </svg>
            </span>

            <span className="block truncate">{selTime ? selTime : "Select Time"}</span>

            {/* caret (centered) */}
            <span className="absolute right-4 top-1/2 -translate-y-1/4 text-slate-600">▾</span>
          </button>

          {openTimes && (
            <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl p-1">
              <div className="px-3 py-2 text-xs text-slate-500">Now</div>
              {timeOptions.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={[
                    "w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-100",
                    selTime === t.value ? "bg-slate-100 font-semibold" : "",
                  ].join(" ")}
                  onClick={() => pickTime(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* hidden input to keep required validation if you rely on it */}
      <input
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        name={name}
        required={required}
        value={selDate && selTime ? `${selDate}T${selTime}` : ""}
        readOnly
        onChange={() => {}}
      />
    </div>
  );
}
