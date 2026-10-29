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

function SignupForm() {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch();
  const next = safeNext(params.get("next"));
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password2: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = t("Enter your full name.");
    if (!form.email.trim()) err.email = t("Enter your email.");
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) err.email = t("Enter a valid email address.");
    if (form.phone.trim() && !/^(?:\+?88)?01[3-9]\d{8}$/.test(form.phone.replace(/[\s-]/g, ""))) err.phone = t("Enter a valid Bangladeshi mobile number (01XXXXXXXXX).");
    if (form.password.length < 8) err.password = t("Use at least 8 characters.");
    if (form.password2 !== form.password) err.password2 = t("Passwords do not match.");
    setErrors(err);
    setFormError("");
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      const data = await api.post<{ user: User; access: string; refresh: string }>("/api/auth/register/", {
        email: form.email.trim(),
        full_name: form.name.trim(),
        phone_number: form.phone.replace(/[\s-]/g, ""),
        password: form.password,
        password2: form.password2,
      });
      setTokens(data.access, data.refresh);
      dispatch(setUser(data.user));
      toast.success(t("Account created successfully!"));
      router.push(next);
    } catch (e2) {
      setFormError((e2 as Error).message || t("Could not create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t("Create an account")}
      subtitle={t("Track orders, save addresses and check out faster.")}
      footer={
        <p className="text-brand-muted">
          {t("Already have an account?")}{" "}
          <Link href={next === "/" ? "/signin" : `/signin?next=${encodeURIComponent(next)}`} className="font-medium text-brand-accent underline underline-offset-2">
            {t("Sign in")}
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
        <TextField id="name" label={t("Full name")} placeholder={t("Your name")} autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} required />
        <TextField id="email" type="email" label={t("Email")} placeholder="you@example.com" autoComplete="email" inputMode="email" value={form.email} onChange={set("email")} error={errors.email} required />
        <TextField id="phone" type="tel" label={t("Mobile number (optional)")} placeholder="01XXXXXXXXX" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set("phone")} error={errors.phone} hint={t("Used to prefill checkout and to find your orders.")} />
        <PasswordInput id="password" name="password" label={t("Password")} placeholder={t("At least 8 characters")} autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} variant="auth" />
        <PasswordInput id="password2" name="password2" label={t("Confirm password")} placeholder={t("Re-type your password")} autoComplete="new-password" value={form.password2} onChange={set("password2")} error={errors.password2} variant="auth" />
        <button type="submit" disabled={loading} className="mt-1 flex h-11 w-full items-center justify-center rounded-md bg-brand-accent font-medium text-brand-dark hover:bg-brand-hover disabled:opacity-60">
          {loading ? t("Creating account...") : t("Create account")}
        </button>
      </form>
    </AuthShell>
  );
}

const Signup = () => (
  <Suspense fallback={null}>
    <SignupForm />
  </Suspense>
);

export default Signup;
