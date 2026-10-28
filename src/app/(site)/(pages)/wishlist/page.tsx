import React from "react";
import { Wishlist } from "@/components/Wishlist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you saved for later.",
  alternates: { canonical: "/wishlist" },
  robots: { index: false, follow: true },
};

const WishlistPage = () => {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
