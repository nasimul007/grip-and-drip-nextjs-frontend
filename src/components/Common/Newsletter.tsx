"use client";
import React, { useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/newsletter/subscribe/", { email });
      toast.success("Successfully subscribed!");
      setEmail("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Subscription failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden bg-brand-dark">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 pb-20">
        <div className="relative z-1 overflow-hidden rounded-xl">
          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt="background illustration"
            className="absolute -z-1 w-full h-full left-0 top-0 rounded-xl opacity-20"
            width={1170}
            height={200}
          />
          <div className="absolute -z-1 max-w-[523px] max-h-[243px] w-full h-full right-0 top-0 bg-gradient-1 opacity-30"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-7.5 xl:pl-12.5 xl:pr-14 py-11">
            <div className="max-w-[491px] w-full">
              <h2 className="max-w-[399px] text-white font-bold text-lg sm:text-xl xl:text-heading-4 mb-3">
                Don&apos;t Miss Out Latest Trends & Offers
              </h2>
              <p className="text-brand-muted">
                Register to receive news about the latest offers & discount
                codes
              </p>
            </div>

            <div className="max-w-[477px] w-full">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-brand-card border border-brand-border outline-none rounded-md placeholder:text-brand-muted py-3 px-5 text-white"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-3 px-7 text-white bg-brand-accent font-medium rounded-md ease-out duration-200 hover:bg-brand-hover disabled:opacity-50"
                  >
                    {loading ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
