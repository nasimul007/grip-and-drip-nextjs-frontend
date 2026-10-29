"use client";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AddressModal from "./AddressModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Orders from "../Orders";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { TextField } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { setUser } from "@/redux/features/auth-slice";
import { createAddress, updateAddress, deleteAddress, setDefaultShipping, fetchAddresses } from "@/redux/features/address-slice";
import { api } from "@/lib/api";
import { useLogout } from "@/lib/useLogout";
import { useT } from "@/lib/i18n/client";
import type { User, Address, AddressFormData } from "@/lib/types";

type Tab = "orders" | "details" | "addresses";
const TABS: { id: Tab; label: string }[] = [
  { id: "orders", label: "Orders" },
  { id: "details", label: "Account details" },
  { id: "addresses", label: "Addresses" },
];

const card = "rounded-xl border border-brand-border bg-brand-card";

function AccountDetails() {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.authReducer.user);
  const [form, setForm] = useState({ full_name: "", email: "", phone_number: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [pw, setPw] = useState({ old: "", next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwMessage, setPwMessage] = useState("");

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || "", email: user.email || "", phone_number: user.phone_number || "" });
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return (setStatus("error"), setMessage(t("Enter your full name.")));
    if (form.phone_number.trim() && !/^(?:\+?88)?01[3-9]\d{8}$/.test(form.phone_number.replace(/[\s-]/g, ""))) {
      return (setStatus("error"), setMessage(t("Enter a valid Bangladeshi mobile number (01XXXXXXXXX).")));
    }
    setStatus("saving");
    try {
      const updated = await api.patch<User>("/api/auth/profile/", { ...form, phone_number: form.phone_number.replace(/[\s-]/g, "") });
      dispatch(setUser(updated));
      setStatus("saved");
      setMessage(t("Your details were saved."));
    } catch (err) {
      setStatus("error");
      setMessage((err as Error).message || t("Could not save your details."));
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.old || !pw.next) return (setPwStatus("error"), setPwMessage(t("Fill in all password fields.")));
    if (pw.next.length < 8) return (setPwStatus("error"), setPwMessage(t("Use at least 8 characters.")));
    if (pw.next !== pw.confirm) return (setPwStatus("error"), setPwMessage(t("Passwords do not match.")));
    setPwStatus("saving");
    try {
      await api.post("/api/auth/password/change/", { old_password: pw.old, new_password: pw.next, confirm_new_password: pw.confirm });
      setPw({ old: "", next: "", confirm: "" });
      setPwStatus("saved");
      setPwMessage(t("Password changed."));
    } catch (err) {
      setPwStatus("error");
      setPwMessage((err as Error).message || t("Could not change the password."));
    }
  };

  const note = (s: string, m: string) =>
    s === "saved" ? (
      <p role="status" className="text-sm text-brand-accent">{m}</p>
    ) : s === "error" ? (
      <p role="alert" className="text-sm text-red">{m}</p>
    ) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={saveProfile} noValidate className={`${card} flex flex-col gap-4 p-4 sm:p-5`}>
        <h2 className="text-base font-semibold text-white">{t("Your details")}</h2>
        <TextField id="full_name" label={t("Full name")} autoComplete="name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <TextField id="email" type="email" label={t("Email")} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <TextField id="phone_number" type="tel" label={t("Mobile number")} placeholder="01XXXXXXXXX" autoComplete="tel" inputMode="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
        {note(status, message)}
        <button type="submit" disabled={status === "saving"} className="h-10 self-start rounded-md bg-brand-accent px-6 text-sm font-medium text-brand-dark hover:bg-brand-hover disabled:opacity-60">
          {status === "saving" ? t("Saving…") : t("Save changes")}
        </button>
      </form>

      <form onSubmit={changePassword} noValidate className={`${card} flex flex-col gap-4 p-4 sm:p-5`}>
        <h2 className="text-base font-semibold text-white">{t("Change password")}</h2>
        <PasswordInput id="old_password" name="old_password" label={t("Current password")} autoComplete="current-password" value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} variant="account" />
        <PasswordInput id="new_password" name="new_password" label={t("New password")} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} variant="account" />
        <PasswordInput id="confirm_password" name="confirm_password" label={t("Confirm new password")} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} variant="account" />
        {note(pwStatus, pwMessage)}
        <button type="submit" disabled={pwStatus === "saving"} className="h-10 self-start rounded-md border border-brand-border px-6 text-sm font-medium text-white hover:border-brand-accent disabled:opacity-60">
          {pwStatus === "saving" ? t("Saving…") : t("Update password")}
        </button>
      </form>
    </div>
  );
}

