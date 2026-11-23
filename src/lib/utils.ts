export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function normalizeColor(input: string | null | undefined): string {
  const value = (input ?? "").trim();
  return HEX_COLOR.test(value) ? value : "#2563eb";
}

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./i, "")
    .toLowerCase();
}

export function timeAgo(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: Array<[number, string]> = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
  ];
  let value = seconds;
  let unit = "second";
  for (const [size, name] of units) {
    if (Math.abs(value) < size) {
      unit = name;
      break;
    }
    value = value / size;
    unit = name;
  }
  if (unit === "second") value = seconds;
  const rounded = Math.round(Math.abs(value));
  return `${rounded} ${unit}${rounded === 1 ? "" : "s"} ago`;
}
