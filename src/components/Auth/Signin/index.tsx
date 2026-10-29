"use client";
import Link from "next/link";
import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { api, setTokens } from "@/lib/api";
import { setUser } from "@/redux/features/auth-slice";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { TextField } from "@/components/ui/Field";
import { useT } from "@/lib/i18n/client";
import type { User } from "@/lib/types";
import AuthShell from "../AuthShell";
import { safeNext } from "../safeNext";

function SigninForm() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next_errors: typeof errors = {};
    if (!email.trim()) next_errors.email = t("Enter your email.");
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next_errors.email = t("Enter a valid email address.");
    if (!password) next_errors.password = t("Enter your password.");
    setErrors(next_errors);
    setFormError("");
    if (Object.keys(next_errors).length) return;

    setLoading(true);
    try {
      const data = await api.post<{ access: string; refresh: string }>("/api/auth/login/", { email: email.trim(), password });
      setTokens(data.access, data.refresh);
      const user = await api.get<User>("/api/auth/profile/");
      dispatch(setUser(user));
      toast.success(t("Signed in successfully!"));
      router.push(next);
    } catch {
      setFormError(t("Wrong email or password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("Sign in")}
      subtitle={t("Welcome back. Sign in to see your orders and check out faster.")}
      footer={
        <p className="text-brand-muted">
          {t("New here?")}{" "}
          <Link href={next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`} className="font-medium text-brand-accent underline underline-offset-2">
            {t("Create an account")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && (
          <p role="alert" className="rounded-md border border-red bg-red-light-6/10 px-3.5 py-2.5 text-sm text-white">
            {formError}
          </p>
        )}
        <TextField
          id="email"
          type="email"
          label={t("Email")}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <PasswordInput
          id="password"
          name="password"
          label={t("Password")}
          placeholder={t("Enter your password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          variant="auth"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex h-11 w-full items-center justify-center rounded-md bg-brand-accent font-medium text-brand-dark hover:bg-brand-hover disabled:opacity-60"
        >
          {loading ? t("Signing in...") : t("Sign in")}
        </button>
        <p className="text-center text-sm">
          <Link href="/contact?topic=password" className="text-brand-muted underline underline-offset-2 hover:text-brand-accent">
            {t("Forgot password?")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

const Signin = () => (
  <Suspense fallback={null}>
    <SigninForm />
  </Suspense>
);

export default Signin;