function Addresses() {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.authReducer.user);
  const addresses = useAppSelector((s) => (Array.isArray(s.addressReducer?.addresses) ? s.addressReducer.addresses : []));
  const saving = useAppSelector((s) => !!s.addressReducer?.loading);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const save = async (data: AddressFormData) => {
    if (editing) await dispatch(updateAddress({ id: editing.id, data })).unwrap();
    else await dispatch(createAddress(data)).unwrap();
    toast.success(editing ? t("Address updated.") : t("Address added."));
    setModal(false);
    setEditing(null);
    dispatch(fetchAddresses());
  };

  const makeDefault = async (id: number) => {
    try {
      await dispatch(setDefaultShipping(id)).unwrap();
      await dispatch(fetchAddresses());
    } catch (err) {
      toast.error((err as Error)?.message || t("Could not set the default address."));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await dispatch(deleteAddress(deleting.id)).unwrap();
      toast.success(t("Address deleted."));
    } catch (err) {
      toast.error((err as Error)?.message || t("Could not delete the address."));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className={card}>
      <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-3.5 sm:px-5">
        <h2 className="text-lg font-semibold text-white">{t("Saved addresses")}</h2>
        <button type="button" onClick={() => { setEditing(null); setModal(true); }} className="h-9 rounded-md bg-brand-accent px-4 text-sm font-medium text-brand-dark hover:bg-brand-hover">
          + {t("Add address")}
        </button>
      </div>

      {addresses.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-brand-muted">{t("You have no saved addresses yet. Add one to check out faster.")}</p>
      ) : (
        <ul className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          {addresses.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 rounded-lg border border-brand-border bg-brand-surface p-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{a.address_name}</span>
                {a.is_default_shipping && <span className="rounded bg-brand-accent px-1.5 py-0.5 text-[10px] font-semibold text-brand-dark">{t("Default")}</span>}
              </div>
              {(a.recipient_name || a.phone) && <p className="text-brand-muted">{[a.recipient_name, a.phone].filter(Boolean).join(" · ")}</p>}
              <p className="text-brand-muted">{a.address}, {a.area_name}, {a.city_name}, {a.division_name}</p>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1">
                <button type="button" onClick={() => { setEditing(a); setModal(true); }} className="text-brand-accent hover:underline">{t("Edit")}</button>
                {!a.is_default_shipping && <button type="button" onClick={() => makeDefault(a.id)} className="text-brand-accent hover:underline">{t("Make default")}</button>}
                <button type="button" onClick={() => setDeleting(a)} className="text-red hover:underline">{t("Delete")}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddressModal
        isOpen={modal}
        mode={editing ? "edit" : "add"}
        initialData={editing || undefined}
        onClose={() => { setModal(false); setEditing(null); }}
        onSubmit={save}
        loading={saving}
        defaults={{ recipient_name: user?.full_name, phone: user?.phone_number }}
      />
      <DeleteConfirmModal isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={confirmDelete} loading={saving} />
    </div>
  );
}

function AccountInner() {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const user = useAppSelector((s) => s.authReducer.user);
  const isAuthenticated = useAppSelector((s) => s.authReducer.isAuthenticated);
  const logout = useLogout();
  const dispatch = useAppDispatch();
  const [checked, setChecked] = useState(false);
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("access_token");

  const tab = (TABS.find((x) => x.id === params.get("tab"))?.id || "orders") as Tab;
  const go = (id: Tab) => router.replace(`${pathname}?tab=${id}`, { scroll: false });

  useEffect(() => {
    setChecked(true);
    if (!localStorage.getItem("access_token")) return;
    api.get<User>("/api/auth/profile/").then((u) => dispatch(setUser(u))).catch(() => {});
  }, [dispatch]);

  if (checked && !isAuthenticated && !hasToken) {
    return (
      <section className="bg-brand-dark py-12">
        <div className="mx-auto w-full max-w-[460px] px-4">
          <div className={`${card} p-6 text-center`}>
            <h1 className="text-xl font-semibold text-white">{t("Sign in to see your account")}</h1>
            <p className="mt-1 text-sm text-brand-muted">{t("Your orders, addresses and details are here once you sign in.")}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/signin?next=/my-account" className="rounded-md bg-brand-accent px-6 py-2.5 font-medium text-brand-dark hover:bg-brand-hover">{t("Sign in")}</Link>
              <Link href="/signup?next=/my-account" className="rounded-md border border-brand-border px-6 py-2.5 font-medium text-white hover:border-brand-accent">{t("Create an account")}</Link>
            </div>
            <p className="mt-4 text-sm text-brand-muted">
              {t("Ordered as a guest?")}{" "}
              <Link href="/track-order" className="text-brand-accent underline underline-offset-2">{t("Track your order")}</Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  const name = user?.full_name || user?.username || "";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

  return (
    <>
      <Breadcrumb title={t("My account")} items={[{ name: "My account" }]} />
      <section className="bg-brand-dark pb-16 pt-4">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className={`${card} mb-4 flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5`}>
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-accent text-lg font-semibold text-brand-dark" aria-hidden="true">{initials}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{name || t("Your account")}</p>
                <p className="truncate text-custom-sm text-brand-muted">{[user?.email, user?.phone_number].filter(Boolean).join(" · ")}</p>
              </div>
            </div>
            <button type="button" onClick={() => { logout(); router.push("/signin"); }} className="h-9 rounded-md border border-brand-border px-4 text-sm font-medium text-white hover:border-red hover:text-red">
              {t("Logout")}
            </button>
          </div>

          <div role="tablist" aria-label={t("Account sections")} className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
            {TABS.map((x) => (
              <button
                key={x.id}
                id={`tab-${x.id}`}
                role="tab"
                type="button"
                aria-selected={tab === x.id}
                aria-controls={`panel-${x.id}`}
                onClick={() => go(x.id)}
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium ${tab === x.id ? "bg-brand-accent text-brand-dark" : "border border-brand-border bg-brand-card text-white hover:border-brand-accent"}`}
              >
                {t(x.label)}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === "orders" && <div className={card}><Orders /></div>}
            {tab === "details" && <AccountDetails />}
            {tab === "addresses" && <Addresses />}
          </div>
        </div>
      </section>
    </>
  );
}

const MyAccount = () => (
  <Suspense fallback={null}>
    <AccountInner />
  </Suspense>
);

export default MyAccount;
