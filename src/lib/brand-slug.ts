/** URL-safe slug for a brand name: "JBL Pro" -> "jbl-pro". Pure, safe for client components. */
export function brandSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
