import Signup from "@/components/Auth/Signup";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Gadget & Widget account to track orders and save addresses.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: true },
};

const SignupPage = () => {
  return (
    <main>
      <Signup />
    </main>
  );
};

export default SignupPage;
