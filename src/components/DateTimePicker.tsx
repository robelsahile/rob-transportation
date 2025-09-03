import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  name: string; // "dateTime"
  value: string; // "YYYY-MM-DDTHH:mm"
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
};

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/* ----------------------------- Helpers ----------------------------- */
function splitValue(v: string) {
  if (!v) return { date: "", time: "" };
  const [d, t] = v.split("T");
  return { date: d ?? "", time: (t ?? "").slice(0, 5) }; // HH:mm
}

function joinValue(date: string, time: string) {
  if (!date) return "";
  const t = time || "00:00";
  return `${date}T${t}`;
}

function labelFromISODate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function buildDays(year: number, monthZeroBased: number) {
  const first = new Date(year, monthZeroBased, 1);
  const startWeekday = first.getDay();
  const last = new Date(year, monthZeroBased + 1, 0);
  const total = last.getDate();

  const cells: Array<{ key: string; date?: Date }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ key: `b-${i}` });
  for (let d = 1; d <= total; d++) cells.push({ key: `d-${d}`, date: new Date(year, monthZeroBased, d) });
  return cells;
}

function sameYMD(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isoFromDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* Format 24h "HH:mm" to 12h "hh:mm AM/PM" for display */
function formatTime12(hhmm: string) {
  if (!hhmm) return "";
  const [hStr, mStr = "00"] = hhmm.split(":");
  let h = parseInt(hStr, 10);
  if (isNaN(h)) h = 0;
  const am = h < 12;
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12.toString().padStart(2, "0")}:${mStr.padStart(2, "0")} ${am ? "AM" : "PM"}`;
}

/* -------------------------- Time Wheel --------------------------- */
type WheelProps = {
  initial: string;                  // "HH:mm" 24h
  onConfirm: (val: string) => void; // returns "HH:mm"
  onClose: () => void;
};

/** Change this to 5, 10, 15 to control minute increments */
const TIME_STEP = 10;

function to12(hhmm: string) {
  let [h, m] = (hhmm || "00:00").split(":").map((n) => parseInt(n, 10));
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;
  const am = h < 12;
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute: m, am };
}
function to24(hour12: number, minute: number, am: boolean) {
  let h = hour12 % 12;
  if (!am) h += 12;
  return `${pad(h)}:${pad(minute)}`;
}

const TimeWheel: React.FC<WheelProps> = ({ initial, onConfirm, onClose }) => {
  const { hour12, minute, am } = to12(initial);

  // Floor to nearest step; change to nearest if you prefer:
  // const nearest = Math.round(minute / TIME_STEP) * TIME_STEP;
  // const [m, setM] = useState<number>(nearest % 60);
  const [h, setH] = useState<number>(hour12);
  const [m, setM] = useState<number>(minute - (minute % TIME_STEP));
  const [isAM, setIsAM] = useState<boolean>(am);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(
    () => Array.from({ length: 60 / TIME_STEP }, (_, i) => i * TIME_STEP),
    []
  );

  // Confirm button styled to match site brand color
  const confirmBtn =
    "w-full py-2 rounded-2xl font-semibold text-white bg-brand-primary hover:bg-brand-primary/90 " +
    "shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1";

  return (
    <div
      className="absolute z-50 mt-2 w-[320px] rounded-2xl shadow-xl bg-white ring-1 ring-black/5 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="grid grid-cols-3 gap-3 mb-4 text-center text-slate-500 text-sm">
        <div className="font-medium">Hour</div>
        <div className="font-medium">Minute</div>
        <div className="font-medium">AM/PM</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Hour */}
        <div className="max-h-44 overflow-y-auto rounded-md border border-slate-200">
          {hours.map((hh) => (
            <button
              key={hh}
              type="button"
              className={["w-full py-2 text-sm hover:bg-slate-100", h === hh ? "bg-slate-100 font-semibold" : ""].join(" ")}
              onClick={() => setH(hh)}
            >
              {hh.toString().padStart(2, "0")}
            </button>
          ))}
        </div>

        {/* Minute */}
        <div className="max-h-44 overflow-y-auto rounded-md border border-slate-200">
          {minutes.map((mm) => (
            <button
              key={mm}
              type="button"
              className={["w-full py-2 text-sm hover:bg-slate-100", m === mm ? "bg-slate-100 font-semibold" : ""].join(" ")}
              onClick={() => setM(mm)}
            >
              {mm.toString().padStart(2, "0")}
            </button>
          ))}
        </div>

        {/* AM / PM */}
        <div className="rounded-md border border-slate-200 overflow-hidden">
          <button
            type="button"
            className={["w-full py-2 text-sm hover:bg-slate-100", isAM ? "bg-slate-100 font-semibold" : ""].join(" ")}
            onClick={() => setIsAM(true)}
          >
            AM
          </button>
          <button
            type="button"
            className={["w-full py-2 text-sm hover:bg-slate-100", !isAM ? "bg-slate-100 font-semibold" : ""].join(" ")}
            onClick={() => setIsAM(false)}
          >
            PM
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="flex-1 py-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className={"flex-1 " + confirmBtn}
          onClick={() => onConfirm(to24(h, m, isAM))}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

/* =========================== Component ============================ */
export default function DateTimePicker({ name, value, onChange, required }: Props) {
  const { date, time } = useMemo(() => splitValue(value), [value]);

  // Use today's date for default label + open on current month
  const today = useMemo(() => new Date(), []);

  const [openCal, setOpenCal] = useState(false);
  const [openTimes, setOpenTimes] = useState(false);
  const calRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);

  // Close popovers on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (openCal && calRef.current && !calRef.current.contains(t)) setOpenCal(false);
      if (openTimes && timeRef.current && !timeRef.current.contains(t)) setOpenTimes(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openCal, openTimes]);

  const initialView = useMemo(() => {
    if (date) {
      const [y, m] = date.split("-").map((n) => parseInt(n, 10));
      return new Date(y, (m ?? 1) - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [date, today]);

  const [viewYear, setViewYear] = useState<number>(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialView.getMonth());
  const days = useMemo(() => buildDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const emit = (nextDate: string, nextTime: string) => {
    onChange({
      target: { name, value: joinValue(nextDate, nextTime) },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const pickDate = (d: Date) => {
    emit(isoFromDate(d), time);
    setOpenCal(false);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const pickTime = (v: string) => {
    emit(date, v); // keep stored value 24h
    setOpenTimes(false);
  };

  const selectedDateObj = useMemo(() => {
    if (!date) return null;
    const [y, m, dd] = date.split("-").map((n) => parseInt(n, 10));
    return new Date(y, (m ?? 1) - 1, dd ?? 1);
  }, [date]);

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ------------------------- DATE ------------------------- */}
        <div className="relative" ref={calRef}>
          <label className="block text-sm font-medium text-brand-text-light mb-1">
            Date {required && <span className="text-red-500">*</span>}
          </label>

          <button
            type="button"
            className="w-full h-12 rounded-md border border-slate-300 bg-white pl-10 pr-10 text-left
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary relative"
            onClick={() => {
              setOpenCal((v) => !v);
              setOpenTimes(false);
            }}
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/4 pointer-events-none">
              {/* Calendar icon */}
              <svg className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 2a1 1 0 012 0v1h4V2a1 1 0 112 0v1h1a2 2 0 012 2v2H3V5a2 2 0 012-2h1V2zM3 9h14v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
            </span>
            <span className="block truncate">
              {date ? labelFromISODate(date) : labelFromISODate(isoFromDate(today))}
            </span>
            <span className="absolute right-6 top-1/2 -translate-y-1/4 text-slate-800">▾</span>
          </button>

          {openCal && (
            <div className="absolute z-40 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-xl p-3">
              {/* Header: month switcher */}
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={goPrevMonth} className="px-2 py-1 rounded hover:bg-slate-100" aria-label="Previous month">‹</button>
                <div className="font-medium text-slate-700">
                  {new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </div>
                <button type="button" onClick={goNextMonth} className="px-2 py-1 rounded hover:bg-slate-100" aria-label="Next month">›</button>
              </div>

              {/* Weekday labels */}
              <div className="grid grid-cols-7 text-center text-xs text-slate-900 mb-1">
                {weekdayLabels.map((w) => (<div key={w} className="py-1">{w}</div>))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((cell, idx) => {
                  if (!cell.date) return <div key={cell.key + idx} className="h-9" />;
                  const d = cell.date;
                  const selected = selectedDateObj ? sameYMD(d, selectedDateObj) : false;
                  const isToday = sameYMD(d, today);

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      className={[
                        "h-9 rounded-md text-sm hover:bg-slate-100 text-slate-800",
                        selected ? "bg-slate-500 text-white hover:bg-slate-900" : ""
                      ].join(" ")}
                      onClick={() => pickDate(d)}
                    >
                      {/* Subtle circle for today if not selected */}
                      {isToday && !selected ? (
                        <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-slate-300">
                          {d.getDate()}
                        </span>
                      ) : (
                        d.getDate()
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------- TIME ------------------------- */}
        <div className="relative" ref={timeRef}>
          <label className="block text-sm font-medium text-brand-text-light mb-1">
            Time {required && <span className="text-red-500">*</span>}
          </label>

          <button
            type="button"
            className="w-full h-12 rounded-md border border-slate-300 bg-white pl-10 pr-10 text-left
                       focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary relative"
            onClick={() => {
              setOpenTimes((v) => !v);
              setOpenCal(false);
            }}
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/4 pointer-events-none">
              {/* Clock icon */}
              <svg className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-12a.75.75 0 00-1.5 0v4c0 .199.079.39.22.53l2.5 2.5a.75.75 0 101.06-1.06l-2.28-2.28V6z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="block truncate">{time ? formatTime12(time) : "Select Time"}</span>
            <span className="absolute right-6 top-1/2 -translate-y-1/4 text-slate-800">▾</span>
          </button>

          {openTimes && (
            <TimeWheel
              initial={time || "00:00"}
              onConfirm={pickTime}
              onClose={() => setOpenTimes(false)}
            />
          )}
        </div>
      </div>

      {/* Hidden input keeps combined required validation */}
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
