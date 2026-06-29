import React, { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop Page | NextCommerce Nextjs E-commerce template",
  description: "This is Shop Page for NextCommerce Template",
  // other metadata
};

const ShopWithSidebarPage = () => {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <ShopWithSidebar />
      </Suspense>
    </main>
  );
};

export default ShopWithSidebarPage;
