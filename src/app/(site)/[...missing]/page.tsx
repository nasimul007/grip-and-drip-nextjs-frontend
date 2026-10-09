import { notFound } from "next/navigation";

// Any URL without a route renders the site 404 inside the main layout.
export default function CatchAll() {
  notFound();
}
