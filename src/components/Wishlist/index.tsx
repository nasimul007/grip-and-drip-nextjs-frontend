"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector } from "@/redux/store";
import SingleItem from "./SingleItem";
import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { useT } from "@/lib/i18n/client";

export const Wishlist = () => {
  const { t } = useT();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const dispatch = useDispatch<AppDispatch>();

  const handleClearWishlist = () => {
    dispatch(removeAllItemsFromWishlist());
  };

  return (
    <>
      <Breadcrumb title="Wishlist" items={[{ name: "Wishlist" }]} />
      <section className="overflow-hidden py-12 lg:py-20 bg-brand-dark">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-white text-2xl">{t("Your Wishlist")}</h2>
            <button onClick={() => handleClearWishlist()} className="text-brand-accent">
              {t("Clear Wishlist")}
            </button>
          </div>

          <div className="bg-brand-card rounded-[10px] shadow-1">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1170px]">
                {/* <!-- table header --> */}
                <div className="flex items-center py-5.5 px-10">
                  <div className="min-w-[83px]"></div>
                  <div className="min-w-[387px]">
                    <p className="text-white">{t("Product")}</p>
                  </div>

                  <div className="min-w-[205px]">
                    <p className="text-white">{t("Unit Price")}</p>
                  </div>

                  <div className="min-w-[265px]">
                    <p className="text-white">{t("Stock Status")}</p>
                  </div>

                  <div className="min-w-[150px]">
                    <p className="text-white text-right">{t("Action")}</p>
                  </div>
                </div>

                {/* <!-- wish item --> */}
                {wishlistItems.map((item, key) => (
                  <SingleItem item={item} key={key} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
