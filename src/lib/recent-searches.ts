const KEY = "recent_searches";
const MAX = 6;

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((q) => typeof q === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  const q = query.trim();
  if (q.length < 2) return;
  try {
    const rest = getRecentSearches().filter((x) => x.toLowerCase() !== q.toLowerCase());
    localStorage.setItem(KEY, JSON.stringify([q, ...rest].slice(0, MAX)));
  } catch {}
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
