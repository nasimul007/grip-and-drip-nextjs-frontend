import Link from "next/link";
import JsonLd from "./JsonLd";
import { absoluteUrl } from "@/lib/site";

export type BreadcrumbItem = { name: string; href?: string };

type Props = {
  /** Page heading rendered as the page's <h1>. Omit when the page has its own <h1>. */
  title?: string;
  items: BreadcrumbItem[];
};

const Breadcrumb = ({ title, items }: Props) => {
  const trail: BreadcrumbItem[] = [{ name: "Home", href: "/" }, ...items];
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <div className="overflow-hidden shadow-breadcrumb">
      <JsonLd data={schema} />
      <div className="border-t border-brand-border">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-5 xl:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {title && (
              <h1 className="font-semibold text-white text-xl sm:text-2xl xl:text-custom-2">
                {title}
              </h1>
            )}
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-custom-sm">
                {trail.map((item, i) => {
                  const last = i === trail.length - 1;
                  return (
                    <li key={`${item.name}-${i}`} className="flex items-center gap-1.5">
                      {item.href && !last ? (
                        <Link href={item.href} className="text-brand-muted hover:text-brand-accent">
                          {item.name}
                        </Link>
                      ) : (
                        <span
                          className="text-brand-accent line-clamp-1"
                          aria-current={last ? "page" : undefined}
                        >
                          {item.name}
                        </span>
                      )}
                      {!last && <span className="text-brand-muted" aria-hidden="true">/</span>}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
