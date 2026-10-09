"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import SectionNav from "./SectionNav";
import { attributeRows, type KeyDetail } from "@/lib/product-display";

type Props = {
  title: string;
  description?: string;
  attributes?: Record<string, unknown>;
  brand?: string;
  sku?: string;
  categoryName?: string;
};

const COLLAPSED_PX = 320;
const SECTION = "scroll-mt-[calc(var(--header-h,60px)+56px)]";

function DescriptionBlock({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tall, setTall] = useState(false);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setTall(el.scrollHeight > COLLAPSED_PX + 80);
  }, [html]);

  const collapsed = tall && !open;
  return (
    <div>
      <div
        ref={ref}
        id="description-content"
        className="product-description text-sm relative overflow-hidden"
        style={collapsed ? { maxHeight: COLLAPSED_PX } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {collapsed && (
        <div className="-mt-16 h-16 relative pointer-events-none bg-gradient-to-t from-brand-dark to-transparent" aria-hidden="true" />
      )}
      {tall && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="description-content"
          className="mt-3 text-sm font-medium text-brand-accent hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export default function ProductSections({ title, description, attributes, brand, sku, categoryName }: Props) {
  const rows: KeyDetail[] = attributeRows(attributes);
  const has = (label: string) => rows.some((r) => r.label.toLowerCase() === label);
  if (brand && !has("brand")) rows.unshift({ label: "Brand", value: brand });
  if (categoryName && !has("category")) rows.push({ label: "Category", value: categoryName });
  if (sku && !has("sku")) rows.push({ label: "SKU", value: sku });

  const nav = [
    { id: "specification", label: "Specification" },
    { id: "description", label: "Description" },
  ];

  return (
    <div className="bg-brand-dark">
      <SectionNav items={nav} />

      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-6 sm:py-8 flex flex-col gap-10">
        <section id="specification" className={SECTION} aria-labelledby="specification-heading">
          <h2 id="specification-heading" className="text-base font-semibold text-white mb-3">
            Specification
          </h2>
          {rows.length > 0 ? (
            <table className="w-full text-sm border border-brand-border rounded-lg overflow-hidden">
              <caption className="sr-only">{title} specifications</caption>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.label}-${i}`} className="odd:bg-brand-card even:bg-brand-surface align-top">
                    <th scope="row" className="w-2/5 sm:w-[28%] text-left font-normal text-brand-muted capitalize py-2.5 px-4 border-b border-brand-border">
                      {r.label}
                    </th>
                    <td className="text-white py-2.5 px-4 border-b border-brand-border">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-brand-muted">No specifications listed for this product.</p>
          )}
        </section>

        <section id="description" className={SECTION} aria-labelledby="description-heading">
          <h2 id="description-heading" className="text-base font-semibold text-white mb-3">
            Description
          </h2>
          {description ? <DescriptionBlock html={description} /> : <p className="text-sm text-brand-muted">No description available.</p>}
        </section>
      </div>
    </div>
  );
}
