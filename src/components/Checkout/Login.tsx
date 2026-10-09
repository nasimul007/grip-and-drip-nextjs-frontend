import React from "react";
import Link from "next/link";

/** Slim strip above the form: back to cart, and a sign-in prompt for guests. */
const Login = ({ isAuthenticated }: { isAuthenticated: boolean }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
    <Link href="/cart" className="text-brand-accent hover:underline">
      ← Back to cart
    </Link>
    {!isAuthenticated && (
      <p className="text-brand-muted">
        Have an account?{" "}
        <Link href="/signin" className="font-medium text-white hover:text-brand-accent">
          Sign in
        </Link>{" "}
        for faster checkout
      </p>
    )}
  </div>
);

export default Login;
