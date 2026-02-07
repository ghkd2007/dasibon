export type PraiseCard = { title: string; imageUrl: string };

const PRAISES_JSON_REGEX = /^\[/;

export function parsePraises(value: string): PraiseCard[] {
  if (!value || !value.trim()) return [];
  const trimmed = value.trim();
  if (!PRAISES_JSON_REGEX.test(trimmed)) {
    return trimmed
      .split(/\n/)
      .map((line) => line.replace(/^#\s*/, "").trim())
      .filter(Boolean)
      .map((title) => ({ title, imageUrl: "" }));
  }
  try {
    const arr = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => ({
      title: typeof item?.title === "string" ? item.title : "",
      imageUrl: typeof item?.imageUrl === "string" ? item.imageUrl : "",
    }));
  } catch {
    return [];
  }
}

export function stringifyPraises(cards: PraiseCard[]): string {
  if (cards.length === 0) return "";
  return JSON.stringify(cards);
}
