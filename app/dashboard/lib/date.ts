export function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function makeUtcRangeFromDateInputs(from: string, to: string) {
  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T23:59:59.999Z`);
  return { fromDate, toDate };
}

export function getTodayRange() {
  const today = new Date();
  const value = toLocalDateInputValue(today);
  return { from: value, to: value };
}

export function getLastNDaysRange(days: number) {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - (days - 1));
  return { from: toLocalDateInputValue(from), to: toLocalDateInputValue(to) };
}

export function getThisMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: toLocalDateInputValue(start), to: toLocalDateInputValue(end) };
}

export function getPreviousMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return { from: toLocalDateInputValue(start), to: toLocalDateInputValue(end) };
}

function parseMonthValue(monthValue: string) {
  const [y, m] = monthValue.split("-");
  const year = Number(y);
  const monthIndex = Number(m) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return null;
  if (monthIndex < 0 || monthIndex > 11) return null;
  return { year, monthIndex };
}

export function getMonthHalfRange(monthValue: string, half: "H1" | "H2") {
  const parsed = parseMonthValue(monthValue);
  if (!parsed) return null;

  const { year, monthIndex } = parsed;
  const start = new Date(year, monthIndex, half === "H1" ? 1 : 16);
  const end =
    half === "H1"
      ? new Date(year, monthIndex, 15)
      : new Date(year, monthIndex + 1, 0);

  return { from: toLocalDateInputValue(start), to: toLocalDateInputValue(end) };
}
