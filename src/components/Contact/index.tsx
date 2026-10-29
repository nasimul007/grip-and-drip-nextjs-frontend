"use client";
import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { api } from "@/lib/api";
import { CONTACT, telHref, whatsappHref } from "@/lib/site";
import { useT } from "@/lib/i18n/client";
import { PhoneIcon, TruckIcon, UserIcon, WhatsAppIcon } from "../Common/icons";

const card = "rounded-xl border border-brand-border bg-brand-card";

function ContactInner() {
  const { t } = useT();
  const params = useSearchParams();
  const topic = params.get("topic");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: topic === "password" ? t("Password reset request") : "",
    message: topic === "password" ? t("I forgot my password. Please help me reset it. My account email is:") + " " : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = t("Enter your name.");
    if (!form.email.trim()) err.email = t("Enter your email.");
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) err.email = t("Enter a valid email address.");
    if (!form.message.trim()) err.message = t("Write your message.");
    setErrors(err);
    setFormError("");
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      await api.post("/api/contact/", { name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim(), message: form.message.trim() });
      setSent(true);
    } catch (e2) {
      setFormError((e2 as Error).message || t("Could not send your message. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const wa = whatsappHref();
  return (
    <>
      <Breadcrumb title={t("Contact us")} items={[{ name: "Contact" }]} />
      <section className="bg-brand-dark pb-16 pt-4">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col gap-4 lg:flex-row">
            <aside className={`${card} w-full self-start lg:max-w-[360px]`}>
              <h2 className="border-b border-brand-border px-4 py-3.5 text-base font-semibold text-white sm:px-5">{t("Contact information")}</h2>
              <ul className="flex flex-col gap-4 p-4 text-sm sm:p-5">
                {CONTACT.address && (
                  <li className="flex items-start gap-3"><TruckIcon className="mt-0.5 shrink-0 text-brand-accent" size={18} /><span>{CONTACT.address}</span></li>
                )}
                {CONTACT.phone && (
                  <li className="flex items-center gap-3"><PhoneIcon className="shrink-0 text-brand-accent" size={18} /><a href={telHref(CONTACT.phone)} className="text-white hover:text-brand-accent">{CONTACT.phone}</a></li>
                )}
                {wa && (
                  <li className="flex items-center gap-3"><WhatsAppIcon className="shrink-0 text-[#25D366]" size={18} /><a href={wa} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-accent">{t("Chat on WhatsApp")}</a></li>
                )}
                {CONTACT.email && (
                  <li className="flex items-center gap-3"><UserIcon className="shrink-0 text-brand-accent" size={18} /><a href={`mailto:${CONTACT.email}`} className="text-white hover:text-brand-accent">{CONTACT.email}</a></li>
                )}
                <li className="text-custom-sm text-brand-muted">{t("Support hours: Saturday – Thursday, 10 AM – 8 PM")}</li>
              </ul>
            </aside>

            <div className={`${card} min-w-0 flex-1 p-4 sm:p-6`}>
              {sent ? (
                <div role="status" className="py-8 text-center">
                  <h2 className="text-lg font-semibold text-white">{t("Message sent")}</h2>
                  <p className="mt-1 text-sm text-brand-muted">{t("Thank you. We will reply to your email as soon as we can.")}</p>
                  <button type="button" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="mt-5 h-10 rounded-md border border-brand-border px-5 text-sm font-medium text-white hover:border-brand-accent">
                    {t("Send another message")}
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="flex flex-col gap-4">
                  <h2 className="text-base font-semibold text-white">{t("Send us a message")}</h2>
                  {formError && <p role="alert" className="rounded-md border border-red bg-red-light-6/10 px-3.5 py-2.5 text-sm text-white">{formError}</p>}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField id="name" label={t("Your name")} autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} required />
                    <TextField id="email" type="email" label={t("Email")} autoComplete="email" inputMode="email" value={form.email} onChange={set("email")} error={errors.email} required />
                  </div>
                  <TextField id="subject" label={t("Subject")} value={form.subject} onChange={set("subject")} />
                  <TextAreaField id="message" label={t("Message")} rows={6} value={form.message} onChange={set("message")} error={errors.message} required />
                  <button type="submit" disabled={loading} className="h-11 self-start rounded-md bg-brand-accent px-8 font-medium text-brand-dark hover:bg-brand-hover disabled:opacity-60">
                    {loading ? t("Sending…") : t("Send message")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const Contact = () => (
  <Suspense fallback={null}>
    <ContactInner />
  </Suspense>
);

export default Contact;
