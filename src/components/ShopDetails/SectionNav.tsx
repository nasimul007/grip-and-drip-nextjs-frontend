"use client";
import React, { useEffect, useState } from "react";

type Item = { id: string; label: string };

/** Sticky in-page navigation under the site header; highlights the section in view. */
export default function SectionNav({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const header =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 60;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A section is "current" while its top is in the band just under the sticky bars.
      { rootMargin: `-${header + 56}px 0px -60% 0px`, threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  return (
    <nav
      aria-label="Product information"
      className="sticky z-40 bg-brand-surface border-y border-brand-border"
      style={{ top: "var(--header-h, 60px)" }}
    >
      <ul className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 flex gap-6">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => go(e, item.id)}
              aria-current={active === item.id ? "true" : undefined}
              className={`block py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active === item.id
                  ? "text-brand-accent border-brand-accent"
                  : "text-white border-transparent hover:text-brand-accent"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
