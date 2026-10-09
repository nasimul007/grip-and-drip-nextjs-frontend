import Signin from "@/components/Auth/Signin";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Gadget & Widget account to track orders and check out faster.",
  alternates: { canonical: "/signin" },
  robots: { index: false, follow: true },
};

const SigninPage = () => {
  return (
    <main>
      <Signin />
    </main>
  );
};

export default SigninPage;
