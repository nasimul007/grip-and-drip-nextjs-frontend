/**
 * Turns a variant colour label ("Space Grey", "Midnight Blue", "Black/Red", "Blue #3366ff")
 * into something a swatch can paint. Returns null when the label isn't recognisable, so the
 * caller can show the name as a text chip instead of a wrong colour.
 */

// Marketing / shade names that are not valid CSS colours (or look wrong as one).
const NAMED: Record<string, string> = {
  grey: "#808080",
  gray: "#808080",
  "space grey": "#53565a",
  "space gray": "#53565a",
  "dark grey": "#4b4f54",
  "dark gray": "#4b4f54",
  "light grey": "#d3d5d8",
  "light gray": "#d3d5d8",
  graphite: "#41424c",
  charcoal: "#36454f",
  "matte black": "#1c1c1e",
  "jet black": "#0a0a0a",
  "midnight": "#191970",
  "midnight blue": "#191970",
  "navy blue": "#1b2a5c",
  navy: "#1b2a5c",
  "sky blue": "#87ceeb",
  "light blue": "#9cc9f0",
  "dark blue": "#0b2a6f",
  "royal blue": "#2b4bd6",
  "ice blue": "#cfe8f7",
  "baby blue": "#a6d1f5",
  "sierra blue": "#9bb5ce",
  teal: "#0f9d9a",
  "mint green": "#98e5be",
  mint: "#98e5be",
  "olive green": "#556b2f",
  "dark green": "#0f5a32",
  "light green": "#a6e3a1",
  "forest green": "#228b22",
  "army green": "#4b5320",
  "alpine green": "#576856",
  "pine green": "#01796f",
  "rose gold": "#e0b4a8",
  gold: "#d4af37",
  "champagne gold": "#e6cfa5",
  champagne: "#f7e7ce",
  silver: "#c0c0c0",
  "starlight": "#f0e6d6",
  titanium: "#8d8d8a",
  "natural titanium": "#b5b0a6",
  "desert titanium": "#bfa48f",
  "black titanium": "#3c3c3d",
  "white titanium": "#e3e2dc",
  "pearl white": "#f5f3ee",
  "off white": "#f2efe6",
  "snow white": "#fffafa",
  cream: "#f5ecd7",
  ivory: "#fffff0",
  beige: "#d9c7a6",
  nude: "#e3bc9a",
  "sand": "#d8c3a0",
  khaki: "#bdb08a",
  coffee: "#6f4e37",
  brown: "#7b4a2b",
  "dark brown": "#4a2c1a",
  "light brown": "#a97c50",
  tan: "#c9a27a",
  burgundy: "#800020",
  maroon: "#6d1a24",
  wine: "#722f37",
  "wine red": "#7b1f2b",
  "dark red": "#8b0000",
  "light red": "#f08080",
  "coral": "#ff6f61",
  "coral red": "#ff4040",
  peach: "#ffcba4",
  "hot pink": "#ff3c8f",
  "light pink": "#f8c8dc",
  "pink": "#ff8fb1",
  magenta: "#d6249f",
  lavender: "#b9a7e0",
  lilac: "#c8a2c8",
  violet: "#8f5fd7",
  purple: "#7e3fbf",
  "light purple": "#c3a9e6",
  "deep purple": "#4a2a82",
  "mustard": "#d9a521",
  "lemon yellow": "#fde047",
  "orange": "#ff8c1a",
  "cosmic orange": "#ff7a2f",
  transparent: "#e9eef2",
  clear: "#e9eef2",
};

// Single words we can fall back on when a label mixes shade words ("Misty Blue", "Ocean Grey").
const BASE: Record<string, string> = {
  black: "#111111",
  white: "#ffffff",
  grey: "#808080",
  gray: "#808080",
  silver: "#c0c0c0",
  red: "#e02424",
  blue: "#2563eb",
  green: "#16a34a",
  yellow: "#facc15",
  orange: "#fb923c",
  pink: "#f472b6",
  purple: "#9333ea",
  violet: "#8b5cf6",
  brown: "#7b4a2b",
  gold: "#d4af37",
  beige: "#d9c7a6",
  cyan: "#06b6d4",
  navy: "#1b2a5c",
  teal: "#0f9d9a",
  titanium: "#8d8d8a",
  graphite: "#41424c",
  midnight: "#191970",
  cream: "#f5ecd7",
  crimson: "#dc143c",
  turquoise: "#30d5c8",
  indigo: "#4b0082",
  lime: "#84cc16",
  aqua: "#22d3ee",
  olive: "#6b7a2a",
  plum: "#8e4585",
  salmon: "#fa8072",
  chocolate: "#5a3a22",
  rose: "#e8607e",
  mint: "#98e5be",
  lavender: "#b9a7e0",
  bronze: "#a97142",
  copper: "#b87333",
};

const HEX = /#([0-9a-f]{3}|[0-9a-f]{6})\b/i;

function single(raw: string): string | null {
  const s = raw.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (!s) return null;
  const hex = s.match(HEX);
  if (hex) return `#${hex[1]}`;
  if (NAMED[s]) return NAMED[s];
  // Last recognised base word wins: "space grey" -> grey, "misty blue" -> blue.
  const words = s.split(" ");
  for (let i = words.length - 1; i >= 0; i--) if (BASE[words[i]]) return BASE[words[i]];
  return null;
}

/** CSS `background` value for a colour label, or null if it can't be read as a colour. */
export function colorBackground(label: string): string | null {
  const parts = label.split(/\s*(?:\/|&|\+|,|\band\b)\s*/i).filter(Boolean);
  if (parts.length > 1) {
    const colors = parts.map(single);
    if (colors.every(Boolean)) {
      const step = 100 / colors.length;
      return `conic-gradient(${colors.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(", ")})`;
    }
    return null;
  }
  return single(label);
}
