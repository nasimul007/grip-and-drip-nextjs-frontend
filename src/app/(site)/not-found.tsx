import type { Metadata } from "next";
import Error from "@/components/Error";
import { getCategoryTree } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const categories = (await getCategoryTree()).slice(0, 8);
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <Error categories={categories} />
    </main>
  );
}
