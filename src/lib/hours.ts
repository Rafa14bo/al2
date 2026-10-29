/**
 * Opening hours by weekday (0 = Sunday), minutes since midnight in Barretos/SP time.
 * A close value above 1440 means the shift ends after midnight (e.g. 00h30 = 1470).
 */
const SHIFT = { open: 18 * 60, close: 24 * 60 + 30 };

export const OPENING_HOURS: { day: string; open: number | null; close: number | null }[] = [
  { day: "Domingo", ...SHIFT },
  { day: "Segunda", open: null, close: null },
  { day: "Terça", ...SHIFT },
  { day: "Quarta", ...SHIFT },
  { day: "Quinta", ...SHIFT },
  { day: "Sexta", ...SHIFT },
  { day: "Sábado", ...SHIFT },
];

export function formatMinutes(m: number) {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, "0")}h${min ? String(min).padStart(2, "0") : ""}`;
}

export function isOpenAt(weekday: number, minutes: number) {
  const today = OPENING_HOURS[weekday];
  if (today && today.open !== null && today.close !== null && minutes >= today.open && minutes < today.close) {
    return true;
  }
  // Shift from the previous day that runs past midnight.
  const prev = OPENING_HOURS[(weekday + 6) % 7];
  if (prev && prev.close !== null && prev.close > 1440 && minutes < prev.close - 1440) return true;
  return false;
}

/** Current weekday/minutes in São Paulo time (same as Barretos), regardless of visitor timezone. */
export function nowInSaoPaulo(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const minutes = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
  return { weekday, minutes };
}
