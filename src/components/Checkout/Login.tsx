import React from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";

/** Slim strip above the form: back to cart, and a sign-in prompt for guests. */
const Login = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const { t } = useT();
  return (
  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
    <Link href="/cart" className="text-brand-accent hover:underline">
      ← {t("Back to cart")}
    </Link>
    {!isAuthenticated && (
      <p className="text-brand-muted">
        {t("Have an account?")}{" "}
        <Link href="/signin?next=/checkout" className="font-medium text-white hover:text-brand-accent">
          {t("Sign in")}
        </Link>{" "}
        {t("for faster checkout")}
      </p>
    )}
  </div>
  );
};

export default Login;
