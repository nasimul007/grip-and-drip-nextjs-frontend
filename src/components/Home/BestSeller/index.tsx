"use client";
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import Link from "next/link";
import { api } from "@/lib/api";
import { mapProductForDisplay } from "@/lib/mappers";
import type { ProductListItem, PaginatedResponse } from "@/lib/types";
import type { Product } from "@/types/product";

const BestSeller = () => {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    api
      .get<PaginatedResponse<ProductListItem>>(
        "/api/products/?is_featured=true&page_size=6"
      )
      .then((data) => setItems(data.results.map(mapProductForDisplay)))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="overflow-hidden bg-brand-dark">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-brand-accent mb-1.5">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.5 0.5L10.163 5.837L15.5 7.5L10.163 9.163L8.5 14.5L6.837 9.163L1.5 7.5L6.837 5.837L8.5 0.5Z" fill="#00D4AA"/>
              </svg>
              This Month
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-white">
              Best Sellers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {items.slice(1, 7).map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border border-brand-border bg-brand-card text-white ease-out duration-200 hover:bg-brand-accent hover:text-white hover:border-brand-accent"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
