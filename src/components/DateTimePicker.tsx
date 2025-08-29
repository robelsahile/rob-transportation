import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  name: string;                // should be "dateTime"
  value: string;               // combined value you store, e.g. "2025-08-29T10:00"
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
};

/** Format helpers */
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

export default function DateTimePicker({ name, value, onChange, required }: Props) {
  // parse incoming combined value (if any)
  const parsed = useMemo(() => {
    // expecting "YYYY-MM-DDTHH:mm" or empty
    if (!value) return { date: "", time: "" };
    const [d, t] = value.split("T");
    return { date: d ?? "", time: t ?? "" };
  }, [value]);

  // internal UI state (for popovers)
  const [openCal, setOpenCal] = useState(false);
  const [openTimes, setOpenTimes] = useState(false);

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const timesRef = useRef<HTMLDivElement | null>(null);

  // Tomorrow placeholder
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  // Calendar view month
  const [viewYear, setViewYear] = useState<number>(() =>
    parsed.date ? Number(parsed.date.slice(0, 4)) : tomorrow.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(() =>
    parsed.date ? Number(parsed.date.slice(5, 7)) - 1 : tomorrow.getMonth()
  );

  // Build days grid for the month
  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay(); // 0 Sun .. 6 Sat
    const last = new Date(viewYear, viewMonth + 1, 0);
    const totalDays = last.getDate();

    const cells: Array<{ key: string; date?: Date }> = [];
    // leading blanks
    for (let i = 0; i < startWeekday; i++) cells.push({ key: `b-${i}` });
    // actual days
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(viewYear, viewMonth, d);
      cells.push({ key: `d-${d}`, date: dt });
    }
    return cells;
  }, [viewYear, viewMonth]);

  // Build 10-minute time slots (00:00..23:50)
  const timeOptions = useMemo(() => {
    const opts: { key: string; label: string; value: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 10) {
        const label = fmtTimeLabel(h, m);
        const v = `${pad(h)}:${pad(m)}`;
        opts.push({ key: v, label, value: v });
      }
    }
    return opts;
  }, []);

  // close popovers on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (openCal && calendarRef.current && !calendarRef.current.contains(t)) setOpenCal(false);
      if (openTimes && timesRef.current && !timesRef.current.contains(t)) setOpenTimes(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openCal, openTimes]);

  function emit(dateStr: string, timeStr: string) {
    const combined = dateStr && timeStr ? `${dateStr}T${timeStr}` : "";
    const evt = {
      target: { name, value: combined },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(evt);
  }

  function pickDate(d: Date) {
    const newDate = toISODate(d);
    emit(newDate, parsed.time);
    setOpenCal(false);
  }

  function pickTime(v: string) {
    emit(parsed.date, v);
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
            {/* Uber-style calendar icon, perfectly centered */}
            <span className="absolute left-3 top-1/2 -translate-y-1/4 pointer-events-none">
              <svg className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6 2a1 1 0 012 0v1h4V2a1 1 0 112 0v1h1a2 2 0 012 2v2H3V5a2 2 0 012-2h1V2zM3 9h14v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
            </span>

            <span className="block truncate">
              {parsed.date ? fmtDateLabel(new Date(parsed.date)) : fmtDateLabel(tomorrow)}
            </span>

            {/* caret centered on the right */}
            <span className="absolute right-3 top-1/2 -translate-y-1/4 text-slate-400">▾</span>
          </button>

          {/* Calendar popover */}
          {openCal && (
            <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-xl p-3">
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-slate-100"
                  onClick={() =>
                    setViewMonth((m) => {
                      const nm = m - 1;
                      if (nm < 0) {
                        setViewYear((y) => y - 1);
                        return 11;
                      }
                      return nm;
                    })
                  }
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <div className="font-medium">
                  {new Date(viewYear, viewMonth, 1).toLocaleString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-slate-100"
                  onClick={() =>
                    setViewMonth((m) => {
                      const nm = m + 1;
                      if (nm > 11) {
                        setViewYear((y) => y + 1);
                        return 0;
                      }
                      return nm;
                    })
                  }
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 px-1 pt-1 pb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 px-1 pb-1">
                {days.map(({ key, date }) => {
                  if (!date)
                    return <div key={key} className="h-9 rounded-md" aria-hidden="true" />;
                  const isSelected = parsed.date && toISODate(date) === parsed.date;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={[
                        "h-9 rounded-md text-sm",
                        isSelected
                          ? "bg-brand-primary text-white"
                          : "hover:bg-slate-100 text-brand-text",
                      ].join(" ")}
                      onClick={() => pickDate(date)}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
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
            {/* Uber-style clock icon, perfectly centered */}
            <span className="absolute left-3 top-1/2 -translate-y-1/4 pointer-events-none">
              <svg className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12a.75.75 0 00-1.5 0v4c0 .199.079.39.22.53l2.5 2.5a.75.75 0 101.06-1.06l-2.28-2.28V6z"
      clipRule="evenodd"
    />
              </svg>
            </span>

            <span className="block truncate">
              {parsed.time ? parsed.time : "Select Time"}
            </span>

            {/* caret centered on the right */}
            <span className="absolute right-3 top-1/2 -translate-y-1/4 text-slate-400">▾</span>
          </button>

          {/* Times popover */}
          {openTimes && (
            <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl p-1">
              <div className="px-3 py-2 text-xs text-slate-500">Now</div>
              {timeOptions.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={[
                    "w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-100",
                    parsed.time === t.value ? "bg-slate-100 font-semibold" : "",
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

      {/* Hidden input to keep the current 'required' validation behavior */}
      <input
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        name={name}
        required={required}
        value={value}
        onChange={() => {}}
        readOnly
      />
    </div>
  );
}
