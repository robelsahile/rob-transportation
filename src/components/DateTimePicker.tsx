import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  name: string; // "dateTime"
  value: string; // "YYYY-MM-DDTHH:mm"
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
};

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

// ---- Helpers --------------------------------------------------------------
function splitValue(v: string) {
  if (!v) return { date: "", time: "" };
  const [d, t] = v.split("T");
  return { date: d ?? "", time: (t ?? "").slice(0, 5) }; // HH:mm only
}

function joinValue(date: string, time: string) {
  if (!date) return "";
  const t = time || "00:00";
  return `${date}T${t}`;
}

// Format a YYYY-MM-DD as local date label (no UTC shift)
function labelFromISODate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

// Build the calendar grid for a given month
function buildDays(year: number, monthZeroBased: number) {
  const first = new Date(year, monthZeroBased, 1);
  const startWeekday = first.getDay(); // 0..6
  const last = new Date(year, monthZeroBased + 1, 0);
  const total = last.getDate();

  const cells: Array<{ key: string; date?: Date }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ key: `b-${i}` });
  for (let d = 1; d <= total; d++) cells.push({ key: `d-${d}`, date: new Date(year, monthZeroBased, d) });
  return cells;
}

// 10-minute time options for the dropdown
function buildTimes() {
  const opts: { key: string; label: string; value: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 10) {
      const v = `${pad(h)}:${pad(m)}`;
      const dt = new Date();
      dt.setHours(h, m, 0, 0);
      const label = dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
      opts.push({ key: v, label, value: v });
    }
  }
  return opts;
}

export default function DateTimePicker({ name, value, onChange, required }: Props) {
  // current combined value -> pieces
  const { date, time } = useMemo(() => splitValue(value), [value]);

  // default “tomorrow” placeholder
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  // calendar popover state
  const [openCal, setOpenCal] = useState(false);
  const [openTimes, setOpenTimes] = useState(false);
  const calRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);

  // month view state
  const [viewYear, setViewYear] = useState<number>(() => (date ? +date.slice(0, 4) : tomorrow.getFullYear()));
  const [viewMonth, setViewMonth] = useState<number>(() => (date ? +date.slice(5, 7) - 1 : tomorrow.getMonth()));

  const days = useMemo(() => buildDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const timeOptions = useMemo(() => buildTimes(), []);

  // Close popovers on outside click — use 'click' (not 'mousedown') so button onClick runs first
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (openCal && calRef.current && !calRef.current.contains(t)) setOpenCal(false);
      if (openTimes && timeRef.current && !timeRef.current.contains(t)) setOpenTimes(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openCal, openTimes]);

  // Emit helper
  const emit = (nextDate: string, nextTime: string) => {
    onChange({
      target: { name, value: joinValue(nextDate, nextTime) },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const pickDate = (d: Date) => {
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    emit(iso, time);
    setOpenCal(false);
    // keep the month view in sync
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const pickTime = (v: string) => {
    emit(date, v);
    setOpenTimes(false);
  };

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div className="relative" ref={calRef}>
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
            {/* calendar icon, vertically centered */}
            <span className="absolute left-3 top-1/2 -translate-y-1/4 pointer-events-none">
              <svg className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6 2a1 1 0 012 0v1h4V2a1 1 0 112 0v1h1a2 2 0 012 2v2H3V5a2 2 0 012-2h1V2zM3 9h14v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
            </span>

            <span className="block truncate">
              {date ? labelFromISODate(date) : labelFromISODate(`${tomorrow.getFullYear()}-${pad(tomorrow.getMonth()+1)}-${pad(tomorrow.getDate())}`)}
            </span>

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
                  {new Date(viewYear, viewMonth, 1).toLocaleString(undefined, { month: "long", year: "numeric" })}
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
                {days.map(({ key, date: d }) =>
                  d ? (
                    <button
                      key={key}
                      type="button"
                      className={[
                        "h-9 rounded-md text-sm",
                        date && `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` === date
                          ? "bg-brand-primary text-white"
                          : "hover:bg-slate-100 text-brand-text",
                      ].join(" ")}
                      onClick={() => pickDate(d)}
                    >
                      {d.getDate()}
                    </button>
                  ) : (
                    <div key={key} className="h-9 rounded-md" aria-hidden="true" />
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
        <div className="relative" ref={timeRef}>
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
            <span className="absolute left-3 top-1/2 -translate-y-1/4 pointer-events-none">
              <svg className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12a.75.75 0 00-1.5 0v4c0 .199.079.39.22.53l2.5 2.5a.75.75 0 101.06-1.06l-2.28-2.28V6z"
                  clipRule="evenodd"
                />
              </svg>
            </span>

            <span className="block truncate">{time || "Select Time"}</span>

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
                    time === t.value ? "bg-slate-100 font-semibold" : "",
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

      {/* Hidden input preserves existing “required” validation on the combined field */}
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
