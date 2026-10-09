import Home from "@/components/Home";
import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  // Home uses the full title without the "| brand" template suffix.
  title: { absolute: `${SITE_NAME} | ${SITE_TAGLINE}` },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <Home />;
}
