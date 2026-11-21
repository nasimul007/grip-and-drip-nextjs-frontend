import Image from "next/image";
import Link from "next/link";
import { mediaPath } from "@/lib/media";
import { mediaUrl } from "@/lib/site";
import type { CategoryNode } from "@/lib/server-api";

/** Apple-style "shop by type" tiles for a parent category's sub-categories. */
export default function SubcategoryTiles({ items, heading }: { items: CategoryNode[]; heading: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={heading} className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pt-8 pb-4">
      <h2 className="mb-5 text-custom-xl font-semibold text-white">{heading}</h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-5">
        {items.map((c) => {
          const src = mediaUrl(c.image);
          return (
            <li key={c.id}>
              <Link
                href={`/category/${c.slug}`}
                className="group flex h-full flex-col items-center rounded-lg border border-brand-border bg-brand-card p-3 text-center ease-out duration-200 hover:border-brand-accent"
              >
                <span className="relative mb-3 flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-md bg-brand-surface">
                  {src ? (
                    <Image
                      src={mediaPath(src)}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 370px"
                      className="object-contain p-3 mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span aria-hidden="true" className="text-4xl font-semibold text-brand-faint">
                      {c.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="font-medium text-white group-hover:text-brand-accent">{c.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
