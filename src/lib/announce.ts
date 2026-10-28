/** Say something to screen-reader users through the page's polite live region. */
export function announce(message: string): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById("a11y-live");
  if (!el) return;
  el.textContent = "";
  // A short delay makes repeated identical messages announce again.
  window.setTimeout(() => {
    el.textContent = message;
  }, 50);
}
