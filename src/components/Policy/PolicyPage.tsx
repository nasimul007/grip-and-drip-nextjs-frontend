import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { POLICIES, getPolicy } from "@/lib/policies";

export function policyMetadata(slug: string): Metadata {
  const policy = getPolicy(slug);
  if (!policy) return {};
  return {
    title: policy.title,
    description: policy.description,
    alternates: { canonical: `/${policy.slug}` },
  };
}

export default function PolicyPage({ slug }: { slug: string }) {
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <main>
      <Breadcrumb title={policy.title} items={[{ name: policy.title }]} />
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-8 lg:py-12 flex flex-col lg:flex-row gap-10">
        <article className="max-w-[760px] flex-1">
          <p className="text-custom-sm text-brand-muted mb-6">
            Last updated: <time dateTime={policy.updated}>{policy.updated}</time>
          </p>
          {policy.sections.map((section) => (
            <section key={section.heading} className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-3">{section.heading}</h2>
              {section.body.map((para, i) => (
                <p key={i} className="mb-2 leading-relaxed">
                  {para}
                </p>
              ))}
            </section>
          ))}
          <p>
            Questions? <Link href="/contact" className="text-brand-accent hover:underline">Contact us</Link>.
          </p>
        </article>
        <nav aria-label="Policies" className="lg:w-[260px]">
          <ul className="rounded-lg border border-brand-border bg-brand-card divide-y divide-brand-border">
            {POLICIES.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${p.slug}`}
                  aria-current={p.slug === slug ? "page" : undefined}
                  className={`block px-4 py-3 text-custom-sm hover:text-brand-accent ${
                    p.slug === slug ? "text-brand-accent" : "text-white"
                  }`}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
