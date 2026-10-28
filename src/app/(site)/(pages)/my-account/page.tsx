import MyAccount from "@/components/MyAccount";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "My account",
  description: "Manage your orders, addresses and account details.",
  alternates: { canonical: "/my-account" },
  robots: { index: false, follow: true },
};

const MyAccountPage = () => {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <MyAccount />
    </main>
  );
};

export default MyAccountPage;
