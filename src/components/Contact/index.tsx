"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import { api } from "@/lib/api";
import { CONTACT, telHref, whatsappHref } from "@/lib/site";
import { PhoneIcon, TruckIcon, UserIcon, WhatsAppIcon } from "../Common/icons";

const Contact = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) return;
    setLoading(true);
    try {
      await api.post("/api/contact/", {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      router.push("/mail-success");
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Contact us" items={[{ name: "Contact" }]} />

      <section className="overflow-hidden py-12 lg:py-20 bg-brand-dark">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <div className="xl:max-w-[370px] w-full bg-brand-card rounded-xl shadow-1">
              <div className="py-5 px-4 sm:px-7.5 border-b border-brand-border">
                <p className="font-medium text-xl text-white">
                  Contact Information
                </p>
              </div>

              <div className="p-4 sm:p-7.5">
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3">
                    <TruckIcon className="text-brand-accent shrink-0" size={20} />
                    <span>{CONTACT.address}</span>
                  </li>
                  {CONTACT.phone && (
                    <li className="flex items-center gap-3">
                      <PhoneIcon className="text-brand-accent shrink-0" size={20} />
                      <a href={telHref(CONTACT.phone)} className="text-white hover:text-brand-accent">{CONTACT.phone}</a>
                    </li>
                  )}
                  {whatsappHref() && (
                    <li className="flex items-center gap-3">
                      <WhatsAppIcon className="text-[#25D366] shrink-0" size={20} />
                      <a href={whatsappHref()!} target="_blank" rel="noopener noreferrer" className="text-white hover:text-brand-accent">
                        Chat on WhatsApp
                      </a>
                    </li>
                  )}
                  {CONTACT.email && (
                    <li className="flex items-center gap-3">
                      <UserIcon className="text-brand-accent shrink-0" size={20} />
                      <a href={`mailto:${CONTACT.email}`} className="text-white hover:text-brand-accent">{CONTACT.email}</a>
                    </li>
                  )}
                  <li className="text-custom-sm text-brand-muted">
                    Support hours: Saturday – Thursday, 10 AM – 8 PM
                  </li>
                </ul>
              </div>
            </div>

            <div className="xl:max-w-[770px] w-full bg-brand-card rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <label htmlFor="firstName" className="block mb-2.5">
                      First Name <span className="text-red">*</span>
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jhon"
                      className="rounded-md border border-brand-border bg-brand-card placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                    />
                  </div>

                  <div className="w-full">
                    <label htmlFor="lastName" className="block mb-2.5">
                      Last Name <span className="text-red">*</span>
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Deo"
                      className="rounded-md border border-brand-border bg-brand-card placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                    />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <label htmlFor="subject" className="block mb-2.5">
                      Subject
                    </label>

                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Type your subject"
                      className="rounded-md border border-brand-border bg-brand-card placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                    />
                  </div>

                  <div className="w-full">
                    <label htmlFor="email" className="block mb-2.5">
                      Email <span className="text-red">*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="rounded-md border border-brand-border bg-brand-card placeholder:text-brand-muted w-full py-2.5 px-5 outline-none duration-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                    />
                  </div>
                </div>

                <div className="mb-7.5">
                  <label htmlFor="message" className="block mb-2.5">
                    Message
                  </label>

                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message"
                    className="rounded-md border border-brand-border bg-brand-card placeholder:text-brand-muted w-full p-5 outline-none duration-200 focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex font-medium text-brand-dark bg-brand-accent py-3 px-7 rounded-md ease-out duration-200 hover:bg-brand-hover disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
