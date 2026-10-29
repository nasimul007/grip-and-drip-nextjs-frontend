import React from "react";

/** Centered card used by sign-in and sign-up. */
export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section className="bg-brand-dark py-8 sm:py-14">
      <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="mx-auto w-full max-w-[460px] rounded-xl border border-brand-border bg-brand-card p-5 sm:p-7">
          <h1 className="text-xl font-semibold text-white sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>}
          <div className="mt-5">{children}</div>
          {footer && <div className="mt-5 border-t border-brand-border pt-4 text-center text-sm">{footer}</div>}
        </div>
      </div>
    </section>
  );
}
