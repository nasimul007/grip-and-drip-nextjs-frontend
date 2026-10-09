import React from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";

type Props = {
  categories?: { id: number; name: string; slug: string }[];
};

const Error = ({ categories = [] }: Props) => {
  return (
    <>
      <Breadcrumb title="Page not found" items={[{ name: "Not found" }]} />
      <section className="overflow-hidden py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-brand-card border border-brand-border rounded-xl px-4 py-10 sm:py-15 lg:py-20 text-center">
            <Image src="/images/404.svg" alt="" className="mx-auto mb-8 w-1/2 sm:w-auto" width={288} height={190} />
            <h2 className="font-medium text-white text-xl sm:text-2xl mb-3">
              Sorry, we can’t find that page
            </h2>
            <p className="max-w-[440px] w-full mx-auto mb-7.5">
              It may have moved or no longer exists. Try searching for the product instead.
            </p>

            <form action="/shop" method="get" role="search" className="max-w-[420px] mx-auto flex gap-2 mb-7.5">
              <label htmlFor="notfound-search" className="sr-only">Search products</label>
              <input
                id="notfound-search"
                type="search"
                name="q"
                placeholder="Search products…"
                className="flex-1 rounded-md bg-brand-surface border border-brand-border py-2.5 px-4 text-white placeholder:text-brand-muted outline-none focus:border-brand-accent"
              />
              <button type="submit" className="rounded-md bg-brand-accent text-brand-dark font-medium px-5">
                Search
              </button>
            </form>

            {categories.length > 0 && (
              <nav aria-label="Popular categories" className="mb-7.5">
                <ul className="flex flex-wrap justify-center gap-2">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/category/${c.slug}`}
                        className="inline-block text-custom-sm text-white border border-brand-border rounded-full px-4 py-1.5 hover:border-brand-accent hover:text-brand-accent"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-2 font-medium text-white border border-brand-border py-3 px-6 rounded-md ease-out duration-200 hover:border-brand-accent"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Error;
