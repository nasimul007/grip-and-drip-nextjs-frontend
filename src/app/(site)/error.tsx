"use client";
import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="bg-brand-dark py-16">
      <div className="mx-auto w-full max-w-[520px] px-4 text-center">
        <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
        <p className="mt-2 text-brand-muted">
          We could not load this page. It is usually a short hiccup, so please try again.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="rounded-md bg-brand-accent px-6 py-2.5 font-medium text-brand-dark hover:bg-brand-hover">
            Try again
          </button>
          <Link href="/" className="rounded-md border border-brand-border px-6 py-2.5 font-medium text-white hover:border-brand-accent">
            Go to homepage
          </Link>
        </div>
      </div>
    </section>
  );
}
