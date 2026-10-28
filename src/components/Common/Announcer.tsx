/** Visually hidden live region used by `announce()`. */
export default function Announcer() {
  return <div id="a11y-live" role="status" aria-live="polite" aria-atomic="true" className="sr-only" />;
}
