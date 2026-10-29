import JsonLd from "./JsonLd";

export type Faq = { question: string; answer: string };

/** Plain accordion (native <details>, no JS) plus FAQPage structured data. */
export default function FaqSection({ faqs, title = "Frequently asked questions" }: { faqs: Faq[]; title?: string }) {
  if (!faqs.length) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <section className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-16" aria-labelledby="faq-heading">
      <JsonLd data={schema} />
      <h2 id="faq-heading" className="mb-4 text-xl font-semibold text-white">{title}</h2>
      <div className="divide-y divide-brand-border rounded-lg border border-brand-border bg-brand-card">
        {faqs.map((f) => (
          <details key={f.question} className="group px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-white">
              {f.question}
              <span aria-hidden="true" className="text-brand-accent transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-custom-sm text-brand-muted">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
